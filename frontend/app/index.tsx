import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect } from 'react';
import { Link, Redirect } from 'expo-router';
import { useUserStore } from '../store/userStore';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
    withSequence
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { translations } from '../constants/I18n';

const { width, height } = Dimensions.get('window');

const REVIEWS = [
    "가족 간 소통이 많아졌어요 ❤️",
    "집안일이 재미있어졌어요 ✨",
    "반려동물과 함께라서 좋아요 🐶",
    "아이들이 스스로 해요 👶",
    "부모님과 더 가까워졌어요 🏡",
];

const FloatingReview = ({ text, index, total }: { text: string, index: number, total: number }) => {
    const translateY = useSharedValue(height);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const duration = 12000 + Math.random() * 4000; // 12-16초
        const delay = index * 2500; // 2.5초 간격으로 시작

        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-100, { duration, easing: Easing.linear }),
                    withTiming(height, { duration: 0 }) // 즉시 리셋
                ),
                -1,
                false
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 1500 }),
                    withTiming(0.7, { duration: duration - 3000 }),
                    withTiming(0, { duration: 1500 })
                ),
                -1,
                false
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    // 좌우 번갈아 배치
    const horizontalPosition = index % 2 === 0 ? width * 0.15 : width * 0.65;

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    position: 'absolute',
                    left: horizontalPosition - 60,
                    zIndex: 0
                }
            ]}
        >
            <View className="bg-white/70 px-4 py-2 rounded-full shadow-sm">
                <Text className="text-gray-500 text-sm">
                    {text}
                </Text>
            </View>
        </Animated.View>
    );
};

export default function Home() {
    const isLoggedIn = useUserStore((state: any) => state.isLoggedIn);
    const language = useUserStore((state: any) => state.language);
    const t = translations[language].intro;

    if (isLoggedIn) {
        return <Redirect href="/(tabs)/home" />;
    }

    return (
        <View className="flex-1 bg-orange-50/30 items-center justify-between py-20 px-6 relative overflow-hidden">
            <StatusBar style="dark" />

            {/* Background Floating Reviews - 채팅 흐르는 효과 */}
            <View className="absolute inset-0 pointer-events-none w-full h-full">
                {REVIEWS.map((review, i) => (
                    <FloatingReview key={i} text={review} index={i} total={REVIEWS.length} />
                ))}
            </View>

            {/* Header / Hero */}
            <Animated.View entering={FadeInDown.duration(1000).springify()} className="items-center mt-32 z-10">
                <View className="w-40 h-40 bg-white rounded-full items-center justify-center mb-8 shadow-lg shadow-orange-100 border-4 border-white">
                    <Text className="text-7xl">🏡</Text>
                </View>
                <Text className="text-orange-600 text-4xl font-extrabold tracking-tight mb-3">MateCheck</Text>
                <Text className="text-gray-500 text-lg font-medium text-center leading-8 bg-white/50 px-4 py-2 rounded-xl">
                    {t.tagline}
                </Text>
            </Animated.View>

            {/* Buttons */}
            <Animated.View entering={FadeInUp.delay(300).duration(1000).springify()} className="w-full gap-4 mb-10 z-10">
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity className="w-full bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:bg-orange-600">
                        <Text className="text-white font-bold text-lg">{t.login_btn}</Text>
                    </TouchableOpacity>
                </Link>

                <View className="flex-row items-center justify-center mt-2">
                    <Text className="text-gray-400 mr-2">{t.signup_prompt}</Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text className="text-orange-600 font-bold text-base underline">{t.signup_btn}</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </View>
    );
}
