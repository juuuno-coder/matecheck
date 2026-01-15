import { View, Text, ScrollView, Image } from 'react-native';
import React from 'react';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { THEMES, AVATARS } from '../../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { translations, Language } from '../../constants/I18n';

export default function ActivityScreen() {
    const { nestTheme, todos, events, members, language } = useUserStore();
    const t = translations[language as Language];

    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';

    // Combine Todos (Completed) and Events into a timeline
    const completedTodos = todos.filter(todo => todo.isCompleted).map(todo => ({
        id: `todo-${todo.id}`,
        type: 'todo',
        title: todo.title,
        user: members.find(m => m.id === todo.completedBy) || members.find(m => m.id === todo.assignees[0]?.id) || members[0], // Fallback
        date: new Date().toISOString().split('T')[0], // Mock date for now as we don't store completion date
        message: language === 'ko' ? "할 일을 완료했어요!" : "completed a task!"
    }));

    const createdEvents = events.map(event => ({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        user: members.find(m => m.id === event.creatorId) || members[0],
        date: event.date,
        message: language === 'ko' ? "새로운 일정을 등록했어요." : "added a new event."
    }));

    // Merge and Sort (Mock sorting by ID or just mixing them for demo)
    // In a real app, we would have 'createdAt' or 'completedAt' timestamps.
    const activities = [...completedTodos, ...createdEvents].sort(() => Math.random() - 0.5);

    const ActivityItem = ({ item }: { item: any }) => (
        <View className="flex-row items-start mb-6 px-4">
            {/* Timeline Line */}
            <View className="absolute left-[34px] top-10 bottom-[-24px] w-0.5 bg-gray-100" />

            <Image
                source={(AVATARS[item.user?.avatarId || 0] || AVATARS[0]).image}
                className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm z-10"
            />

            <View className="flex-1 ml-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-start mb-1">
                    <Text className="font-bold text-gray-900 text-base">{item.user?.nickname || '알 수 없음'}</Text>
                    <Text className="text-xs text-gray-400">{item.date}</Text>
                </View>
                <Text className="text-gray-600 mb-2">
                    {item.message} <Text className={cn("font-bold", themeText)}>{item.title}</Text>
                </Text>
                {item.type === 'todo' && (
                    <View className="flex-row items-center">
                        <Ionicons name="checkbox" size={16} color="#4B5563" />
                        <Text className="text-xs text-gray-500 ml-1">Mission Completed</Text>
                    </View>
                )}
                {item.type === 'event' && (
                    <View className="flex-row items-center">
                        <Ionicons name="calendar" size={16} color="#4B5563" />
                        <Text className="text-xs text-gray-500 ml-1">Event Created</Text>
                    </View>
                )}
            </View>
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

            <ScrollView className="flex-1 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
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
