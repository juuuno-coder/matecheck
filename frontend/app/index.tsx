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
    "가족 간 소통이 많아져서 좋아요! ❤️",
    "반려동물과 함께라서 더 행복해요 🐶",
    "우리 가족만의 공간이 생겼어요 ✨",
    "서로 할 일을 챙겨주니 든든해요 👍",
    "집안일 분담이 훨씬 쉬워졌어요 🧹",
    "매일매일 기록하는 재미가 있어요 📝",
    "아이들과 함께 목표를 달성해요 🏆"
];

const FloatingReview = ({ text, index, total }: { text: string, index: number, total: number }) => {
    const translateY = useSharedValue(height);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        const duration = 8000 + Math.random() * 4000; // Random duration 8-12s
        const delay = index * (8000 / total); // Staggered start

        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-100, { duration, easing: Easing.linear }),
                -1, // Infinite
                false // Do not reverse
            )
        );

        // Fade in/out logic is a bit complex with continuous repeat of transform.
        // Simplified: Just opacity 1 during move?
        // Better: Layout animation opacity?

        // Let's just define a fixed opacity animation that loops or just stays visible after entry?
        // Actually, let's keep it simple: Start opacity 0, fade in, iterate.
        // But with translate repeating, we want opacity to reset.
        // We can attach opacity to translateY? 
        // Or just let it fly.
        opacity.value = withDelay(delay, withTiming(1, { duration: 1000 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value, // Simple fade in at start
            // position: 'absolute',
            // left: Math.random() * (width - 200), // Random collision? better distinct positions
        };
    });

    // Determine random horizontal position
    const randomLeft = 20 + (index % 2) * (width / 2 - 40) + Math.random() * 40;
    // Alternate sides roughly: left, right, left...

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    position: 'absolute',
                    left: index % 2 === 0 ? 20 : undefined,
                    right: index % 2 !== 0 ? 20 : undefined,
                    zIndex: 0
                }
            ]}
        >
            <View className="bg-white/90 px-4 py-3 rounded-2xl shadow-sm border border-orange-50 mb-4 opacity-80">
                <Text className="text-gray-600 font-medium text-sm">
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

            {/* Background Floating Reviews */}
            <View className="absolute inset-0 pointer-events-none w-full h-full">
                {REVIEWS.map((review, i) => (
                    <FloatingReview key={i} text={review} index={i} total={REVIEWS.length} />
                ))}
                {/* Overlay gradient to fade out at top/bottom? optional */}
                <View className="absolute top-0 w-full h-40 bg-gradient-to-b from-white/90 to-transparent" />
                <View className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-white/90 to-transparent" />
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
