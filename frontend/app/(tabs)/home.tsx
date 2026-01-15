import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { AVATARS, THEMES, NEST_AVATARS } from '../../constants/data';
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
        nickname, avatarId, nestName, nestTheme, nestId, nestAvatarId,
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

                {/* Nest Header (Modern & Simple) */}
                <View className={cn("pt-16 pb-8 px-6 rounded-b-[40px] mb-8 items-center", themeItemBg)}>
                    <View className="w-20 h-20 bg-white rounded-[32px] items-center justify-center mb-4 shadow-sm overflow-hidden p-3 transform rotate-3">
                        <Image
                            source={(NEST_AVATARS.find((a: any) => a.id === nestAvatarId) || NEST_AVATARS[0]).image}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </View>

                    <Text className="text-gray-500 font-bold text-sm mb-1 text-center tracking-wide uppercase">{greeting}</Text>
                    <Text className="text-2xl font-black text-gray-900 text-center mb-6">{nestName}</Text>

                    {/* Member Stack (Clean Pill) */}
                    <View className="flex-row items-center bg-white py-2 pl-2 pr-4 rounded-full shadow-sm border border-gray-100">
                        <View className="flex-row -space-x-2 mr-3">
                            {members.slice(0, 4).map((m: any, i: number) => (
                                <Avatar
                                    key={m.id}
                                    source={(AVATARS[m.avatarId] || AVATARS[0]).image}
                                    size="xs"
                                    borderColor="#FFFFFF"
                                    borderWidth={2}
                                />
                            ))}
                        </View>
                        <Text className="text-gray-600 font-bold text-xs">
                            {members.length === 0 ? t.empty_mate : `${members.length} Mates`}
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="absolute top-14 right-4 w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
                        onPress={() => router.push('/(tabs)/settings')}
                    >
                        <Ionicons name="settings-outline" size={22} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                <View className="px-6 gap-6">

                    {/* 1. Smart Briefing Card (Modern Dark) */}
                    <Animated.View entering={FadeInUp.delay(200)} className="bg-gray-900 rounded-[32px] p-6 shadow-xl shadow-gray-200">
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center">
                                    <Text className="text-xl">✨</Text>
                                </View>
                                <View>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Daily Briefing</Text>
                                    <Text className="text-white text-lg font-bold">오늘의 체크리스트</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setActivityModalVisible(true)} className="w-8 h-8 bg-gray-800 rounded-full items-center justify-center">
                                <Ionicons name="notifications" size={16} color="white" />
                                <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-gray-900" />
                            </TouchableOpacity>
                        </View>

                        <View className="gap-3">
                            {/* Smart Content Logic */}
                            {upcomingEvents.length > 0 ? (
                                <View className="bg-gray-800 p-4 rounded-2xl flex-row gap-4 items-center">
                                    <View className="bg-orange-500/20 w-10 h-10 rounded-xl items-center justify-center">
                                        <Text className="text-lg">📅</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-orange-300 font-bold text-xs mb-1">D-{getDDay(upcomingEvents[0].date).replace('D-', '')} Upcoming</Text>
                                        <Text className="text-white font-bold text-base" numberOfLines={1}>{upcomingEvents[0].title}</Text>
                                    </View>
                                </View>
                            ) : activeGoals.length > 0 ? (
                                <View className="bg-gray-800 p-4 rounded-2xl flex-row gap-4 items-center">
                                    <View className="bg-blue-500/20 w-10 h-10 rounded-xl items-center justify-center">
                                        <Text className="text-lg">🏆</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-blue-300 font-bold text-xs mb-1">Focus Goal</Text>
                                        <Text className="text-white font-bold text-base" numberOfLines={1}>{activeGoals[0].title}</Text>
                                        <Text className="text-gray-400 text-xs mt-1">{activeGoals[0].current}% 달성 중</Text>
                                    </View>
                                </View>
                            ) : (
                                <View className="bg-gray-800 p-4 rounded-2xl flex-row gap-4 items-center">
                                    <View className="bg-green-500/20 w-10 h-10 rounded-xl items-center justify-center">
                                        <Text className="text-lg">🌿</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-green-300 font-bold text-xs mb-1">Peaceful Day</Text>
                                        <Text className="text-white font-bold text-base">오늘 하루도 행복하게!</Text>
                                    </View>
                                </View>
                            )}

                            {incompleteTodos.length > 0 && (
                                <View className="bg-gray-800/50 p-4 rounded-2xl flex-row justify-between items-center">
                                    <Text className="text-gray-400 font-medium text-sm">남은 할 일</Text>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-white font-bold">{incompleteTodos.length}개</Text>
                                        <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {/* 2. Upcoming Schedule (Clean List) */}
                    <View>
                        <SectionHeader title="돌아오는 일정 📅" onPress={() => router.push('/(tabs)/plan')} />
                        {upcomingEvents.length === 0 ? (
                            <View className="bg-gray-50 p-8 rounded-[32px] items-center justify-center border border-gray-100/50">
                                <Text className="text-4xl mb-4 opacity-30">🗓️</Text>
                                <Text className="text-gray-400 font-medium">등록된 일정이 없어요</Text>
                            </View>
                        ) : (
                            <View className="gap-3">
                                {upcomingEvents.slice(0, 3).map((evt: any, index: number) => {
                                    const dday = getDDay(evt.date);
                                    const isToday = dday === '오늘';

                                    return (
                                        <Animated.View key={evt.id} entering={FadeInDown.delay(index * 100 + 300)}
                                            className="flex-row bg-white p-5 rounded-3xl border border-gray-100 items-center shadow-sm"
                                        >
                                            {/* Date Box (Modern) */}
                                            <View className={cn("w-14 h-14 rounded-2xl items-center justify-center mr-5", isToday ? "bg-gray-900" : "bg-gray-50")}>
                                                <Text className={cn("text-[10px] font-bold uppercase", isToday ? "text-gray-400" : "text-gray-400")}>
                                                    {new Date(evt.date).getMonth() + 1}월
                                                </Text>
                                                <Text className={cn("text-xl font-black", isToday ? "text-white" : "text-gray-900")}>
                                                    {new Date(evt.date).getDate()}
                                                </Text>
                                            </View>

                                            {/* Content */}
                                            <View className="flex-1 gap-1">
                                                <View className="flex-row justify-between items-center">
                                                    <View className={cn("px-2 py-0.5 rounded-md self-start mb-1", isToday ? "bg-red-50" : "bg-gray-100")}>
                                                        <Text className={cn("text-[10px] font-bold", isToday ? "text-red-500" : "text-gray-500")}>{dday}</Text>
                                                    </View>
                                                </View>
                                                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{evt.title}</Text>
                                                <Text className="text-gray-400 text-xs font-medium">
                                                    {evt.endDate ? `${evt.date} ~ ${evt.endDate}` : 'All Day'}
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
                                className="mt-4 flex-row justify-center items-center py-4 bg-gray-50 rounded-2xl active:bg-gray-100"
                            >
                                <Text className="text-gray-500 font-bold text-sm">전체 일정 보기</Text>
                                <Ionicons name="arrow-forward" size={16} color="#6B7280" className="ml-2" />
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
