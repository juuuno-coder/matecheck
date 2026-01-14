import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { API_URL } from '../constants/Config';
import { AVATARS } from '../constants/data';
import { translations } from '../constants/I18n';

export default function ProfileEditScreen() {
    const router = useRouter();
    const { nickname, avatarId, userId, setProfile, language } = useUserStore();
    const t = translations[language];

    const [newNickname, setNewNickname] = useState(nickname);
    const [selectedAvatarId, setSelectedAvatarId] = useState(avatarId);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!newNickname.trim()) {
            Alert.alert(t.common.error, "닉네임을 입력해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    nickname: newNickname,
                    avatar_id: selectedAvatarId
                })
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.nickname, data.avatar_id);
                Alert.alert(t.common.success, "프로필이 수정되었습니다.", [
                    { text: t.common.ok, onPress: () => router.back() }
                ]);
            } else {
                Alert.alert(t.common.error, "저장에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t.common.error, t.common.network_error);
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
                        <Text className="text-xl font-bold text-gray-900">프로필 수정</Text>
                    </View>
                    <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                        <Text className={`text-lg font-bold ${isSaving ? 'text-gray-300' : 'text-orange-600'}`}>
                            {isSaving ? "저장 중" : "완료"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* Avatar Selection */}
                <View className="items-center mb-8">
                    <Text className="text-sm font-bold text-gray-900 mb-4">아바타 선택</Text>
                    <View className="w-32 h-32 bg-white rounded-full items-center justify-center mb-4 shadow-lg border-4 border-orange-100">
                        <Text className="text-6xl">{AVATARS.find(a => a.id === selectedAvatarId)?.emoji || '🙂'}</Text>
                    </View>
                    <Text className="text-xs text-gray-400 mb-4">아이콘을 눌러 캐릭터를 변경하세요</Text>

                    {/* Avatar Grid */}
                    <View className="flex-row flex-wrap justify-center gap-3 max-w-sm">
                        {AVATARS.map((avatar) => (
                            <TouchableOpacity
                                key={avatar.id}
                                onPress={() => setSelectedAvatarId(avatar.id)}
                                className={`w-16 h-16 rounded-2xl items-center justify-center ${selectedAvatarId === avatar.id
                                        ? 'bg-orange-100 border-2 border-orange-500'
                                        : 'bg-gray-100 border-2 border-gray-200'
                                    }`}
                            >
                                <Text className="text-3xl">{avatar.emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Nickname Input */}
                <View>
                    <Text className="text-sm font-bold text-gray-900 mb-2">닉네임</Text>
                    <TextInput
                        value={newNickname}
                        onChangeText={setNewNickname}
                        className="bg-white border border-gray-200 rounded-xl p-4 text-lg text-gray-900 shadow-sm"
                        placeholder="닉네임을 입력하세요"
                        maxLength={20}
                    />
                    <Text className="text-xs text-gray-400 mt-2">{newNickname.length} / 20</Text>
                </View>
            </ScrollView>
        </View>
    );
}
