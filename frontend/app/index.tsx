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

const { width, height } = Dimensions.get('window');

const REVIEWS = [
    "가족 간 소통이 많아졌어요 ❤️",
    "집안일이 재미있어졌어요 ✨",
    "반려동물과 함께라서 좋아요 🐶",
];

const FloatingReview = ({ text, index, total }: { text: string, index: number, total: number }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const delay = index * 2500; // Staggered by 2.5s each

        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-80, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 0 }) // Reset
                ),
                -1,
                false
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 800 }),
                    withTiming(0.5, { duration: 2000 }),
                    withTiming(0, { duration: 800 }),
                    withTiming(0, { duration: 2400 }) // Stay hidden
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

    const startY = height / 2 + (index - 1) * 50; // Start from middle area

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    position: 'absolute',
                    top: startY,
                    left: index % 2 === 0 ? 20 : undefined,
                    right: index % 2 !== 0 ? 20 : undefined,
                    zIndex: 0
                }
            ]}
        >
            <View className="bg-white/70 px-3 py-2 rounded-full shadow-sm">
                <Text className="text-gray-500 text-xs">
                    {text}
                </Text>
            </View>
        </Animated.View>
    );
};

export default function Home() {
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);

    if (isLoggedIn) {
        return <Redirect href="/(tabs)/home" />;
    }

    return (
        <View className="flex-1 bg-orange-50/30 items-center justify-between py-20 px-6 relative overflow-hidden">
            <StatusBar style="dark" />

            {/* Background Floating Reviews - Limited to middle area */}
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
                <Text className="text-orange-600 text-4xl font-extrabold tracking-tight mb-3 shadow-sm">MateCheck</Text>
                <Text className="text-gray-500 text-lg font-medium text-center leading-8 bg-white/50 px-4 py-2 rounded-xl overflow-hidden">
                    우리 가족의 소중한 일상,{'\n'}함께 이루는 목표와 행복
                </Text>
            </Animated.View>

            {/* Buttons */}
            <Animated.View entering={FadeInUp.delay(300).duration(1000).springify()} className="w-full gap-4 mb-10 z-10">
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
