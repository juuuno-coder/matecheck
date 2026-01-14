import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useEffect } from 'react';
import { Link, Redirect, useRouter } from 'expo-router';
import { useUserStore } from '../store/userStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);

    if (isLoggedIn) {
        return <Redirect href="/(tabs)/home" />;
    }

    return (
        <View className="flex-1 bg-white items-center justify-between py-20 px-6">
            <StatusBar style="dark" />

            {/* Header / Hero */}
            <Animated.View entering={FadeInDown.duration(1000).springify()} className="items-center mt-20">
                <View className="w-40 h-40 bg-orange-50 rounded-full items-center justify-center mb-8 shadow-sm border border-orange-100">
                    <Text className="text-7xl">🏡</Text>
                </View>
                <Text className="text-orange-600 text-4xl font-extrabold tracking-tight mb-3">MateCheck</Text>
                <Text className="text-gray-500 text-lg font-medium text-center leading-8">
                    우리 가족의 소중한 일상,{'\n'}함께 이루는 목표와 행복
                </Text>
            </Animated.View>

            {/* Buttons */}
            <Animated.View entering={FadeInUp.delay(300).duration(1000).springify()} className="w-full gap-4 mb-10">
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity className="w-full bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:bg-orange-600">
                        <Text className="text-white font-bold text-lg">로그인</Text>
                    </TouchableOpacity>
                </Link>

                <View className="flex-row items-center justify-center mt-2">
                    <Text className="text-gray-400 mr-2">아직 계정이 없으신가요?</Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text className="text-orange-600 font-bold text-base underline">회원가입</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </View>
    );
}
