import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { API_URL } from '../../constants/Config';
import { cn } from '../../lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SignupScreen() {
    const router = useRouter();
    const { setEmail: setStoreEmail } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignup = async () => {
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert("알림", "모든 정보를 입력해주세요.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        email,
                        password,
                        password_confirmation: confirmPassword
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Proceed to Nest Choice
                setStoreEmail(email);
                router.push('/(onboarding)/nest_choice');
            } else {
                Alert.alert("가입 실패", data.errors ? data.errors.join("\n") : "알 수 없는 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "서버와 통신 중 문제가 발생했습니다.");
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <StatusBar style="dark" />

            <View className="mb-8">
                <TouchableOpacity onPress={() => router.back()} className="mb-6 w-10 h-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
                    <Ionicons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>

                <Animated.View entering={FadeInDown.duration(800).springify()}>
                    <Text className="text-4xl font-extrabold text-gray-900 mb-2">환영합니다! 🎉</Text>
                    <Text className="text-lg text-gray-500">
                        메이트체크와 함께{'\n'}우리 가족만의 특별한 공간을 만들어요.
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

                <View className="gap-2 mb-6">
                    <Text className="text-sm font-bold text-gray-600 ml-1">비밀번호</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="영문, 숫자 8자리 이상"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-800 text-lg focus:border-orange-500 focus:bg-white"
                        secureTextEntry
                    />
                </View>

                <View className="gap-2 mb-10">
                    <Text className="text-sm font-bold text-gray-600 ml-1">비밀번호 확인</Text>
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="비밀번호 다시 입력"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-800 text-lg focus:border-orange-500 focus:bg-white"
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSignup}
                    className="w-full bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:bg-orange-600 mb-6"
                >
                    <Text className="text-white font-bold text-lg">가입하고 시작하기</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center gap-1">
                    <Text className="text-gray-400">이미 계정이 있으신가요?</Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <Text className="text-orange-600 font-bold">로그인</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </View>
    );
}
