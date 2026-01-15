import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { AVATARS, THEMES } from '../../constants/data';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '../../constants/I18n';
import TutorialOverlay from '../../components/TutorialOverlay';
import FloatingActionMenu from '../../components/FloatingActionMenu';
import Avatar from '../../components/Avatar';
import ActivityModal from '../../components/ActivityModal';

const { width, height } = Dimensions.get('window');

const getDDay = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days < 0) return `D+${Math.abs(days)}`;
    return `D-${days}`;
};

export default function HomeScreen() {
    const router = useRouter();
    const {
        nickname, avatarId, nestName, nestTheme, nestId,
        todos, events, goals, members, language: langFromStore, hasSeenTutorial, completeTutorial,
        syncMissions, syncEvents, syncGoals, syncTransactions
    } = useUserStore();
    const language = langFromStore as 'ko' | 'en';
    const t = (translations[language] as any).home;
    const [greeting, setGreeting] = useState('');
    const [activityModalVisible, setActivityModalVisible] = useState(false);

    // Theme setup
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';
    const themeItemBg = THEMES[nestTheme]?.bg || 'bg-orange-50';

    // Data Aggregation
    const incompleteTodos = todos.filter((t: any) => !t.isCompleted).slice(0, 3);
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingEvents = events
        .filter((e: any) => e.date >= todayStr)
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
        .slice(0, 2);

    // Top 3 Goals (Vision or Year preferred, else any)
    const activeGoals = goals.sort((a: any, b: any) => {
        const order = { vision: 0, year: 1, month: 2, week: 3 };
        return order[a.type as keyof typeof order] - order[b.type as keyof typeof order];
    }).slice(0, 3);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting(t.greeting_morning);
        else if (hour < 18) setGreeting(t.greeting_afternoon);
        else setGreeting(t.greeting_evening);

        // Sync data if we have nestId
        if (nestId) {
            syncMissions();
            syncEvents();
            syncGoals();
            syncTransactions();
        }
    }, [nestId, language]);

    const SectionHeader = ({ title, onPress }: { title: string, onPress: () => void }) => (
        <View className="flex-row justify-between items-center mb-3 mt-6">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <TouchableOpacity onPress={onPress}>
                <Text className="text-gray-400 text-sm">{language === 'ko' ? '더보기 ›' : 'More ›'}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Nest Header (Centered & Large) */}
                <View className={cn("pt-20 pb-10 px-6 rounded-b-[50px] mb-6 items-center", themeItemBg)}>
                    <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-sm">
                        <Text className="text-5xl">🪐</Text>
                    </View>

                    <Text className="text-gray-500 font-medium text-sm mb-1 text-center">{greeting}</Text>
                    <Text className="text-3xl font-extrabold text-gray-900 text-center mb-6">{nestName}</Text>

                    {/* Member Stack (Centered) */}
                    <View className="flex-row items-center bg-white/80 py-2 px-4 rounded-full shadow-sm">
                        <View className="flex-row pl-2 mr-2">
                            {members.slice(0, 4).map((m: any, i: number) => (
                                <Avatar
                                    key={m.id}
                                    source={(AVATARS[m.avatarId] || AVATARS[0]).image}
                                    size="xs"
                                    className="-ml-3"
                                    borderColor="#FFFFFF"
                                    borderWidth={2}
                                />
                            ))}
                        </View>
                        <Text className="text-gray-600 font-semibold text-xs">{t.mate_count.replace('{count}', members.length.toString())}</Text>
                    </View>

                    <TouchableOpacity
                        className="absolute top-16 right-16 p-2 rounded-full bg-white/50"
                        onPress={() => setActivityModalVisible(true)}
                    >
                        <Ionicons name="notifications-outline" size={20} color="#4B5563" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="absolute top-16 right-6 p-2 rounded-full bg-white/50"
                        onPress={() => router.push('/(tabs)/settings')}
                    >
                        <Ionicons name="settings-outline" size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                <View className="px-6 gap-8">

                    {/* 1. AI Agent Briefing Card */}
                    <Animated.View entering={FadeInUp.delay(200)} className="bg-gray-900 rounded-3xl p-6 shadow-xl shadow-orange-500/20">
                        <View className="flex-row items-center mb-4 gap-3">
                            <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center">
                                <Ionicons name="sparkles" size={20} color="white" />
                            </View>
                            <View>
                                <Text className="text-orange-400 text-xs font-bold uppercase tracking-wider">Smart Briefing</Text>
                                <Text className="text-white text-lg font-bold">오늘의 체크리스트</Text>
                            </View>
                        </View>

                        <View className="gap-3">
                            {/* Priority 1: Event */}
                            {upcomingEvents.length > 0 ? (
                                <View className="flex-row items-start gap-3 bg-white/10 p-3 rounded-xl">
                                    <Text className="text-xl">📅</Text>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-xs">잊지 마세요!</Text>
                                        <Text className="text-white font-medium">
                                            <Text className="font-bold text-orange-300">'{upcomingEvents[0].title}'</Text> 일정이 {getDDay(upcomingEvents[0].date)} 있어요.
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View className="flex-row items-start gap-3 bg-white/10 p-3 rounded-xl">
                                    <Text className="text-xl">📅</Text>
                                    <Text className="text-gray-300 mt-1">예정된 일정이 없어서 여유로워요.</Text>
                                </View>
                            )}

                            {/* Priority 2: Goal */}
                            {activeGoals.length > 0 && (
                                <View className="flex-row items-start gap-3 bg-white/10 p-3 rounded-xl">
                                    <Text className="text-xl">🏆</Text>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-xs">목표 달성 응원!</Text>
                                        <Text className="text-white font-medium">
                                            <Text className="font-bold text-orange-300">{activeGoals[0].title}</Text> {activeGoals[0].current}% 달성 중이에요!
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Priority 3: Mission Count */}
                            <View className="flex-row items-start gap-3 bg-white/10 p-3 rounded-xl">
                                <Text className="text-xl">✅</Text>
                                <View className="flex-1">
                                    <Text className="text-gray-300 text-xs">오늘의 미션</Text>
                                    {incompleteTodos.length > 0 ? (
                                        <Text className="text-white font-medium">
                                            아직 <Text className="font-bold text-orange-300">{incompleteTodos.length}개의 미션</Text>이 남아있어요. 화이팅!
                                        </Text>
                                    ) : (
                                        <Text className="text-white font-medium">모든 미션을 완료했어요! 완벽해요 🎉</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* 2. Upcoming Schedule (Pretty UI) */}
                    <View>
                        <SectionHeader title="돌아오는 일정 📅" onPress={() => router.push('/(tabs)/plan')} />
                        {upcomingEvents.length === 0 ? (
                            <View className="bg-gray-50 p-6 rounded-2xl items-center border border-gray-100 border-dashed">
                                <Text className="text-gray-400">예정된 일정이 없어요.</Text>
                            </View>
                        ) : (
                            <View className="gap-3">
                                {upcomingEvents.slice(0, 3).map((evt: any, index: number) => {
                                    const dday = getDDay(evt.date);
                                    const isToday = dday === '오늘';

                                    return (
                                        <Animated.View key={evt.id} entering={FadeInDown.delay(index * 100 + 300)} className="flex-row bg-white p-4 rounded-3xl border border-gray-100 shadow-sm items-center">
                                            {/* Date Box */}
                                            <View className={cn("w-16 h-16 rounded-2xl items-center justify-center mr-4 shadow-sm", isToday ? "bg-orange-500" : "bg-gray-50")}>
                                                <Text className={cn("text-xs font-bold uppercase mb-0.5", isToday ? "text-white" : "text-gray-400")}>
                                                    {new Date(evt.date).getMonth() + 1}월
                                                </Text>
                                                <Text className={cn("text-2xl font-black", isToday ? "text-white" : "text-gray-900")}>
                                                    {new Date(evt.date).getDate()}
                                                </Text>
                                            </View>

                                            {/* Content */}
                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-start mb-1">
                                                    <Text className="font-bold text-gray-900 text-lg flex-1 mr-2" numberOfLines={1}>{evt.title}</Text>
                                                    <View className={cn("px-2 py-1 rounded-full", isToday ? "bg-red-100" : "bg-gray-100")}>
                                                        <Text className={cn("text-[10px] font-bold", isToday ? "text-red-600" : "text-gray-500")}>{dday}</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-gray-400 text-sm">
                                                    {evt.endDate ? `${evt.date} ~ ${evt.endDate}` : '하루 종일'}
                                                </Text>
                                            </View>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        )}
                        {upcomingEvents.length > 0 && (
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/plan')}
                                className="mt-4 flex-row justify-center items-center py-3 bg-gray-50 rounded-xl"
                            >
                                <Text className="text-gray-500 font-medium text-sm">전체 일정 보기</Text>
                                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </ScrollView >

            <TutorialOverlay
                visible={!hasSeenTutorial}
                onComplete={completeTutorial}
                steps={[
                    {
                        target: { x: 20, y: 170, width: width - 40, height: 260, borderRadius: 24 },
                        title: "오늘의 체크리스트 ✅",
                        description: "룸메이트와 오늘 하기로 한 할 일들을 확인하세요. 완료 버튼을 눌러 서로에게 공유할 수 있어요.",
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 450, width: width - 40, height: 180, borderRadius: 24 },
                        title: "우리 집 일정 📅",
                        description: "집들이, 공과금 납부일 등 메이트들과 공유해야 할 중요한 일정들을 미리 확인하세요.",
                        position: "top"
                    },
                    {
                        target: { x: 0, y: height - (Platform.OS === 'ios' ? 95 : 70), width: width, height: 90, borderRadius: 0 },
                        title: "스마트한 메뉴 이동 🚀",
                        description: "규칙 정하기, 일정 공유, 함께 목표 달성, 공금 정산까지 하단 메뉴에서 빠르게 이동하세요.",
                        position: "top"
                    }
                ]}
            />

            <FloatingActionMenu themeBg={THEMES[nestTheme]?.color || 'bg-orange-500'} />

            <ActivityModal
                visible={activityModalVisible}
                onClose={() => setActivityModalVisible(false)}
            />
        </View >
    );
}
