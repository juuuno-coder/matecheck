import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { API_URL } from '../../constants/Config';
import { cn } from '../../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const router = useRouter();
    const { setNest, setProfile, setEmail: setStoreEmail, setMembers } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Login Success
                setStoreEmail(email);

                const user = data.user;
                const nest = data.nest; // Assuming backend returns nest

                if (user.nickname) {
                    setProfile(user.nickname, user.avatar_id || 0);
                } else {
                    setProfile("돌아온 메이트", 0);
                }

                if (nest) {
                    setNest(nest.name, nest.theme_id, nest.invite_code, String(nest.id));
                    setMembers(nest.members);
                    router.replace('/(tabs)/home');
                } else {
                    router.push('/(onboarding)/nest_choice');
                }
            } else {
                Alert.alert("로그인 실패", data.error || "이메일 또는 비밀번호를 확인해주세요.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "서버와 통신 중 문제가 발생했습니다.");
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <StatusBar style="dark" />

            <View className="mb-10">
                <TouchableOpacity onPress={() => router.back()} className="mb-6 w-10 h-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
                    <Ionicons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>

                <Animated.View entering={FadeInDown.duration(800).springify()}>
                    <Text className="text-4xl font-extrabold text-gray-900 mb-2">반가워요! 👋</Text>
                    <Text className="text-lg text-gray-500">
                        가족과의 소중한 일상,{'\n'}메이트체크에서 다시 이어가세요.
                    </Text>
                </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="w-full gap-2">
                <View className="gap-2 mb-6">
                    <Text className="text-sm font-bold text-gray-600 ml-1">이메일 주소</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="example@matecheck.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-800 text-lg focus:border-orange-500 focus:bg-white"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View className="gap-2 mb-8">
                    <Text className="text-sm font-bold text-gray-600 ml-1">비밀번호</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="비밀번호를 입력해주세요"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-800 text-lg focus:border-orange-500 focus:bg-white"
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    className="w-full bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:bg-orange-600 mb-6"
                >
                    <Text className="text-white font-bold text-lg">로그인하기</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center gap-1">
                    <Text className="text-gray-400">계정이 없으신가요?</Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text className="text-orange-600 font-bold">회원가입</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </View>
    );
}
