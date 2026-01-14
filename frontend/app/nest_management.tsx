import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { API_URL } from '../constants/Config';
import { THEMES } from '../constants/data';
import { cn } from '../lib/utils';
import * as ImagePicker from 'expo-image-picker';

const PRESET_IMAGES = [
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80", // Cozy House
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", // Planet/Space
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&q=80", // Dog House / Puppy
    "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=800&q=80", // Fantasy/Illustration
];

export default function NestManagementScreen() {
    const router = useRouter();
    const { nestName, nestTheme, nestImage, nestId, setNest, inviteCode } = useUserStore();

    const [name, setName] = useState(nestName);
    const [selectedTheme, setSelectedTheme] = useState(nestTheme);
    const [imageUrl, setImageUrl] = useState(nestImage || PRESET_IMAGES[0]);
    const [isSaving, setIsSaving] = useState(false);

    const pickCustomImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("알림", "보금자리 이름을 입력해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nest: {
                        name,
                        theme_id: selectedTheme,
                        image_url: imageUrl
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Update local store
                setNest(data.name, data.theme_id, data.invite_code, data.id, data.image_url);
                Alert.alert("저장 완료", "보금자리 정보가 수정되었습니다.", [
                    { text: "확인", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("오류", "저장에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "네트워크 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">보금자리 관리</Text>
                    </View>
                    <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                        <Text className={cn("text-lg font-bold", isSaving ? "text-gray-300" : "text-orange-600")}>
                            {isSaving ? "저장 중" : "완료"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="p-6 gap-8">

                    {/* Preview Section */}
                    <View className="items-center">
                        <View className="w-full h-48 rounded-3xl overflow-hidden shadow-lg mb-4 bg-gray-200 relative">
                            <Image
                                source={{ uri: imageUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <View className="absolute bottom-0 w-full bg-black/40 p-4">
                                <Text className="text-white text-2xl font-bold text-center">{name || "보금자리 이름"}</Text>
                            </View>
                        </View>
                        <Text className="text-gray-400 text-xs">미리보기</Text>
                    </View>

                    {/* Input: Name */}
                    <View>
                        <Text className="text-sm font-bold text-gray-900 mb-2">보금자리 이름</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            className="bg-white border border-gray-200 rounded-xl p-4 text-lg text-gray-900 shadow-sm"
                            placeholder="우리 가족만의 이름을 지어주세요"
                        />
                    </View>

                    {/* Input: Image Preset */}
                    <View>
                        <Text className="text-sm font-bold text-gray-900 mb-3">대표 이미지 선택</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
                            {PRESET_IMAGES.map((url, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setImageUrl(url)}
                                    className={cn(
                                        "w-24 h-24 rounded-xl overflow-hidden border-2",
                                        imageUrl === url ? "border-orange-500" : "border-gray-100"
                                    )}
                                >
                                    <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                                    {imageUrl === url && (
                                        <View className="absolute inset-0 bg-orange-500/20 items-center justify-center">
                                            <Ionicons name="checkmark-circle" size={24} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Custom Upload Button */}
                        <TouchableOpacity
                            onPress={pickCustomImage}
                            className="mt-4 bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 flex-row items-center justify-center gap-3 active:bg-gray-50"
                        >
                            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
                                <Ionicons name="cloud-upload-outline" size={20} color="#F97316" />
                            </View>
                            <View>
                                <Text className="text-gray-900 font-bold">내 사진 업로드하기</Text>
                                <Text className="text-gray-400 text-xs">갤러리에서 선택</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Input: Theme Color */}
                    <View>
                        <Text className="text-sm font-bold text-gray-900 mb-3">테마 컬러</Text>
                        <View className="flex-row gap-3">
                            {Object.entries(THEMES).map(([id, theme]: [string, any]) => (
                                <TouchableOpacity
                                    key={id}
                                    onPress={() => setSelectedTheme(Number(id))}
                                    className={cn(
                                        "w-12 h-12 rounded-full items-center justify-center shadow-sm border-2",
                                        selectedTheme === Number(id) ? "border-gray-900" : "border-white",
                                        theme.bg
                                    )}
                                >
                                    <Text className="text-xl">{theme.emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    );
}
