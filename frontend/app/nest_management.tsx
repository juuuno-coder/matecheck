import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { API_URL } from '../constants/Config';
import { THEMES, NEST_AVATARS } from '../constants/data';
import { cn } from '../lib/utils';
import * as ImagePicker from 'expo-image-picker';
import AvatarPicker from '../components/AvatarPicker';



export default function NestManagementScreen() {
    const router = useRouter();
    const { nestName, nestTheme, nestImage, nestId, setNest, inviteCode, nestAvatarId } = useUserStore();
    const { language } = useUserStore();

    const [name, setName] = useState(nestName);
    const [selectedTheme, setSelectedTheme] = useState(nestTheme);
    const [selectedAvatarId, setSelectedAvatarId] = useState(nestAvatarId || 100);
    const [imageUrl, setImageUrl] = useState(nestImage || '');
    const [isSaving, setIsSaving] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);

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
                        avatar_id: selectedAvatarId,
                        image_url: imageUrl
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Update local store
                setNest(data.name, data.theme_id, data.invite_code, data.id.toString(), data.image_url, data.avatar_id);
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
                        <TouchableOpacity
                            onPress={() => setPickerVisible(true)}
                            className="w-40 h-40 rounded-full overflow-hidden shadow-lg mb-4 bg-white border-4 border-white relative items-center justify-center"
                        >
                            <Image
                                source={(NEST_AVATARS.find(a => a.id === selectedAvatarId) || NEST_AVATARS[0]).image}
                                style={{ width: 128, height: 128 }}
                                resizeMode="contain"
                            />
                            <View className="absolute bottom-2 right-2 bg-gray-900 p-2 rounded-full border-2 border-white">
                                <Ionicons name="camera" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-gray-400 text-xs">아이콘을 터치해 변경하세요</Text>
                    </View>

                    <AvatarPicker
                        visible={pickerVisible}
                        onClose={() => setPickerVisible(false)}
                        onSelect={(id) => setSelectedAvatarId(id)}
                        selectedId={selectedAvatarId}
                        avatars={NEST_AVATARS}
                    />

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
