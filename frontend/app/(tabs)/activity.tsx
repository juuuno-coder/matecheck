import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { THEMES, AVATARS } from '../../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { translations, Language } from '../../constants/I18n';
import { useRouter } from 'expo-router';

export default function ActivityScreen() {
    const { nestTheme, todos, events, members, language, nestName } = useUserStore();
    const router = useRouter();
    const t = translations[language as Language];

    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';

    // Helper to format date (mock)
    const today = new Date().toISOString().split('T')[0];

    // 1. Nest Creation Log (Mock - assumes first member created it)
    const nestCreationLog = {
        id: 'nest-created',
        type: 'nest',
        title: nestName,
        user: members[0] || { nickname: 'Admin', avatarId: 0 },
        date: today,
        message: language === 'ko' ? "보금자리를 개설했어요 🎉" : "created the nest 🎉",
        targetPath: '/(tabs)/settings'
    };

    // 2. Member Join Logs (Mock)
    const memberJoinLogs = members.slice(1).map((m, i) => ({
        id: `join-${m.id}`,
        type: 'join',
        title: nestName,
        user: m,
        date: today,
        message: language === 'ko' ? "보금자리에 구성원으로 참여했어요 👋" : "joined the nest 👋",
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
        targetPath: '/(tabs)/plan?action=todo' // We'll handle this param in Plan if needed, or just go to Plan
    }));

    // 4. Events Created
    const createdEventsLogs = events.map(event => ({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        user: members.find(m => m.id === event.creatorId) || members[0], // Fallback to first member if creator not found
        date: event.date,
        message: language === 'ko' ? "일정을 추가했어요 📅" : "added a schedule 📅",
        targetPath: '/(tabs)/plan'
    }));

    // Merge all logs and sort by date (descending - mock logic putting Nest creation last)
    // Actually, we want newest first. Since most dates are 'today', we'll rely on array order mostly.
    const activities = [
        ...completedTodosLogs,
        ...createdEventsLogs,
        ...memberJoinLogs,
        nestCreationLog
    ].sort((a, b) => {
        // Simple sort: if dates are different, sort by date. If same, random(mock) or keep order.
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return 0; // Keep relative order for same day, roughly
    });

    const handlePress = (path: string) => {
        // Simple navigation. For query params support, we might need adjustments in the target screens.
        // Currently, direct push works for tab switching in Expo Router.
        if (path.includes('?')) {
            const [pathname, query] = path.split('?');
            // Expo Router handle params slightly differently but for Tabs, simple push often works or use 'href'
            // We'll use router.push with object for safer handling if needed, but string works for tabs usually.
            router.push(path as any);
        } else {
            router.push(path as any);
        }
    };

    const ActivityItem = ({ item }: { item: any }) => (
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
                <View className="flex-row justify-between items-start mb-1">
                    <Text className="font-bold text-gray-900 text-base">
                        {item.user?.nickname || (language === 'ko' ? '알 수 없음' : 'Unknown')}
                    </Text>
                    <Text className="text-xs text-gray-400">{item.date}</Text>
                </View>
                <Text className="text-gray-600 mb-1 leading-5">
                    {item.user?.nickname} {language === 'ko' ? "님이" : ""} <Text className="font-medium text-gray-800">{item.title}</Text>
                    {language === 'ko' ? (item.type === 'join' ? "에" : "을(를)") : ""} {item.message.replace(language === 'ko' ? "보금자리를 " : "", "").replace(language === 'ko' ? "보금자리에 " : "", "").replace(language === 'ko' ? "할 일을 " : "", "").replace(language === 'ko' ? "일정을 " : "", "")}
                </Text>

                {/* Simplified Message Display */}
                <Text className="text-sm text-gray-500 mt-1">
                    {item.message}
                </Text>
            </TouchableOpacity>
        </View>
    );

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
