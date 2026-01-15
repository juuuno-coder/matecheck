import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/userStore';
import { API_URL } from '../../constants/Config';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Anniversary {
    id: number;
    title: string;
    anniversary_date: string;
    is_recurring: boolean;
    category: string;
}

export default function AnniversaryScreen() {
    const { nestId } = useUserStore();
    const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [dateString, setDateString] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [category, setCategory] = useState('기타');

    const categories = ['생일', '결혼기념일', '연애기념일', '입사기념일', '기타'];

    useEffect(() => {
        if (nestId) {
            fetchAnniversaries();
        }
    }, [nestId]);

    const fetchAnniversaries = async () => {
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/anniversaries`);
            if (response.ok) {
                const data = await response.json();
                setAnniversaries(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addAnniversary = async () => {
        if (!title.trim()) {
            Alert.alert('오류', '제목을 입력해주세요.');
            return;
        }
        if (!nestId) return;

        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/anniversaries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    anniversary: {
                        title,
                        anniversary_date: dateString,
                        is_recurring: isRecurring,
                        category
                    }
                })
            });

            if (response.ok) {
                const newAnniversary = await response.json();
                setAnniversaries([...anniversaries, newAnniversary]);
                setModalVisible(false);
                resetForm();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '기념일 추가에 실패했습니다.');
        }
    };

    const deleteAnniversary = async (id: number) => {
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/anniversaries/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setAnniversaries(anniversaries.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDateString('');
        setIsRecurring(false);
        setCategory('기타');
    };

    const calculateDday = (anniversaryDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(anniversaryDate);
        target.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'D-Day';
        if (diffDays > 0) return `D-${diffDays}`;
        return `D+${Math.abs(diffDays)}`;
    };

    const getCategoryEmoji = (cat: string) => {
        const emojiMap: any = {
            '생일': '🎂',
            '결혼기념일': '💍',
            '연애기념일': '❤️',
            '입사기념일': '💼',
            '기타': '📅'
        };
        return emojiMap[cat] || '📅';
    };

    const getCategoryColor = (cat: string) => {
        const colorMap: any = {
            '생일': 'bg-pink-500',
            '결혼기념일': 'bg-purple-500',
            '연애기념일': 'bg-red-500',
            '입사기념일': 'bg-blue-500',
            '기타': 'bg-gray-500'
        };
        return colorMap[cat] || 'bg-gray-500';
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    <Text className="text-2xl font-bold text-gray-900">기념일 📅</Text>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-orange-500 px-4 py-2 rounded-xl"
                    >
                        <Text className="text-white font-bold">+ 추가</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Anniversary List */}
            <ScrollView className="flex-1 p-6">
                {anniversaries.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-6xl mb-4">📅</Text>
                        <Text className="text-gray-400 text-lg">등록된 기념일이 없습니다.</Text>
                        <Text className="text-gray-300 text-sm mt-2">소중한 날을 기록해보세요!</Text>
                    </View>
                ) : (
                    anniversaries.map((anniversary, index) => (
                        <Animated.View
                            key={anniversary.id}
                            entering={FadeInDown.delay(index * 100)}
                            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View className={`${getCategoryColor(anniversary.category)} px-3 py-1 rounded-full mr-2`}>
                                            <Text className="text-white text-xs font-bold">
                                                {getCategoryEmoji(anniversary.category)} {anniversary.category}
                                            </Text>
                                        </View>
                                        {anniversary.is_recurring && (
                                            <View className="bg-blue-100 px-2 py-1 rounded-full">
                                                <Text className="text-blue-600 text-xs font-bold">🔄 매년</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-lg font-bold text-gray-900 mb-1">
                                        {anniversary.title}
                                    </Text>
                                    <Text className="text-gray-500 text-sm">
                                        {new Date(anniversary.anniversary_date).toLocaleDateString('ko-KR')}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <View className="bg-orange-50 px-4 py-2 rounded-xl mb-2">
                                        <Text className="text-orange-600 text-xl font-bold">
                                            {calculateDday(anniversary.anniversary_date)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                '삭제 확인',
                                                '이 기념일을 삭제하시겠습니까?',
                                                [
                                                    { text: '취소', style: 'cancel' },
                                                    { text: '삭제', style: 'destructive', onPress: () => deleteAnniversary(anniversary.id) }
                                                ]
                                            );
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    ))
                )}
            </ScrollView>

            {/* Add Anniversary Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-gray-900">새 기념일 추가</Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                                <Ionicons name="close" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-96">
                            {/* Title */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">제목</Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                                placeholder="예: 우리 결혼기념일"
                            />

                            {/* Category */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">카테고리</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setCategory(cat)}
                                        className={`px-4 py-2 rounded-xl ${category === cat ? getCategoryColor(cat) : 'bg-gray-100'
                                            }`}
                                    >
                                        <Text className={`font-bold ${category === cat ? 'text-white' : 'text-gray-600'}`}>
                                            {getCategoryEmoji(cat)} {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Date */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">날짜</Text>
                            <TextInput
                                value={dateString}
                                onChangeText={setDateString}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                                placeholder="YYYY-MM-DD (예: 2026-12-25)"
                            />

                            {/* Recurring */}
                            <TouchableOpacity
                                onPress={() => setIsRecurring(!isRecurring)}
                                className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6"
                            >
                                <Text className="text-gray-900 font-medium">매년 반복</Text>
                                <View className={`w-12 h-6 rounded-full ${isRecurring ? 'bg-orange-500' : 'bg-gray-300'} justify-center`}>
                                    <View className={`w-5 h-5 rounded-full bg-white ${isRecurring ? 'self-end mr-0.5' : 'self-start ml-0.5'}`} />
                                </View>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={addAnniversary}
                            className="bg-orange-500 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">기념일 추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
