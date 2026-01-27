import { View, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Txt, Button, colors } from '@toss/tds-react-native';

export default function TossHome() {
    const { isLoggedIn, setProfile, setNest } = useUserStore();
    const router = useRouter();
    const [agreeStep, setAgreeStep] = useState(false);

    if (isLoggedIn) {
        return <Redirect href="/toss/(tabs)/home" />;
    }

    const handleTossLogin = () => {
        setAgreeStep(true);
    };

    const confirmTossLogin = () => {
        // Mock Login
        setProfile('김토스', 1, 'toss_user_123');
        setNest('토스 러브하우스', 0, 'TOSS1234', 'nest_toss_01', '', 100, true);

        // Manual redirect if Store update doesn't trigger immediate re-render of Redirect
        router.replace('/toss/(tabs)/home');
    };

    return (
        <View className="flex-1 bg-white items-center justify-between relative px-6 pt-20 pb-10">
            <StatusBar style="dark" />

            {/* Toss Style Intro */}
            <Animated.View entering={FadeInDown.duration(800).springify()} className="items-center w-full mt-10">
                <View className="w-24 h-24 bg-blue-50 rounded-3xl items-center justify-center mb-6">
                    <Txt typography="t1">🏠</Txt>
                </View>
                <Txt typography="t3" fontWeight="bold" color={colors.grey900} style={{ marginBottom: 8 }}>룸메이트체크</Txt>
                <Txt typography="t5" color={colors.grey500} style={{ textAlign: 'center', lineHeight: 28 }}>
                    토스에서 시작하는{'\n'}
                    가장 쉬운 공동 생활 관리
                </Txt>
            </Animated.View>

            {/* Agreement / Login Section */}
            <Animated.View entering={FadeInUp.delay(200).duration(800)} className="w-full">
                {agreeStep ? (
                    <View className="bg-gray-50 p-6 rounded-2xl mb-4 w-full">
                        <Txt typography="t5" fontWeight="bold" color={colors.grey900} style={{ marginBottom: 16 }}>서비스 이용 동의</Txt>
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="checkmark-circle" size={20} color={colors.blue500} />
                            <Txt typography="t6" color={colors.grey600} style={{ marginLeft: 8 }}>개인정보 제3자 제공 동의 (필수)</Txt>
                        </View>
                        <View className="flex-row items-center mb-6">
                            <Ionicons name="checkmark-circle" size={20} color={colors.blue500} />
                            <Txt typography="t6" color={colors.grey600} style={{ marginLeft: 8 }}>서비스 이용약관 동의 (필수)</Txt>
                        </View>
                        <Button
                            onPress={confirmTossLogin}
                            size="big"
                            type="primary"
                            style="fill"
                            display="full"
                        >
                            동의하고 시작하기
                        </Button>
                    </View>
                ) : (
                    <Button
                        onPress={handleTossLogin}
                        size="big"
                        type="primary"
                        style="fill"
                        display="full"
                    >
                        토스로 계속하기
                    </Button>
                )}
            </Animated.View>
        </View>
    );
}
