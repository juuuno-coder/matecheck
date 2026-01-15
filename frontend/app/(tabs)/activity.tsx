import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { THEMES, AVATARS } from '../../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/Config';
import { translations, Language } from '../../constants/I18n';
import { useRouter } from 'expo-router';

// Define Rule Interface here too (or move to types)
interface HouseRule {
    id: number;
    title: string;
    description: string;
    rule_type: string;
    priority: number;
    created_at?: string; // Assume API returns this
}

export default function ActivityScreen() {
    const { nestTheme, todos, events, goals, members, language, nestName, nestId } = useUserStore();
    const router = useRouter();
    const t = translations[language as Language];

    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';

    const [rules, setRules] = useState<HouseRule[]>([]);

    // Fetch Rules specifically for Activity Log since it's not in global store yet
    useEffect(() => {
        if (nestId) {
            fetch(`${API_URL}/nests/${nestId}/house_rules`)
                .then(res => res.json())
                .then(data => setRules(data))
                .catch(err => console.error("Failed to fetch rules for activity:", err));
        }
    }, [nestId]);

    // Helper to format date (mock)
    const today = new Date().toISOString().split('T')[0];

    // 1. Nest Creation Log
    const nestCreationLog = {
        id: 'nest-created',
        type: 'nest',
        title: nestName,
        user: members[0] || { nickname: 'Admin', avatarId: 0 },
        date: today,
        message: language === 'ko' ? "보금자리가 개설되었어요 🎉" : "The nest was created 🎉",
        targetPath: '/(tabs)/settings'
    };

    // 2. Member Join Logs
    const memberJoinLogs = members.slice(1).map((m, i) => ({
        id: `join-${m.id}`,
        type: 'join',
        title: nestName,
        user: m,
        date: today,
        message: language === 'ko' ? "새로운 가족이 합류했어요 👋" : "joined the family 👋",
        targetPath: '/(tabs)/settings'
    }));

    // 3. Completed Todos
    const completedTodosLogs = todos.filter(todo => todo.isCompleted).map(todo => ({
        id: `todo-${todo.id}`,
        type: 'todo',
        title: todo.title,
        user: members.find(m => m.id === todo.completedBy) || members.find(m => m.id === todo.assignees[0]?.id) || members[0],
        date: today,
        message: language === 'ko' ? "할 일을 완료했어요 ✅" : "completed a task ✅",
        targetPath: '/(tabs)/plan?action=todo'
    }));

    // 4. Events Created
    const createdEventsLogs = events.map(event => ({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        user: members.find(m => m.id === event.creatorId) || members[0],
        date: event.date,
        message: language === 'ko' ? "일정을 추가했어요 📅" : "added a schedule 📅",
        targetPath: '/(tabs)/plan'
    }));

    // 5. Goals Added
    const goalLogs = goals.map(goal => ({
        id: `goal-${goal.id}`,
        type: 'goal',
        title: goal.title,
        user: members[0], // Goals are communal, attribution is less important or defaults to admin
        date: today,
        message: language === 'ko'
            ? `우리 보금자리 ${nestName}에\n새로운 목표가 추가되었어요 ✨`
            : `A new goal was added to\nour nest ${nestName} ✨`,
        targetPath: '/(tabs)/rules'
    }));

    // 6. Rules Added
    const ruleLogs = rules.map(rule => ({
        id: `rule-${rule.id}`,
        type: 'rule',
        title: rule.title,
        user: members[0], // Rules are communal
        date: rule.created_at ? rule.created_at.split('T')[0] : today, // Use real date if available
        message: language === 'ko'
            ? `우리 보금자리 ${nestName}에\n새로운 규칙이 추가되었어요 📜`
            : `A new rule was added to\nour nest ${nestName} 📜`,
        targetPath: '/(tabs)/rules'
    }));

    // Merge all logs
    const activities = [
        ...completedTodosLogs,
        ...createdEventsLogs,
        ...goalLogs,
        ...ruleLogs,
        ...memberJoinLogs,
        nestCreationLog
    ].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return 0; // Simple stable sort
    });

    const handlePress = (path: string) => {
        if (path.includes('?')) {
            router.push(path as any);
        } else {
            router.push(path as any);
        }
    };

    const ActivityItem = ({ item }: { item: any }) => {
        // Customize text based on type
        const isCommunal = item.type === 'goal' || item.type === 'rule' || item.type === 'nest';

        return (
            <View className="flex-row items-start mb-6 px-4">
                {/* Timeline Line */}
                <View className="absolute left-[34px] top-10 bottom-[-24px] w-0.5 bg-gray-100" />

                <Image
                    source={(AVATARS[item.user?.avatarId || 0] || AVATARS[0]).image}
                    className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm z-10"
                />

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handlePress(item.targetPath)}
                    className="flex-1 ml-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-row items-center gap-1">
                            {!isCommunal && <Text className="font-bold text-gray-900 text-base">{item.user?.nickname || 'Unknown'}</Text>}
                            <Text className="text-xs text-gray-400 mt-0.5">{item.date}</Text>
                        </View>
                    </View>

                    {isCommunal ? (
                        <View>
                            <Text className="text-gray-800 text-sm font-medium mb-1 leading-5">{item.message}</Text>
                            <Text className={cn("text-base font-bold", themeText)}>{item.title}</Text>
                        </View>
                    ) : (
                        <Text className="text-gray-600 mb-1 leading-5">
                            {item.user?.nickname}{language === 'ko' ? "님이 " : " "}
                            <Text className="font-medium text-gray-800">{item.title}</Text>
                            {language === 'ko'
                                ? (item.type === 'join' ? "에 " : "을(를) ")
                                : " "
                            }
                            {item.message.replace("보금자리를 ", "").replace("보금자리에 ", "").replace("할 일을 ", "").replace("일정을 ", "").replace("created the nest", "created").replace("joined the nest", "joined").replace("completed a task", "completed").replace("added a schedule", "added")}
                        </Text>
                    )}

                    {!isCommunal && (
                        <Text className="text-sm text-gray-400 mt-1">
                            {item.message}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-4 px-6 bg-white border-b border-gray-100 shadow-sm z-10">
                <Text className="text-2xl font-bold text-gray-800">
                    {language === 'ko' ? "활동 기록 👀" : "Activity Log 👀"}
                </Text>
            </View>

            <ScrollView className="flex-1 pt-6" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {activities.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-5xl mb-4">📭</Text>
                        <Text className="text-gray-400 text-lg">
                            {language === 'ko' ? "아직 활동 내역이 없어요" : "No activity yet"}
                        </Text>
                    </View>
                ) : (
                    activities.map((item, index) => (
                        <ActivityItem key={index} item={item} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}
