import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { API_URL } from '../../constants/Config';
import { translations } from '../../constants/I18n';

export default function CreateNestScreen() {
    const router = useRouter();
    const { setNest, nickname, avatarId, userEmail, language } = useUserStore();
    const t = translations[language].onboarding;

    const [name, setName] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) return;

        try {
            const response = await fetch(`${API_URL}/nests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    nest: { name: name, theme_id: 0 },
                    user: { nickname, avatar_id: avatarId }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setNest(data.name, data.theme_id, data.invite_code, data.id.toString());
                router.replace('/(tabs)/home');
            } else {
                Alert.alert("Error", data.errors?.join(', ') || "Failed to create.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server connection failed.");
        }
    };

    return (
        <View className="flex-1 bg-white pt-12 px-6">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                <Text className="text-gray-400 font-medium mb-1 text-sm">{t.step3}</Text>
                <Text className="text-2xl font-bold text-gray-800 mb-8 leading-9">
                    {t.create_title}
                </Text>

                <View className="items-center mb-10">
                    <View className="w-24 h-24 bg-orange-50 rounded-3xl items-center justify-center shadow-sm">
                        <Text className="text-5xl">🪐</Text>
                    </View>
                </View>

                <Text className="text-base font-semibold text-gray-700 mb-3 ml-1">{t.nest_name_label}</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t.nest_name_placeholder}
                    placeholderTextColor="#E2E8F0"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-gray-800 text-lg focus:border-orange-200"
                    autoFocus
                />
            </Animated.View>

            <View className="flex-1 justify-end pb-12">
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={!name.trim()}
                    className={cn(
                        "w-full py-5 rounded-2xl items-center",
                        name.trim() ? "bg-orange-500 shadow-lg shadow-orange-100" : "bg-gray-100"
                    )}
                >
                    <Text className={cn("font-bold text-lg", name.trim() ? "text-white" : "text-gray-400")}>{t.start_btn}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
