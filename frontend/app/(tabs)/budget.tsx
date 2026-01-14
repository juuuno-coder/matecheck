import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal } from 'react-native';
import React, { useState } from 'react';
import { PieChart } from 'react-native-chart-kit';
import { cn } from '../../lib/utils';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useUserStore, BudgetTransaction } from '../../store/userStore';
import { THEMES, AVATARS } from '../../constants/data';

export default function BudgetScreen() {
    const { nestTheme, budgetGoal, transactions, addTransaction, avatarId } = useUserStore();
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';

    // State for new Transaction
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // Calculations
    const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = budgetGoal - totalSpent;
    const progress = Math.min(100, Math.round((totalSpent / budgetGoal) * 100));

    // Group by category for Chart
    const categoryTotals = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    const chartData = [
        { name: '식비', amount: categoryTotals['food'] || 0, color: '#FFAB91', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: '주거/통신', amount: categoryTotals['housing'] || 0, color: '#80CBC4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: '생활', amount: categoryTotals['living'] || 0, color: '#9FA8DA', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: '교통', amount: categoryTotals['transport'] || 0, color: '#CE93D8', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: '기타', amount: categoryTotals['etc'] || 0, color: '#BCAAA4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    ].filter(d => d.amount > 0);

    // If no data, show placeholder in chart
    if (chartData.length === 0) {
        chartData.push({ name: '지출 없음', amount: 100, color: '#E5E7EB', legendFontColor: '#9CA3AF', legendFontSize: 12 });
    }

    const handleAdd = () => {
        if (!title || !amount) return;
        // Default category needed for simple MVP, usually would have a selector
        addTransaction(title, parseInt(amount), 'etc');
        setTitle('');
        setAmount('');
        setModalVisible(false);
    };

    return (
        <View className="flex-1 bg-white">
            <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-800">공동 가계부 💰</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text className={cn("font-bold text-lg", themeText)}>+ 기록</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <Animated.View entering={SlideInUp.delay(100)} className={cn("m-4 p-6 rounded-3xl shadow-lg", themeBg, "shadow-orange-200")}>
                    <Text className="text-white/80 font-medium mb-1">이번 달 남은 예산</Text>
                    <Text className="text-white text-4xl font-bold mb-6">
                        {remaining.toLocaleString()}원
                    </Text>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-white/90 text-xs font-medium">지출 {totalSpent.toLocaleString()}</Text>
                        <Text className="text-white/90 text-xs font-medium">목표 {budgetGoal.toLocaleString()}</Text>
                    </View>
                    <View className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                        <View style={{ width: `${progress}%` }} className="h-full bg-white rounded-full" />
                    </View>
                </Animated.View>

                {/* Chart Section */}
                <View className="mx-4 mt-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm items-center">
                    <Text className="text-gray-800 font-bold mb-2 w-full text-lg">지출 분석</Text>
                    <PieChart
                        data={chartData}
                        width={Dimensions.get('window').width - 60}
                        height={200}
                        chartConfig={{
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor={"amount"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                        hasLegend={true}
                    />
                </View>

                {/* Recent Transactions List */}
                <View className="mx-4 mt-6">
                    <Text className="text-lg font-bold text-gray-800 mb-3">최근 지출 내역</Text>
                    {transactions.length === 0 ? (
                        <Text className="text-gray-400 text-center py-4">아직 지출 내역이 없습니다.</Text>
                    ) : (
                        transactions.slice(0, 10).map((t) => (
                            <View key={t.id} className="flex-row justify-between items-center py-4 border-b border-gray-50">
                                <View className="flex-row items-center gap-3">
                                    <View className={cn("w-10 h-10 rounded-full items-center justify-center bg-gray-50", themeText.replace('text-', 'bg-').replace('600', '100'))}>
                                        <Text className="text-lg">💸</Text>
                                    </View>
                                    <View>
                                        <Text className="font-bold text-gray-800 text-base">{t.title}</Text>
                                        <Text className="text-gray-400 text-xs">{t.date} • {AVATARS[Number(t.payerId)]?.label || '멤버'}</Text>
                                    </View>
                                </View>
                                <Text className="font-bold text-gray-900 text-lg">-{t.amount.toLocaleString()}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Fixed Costs Teaser */}
                <View className="mx-4 mt-8 pb-8">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-bold text-gray-800">고정 지출 예정</Text>
                        <Text className="text-gray-400 text-xs">매달 1일 갱신</Text>
                    </View>
                    <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex-row justify-between">
                        <Text className="text-gray-600">🏠 관리비 (예상)</Text>
                        <Text className="font-bold text-gray-500">150,000원</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Add Transaction Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-3xl p-6 pb-12">
                        <Text className="text-xl font-bold text-gray-800 mb-6">지출 기록하기</Text>

                        <Text className="text-gray-500 mb-2 font-bold">내용</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="예: 마트 장보기"
                            className="bg-gray-50 rounded-xl p-4 text-gray-900 mb-4 font-bold text-lg"
                        />

                        <Text className="text-gray-500 mb-2 font-bold">금액</Text>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            keyboardType="numeric"
                            className="bg-gray-50 rounded-xl p-4 text-gray-900 mb-8 font-bold text-2xl"
                        />

                        <TouchableOpacity
                            onPress={handleAdd}
                            className={cn("w-full py-4 rounded-xl items-center", themeBg)}
                        >
                            <Text className="text-white font-bold text-lg">입력 완료</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-4 py-2 items-center">
                            <Text className="text-gray-400 font-medium">취소</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
