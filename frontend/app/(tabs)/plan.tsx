import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { useUserStore, Todo } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { THEMES, AVATARS } from '../../constants/data';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { translations, Language } from '../../constants/I18n';

// --- CALENDAR LOCALE SETUP ---
LocaleConfig.locales['kr'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

export default function PlanScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ action?: string }>();
    const {
        nestTheme, events, addEvent, voteEvent, deleteEvent, avatarId,
        todos, addTodo, toggleTodo, deleteTodo, members, language
    } = useUserStore();

    const t = translations[language as Language];
    const tCalendar = t.calendar;
    const tTodo = t.todo;
    const tCommon = t.common;

    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeBorder = THEMES[nestTheme]?.color?.replace('bg-', 'border-') || 'border-orange-500';
    const activeColorHex = themeBg.includes('orange') ? '#FF7F50' : '#FF7F50';

    // --- SELECTION MODAL STATE ---
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);

    // --- CALENDAR STATE ---
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [calModalVisible, setCalModalVisible] = useState(false);
    const [eventText, setEventText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [eventTime, setEventTime] = useState<string>('');
    const [isTimeEnabled, setIsTimeEnabled] = useState(false);

    // --- TODO STATE ---
    const [todoModalVisible, setTodoModalVisible] = useState(false);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([members[0]?.id || '0']);
    const [repeatOption, setRepeatOption] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
    const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
    const [repeatEndDate, setRepeatEndDate] = useState<string | null>(null);

    // Handle Deep Linking / Params
    React.useEffect(() => {
        if (params.action === 'add') {
            setCalModalVisible(true); // Default to calendar add if general add
            router.setParams({ action: '' });
        }
    }, [params.action]);

    // --- ACTIONS ---
    const handleAddButtonPress = () => {
        setSelectionModalVisible(true);
    };

    const handleSelectAction = (action: 'event' | 'todo') => {
        setSelectionModalVisible(false);
        setTimeout(() => {
            if (action === 'event') setCalModalVisible(true);
            else setTodoModalVisible(true);
        }, 300);
    };

    // --- CALENDAR LOGIC ---
    const handleDayPress = (day: DateData) => setSelectedDate(day.dateString);
    const isDateInRange = (target: string, start: string, end?: string) => {
        if (!end) return target === start;
        return target >= start && target <= end;
    };
    const selectedEvents = events.filter(e => isDateInRange(selectedDate, e.date, e.endDate));

    const renderDay = ({ date, state }: any) => {
        if (!date) return <View />;
        const dayEvents = events.filter(e => isDateInRange(date.dateString, e.date, e.endDate));
        const isSelected = selectedDate === date.dateString;
        const isToday = today === date.dateString;

        return (
            <TouchableOpacity onPress={() => handleDayPress(date)} className="w-[100%] h-16 items-center pt-1">
                <View className={cn("w-6 h-6 rounded-full items-center justify-center mb-0.5", isSelected ? themeBg : "bg-transparent")}>
                    <Text className={cn("font-medium text-xs", isSelected ? "text-white font-bold" : (state === 'disabled' ? "text-gray-300" : "text-gray-800"), !isSelected && isToday ? "text-blue-600 font-bold" : "")}>{date.day}</Text>
                </View>
                <View className="w-full px-0.5 gap-0.5">
                    {dayEvents.slice(0, 2).map((evt, i) => (
                        <View key={i} className={cn("rounded px-1 py-0.5 flex-row items-center", isSelected ? "bg-gray-800" : themeBg)}>
                            <Text className="text-[8px] text-white font-bold" numberOfLines={1}>{evt.title}</Text>
                        </View>
                    ))}
                    {dayEvents.length > 2 && <Text className="text-[8px] text-gray-400 text-center">+{dayEvents.length - 2}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const addDays = (dateStr: string, days: number) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    const onAddEvent = () => {
        if (!eventText.trim()) return;
        const timeToSend = isTimeEnabled && eventTime.trim() ? eventTime.trim() : undefined;
        addEvent(eventText, selectedDate, selectedImage || undefined, endDate || undefined, timeToSend);
        setEventText(''); setSelectedImage(null); setEndDate(null); setEventTime(''); setIsTimeEnabled(false); setCalModalVisible(false);
    };

    const pickImage = async (forTodo = false) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5,
        });
        if (!result.canceled) setSelectedImage(result.assets[0].uri);
    };

    // --- TODO LOGIC ---
    const dailyMissions = todos.filter(t => t.repeat !== 'weekly');
    const weeklyMissions = todos.filter(t => t.repeat === 'weekly');

    const getFutureDate = (months: number) => {
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
    };

    const handleAddTodo = () => {
        if (newTodoTitle.trim()) {
            addTodo(newTodoTitle, selectedAssigneeIds, repeatOption, selectedImage || undefined);
            setNewTodoTitle(''); setRepeatOption('none'); setIsRepeatEnabled(false); setSelectedImage(null); setRepeatEndDate(null); setTodoModalVisible(false);
        }
    };

    const toggleAssignee = (id: string) => {
        if (selectedAssigneeIds.includes(id)) {
            if (selectedAssigneeIds.length > 1) setSelectedAssigneeIds(prev => prev.filter(mid => mid !== id));
        } else {
            setSelectedAssigneeIds(prev => [...prev, id]);
        }
    };

    const TodoItem = ({ item, index }: { item: Todo, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 50)} layout={Layout.springify()} className={cn("flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border", item.isCompleted ? "border-gray-100 opacity-60" : "border-gray-100")}>
            <TouchableOpacity onPress={() => toggleTodo(item.id, '0')} className={cn("w-6 h-6 rounded-md border-2 mr-3 items-center justify-center", item.isCompleted ? `${themeBg} ${themeBorder}` : "border-gray-300 bg-white")}>
                {item.isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
            </TouchableOpacity>
            <View className="flex-1 mr-2">
                <View className="flex-row items-center gap-1 mb-1">
                    {item.repeat === 'daily' && <View className="bg-blue-100 px-1.5 py-0.5 rounded text-xs"><Text className="text-blue-600 text-[10px] font-bold">{tTodo.daily_badge}</Text></View>}
                    <Text className={cn("text-lg font-medium", item.isCompleted ? "text-gray-400 line-through" : "text-gray-800")}>{item.title}</Text>
                </View>
                {item.imageUrl && <Image source={{ uri: item.imageUrl }} className="w-16 h-16 rounded-lg mb-1" />}
            </View>
            <View className="items-end justify-center">
                <View className="flex-row pl-2">
                    {item.assignees?.map((assignee, i) => (
                        <Image key={assignee.id} source={(AVATARS[assignee.avatarId] || AVATARS[0]).image} className="w-8 h-8 rounded-full border-2 border-white -ml-2" style={{ zIndex: 10 - i }} />
                    ))}
                </View>
            </View>
            <TouchableOpacity onPress={() => deleteTodo(item.id)} className="ml-2 pl-2 border-l border-gray-100">
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-16 pb-4 px-6 bg-white flex-row justify-between items-center shadow-sm z-10">
                <Text className="text-2xl font-bold text-gray-900">
                    {tCalendar.title}
                </Text>
                {/* Global Add Button */}
                <TouchableOpacity
                    onPress={handleAddButtonPress}
                    className={cn("w-10 h-10 rounded-full items-center justify-center shadow-md", themeBg)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Single Page ScrollView */}
            <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Calendar Section */}
                <View className="bg-white pb-6 rounded-b-3xl shadow-sm mb-6">
                    <Calendar
                        current={today}
                        dayComponent={renderDay}
                        key={JSON.stringify(events)}
                        theme={{ arrowColor: activeColorHex, monthTextColor: '#1F2937', textMonthFontWeight: '800' }}
                    />
                </View>

                {/* Selected Date Events */}
                <View className="px-6 mb-8">
                    {/* Date Header + Inline Add Button */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-gray-800 flex-row items-center">
                            📅 {Number(selectedDate.split('-')[1])}월 {Number(selectedDate.split('-')[2])}일
                        </Text>
                        <TouchableOpacity
                            onPress={() => setCalModalVisible(true)}
                            className="bg-white border border-gray-200 px-3 py-1.5 rounded-full flex-row items-center shadow-sm active:bg-gray-50"
                        >
                            <Ionicons name="add" size={14} color="#374151" />
                            <Text className="text-xs font-bold text-gray-700 ml-1">
                                {language === 'ko' ? "이 날짜에 추가" : "Add to this date"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {selectedEvents.length === 0 ? (
                        <View className="bg-white rounded-2xl p-6 items-center justify-center border border-gray-100 border-dashed mb-2">
                            <Text className="text-gray-400 font-medium text-sm">{tCalendar.no_events}</Text>
                        </View>
                    ) : (
                        selectedEvents.map((evt, idx) => {
                            const isVote = evt.type === 'vote';
                            const voteCount = evt.votes[selectedDate]?.length || 0;
                            const hasVoted = evt.votes[selectedDate]?.includes(String(avatarId));
                            return (
                                <Animated.View key={evt.id} entering={FadeInUp.delay(idx * 100)} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
                                    <View className="flex-row items-start gap-3">
                                        <View className={cn("w-1 h-full rounded-full absolute left-0 top-0 bottom-0", themeBg)} />
                                        <View className="flex-1 ml-3">
                                            <View className="flex-row justify-between items-start">
                                                <View>
                                                    <Text className="text-gray-800 font-bold text-lg">{evt.title} {evt.time && <Text className={cn("text-base font-medium", themeText)}> {evt.time}</Text>}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => deleteEvent(evt.id)}><Ionicons name="trash-outline" size={20} color="#9CA3AF" /></TouchableOpacity>
                                            </View>
                                            {evt.imageUrl && <Image source={{ uri: evt.imageUrl }} className="w-full h-32 rounded-lg my-2 bg-gray-100" resizeMode="cover" />}
                                            {isVote && (
                                                <TouchableOpacity onPress={() => voteEvent(evt.id, selectedDate, String(avatarId))} className={cn("flex-row items-center px-4 py-2 rounded-xl mt-2 border", hasVoted ? `${themeBg} border-transparent` : "bg-gray-50 border-gray-200")}>
                                                    <Text className={cn("text-sm font-bold mr-2", hasVoted ? "text-white" : "text-gray-500")}>{hasVoted ? "참가 완료" : "참가하기"}</Text>
                                                    <View className={cn("px-2 py-0.5 rounded-full", hasVoted ? "bg-white/20" : "bg-white border border-gray-200")}><Text className={cn("text-xs font-bold", hasVoted ? "text-white" : "text-gray-500")}>{voteCount}명</Text></View>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })
                    )}
                </View>

                {/* Todos Section */}
                <View className="px-6">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-lg font-bold text-gray-800">✅ {language === 'ko' ? "할 일" : "Todo"}</Text>
                    </View>

                    {todos.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-100 border-dashed">
                            <Text className="text-gray-400 text-sm">{tTodo.empty_list_title}</Text>
                        </View>
                    ) : (
                        <>
                            <Text className="text-sm font-bold text-gray-500 mb-2 ml-1">{tTodo.today}</Text>
                            {dailyMissions.length > 0 ? dailyMissions.map((item, index) => <TodoItem key={item.id} item={item} index={index} />) : <Text className="text-gray-400 ml-1 mb-6 text-xs">{tTodo.empty_today}</Text>}

                            <View className="h-4" />

                            <Text className="text-sm font-bold text-gray-500 mb-2 ml-1">{tTodo.weekly}</Text>
                            {weeklyMissions.length > 0 ? weeklyMissions.map((item, index) => <TodoItem key={item.id} item={item} index={index} />) : <Text className="text-gray-400 ml-1 text-xs">{tTodo.empty_weekly}</Text>}
                        </>
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
                            onPress={() => handleSelectAction('event')}
                            className="p-5 border-b border-gray-100 flex-row items-center justify-center bg-gray-50 active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">📅</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "일정 추가하기" : "Add Event"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleSelectAction('todo')}
                            className="p-5 flex-row items-center justify-center bg-white active:bg-gray-100"
                        >
                            <Text className="text-2xl mr-3">✅</Text>
                            <Text className="text-lg font-bold text-gray-800">
                                {language === 'ko' ? "할 일 추가하기" : "Add Todo"}
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

            {/* Calendar Modal */}
            <Modal animationType="fade" transparent={true} visible={calModalVisible} onRequestClose={() => setCalModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-3xl p-6 pb-12">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">{tCalendar.add_event}</Text>
                            <TouchableOpacity onPress={() => setCalModalVisible(false)}><Text className="text-gray-400 text-lg">{tCommon.cancel}</Text></TouchableOpacity>
                        </View>
                        <TextInput
                            value={eventText}
                            onChangeText={setEventText}
                            placeholder={tCalendar.event_title_placeholder}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-lg mb-2 font-medium"
                        />

                        {/* Time Input Toggle */}
                        <View className="mb-4">
                            {!isTimeEnabled ? (
                                <TouchableOpacity onPress={() => setIsTimeEnabled(true)}>
                                    <Text className={cn("text-sm font-bold underline ml-1", themeText)}>
                                        + {language === 'ko' ? "시간 추가" : "Add Time"}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View className="flex-row items-center gap-2">
                                    <View className="flex-1">
                                        <TextInput
                                            value={eventTime}
                                            onChangeText={setEventTime}
                                            placeholder={language === 'ko' ? "예: 오후 2시" : "e.g. 2:00 PM"}
                                            className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900"
                                            autoFocus
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => { setIsTimeEnabled(false); setEventTime(''); }}
                                        className="p-2 bg-gray-100 rounded-full"
                                    >
                                        <Ionicons name="close" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <View className="mb-6 space-y-3">
                            <View>
                                {!endDate ? (
                                    <TouchableOpacity onPress={() => setEndDate(addDays(selectedDate, 1))}><Text className={cn("text-sm font-bold underline mb-2", themeText)}>+ {tCalendar.end_date_label}</Text></TouchableOpacity>
                                ) : (
                                    <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 mb-2">
                                        <View><Text className="text-xs text-gray-400">종료일</Text><Text className="text-lg font-bold text-gray-800">{endDate}</Text></View>
                                        <TouchableOpacity onPress={() => setEndDate(null)}><Ionicons name="close-circle" size={24} color="#9CA3AF" /></TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity onPress={onAddEvent} disabled={!eventText.trim()} className={cn("w-full py-4 rounded-xl items-center shadow-lg", eventText.trim() ? themeBg : "bg-gray-200 shadow-none")}>
                            <Text className="text-white font-bold text-lg">{tCommon.add}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Todo Modal */}
            <Modal animationType="slide" transparent={true} visible={todoModalVisible} onRequestClose={() => setTodoModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">{tTodo.add_modal}</Text>
                            <TouchableOpacity onPress={() => setTodoModalVisible(false)}><Text className="text-gray-400 font-medium">{tCommon.cancel}</Text></TouchableOpacity>
                        </View>
                        <TextInput value={newTodoTitle} onChangeText={setNewTodoTitle} placeholder={tTodo.placeholder_input} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-lg mb-4" />

                        <Text className="text-sm font-bold text-gray-500 mb-3">{tTodo.repeat_label}</Text>
                        {/* Repeat Options */}
                        <View className="flex-row gap-2 bg-gray-50 p-2 rounded-xl mb-4">
                            {(['none', 'daily', 'weekly'] as const).map((opt) => (
                                <TouchableOpacity key={opt} onPress={() => setRepeatOption(opt as any)} className={cn("flex-1 py-2 rounded-lg items-center", repeatOption === opt ? "bg-white shadow-sm" : "")}>
                                    <Text className={cn("font-bold text-xs", repeatOption === opt ? themeText : "text-gray-400")}>{opt === 'none' ? (language === 'ko' ? "반복 안함" : "None") : opt === 'daily' ? (language === 'ko' ? "매일" : "Daily") : (language === 'ko' ? "매주" : "Weekly")}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Repeat End Date (Advanced) */}
                        {repeatOption !== 'none' && (
                            <Animated.View entering={FadeInUp} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <Text className="text-xs font-bold text-gray-500 mb-2">
                                    {language === 'ko' ? "언제까지 반복할까요?" : "Repeat until?"}
                                </Text>
                                <View className="flex-row gap-2 mb-2">
                                    {[1, 3, 6].map(month => (
                                        <TouchableOpacity
                                            key={month}
                                            onPress={() => setRepeatEndDate(getFutureDate(month))}
                                            className={cn("px-3 py-1.5 rounded-lg border", repeatEndDate === getFutureDate(month) ? `bg-white ${themeBorder}` : "bg-white border-gray-200")}
                                        >
                                            <Text className={cn("text-xs font-medium", repeatEndDate === getFutureDate(month) ? themeText : "text-gray-500")}>
                                                {month}{language === 'ko' ? "개월" : "m"}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        onPress={() => setRepeatEndDate(null)}
                                        className={cn("px-3 py-1.5 rounded-lg border", !repeatEndDate ? "bg-gray-200 border-transparent" : "bg-white border-gray-200")}
                                    >
                                        <Text className="text-xs font-medium text-gray-500">{language === 'ko' ? "계속(무제한)" : "Forever"}</Text>
                                    </TouchableOpacity>
                                </View>
                                {repeatEndDate && (
                                    <Text className="text-xs text-gray-400 text-right">
                                        ~ {repeatEndDate} {language === 'ko' ? "종료" : "End"}
                                    </Text>
                                )}
                            </Animated.View>
                        )}

                        <TouchableOpacity onPress={handleAddTodo} disabled={!newTodoTitle.trim()} className={cn("w-full py-4 rounded-xl items-center shadow-lg", newTodoTitle.trim() ? themeBg : "bg-gray-200 shadow-none")}>
                            <Text className="text-white font-bold text-lg">{tCommon.add}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
