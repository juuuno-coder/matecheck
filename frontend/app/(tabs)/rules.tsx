import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useUserStore, Goal } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { THEMES } from '../../constants/data';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { translations, Language } from '../../constants/I18n';
import { API_URL } from '../../constants/Config';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TutorialOverlay from '../../components/TutorialOverlay';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Types for House Rules
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

export default function RulesScreen() {
    const { nestTheme, goals, addGoal, incrementGoalProgress, decrementGoalProgress, deleteGoal, language, nestId } = useUserStore();
    const router = useRouter();
    const params = useLocalSearchParams<{ action?: string }>();

    // Explicitly cast translations to avoid type errors
    const tCommon = translations[language as Language].common;
    const tGoals = translations[language as Language].goal;

    // Theme Colors
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';

    // --- SELECTION MODAL STATE ---
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);

    // --- GOAL STATE ---
    const [goalModalVisible, setGoalModalVisible] = useState(false);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalTarget, setGoalTarget] = useState('1');
    const [selectedGoalType, setSelectedGoalType] = useState<Goal['type']>('month');
    const [goalUnit, setGoalUnit] = useState('회');

    // --- RULE STATE ---
    const [rules, setRules] = useState<HouseRule[]>([]);
    const [ruleModalVisible, setRuleModalVisible] = useState(false);
    const [ruleTitle, setRuleTitle] = useState('');
    const [ruleDescription, setRuleDescription] = useState('');
    const [ruleType, setRuleType] = useState('other');
    const [showTutorial, setShowTutorial] = useState(false);

    // Fetch Rules & Handle Deep Linking
    useEffect(() => {
        if (nestId) {
            fetchRules();
        }
    }, [nestId]);

    useEffect(() => {
        if (params.action === 'add_goal') {
            setGoalModalVisible(true);
            router.setParams({ action: '' });
        } else if (params.action === 'add_rule') {
            setRuleModalVisible(true);
            router.setParams({ action: '' });
        }
    }, [params.action]);

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

    // --- ACTIONS ---
    const handleAddButtonPress = () => {
        setSelectionModalVisible(true);
    };

    const handleSelectAction = (action: 'rule' | 'goal') => {
        setSelectionModalVisible(false);
        setTimeout(() => {
            if (action === 'rule') setRuleModalVisible(true);
            else setGoalModalVisible(true);
        }, 300);
    };

    const handleAddGoal = () => {
        if (goalTitle.trim()) {
            addGoal(selectedGoalType, goalTitle, Number(goalTarget), goalUnit);
            setGoalTitle('');
            setGoalTarget('1');
            setGoalUnit('회');
            setGoalModalVisible(false);
        }
    };

    const confirmDeleteGoal = (id: string) => {
        Alert.alert(
            tCommon.delete,
            tGoals.delete_msg || "삭제하시겠습니까?", // Fallback
            [
                { text: tCommon.cancel, style: "cancel" },
                { text: tCommon.delete, onPress: () => deleteGoal(id), style: "destructive" }
            ]
        );
    };

    const addRule = async () => {
        if (!ruleTitle.trim()) {
            Alert.alert(tCommon.error, '제목을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/house_rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    house_rule: {
                        title: ruleTitle,
                        description: ruleDescription,
                        rule_type: ruleType,
                        priority: rules.length + 1
                    }
                })
            });

            if (response.ok) {
                const newRule = await response.json();
                setRules([...rules, newRule]);
                resetRuleForm();
                setRuleModalVisible(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert(tCommon.error, '규칙 추가 실패');
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

    const resetRuleForm = () => {
        setRuleTitle('');
        setRuleDescription('');
        setRuleType('other');
    };

    const getRuleTypeInfo = (type: string) => {
        return RULE_TYPES.find(t => t.id === type) || RULE_TYPES[RULE_TYPES.length - 1];
    };

    // --- COMPONENTS ---
    const GoalSection = ({ type, label, icon }: { type: Goal['type'], label: string, icon: string }) => {
        const sectionGoals = goals.filter((g: any) => g.type === type);

        if (sectionGoals.length === 0) return null;

        return (
            <View className="mb-8">
                <View className="flex-row items-center mb-4 px-2">
                    <Text className="text-2xl mr-2">{icon}</Text>
                    <Text className="text-xl font-bold text-gray-800">{label}</Text>
                </View>

                {sectionGoals.map((goal: Goal, index: number) => (
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

                            <TouchableOpacity onPress={() => confirmDeleteGoal(goal.id)} className="p-1">
                                <Ionicons name="trash-outline" size={18} color="#D1D5DB" />
                            </TouchableOpacity>
                        </View>

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
                ))}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-4 px-6 bg-white flex-row justify-between items-center shadow-sm z-10">
                <View className="flex-row items-center gap-2">
                    <Text className="text-2xl font-bold text-gray-900">
                        {language === 'ko' ? "약속" : "Promises"}
                    </Text>
                    <TouchableOpacity onPress={() => setShowTutorial(true)}>
                        <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleAddButtonPress}
                    className={cn("w-10 h-10 rounded-full items-center justify-center shadow-md", themeBg)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Content Info */}
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>

                {/* Goals Section (Moved to Top) */}
                <View className="mb-12">
                    <View className="flex-row items-center mb-5 ml-1">
                        <Text className="text-2xl mr-2">🏆</Text>
                        <Text className="text-2xl font-bold text-gray-900">{language === 'ko' ? "우리의 목표" : "Our Goals"}</Text>
                    </View>

                    {goals.length === 0 ? (
                        <TouchableOpacity
                            onPress={() => setGoalModalVisible(true)}
                            className="bg-white rounded-3xl p-10 items-center justify-center border border-gray-100 shadow-sm active:bg-gray-50 bg-white"
                        >
                            <View className="w-16 h-16 bg-yellow-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="trophy-outline" size={32} color="#fbbf24" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg mb-2">
                                {language === 'ko' ? "목표를 세워보세요" : "Set your goals"}
                            </Text>
                            <Text className="text-gray-400 text-center text-sm leading-5">
                                {language === 'ko' ? "함께 이루고 싶은 꿈이 있나요?\n터치해서 목표를 추가해보세요!" : "Dreaming of something together?\nTap to add a new goal!"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <GoalSection type="vision" label={language === 'ko' ? "우리의 꿈 (Vision)" : "Our Vision"} icon="✨" />
                            <GoalSection type="year" label={language === 'ko' ? "올해의 목표" : "Yearly Goals"} icon="📅" />
                            <GoalSection type="month" label={language === 'ko' ? "이번 달 목표" : "Monthly Goals"} icon="🎯" />
                            <GoalSection type="week" label={language === 'ko' ? "이번 주 목표" : "Weekly Goals"} icon="🔥" />
                        </>
                    )}
                </View>

                {/* Rules Section (Moved to Bottom) */}
                <View className="mb-24">
                    <View className="flex-row items-center mb-5 ml-1">
                        <Text className="text-2xl mr-2">📜</Text>
                        <Text className="text-2xl font-bold text-gray-900">{language === 'ko' ? "우리 집 규칙" : "House Rules"}</Text>
                    </View>

                    {rules.length === 0 ? (
                        <TouchableOpacity
                            onPress={() => setRuleModalVisible(true)}
                            className="bg-white rounded-3xl p-10 items-center justify-center border border-gray-100 shadow-sm active:bg-gray-50"
                        >
                            <View className="w-16 h-16 bg-indigo-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="document-text-outline" size={32} color="#6366f1" />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg mb-2">
                                {language === 'ko' ? "규칙이 비어있어요" : "No rules yet"}
                            </Text>
                            <Text className="text-gray-400 text-center text-sm leading-5">
                                {language === 'ko' ? "서로를 위한 약속을 만들어볼까요?\n터치해서 첫 규칙을 추가해보세요!" : "Create promises for each other.\nTap to add your first rule!"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        rules.map((rule: HouseRule, index: number) => {
                            const typeInfo = getRuleTypeInfo(rule.rule_type);
                            return (
                                <Animated.View
                                    key={rule.id}
                                    entering={FadeInDown.delay(index * 100)}
                                    className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row items-start justify-between mb-2">
                                        <View className="flex-row items-center flex-1">
                                            <View className={`${typeInfo.color} w-10 h-10 rounded-xl items-center justify-center mr-3`}>
                                                <Ionicons name={typeInfo.icon as any} size={20} color="white" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-xs text-gray-400 mb-0.5">{typeInfo.label}</Text>
                                                <Text className="text-lg font-bold text-gray-900">{rule.title}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert(
                                                    tCommon.delete,
                                                    language === 'ko' ? '이 규칙을 삭제하시겠습니까?' : 'Delete this rule?',
                                                    [
                                                        { text: tCommon.cancel, style: 'cancel' },
                                                        { text: tCommon.delete, style: 'destructive', onPress: () => deleteRule(rule.id) }
                                                    ]
                                                );
                                            }}
                                            className="p-2 -mr-2"
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                    {rule.description ? (
                                        <Text className="text-gray-500 leading-5 text-sm ml-[52px]">{rule.description}</Text>
                                    ) : null}
                                </Animated.View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* --- SELECTION MODAL --- */}
            <Modal visible={selectionModalVisible} animationType="fade" transparent>
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end pb-10 px-4"
                    activeOpacity={1}
                    onPress={() => setSelectionModalVisible(false)}
                >
                    <Animated.View
                        entering={FadeInUp.springify()}
                        className="bg-white rounded-2xl overflow-hidden shadow-xl"
                    >
                        <TouchableOpacity
                            onPress={() => handleSelectAction('rule')}
                            className="p-5 border-b border-gray-100 flex-row items-center justify-center bg-gray-50 active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">📜</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "규칙 추가하기" : "Add House Rule"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('goal')}
                            className="p-5 flex-row items-center justify-center bg-white active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">🏆</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "목표 추가하기" : "Add Goal"}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                    <TouchableOpacity
                        onPress={() => setSelectionModalVisible(false)}
                        className="bg-white rounded-xl p-4 mt-3 items-center shadow-lg"
                    >
                        <Text className="text-lg font-bold text-gray-900">{tCommon.cancel}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* --- ADD RULE MODAL --- */}
            <Modal visible={ruleModalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-gray-900">
                                {language === 'ko' ? "새 규칙 추가" : "Add New Rule"}
                            </Text>
                            <TouchableOpacity onPress={() => { setRuleModalVisible(false); resetRuleForm(); }}>
                                <Ionicons name="close" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-96">
                            <Text className="text-sm font-bold text-gray-700 mb-2">{language === 'ko' ? "유형" : "Type"}</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {RULE_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        onPress={() => setRuleType(type.id)}
                                        className={`flex-row items-center px-4 py-2 rounded-xl ${ruleType === type.id ? type.color : 'bg-gray-100'}`}
                                    >
                                        <Ionicons name={type.icon as any} size={16} color={ruleType === type.id ? 'white' : '#6B7280'} />
                                        <Text className={`ml-2 font-bold ${ruleType === type.id ? 'text-white' : 'text-gray-600'}`}>{type.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-sm font-bold text-gray-700 mb-2">{language === 'ko' ? "제목" : "Title"}</Text>
                            <TextInput
                                value={ruleTitle}
                                onChangeText={setRuleTitle}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-900"
                                placeholder={language === 'ko' ? "예: 밤 10시 이후 조용히" : "e.g. Quiet hours after 10PM"}
                            />

                            <Text className="text-sm font-bold text-gray-700 mb-2">{language === 'ko' ? "설명 (선택)" : "Description (Optional)"}</Text>
                            <TextInput
                                value={ruleDescription}
                                onChangeText={setRuleDescription}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-gray-900"
                                placeholder={language === 'ko' ? "자세한 설명을 적어주세요" : "Enter details"}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </ScrollView>

                        <TouchableOpacity onPress={addRule} className={cn("py-4 rounded-xl items-center", themeBg)}>
                            <Text className="text-white font-bold text-lg">{tCommon.add}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- ADD GOAL MODAL --- */}
            <Modal visible={goalModalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-gray-900">{tGoals.add_goal}</Text>
                            <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-96">
                            <Text className="text-sm font-bold text-gray-500 mb-3">{tGoals.goal_title_label}</Text>
                            <View className="flex-row gap-2 mb-4">
                                {['vision', 'year', 'month', 'week'].map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => setSelectedGoalType(t as any)}
                                        className={cn("px-4 py-2 rounded-full border", selectedGoalType === t ? `${themeBg} border-transparent` : "bg-white border-gray-200")}
                                    >
                                        <Text className={cn("font-bold capitalize", selectedGoalType === t ? "text-white" : "text-gray-500")}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                value={goalTitle}
                                onChangeText={setGoalTitle}
                                placeholder={tGoals.goal_title_placeholder}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-lg mb-4"
                            />

                            {selectedGoalType !== 'vision' && (
                                <View className="flex-row gap-4 mb-6">
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-gray-500 mb-2">{tGoals.target_amount_label}</Text>
                                        <TextInput
                                            value={goalTarget}
                                            onChangeText={setGoalTarget}
                                            keyboardType="numeric"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-lg text-center"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-gray-500 mb-2">단위 (Unit)</Text>
                                        <TextInput
                                            value={goalUnit}
                                            onChangeText={setGoalUnit}
                                            placeholder="회, 원..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-lg text-center"
                                        />
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        <TouchableOpacity onPress={handleAddGoal} disabled={!goalTitle.trim()} className={cn("w-full py-4 rounded-xl items-center shadow-lg", goalTitle.trim() ? themeBg : "bg-gray-200 shadow-none")}>
                            <Text className="text-white font-bold text-lg">{tGoals.add_button}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <TutorialOverlay
                visible={showTutorial}
                onComplete={() => setShowTutorial(false)}
                steps={[
                    {
                        target: { x: 20, y: 270, width: width - 40, height: 180, borderRadius: 24 },
                        title: "함께하는 목표 🏆",
                        description: "이번 달 공과금 아끼기, 매주 대청소하기 등 메이트들과 함께 달성할 목표를 세워보세요.",
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 300, width: width - 40, height: 180, borderRadius: 24 },
                        title: "우리의 규칙 📜",
                        description: "손님 초대, 소음 시간 등 갈등을 줄이기 위한 우리 집만의 약속을 명문화할 수 있습니다.",
                        position: "top"
                    },
                    {
                        target: { x: width - 60, y: 65, width: 44, height: 44, borderRadius: 22 },
                        title: "새로운 약속 추가",
                        description: "플러스 버튼을 눌러 목표나 규칙을 언제든지 새롭게 추가할 수 있어요.",
                        position: "bottom"
                    }
                ]}
            />
        </View >
    );
}
