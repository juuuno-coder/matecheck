import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { useUserStore, Goal } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { THEMES } from '../../constants/data';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '../../constants/I18n';

export default function GoalScreen() {
    const { nestTheme, goals, addGoal, incrementGoalProgress, decrementGoalProgress, deleteGoal, language } = useUserStore();
    const t = translations[language].tabs;

    const labels = {
        ko: {
            title: "우리의 목표 🏆",
            vision: "우리의 꿈 (Vision)",
            year: "2026년 연간 목표",
            month: "이번 달 목표",
            week: "이번 주 목표",
            empty: "등록된 목표가 없어요.",
            add: "+ 목표 추가하기",
            new: "새로운 목표",
            type: "목표 유형",
            content: "목표 내용",
            count: "목표 횟수/양",
            unit: "단위",
            submit: "등록하기",
            cancel: "취소",
            types: { vision: '비전', year: '연간', month: '월간', week: '주간' }
        },
        en: {
            title: "Our Goals 🏆",
            vision: "Our Vision ✨",
            year: "2026 Yearly Goals",
            month: "Monthly Goals",
            week: "Weekly Goals",
            empty: "No goals registered yet.",
            add: "+ Add a goal",
            new: "New Goal",
            type: "Goal Type",
            content: "Content",
            count: "Target Value",
            unit: "Unit",
            submit: "Register",
            cancel: "Cancel",
            types: { vision: 'Vision', year: 'Yearly', month: 'Monthly', week: 'Weekly' }
        }
    }[language];

    // Feature Theme Colors
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('1');
    const [selectedType, setSelectedType] = useState<Goal['type']>('month');
    const [unit, setUnit] = useState('회');

    const handleAddGoal = () => {
        if (title.trim()) {
            addGoal(selectedType, title, Number(target), unit);
            setTitle('');
            setTarget('1');
            setUnit('회');
            setModalVisible(false);
        }
    };

    const confirmDelete = (id: string) => {
        Alert.alert(
            "목표 삭제",
            "정말로 이 목표를 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                { text: "삭제", onPress: () => deleteGoal(id), style: "destructive" }
            ]
        );
    };

    const renderProgressBar = (current: number, target: number) => {
        const percentage = Math.min((current / target) * 100, 100);

        return (
            <View className="h-4 bg-gray-100 rounded-full mt-3 overflow-hidden relative">
                <View
                    className={cn("h-full rounded-full absolute left-0 top-0", themeBg)}
                    style={{ width: `${percentage}%` }}
                />
            </View>
        );
    };

    const GoalSection = ({ type, label, icon }: { type: Goal['type'], label: string, icon: string }) => {
        const sectionGoals = goals.filter(g => g.type === type);

        return (
            <View className="mb-8">
                <View className="flex-row items-center mb-4 px-2">
                    <Text className="text-2xl mr-2">{icon}</Text>
                    <Text className="text-xl font-bold text-gray-800">{label}</Text>
                </View>

                {sectionGoals.length === 0 ? (
                    <View className="bg-gray-50 border border-gray-100 border-dashed rounded-2xl p-6 items-center">
                        <Text className="text-gray-400">{labels.empty}</Text>
                        <TouchableOpacity onPress={() => { setSelectedType(type); setModalVisible(true); }}>
                            <Text className={cn("mt-2 font-bold", themeText)}>{labels.add}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    sectionGoals.map((goal, index) => (
                        <Animated.View
                            key={goal.id}
                            entering={FadeInUp.delay(index * 100)}
                            layout={Layout.springify()}
                            className="bg-white p-5 rounded-2xl mb-3 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-1 flex-row items-center mr-2">
                                    {goal.current >= goal.target && <Text className="mr-2">🎉</Text>}
                                    <Text className={cn("text-lg font-bold", goal.current >= goal.target ? "text-gray-400 line-through" : "text-gray-800")} numberOfLines={1}>
                                        {goal.title}
                                    </Text>
                                </View>

                                <TouchableOpacity onPress={() => confirmDelete(goal.id)} className="p-1">
                                    <Ionicons name="trash-outline" size={18} color="#D1D5DB" />
                                </TouchableOpacity>
                            </View>

                            {/* Compact Row: [-] [Progress] [+] */}
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => decrementGoalProgress(goal.id)}
                                    className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center border border-gray-200"
                                    disabled={goal.current <= 0}
                                >
                                    <Ionicons name="remove" size={16} color={goal.current <= 0 ? "#D1D5DB" : "#4B5563"} />
                                </TouchableOpacity>

                                <View className="flex-1 mx-3">
                                    <View className="flex-row justify-between items-end mb-1.5 px-1">
                                        <Text className="text-xs font-bold text-gray-500">
                                            {goal.current}
                                            <Text className="font-normal text-gray-400"> / {goal.target} {goal.unit}</Text>
                                        </Text>
                                        <Text className="text-[10px] text-gray-400">{Math.min(Math.round((goal.current / goal.target) * 100), 100)}%</Text>
                                    </View>
                                    <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <View
                                            className={cn("h-full rounded-full", themeBg)}
                                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => incrementGoalProgress(goal.id)}
                                    className={cn("w-8 h-8 rounded-full items-center justify-center shadow-sm", themeBg)}
                                    disabled={goal.current >= goal.target}
                                    style={{ opacity: goal.current >= goal.target ? 0.5 : 1 }}
                                >
                                    <Ionicons name="add" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-800">{labels.title}</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className={cn("w-10 h-10 rounded-full items-center justify-center shadow-md", themeBg)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                <GoalSection type="vision" label={labels.vision} icon="✨" />
                <GoalSection type="year" label={labels.year} icon="📅" />
                <GoalSection type="month" label={labels.month} icon="🎯" />
                <GoalSection type="week" label={labels.week} icon="🔥" />
            </ScrollView>

            {/* Add Goal Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">{labels.new}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-gray-400 font-medium">{labels.cancel}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-bold text-gray-500 mb-3">{labels.type}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row" contentContainerStyle={{ gap: 10 }}>
                            {[
                                { id: 'vision', label: labels.types.vision },
                                { id: 'year', label: labels.types.year },
                                { id: 'month', label: labels.types.month },
                                { id: 'week', label: labels.types.week }
                            ].map((t) => (
                                <TouchableOpacity
                                    key={t.id}
                                    onPress={() => setSelectedType(t.id as any)}
                                    className={cn(
                                        "px-4 py-2 rounded-full border",
                                        selectedType === t.id ? `${themeBg} border-transparent` : "bg-white border-gray-200"
                                    )}
                                >
                                    <Text className={cn("font-bold", selectedType === t.id ? "text-white" : "text-gray-500")}>
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text className="text-sm font-bold text-gray-500 mb-2">{labels.content}</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder={language === 'ko' ? "예: 매주 가족 산책하기, 저축 100만원" : "e.g. Weekly walk, Saving $1000"}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-4 text-gray-800 text-lg mb-6"
                        />

                        {selectedType !== 'vision' && (
                            <View className="flex-row gap-4 mb-8">
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-gray-500 mb-2">{labels.count}</Text>
                                    <TextInput
                                        value={target}
                                        onChangeText={setTarget}
                                        keyboardType="numeric"
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-4 text-gray-800 text-lg text-center"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-gray-500 mb-2">{labels.unit}</Text>
                                    <TextInput
                                        value={unit}
                                        onChangeText={setUnit}
                                        placeholder={language === 'ko' ? "회, 원, km" : "times, $, km"}
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-4 text-gray-800 text-lg text-center"
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleAddGoal}
                            disabled={!title.trim()}
                            className={cn(
                                "w-full py-4 rounded-xl items-center shadow-lg",
                                title.trim() ? themeBg : "bg-gray-200 shadow-none"
                            )}
                        >
                            <Text className="text-white font-bold text-lg">{labels.submit}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
