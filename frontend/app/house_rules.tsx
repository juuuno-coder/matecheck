import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { API_URL } from '../constants/Config';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface HouseRule {
    id: number;
    title: string;
    description: string;
    rule_type: string;
    priority: number;
}

const RULE_TYPES = [
    { id: 'quiet_hours', label: '조용한 시간', icon: 'moon', color: 'bg-indigo-500' },
    { id: 'guests', label: '손님 초대', icon: 'people', color: 'bg-purple-500' },
    { id: 'cleaning', label: '청소 규칙', icon: 'sparkles', color: 'bg-green-500' },
    { id: 'common_space', label: '공용 공간', icon: 'home', color: 'bg-blue-500' },
    { id: 'other', label: '기타', icon: 'ellipsis-horizontal', color: 'bg-gray-500' }
];

export default function HouseRulesScreen() {
    const router = useRouter();
    const { nestId } = useUserStore();
    const [rules, setRules] = useState<HouseRule[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ruleType, setRuleType] = useState('other');

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/house_rules`);
            if (response.ok) {
                const data = await response.json();
                setRules(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addRule = async () => {
        if (!title.trim()) {
            Alert.alert('오류', '제목을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/house_rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    house_rule: {
                        title,
                        description,
                        rule_type: ruleType,
                        priority: rules.length + 1
                    }
                })
            });

            if (response.ok) {
                const newRule = await response.json();
                setRules([...rules, newRule]);
                resetForm();
                setModalVisible(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '규칙 추가에 실패했습니다.');
        }
    };

    const deleteRule = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/house_rules/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setRules(rules.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setRuleType('other');
    };

    const getRuleTypeInfo = (type: string) => {
        return RULE_TYPES.find(t => t.id === type) || RULE_TYPES[RULE_TYPES.length - 1];
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-900 flex-1">하우스 룰 📜</Text>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-orange-500 px-4 py-2 rounded-xl"
                    >
                        <Text className="text-white font-bold">+ 추가</Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-gray-500 text-sm">함께 지키는 우리 집 규칙</Text>
            </View>

            {/* Rules List */}
            <ScrollView className="flex-1 p-6">
                {rules.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-6xl mb-4">📜</Text>
                        <Text className="text-gray-400 text-lg">아직 규칙이 없습니다</Text>
                        <Text className="text-gray-300 text-sm mt-2">첫 규칙을 만들어보세요!</Text>
                    </View>
                ) : (
                    rules.map((rule, index) => {
                        const typeInfo = getRuleTypeInfo(rule.rule_type);
                        return (
                            <Animated.View
                                key={rule.id}
                                entering={FadeInDown.delay(index * 100)}
                                className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100"
                            >
                                <View className="flex-row items-start justify-between mb-3">
                                    <View className="flex-row items-center flex-1">
                                        <View className={`${typeInfo.color} w-10 h-10 rounded-xl items-center justify-center mr-3`}>
                                            <Ionicons name={typeInfo.icon as any} size={20} color="white" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-xs text-gray-400 mb-1">{typeInfo.label}</Text>
                                            <Text className="text-lg font-bold text-gray-900">{rule.title}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                '삭제 확인',
                                                '이 규칙을 삭제하시겠습니까?',
                                                [
                                                    { text: '취소', style: 'cancel' },
                                                    { text: '삭제', style: 'destructive', onPress: () => deleteRule(rule.id) }
                                                ]
                                            );
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                                {rule.description ? (
                                    <Text className="text-gray-600 leading-6">{rule.description}</Text>
                                ) : null}
                            </Animated.View>
                        );
                    })
                )}
            </ScrollView>

            {/* Add Rule Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-gray-900">새 규칙 추가</Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                                <Ionicons name="close" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-96">
                            {/* Rule Type */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">규칙 유형</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {RULE_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        onPress={() => setRuleType(type.id)}
                                        className={`flex-row items-center px-4 py-2 rounded-xl ${ruleType === type.id ? type.color : 'bg-gray-100'
                                            }`}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={16}
                                            color={ruleType === type.id ? 'white' : '#6B7280'}
                                        />
                                        <Text className={`ml-2 font-bold ${ruleType === type.id ? 'text-white' : 'text-gray-600'}`}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Title */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">제목</Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                                placeholder="예: 밤 10시 이후 조용히"
                            />

                            {/* Description */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">설명 (선택)</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-gray-900"
                                placeholder="규칙에 대한 자세한 설명"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </ScrollView>

                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={addRule}
                            className="bg-orange-500 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">규칙 추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
