import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { API_URL } from '../constants/Config';
import { AVATARS } from '../constants/data';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Avatar from '../components/Avatar';

interface ChoreRotation {
    id: number;
    chore_name: string;
    rotation_type: string;
    current_assignee_id: number;
    current_assignee_name: string;
    current_assignee_avatar: number;
    next_rotation_date: string;
}

const ROTATION_TYPES = [
    { id: 'daily', label: '매일', icon: 'sunny', color: 'bg-yellow-500' },
    { id: 'weekly', label: '매주', icon: 'calendar', color: 'bg-blue-500' },
    { id: 'biweekly', label: '격주', icon: 'calendar-outline', color: 'bg-purple-500' },
    { id: 'monthly', label: '매월', icon: 'calendar-number', color: 'bg-green-500' }
];

const CHORE_PRESETS = [
    { name: '설거지', icon: '🍽️' },
    { name: '청소', icon: '🧹' },
    { name: '분리수거', icon: '♻️' },
    { name: '화장실 청소', icon: '🚽' },
    { name: '쓰레기 버리기', icon: '🗑️' },
    { name: '빨래', icon: '👕' }
];

export default function ChoreRotationScreen() {
    const router = useRouter();
    const { nestId, members } = useUserStore();
    const [rotations, setRotations] = useState<ChoreRotation[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [choreName, setChoreName] = useState('');
    const [rotationType, setRotationType] = useState('weekly');

    useEffect(() => {
        fetchRotations();
    }, []);

    const fetchRotations = async () => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/chore_rotations`);
            if (response.ok) {
                const data = await response.json();
                setRotations(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addRotation = async () => {
        if (!choreName.trim()) {
            Alert.alert('오류', '집안일 이름을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/chore_rotations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chore_rotation: {
                        chore_name: choreName,
                        rotation_type: rotationType
                    }
                })
            });

            if (response.ok) {
                fetchRotations();
                resetForm();
                setModalVisible(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '로테이션 추가에 실패했습니다.');
        }
    };

    const rotateChore = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/chore_rotations/${id}/rotate`, {
                method: 'POST'
            });

            if (response.ok) {
                fetchRotations();
                Alert.alert('완료!', '다음 담당자로 변경되었습니다.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteRotation = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/chore_rotations/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setRotations(rotations.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setChoreName('');
        setRotationType('weekly');
    };

    const getRotationTypeInfo = (type: string) => {
        return ROTATION_TYPES.find(t => t.id === type) || ROTATION_TYPES[1];
    };

    const getDaysUntilRotation = (nextDate: string) => {
        const today = new Date();
        const next = new Date(nextDate);
        const diffTime = next.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return '교체 필요';
        if (diffDays === 0) return '오늘 교체';
        if (diffDays === 1) return '내일 교체';
        return `${diffDays}일 후`;
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-gradient-to-br from-green-500 to-teal-500">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-white/20 px-4 py-2 rounded-xl"
                    >
                        <Text className="text-white font-bold">+ 추가</Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-white text-3xl font-bold mb-2">집안일 로테이션 🔄</Text>
                <Text className="text-white/80 text-sm mb-6">공정한 순번 자동 관리</Text>

                {/* Summary */}
                <View className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-white/70 text-sm mb-1">활성 로테이션</Text>
                            <Text className="text-white text-3xl font-black">{rotations.length}개</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="people" size={20} color="white" />
                            <Text className="text-white ml-2 font-bold">{members.length}명 참여</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Rotations List */}
            <ScrollView className="flex-1 px-6 pt-4">
                {rotations.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-6xl mb-4">🔄</Text>
                        <Text className="text-gray-400 text-lg">로테이션이 없습니다</Text>
                        <Text className="text-gray-300 text-sm mt-2">집안일 순번을 만들어보세요!</Text>
                    </View>
                ) : (
                    rotations.map((rotation, index) => {
                        const typeInfo = getRotationTypeInfo(rotation.rotation_type);
                        const daysInfo = getDaysUntilRotation(rotation.next_rotation_date);
                        const isOverdue = daysInfo === '교체 필요';

                        return (
                            <Animated.View
                                key={rotation.id}
                                entering={FadeInDown.delay(index * 100)}
                                className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
                            >
                                {/* Header */}
                                <View className="flex-row items-start justify-between mb-4">
                                    <View className="flex-1">
                                        <Text className="text-2xl font-black text-gray-900 mb-1">
                                            {rotation.chore_name}
                                        </Text>
                                        <View className={`${typeInfo.color} self-start px-3 py-1 rounded-full`}>
                                            <Text className="text-white text-xs font-bold">{typeInfo.label}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                '삭제 확인',
                                                '이 로테이션을 삭제하시겠습니까?',
                                                [
                                                    { text: '취소', style: 'cancel' },
                                                    { text: '삭제', style: 'destructive', onPress: () => deleteRotation(rotation.id) }
                                                ]
                                            );
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                {/* Current Assignee */}
                                <View className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 mb-4">
                                    <Text className="text-gray-500 text-xs font-bold mb-3">현재 담당자</Text>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <Avatar
                                                source={AVATARS[rotation.current_assignee_avatar || 0].image}
                                                size="sm"
                                                borderColor="#10B981"
                                                borderWidth={2}
                                            />
                                            <View className="ml-3">
                                                <Text className="text-gray-900 font-bold text-lg">
                                                    {rotation.current_assignee_name}
                                                </Text>
                                                <View className={`px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-blue-100'} self-start mt-1`}>
                                                    <Text className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                                                        {daysInfo}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert(
                                                    '순번 교체',
                                                    '다음 담당자로 변경하시겠습니까?',
                                                    [
                                                        { text: '취소', style: 'cancel' },
                                                        { text: '교체', onPress: () => rotateChore(rotation.id) }
                                                    ]
                                                );
                                            }}
                                            className="bg-green-500 w-12 h-12 rounded-full items-center justify-center"
                                        >
                                            <Ionicons name="refresh" size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* All Members Preview */}
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-xs mr-2">순번:</Text>
                                    <View className="flex-row flex-1">
                                        {members.slice(0, 5).map((member, idx) => (
                                            <View
                                                key={member.id}
                                                className={`-ml-2 ${member.id === rotation.current_assignee_id ? 'z-10' : ''}`}
                                            >
                                                <Avatar
                                                    source={AVATARS[member.avatarId || 0].image}
                                                    size="xs"
                                                    borderColor={member.id === rotation.current_assignee_id ? '#10B981' : '#FFFFFF'}
                                                    borderWidth={member.id === rotation.current_assignee_id ? 2 : 1}
                                                />
                                            </View>
                                        ))}
                                        {members.length > 5 && (
                                            <View className="w-8 h-11 bg-gray-100 rounded-lg items-center justify-center -ml-2">
                                                <Text className="text-gray-600 text-xs font-bold">+{members.length - 5}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </Animated.View>
                        );
                    })
                )}
            </ScrollView>

            {/* Add Rotation Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-gray-900">새 로테이션 추가</Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                                <Ionicons name="close" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-96">
                            {/* Chore Presets */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">빠른 선택</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {CHORE_PRESETS.map((preset) => (
                                    <TouchableOpacity
                                        key={preset.name}
                                        onPress={() => setChoreName(preset.name)}
                                        className={`flex-row items-center px-4 py-2 rounded-xl ${choreName === preset.name ? 'bg-green-500' : 'bg-gray-100'
                                            }`}
                                    >
                                        <Text className="mr-2">{preset.icon}</Text>
                                        <Text className={`font-bold ${choreName === preset.name ? 'text-white' : 'text-gray-600'}`}>
                                            {preset.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Custom Chore Name */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">집안일 이름</Text>
                            <TextInput
                                value={choreName}
                                onChangeText={setChoreName}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                                placeholder="예: 설거지, 청소"
                            />

                            {/* Rotation Type */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">교체 주기</Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {ROTATION_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        onPress={() => setRotationType(type.id)}
                                        className={`flex-row items-center px-4 py-3 rounded-xl flex-1 ${rotationType === type.id ? type.color : 'bg-gray-100'
                                            }`}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={18}
                                            color={rotationType === type.id ? 'white' : '#6B7280'}
                                        />
                                        <Text className={`ml-2 font-bold ${rotationType === type.id ? 'text-white' : 'text-gray-600'}`}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={addRotation}
                            className="bg-green-500 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">로테이션 추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
