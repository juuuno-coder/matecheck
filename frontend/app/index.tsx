import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function DevGateway() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-100 items-center justify-center p-6 bg-white">
            <StatusBar style="dark" />
            <Text className="text-2xl font-bold mb-8 text-gray-800">개발자 모드: 앱 선택</Text>

            <View className="w-full gap-4 max-w-sm">
                <TouchableOpacity
                    onPress={() => router.push('/mate')}
                    className="w-full bg-orange-500 p-6 rounded-2xl shadow-md border-b-4 border-orange-700 active:border-b-0 active:mt-1"
                >
                    <Text className="text-white text-xl font-bold text-center">🏡 MateCheck</Text>
                    <Text className="text-orange-100 text-center mt-2">오리지널 버전</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/toss')}
                    className="w-full bg-[#0064FF] p-6 rounded-2xl shadow-md border-b-4 border-blue-700 active:border-b-0 active:mt-1"
                >
                    <Text className="text-white text-xl font-bold text-center">App In Toss</Text>
                    <Text className="text-blue-100 text-center mt-2">룸메이트체크 (토스 미니앱)</Text>
                </TouchableOpacity>
            </View>

            <Text className="absolute bottom-10 text-gray-400 text-sm">
                Local Development Gateway
            </Text>
        </View>
    );
}
