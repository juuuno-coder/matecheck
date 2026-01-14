import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { API_URL } from '../constants/Config';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface SplitBill {
    id: number;
    title: string;
    total_amount: number;
    bill_type: string;
    due_date: string;
    is_paid: boolean;
    per_person: number;
    member_count: number;
}

const BILL_TYPES = [
    { id: 'rent', label: '월세', icon: 'home', color: 'bg-blue-500' },
    { id: 'utilities', label: '공과금', icon: 'flash', color: 'bg-yellow-500' },
    { id: 'internet', label: '인터넷', icon: 'wifi', color: 'bg-purple-500' },
    { id: 'groceries', label: '장보기', icon: 'cart', color: 'bg-green-500' },
    { id: 'cleaning', label: '청소용품', icon: 'sparkles', color: 'bg-pink-500' },
    { id: 'other', label: '기타', icon: 'ellipsis-horizontal', color: 'bg-gray-500' }
];

export default function SplitBillsScreen() {
    const router = useRouter();
    const { nestId } = useUserStore();
    const [bills, setBills] = useState<SplitBill[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [billType, setBillType] = useState('utilities');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/split_bills`);
            if (response.ok) {
                const data = await response.json();
                setBills(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addBill = async () => {
        if (!title.trim() || !amount.trim()) {
            Alert.alert('오류', '제목과 금액을 입력해주세요.');
            return;
        }

        const today = new Date();
        const defaultDueDate = dueDate || new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/split_bills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    split_bill: {
                        title,
                        total_amount: parseFloat(amount),
                        bill_type: billType,
                        due_date: defaultDueDate
                    }
                })
            });

            if (response.ok) {
                const newBill = await response.json();
                setBills([newBill, ...bills]);
                resetForm();
                setModalVisible(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '청구서 추가에 실패했습니다.');
        }
    };

    const togglePaid = async (bill: SplitBill) => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/split_bills/${bill.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    split_bill: { is_paid: !bill.is_paid }
                })
            });

            if (response.ok) {
                setBills(bills.map(b => b.id === bill.id ? { ...b, is_paid: !b.is_paid } : b));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteBill = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/split_bills/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setBills(bills.filter(b => b.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setAmount('');
        setBillType('utilities');
        setDueDate('');
    };

    const getBillTypeInfo = (type: string) => {
        return BILL_TYPES.find(t => t.id === type) || BILL_TYPES[BILL_TYPES.length - 1];
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('ko-KR').format(num);
    };

    const getDaysUntilDue = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`;
        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '내일';
        return `${diffDays}일 남음`;
    };

    const unpaidBills = bills.filter(b => !b.is_paid);
    const paidBills = bills.filter(b => b.is_paid);
    const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.per_person, 0);

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-gradient-to-br from-orange-500 to-pink-500">
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
                <Text className="text-white text-3xl font-bold mb-2">공동 정산 💰</Text>
                <Text className="text-white/80 text-sm mb-6">투명하고 공정한 비용 분담</Text>

                {/* Summary Card */}
                <View className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20">
                    <Text className="text-white/70 text-sm mb-1">내가 낼 금액</Text>
                    <Text className="text-white text-4xl font-black mb-3">₩{formatCurrency(totalUnpaid)}</Text>
                    <View className="flex-row items-center">
                        <Ionicons name="people" size={16} color="white" />
                        <Text className="text-white/80 text-sm ml-2">
                            {unpaidBills.length}개 미정산 청구서
                        </Text>
                    </View>
                </View>
            </View>

            {/* Bills List */}
            <ScrollView className="flex-1 px-6 pt-4">
                {/* Unpaid Bills */}
                {unpaidBills.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-3">미정산</Text>
                        {unpaidBills.map((bill, index) => {
                            const typeInfo = getBillTypeInfo(bill.bill_type);
                            const daysInfo = getDaysUntilDue(bill.due_date);
                            const isOverdue = daysInfo.includes('지남');

                            return (
                                <Animated.View
                                    key={bill.id}
                                    entering={FadeInDown.delay(index * 100)}
                                    className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row items-start justify-between mb-4">
                                        <View className="flex-row items-center flex-1">
                                            <View className={`${typeInfo.color} w-12 h-12 rounded-xl items-center justify-center mr-3`}>
                                                <Ionicons name={typeInfo.icon as any} size={24} color="white" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-xs text-gray-400 mb-1">{typeInfo.label}</Text>
                                                <Text className="text-lg font-bold text-gray-900">{bill.title}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert(
                                                    '삭제 확인',
                                                    '이 청구서를 삭제하시겠습니까?',
                                                    [
                                                        { text: '취소', style: 'cancel' },
                                                        { text: '삭제', style: 'destructive', onPress: () => deleteBill(bill.id) }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="bg-gray-50 rounded-xl p-4 mb-3">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-gray-500 text-sm">총 금액</Text>
                                            <Text className="text-gray-900 font-bold">₩{formatCurrency(bill.total_amount)}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-gray-500 text-sm">인원</Text>
                                            <Text className="text-gray-900">{bill.member_count}명</Text>
                                        </View>
                                        <View className="border-t border-gray-200 my-2" />
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-orange-600 font-bold">내 부담금</Text>
                                            <Text className="text-orange-600 font-black text-xl">₩{formatCurrency(bill.per_person)}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center justify-between">
                                        <View className={`px-3 py-1 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                                            <Text className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                                                {daysInfo}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => togglePaid(bill)}
                                            className="bg-orange-500 px-6 py-2 rounded-xl"
                                        >
                                            <Text className="text-white font-bold">정산 완료</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>
                )}

                {/* Paid Bills */}
                {paidBills.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-3">정산 완료</Text>
                        {paidBills.map((bill, index) => {
                            const typeInfo = getBillTypeInfo(bill.bill_type);

                            return (
                                <Animated.View
                                    key={bill.id}
                                    entering={FadeInDown.delay((unpaidBills.length + index) * 100)}
                                    className="bg-gray-50 rounded-2xl p-5 mb-3 opacity-60"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1">
                                            <View className={`${typeInfo.color} w-10 h-10 rounded-xl items-center justify-center mr-3 opacity-50`}>
                                                <Ionicons name={typeInfo.icon as any} size={20} color="white" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-sm font-bold text-gray-600">{bill.title}</Text>
                                                <Text className="text-xs text-gray-400">₩{formatCurrency(bill.per_person)}</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                            <TouchableOpacity onPress={() => togglePaid(bill)}>
                                                <Ionicons name="refresh" size={20} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>
                )}

                {bills.length === 0 && (
                    <View className="items-center justify-center py-20">
                        <Text className="text-6xl mb-4">💰</Text>
                        <Text className="text-gray-400 text-lg">청구서가 없습니다</Text>
                        <Text className="text-gray-300 text-sm mt-2">공과금을 추가해보세요!</Text>
                    </View>
                )}
            </ScrollView>

            {/* Add Bill Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-gray-900">새 청구서 추가</Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                                <Ionicons name="close" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-96">
                            {/* Bill Type */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">청구서 유형</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {BILL_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        onPress={() => setBillType(type.id)}
                                        className={`flex-row items-center px-4 py-2 rounded-xl ${billType === type.id ? type.color : 'bg-gray-100'
                                            }`}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={16}
                                            color={billType === type.id ? 'white' : '#6B7280'}
                                        />
                                        <Text className={`ml-2 font-bold ${billType === type.id ? 'text-white' : 'text-gray-600'}`}>
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
                                placeholder="예: 1월 전기세"
                            />

                            {/* Amount */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">총 금액</Text>
                            <TextInput
                                value={amount}
                                onChangeText={setAmount}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                                placeholder="예: 150000"
                                keyboardType="numeric"
                            />

                            {/* Due Date */}
                            <Text className="text-sm font-bold text-gray-700 mb-2">마감일 (선택)</Text>
                            <TextInput
                                value={dueDate}
                                onChangeText={setDueDate}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-gray-900"
                                placeholder="YYYY-MM-DD (예: 2026-01-31)"
                            />
                        </ScrollView>

                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={addBill}
                            className="bg-orange-500 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">청구서 추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
