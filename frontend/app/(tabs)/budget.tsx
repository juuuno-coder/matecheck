import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { PieChart } from 'react-native-chart-kit';
import { cn } from '../../lib/utils';
import Animated, { FadeIn, FadeInDown, SlideInUp, Layout } from 'react-native-reanimated';
import { useUserStore, BudgetTransaction, FixedExpense } from '../../store/userStore';
import { THEMES, AVATARS } from '../../constants/data';
import { translations } from '../../constants/I18n';
import { Ionicons } from '@expo/vector-icons';
import TutorialOverlay from '../../components/TutorialOverlay';
import Avatar from '../../components/Avatar';

const { width, height } = Dimensions.get('window');

export default function BudgetScreen() {
    const {
        nestTheme, budgetGoal, transactions, addTransaction,
        fixedExpenses, setBudgetGoal, addFixedExpense, deleteFixedExpense,
        avatarId, language: langFromStore
    } = useUserStore();
    const language = langFromStore as 'ko' | 'en';
    const t = (translations[language] as any).budget;

    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';
    const themeBgSoft = THEMES[nestTheme]?.bg || 'bg-orange-50';

    // State for Modals
    const [transModalVisible, setTransModalVisible] = useState(false);
    const [goalModalVisible, setGoalModalVisible] = useState(false);
    const [fixedModalVisible, setFixedModalVisible] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // Form States
    const [tempTitle, setTempTitle] = useState('');
    const [tempAmount, setTempAmount] = useState('');
    const [tempGoal, setTempGoal] = useState(budgetGoal.toString());
    const [tempDay, setTempDay] = useState('1');

    // Calculations
    const totalSpent = transactions.reduce((acc: number, curr: BudgetTransaction) => acc + curr.amount, 0);
    const fixedTotal = fixedExpenses.reduce((acc: number, curr: FixedExpense) => acc + curr.amount, 0);
    const remaining = budgetGoal - totalSpent;
    const progress = Math.min(100, Math.round((totalSpent / budgetGoal) * 100));

    // Category Totals
    const categoryTotals = transactions.reduce((acc: Record<string, number>, t: BudgetTransaction) => {
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

    if (chartData.length === 0) {
        chartData.push({ name: '지출 없음', amount: 1, color: '#F3F4F6', legendFontColor: '#9CA3AF', legendFontSize: 12 });
    }

    const handleAddTransaction = () => {
        if (!tempTitle || !tempAmount) return;
        addTransaction(tempTitle, parseInt(tempAmount), 'etc');
        setTempTitle(''); setTempAmount(''); setTransModalVisible(false);
    };

    const handleSetGoal = () => {
        if (!tempGoal) return;
        setBudgetGoal(parseInt(tempGoal));
        setGoalModalVisible(false);
    };

    const handleAddFixed = () => {
        if (!tempTitle || !tempAmount) return;
        addFixedExpense(tempTitle, parseInt(tempAmount), parseInt(tempDay));
        setTempTitle(''); setTempAmount(''); setTempDay('1'); setFixedModalVisible(false);
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header (Modern Simple Style) */}
            <View className="pt-16 pb-6 px-6 bg-white shadow-sm rounded-b-[40px] z-20 mb-2 flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                    <Text className="text-3xl font-black text-gray-900">{t.title}</Text>
                    <TouchableOpacity onPress={() => setShowTutorial(true)} className="mt-1">
                        <Ionicons name="help-circle-outline" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => setTransModalVisible(true)}
                    className={cn("px-5 py-2.5 rounded-full shadow-lg shadow-orange-200 flex-row items-center gap-1", themeBg)}
                >
                    <Ionicons name="add" size={18} color="white" />
                    <Text className="text-white font-bold text-sm">기록</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120, paddingTop: 24 }} showsVerticalScrollIndicator={false}>
                <View className="gap-8">

                    {/* 1. Summary Card (Highlighted) */}
                    <Animated.View entering={SlideInUp.delay(100)} className={cn("p-8 rounded-[40px] shadow-xl border border-white/20", themeBg)}>
                        {/* Header Row */}
                        <View className="flex-row justify-between items-center mb-10">
                            <Text className="text-gray-900 text-lg font-bold opacity-80">{t.goal_title}</Text>
                            <TouchableOpacity onPress={() => setGoalModalVisible(true)} className="bg-white px-4 py-2 rounded-full shadow-sm">
                                <Text className="text-gray-900 text-xs font-bold">목표 수정</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Center Hero Section */}
                        <View className="items-center mb-12">
                            <Text className="text-gray-900/60 text-sm font-bold mb-2 uppercase tracking-widest">Remaining Layout</Text>
                            <Text className="text-gray-900 text-5xl font-black tracking-tighter" style={{ includeFontPadding: false }}>
                                {remaining.toLocaleString()}
                                <Text className="text-3xl font-bold">원</Text>
                            </Text>
                        </View>

                        {/* Progress Bar */}
                        <View className="mb-6">
                            <View className="flex-row justify-between mb-2 px-1">
                                <Text className="text-gray-900/60 text-xs font-bold">0%</Text>
                                <Text className="text-gray-900/60 text-xs font-bold">100%</Text>
                            </View>
                            <View className="w-full h-5 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
                                <Animated.View style={{ width: `${progress}%` }} className="h-full bg-gray-900 rounded-full shadow-sm" />
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm items-center">
                                <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Spent</Text>
                                <Text className="text-gray-900 font-bold text-lg">{totalSpent.toLocaleString()}</Text>
                            </View>
                            <View className="flex-1 bg-white/50 p-5 rounded-3xl border border-white/50 items-center">
                                <Text className="text-gray-800/60 text-[10px] uppercase font-bold mb-1">Target</Text>
                                <Text className="text-gray-900/80 font-bold text-lg">{budgetGoal.toLocaleString()}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* 2. Fixed Expenses Section */}
                    <View>
                        <View className="flex-row justify-between items-center mb-4 px-2">
                            <Text className="text-xl font-black text-gray-900">고정 지출 🏠</Text>
                            <TouchableOpacity onPress={() => setFixedModalVisible(true)} className="flex-row items-center gap-1">
                                <Text className={cn("font-bold text-sm", themeText)}>+ 추가</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="bg-white p-2 rounded-[32px] border border-gray-100 shadow-sm">
                            {fixedExpenses.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Text className="text-gray-400 font-medium">등록된 고정 지출이 없어요</Text>
                                </View>
                            ) : (
                                <View>
                                    {fixedExpenses.map((f: FixedExpense, i: number) => (
                                        <View key={f.id} className={cn("flex-row justify-between items-center p-5", i !== fixedExpenses.length - 1 && "border-b border-gray-50")}>
                                            <View className="flex-row items-center gap-4 flex-1">
                                                <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center border border-gray-200">
                                                    <Text className="text-gray-900 font-black text-sm">{f.day}</Text>
                                                    <Text className="text-gray-400 text-[9px] font-bold">일</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="font-bold text-gray-900 text-lg mb-0.5">{f.title}</Text>
                                                    <Text className="text-gray-400 text-xs font-medium">매월 자동 계산</Text>
                                                </View>
                                            </View>
                                            <View className="items-end gap-1">
                                                <Text className="font-black text-gray-900 text-lg">{f.amount.toLocaleString()}원</Text>
                                                <TouchableOpacity onPress={() => deleteFixedExpense(f.id)} className="opacity-40">
                                                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                    <View className="m-2 p-5 bg-gray-50 rounded-[24px] flex-row justify-between items-center border border-gray-100">
                                        <Text className="text-gray-500 text-sm font-bold">총 고정 지출</Text>
                                        <Text className="text-gray-900 font-black text-xl">{fixedTotal.toLocaleString()}원</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* 3. Spend Analysis Chart */}
                    <View>
                        <Text className="text-xl font-black text-gray-900 mb-4 px-2">지출 분석 📊</Text>
                        <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm items-center">
                            <PieChart
                                data={chartData}
                                width={width - 80}
                                height={200}
                                chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                                accessor={"amount"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                center={[0, 0]}
                                absolute
                            />
                        </View>
                    </View>

                    {/* 4. Recent Transactions List */}
                    <View>
                        <Text className="text-xl font-black text-gray-900 mb-4 px-2">최근 지출 💸</Text>
                        <View className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-2">
                            {transactions.length === 0 ? (
                                <View className="py-12 items-center">
                                    <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="receipt-outline" size={32} color="#D1D5DB" />
                                    </View>
                                    <Text className="text-gray-400 font-medium">아직 지출 내역이 없습니다.</Text>
                                </View>
                            ) : (
                                transactions.slice(0, 10).map((t: BudgetTransaction, i: number) => (
                                    <Animated.View
                                        entering={FadeInDown.delay(i * 50)}
                                        key={t.id}
                                        className={cn("flex-row justify-between items-center p-5", i !== transactions.length - 1 && "border-b border-gray-50")}
                                    >
                                        <View className="flex-row items-center gap-4">
                                            <Avatar
                                                source={(AVATARS[Number(t.payerId)] || AVATARS[0]).image}
                                                size="sm"
                                                className="bg-gray-50"
                                            />
                                            <View>
                                                <Text className="font-bold text-gray-800 text-base mb-0.5">{t.title}</Text>
                                                <Text className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                                                    {t.date} • {(AVATARS[Number(t.payerId)] || AVATARS[0]).label}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className="font-black text-gray-900 text-lg">-{t.amount.toLocaleString()}</Text>
                                            <View className="bg-gray-100 px-2 py-1 rounded mt-1">
                                                <Text className="text-gray-500 text-[10px] font-bold">{t.category}</Text>
                                            </View>
                                        </View>
                                    </Animated.View>
                                ))
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* --- MODALS --- */}

            {/* Set Budget Goal Modal */}
            <Modal animationType="slide" transparent visible={goalModalVisible} onRequestClose={() => setGoalModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => setGoalModalVisible(false)} />
                    <Animated.View entering={SlideInUp} className="bg-white rounded-t-[40px] p-8 pb-12">
                        <Text className="text-2xl font-black text-gray-900 mb-2">{t.goal_title} 💰</Text>
                        <Text className="text-gray-500 mb-8">{t.goal_desc}</Text>

                        <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Total Budget Amount</Text>
                        <TextInput
                            value={tempGoal}
                            onChangeText={setTempGoal}
                            placeholder="0"
                            keyboardType="numeric"
                            className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-900 font-black text-3xl mb-10 shadow-sm"
                        />

                        <TouchableOpacity onPress={handleSetGoal} className={cn("w-full py-5 rounded-2xl items-center shadow-lg shadow-orange-200", themeBg)}>
                            <Text className="text-white font-bold text-lg">설정 완료</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* Add Transaction Modal */}
            <Modal animationType="slide" transparent visible={transModalVisible} onRequestClose={() => setTransModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => setTransModalVisible(false)} />
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <View className="bg-white rounded-t-[40px] p-8 pb-12">
                            <Text className="text-2xl font-black text-gray-900 mb-6">지출 기록하기 💸</Text>

                            <TextInput
                                value={tempTitle}
                                onChangeText={setTempTitle}
                                placeholder="어디에 썼나요? (예: 마트 장보기)"
                                className="bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 font-bold text-lg mb-4 shadow-sm"
                            />

                            <TextInput
                                value={tempAmount}
                                onChangeText={setTempAmount}
                                placeholder="얼마를 썼나요? (원)"
                                keyboardType="numeric"
                                className="bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 font-black text-2xl mb-8 shadow-sm"
                            />

                            <TouchableOpacity onPress={handleAddTransaction} className={cn("w-full py-5 rounded-2xl items-center", themeBg)}>
                                <Text className="text-white font-bold text-lg">기록 완료</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Add Fixed Expense Modal */}
            <Modal animationType="slide" transparent visible={fixedModalVisible} onRequestClose={() => setFixedModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => setFixedModalVisible(false)} />
                    <View className="bg-white rounded-t-[40px] p-8 pb-12">
                        <Text className="text-2xl font-black text-gray-900 mb-6">고정 지출 추가 🏡</Text>

                        <TextInput
                            value={tempTitle}
                            onChangeText={setTempTitle}
                            placeholder="지출 항목 (예: 관리비, 월세)"
                            className="bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 font-bold text-lg mb-4 shadow-sm"
                        />

                        <TextInput
                            value={tempAmount}
                            onChangeText={setTempAmount}
                            placeholder="금액 (원)"
                            keyboardType="numeric"
                            className="bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 font-bold text-lg mb-4 shadow-sm"
                        />

                        <View className="flex-row items-center gap-4 mb-8">
                            <Text className="text-gray-500 font-bold">결제일:</Text>
                            <TextInput
                                value={tempDay}
                                onChangeText={setTempDay}
                                placeholder="1"
                                keyboardType="numeric"
                                maxLength={2}
                                className="bg-white border border-gray-200 rounded-xl p-3 text-gray-900 font-bold w-16 text-center shadow-sm"
                            />
                            <Text className="text-gray-500 font-bold">일</Text>
                        </View>

                        <TouchableOpacity onPress={handleAddFixed} className={cn("w-full py-5 rounded-2xl items-center", themeBg)}>
                            <Text className="text-white font-bold text-lg">등록 완료</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <TutorialOverlay
                visible={showTutorial}
                onComplete={() => setShowTutorial(false)}
                steps={[
                    {
                        target: { x: 20, y: 150, width: width - 40, height: 200, borderRadius: 40 },
                        title: "예산 한눈에 보기",
                        description: "이번 달 총 공금과 남은 금액을 실시간으로 확인할 수 있어요.",
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 370, width: width - 40, height: 180, borderRadius: 30 },
                        title: "고정 지출 관리",
                        description: "월세, 관리비 같은 정기적인 지출을 등록하고 매달 일정을 챙기세요.",
                        position: "bottom"
                    },
                    {
                        target: { x: width - 120, y: 60, width: 100, height: 45, borderRadius: 25 },
                        title: "지출 기록하기",
                        description: "새로운 지출이 생길 때마다 여기서 바로 기록할 수 있어요.",
                        position: "bottom"
                    }
                ]}
            />
        </View>
    );
}
