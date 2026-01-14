import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { THEMES, AVATARS } from '../../constants/data';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

LocaleConfig.locales['kr'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

export default function CalendarScreen() {
    const { nestTheme, events, addEvent, voteEvent, deleteEvent, avatarId } = useUserStore();
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';

    // Derived Colors for Calendar
    const activeColorHex = themeBg.includes('orange') ? '#FF7F50' :
        themeBg.includes('teal') ? '#26A69A' :
            themeBg.includes('indigo') ? '#5C6BC0' : '#FF7F50';

    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [modalVisible, setModalVisible] = useState(false);
    const [eventText, setEventText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const handleDayPress = (day: DateData) => setSelectedDate(day.dateString);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const onAddEvent = () => {
        if (!eventText.trim()) return;
        addEvent(eventText, selectedDate, selectedImage || undefined, endDate || undefined);
        setEventText('');
        setSelectedImage(null);
        setEndDate(null);
        setModalVisible(false);
    };

    // Helper to check if a date is between start and end (inclusive)
    const isDateInRange = (target: string, start: string, end?: string) => {
        if (!end) return target === start;
        return target >= start && target <= end;
    };

    const selectedEvents = events.filter(e => isDateInRange(selectedDate, e.date, e.endDate));

    // Custom Day Component
    const renderDay = ({ date, state }: any) => {
        if (!date) return <View />;

        const dayEvents = events.filter(e => isDateInRange(date.dateString, e.date, e.endDate));
        const isSelected = selectedDate === date.dateString;
        const isToday = today === date.dateString;

        return (
            <TouchableOpacity
                onPress={() => handleDayPress(date)}
                className="w-[100%] h-16 items-center pt-1"
            >
                {/* Date Number Indicator */}
                <View className={cn(
                    "w-6 h-6 rounded-full items-center justify-center mb-0.5",
                    isSelected ? themeBg : "bg-transparent"
                )}>
                    <Text className={cn(
                        "font-medium text-xs",
                        isSelected ? "text-white font-bold" : (state === 'disabled' ? "text-gray-300" : "text-gray-800"),
                        !isSelected && isToday ? "text-blue-600 font-bold" : ""
                    )}>
                        {date.day}
                    </Text>
                </View>

                {/* Event Summaries */}
                <View className="w-full px-0.5 gap-0.5">
                    {dayEvents.slice(0, 2).map((evt, i) => (
                        <View key={i} className={cn("rounded px-1 py-0.5 flex-row items-center", isSelected ? "bg-gray-800" : themeBg)}>
                            <Text className="text-[8px] text-white font-bold" numberOfLines={1}>
                                {evt.title}
                            </Text>
                        </View>
                    ))}
                    {dayEvents.length > 2 && (
                        <Text className="text-[8px] text-gray-400 text-center">+{dayEvents.length - 2}</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Helper to add days to date string
    const addDays = (dateStr: string, days: number) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    return (
        <View className="flex-1 bg-white">
            <View className="pt-16 px-6 pb-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-800">일정 캘린더</Text>
                <TouchableOpacity
                    onPress={() => {
                        setEndDate(null); // Reset
                        setModalVisible(true);
                    }}
                    className={cn("w-10 h-10 rounded-full items-center justify-center opacity-90", themeBg)}
                >
                    <Text className="text-2xl text-white font-bold mb-1">+</Text>
                </TouchableOpacity>
            </View>

            <View className="mt-4">
                <Calendar
                    current={today}
                    dayComponent={renderDay}
                    key={JSON.stringify(events)} // Force re-render when events change
                    theme={{
                        // Basic theme overrides if needed, though dayComponent handles most
                        arrowColor: activeColorHex,
                        monthTextColor: '#1F2937',
                        textMonthFontWeight: '800',
                    }}
                />
            </View>

            <View className="flex-1 px-6 pt-6 bg-gray-50 rounded-t-3xl mt-4 border-t border-gray-100 shadow-inner">
                <Text className="text-lg font-bold text-gray-800 mb-4 flex-row items-center">
                    {selectedDate.split('-')[1]}월 {selectedDate.split('-')[2]}일 일정
                </Text>

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    {selectedEvents.length === 0 ? (
                        <View className="items-center justify-center py-12 opacity-50">
                            <Text className="text-4xl mb-4">🏝️</Text>
                            <Text className="text-gray-400 font-medium">등록된 일정이 없습니다.</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)} className="mt-4">
                                <Text className={cn("font-bold", themeText)}>+ 일정 추가하기</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        selectedEvents.map((evt, idx) => {
                            const isVote = evt.type === 'vote';
                            const voteCount = evt.votes[selectedDate]?.length || 0;
                            const hasVoted = evt.votes[selectedDate]?.includes(String(avatarId));
                            const isMultiDay = evt.endDate && evt.endDate !== evt.date;

                            return (
                                <Animated.View
                                    key={evt.id}
                                    entering={FadeInUp.delay(idx * 100)}
                                    className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row items-start gap-3">
                                        <View className={cn("w-1 h-full rounded-full absolute left-0 top-0 bottom-0", themeBg)} />
                                        <View className="flex-1 ml-3">
                                            <View className="flex-row justify-between items-start">
                                                <View>
                                                    <Text className="text-gray-800 font-bold text-lg">{evt.title}</Text>
                                                    {isMultiDay && (
                                                        <Text className="text-xs text-blue-500 font-bold mb-1">
                                                            {evt.date} ~ {evt.endDate}
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text className="text-gray-400 text-xs mt-1">작성자: {AVATARS[Number(evt.creatorId)]?.label || '멤버'}</Text>
                                            </View>

                                            {evt.imageUrl && (
                                                <Image source={{ uri: evt.imageUrl }} className="w-full h-32 rounded-lg my-2 bg-gray-100" resizeMode="cover" />
                                            )}

                                            {isVote && (
                                                <View className="flex-row items-center justify-between mt-2">
                                                    <TouchableOpacity
                                                        onPress={() => voteEvent(evt.id, selectedDate, String(avatarId))}
                                                        className={cn(
                                                            "flex-row items-center px-4 py-2 rounded-xl border",
                                                            hasVoted ? `${themeBg} border-transparent` : "bg-gray-50 border-gray-200"
                                                        )}
                                                    >
                                                        <Text className={cn("text-sm font-bold mr-2", hasVoted ? "text-white" : "text-gray-500")}>
                                                            {hasVoted ? "참가 완료" : "참가하기"}
                                                        </Text>
                                                        <View className={cn("px-2 py-0.5 rounded-full", hasVoted ? "bg-white/20" : "bg-white border border-gray-200")}>
                                                            <Text className={cn("text-xs font-bold", hasVoted ? "text-white" : "text-gray-500")}>
                                                                {voteCount}명
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity onPress={() => deleteEvent(evt.id)} className="p-2">
                                                        <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })
                    )}
                </ScrollView>
            </View>

            {/* Modal */}
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-3xl p-6 pb-12">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">새로운 일정</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-gray-400 text-lg">취소</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={eventText}
                            onChangeText={setEventText}
                            placeholder="예: 가족 저녁 식사, 여행"
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-lg mb-2 font-medium"
                            autoFocus
                            placeholderTextColor="#9CA3AF"
                        />

                        {/* End Date Toggle */}
                        <View className="mb-6">
                            {!endDate ? (
                                <TouchableOpacity onPress={() => setEndDate(addDays(selectedDate, 1))}>
                                    <Text className={cn("text-sm font-bold underline", themeText)}>+ 종료일 입력하기</Text>
                                </TouchableOpacity>
                            ) : (
                                <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <View>
                                        <Text className="text-xs text-gray-400">종료일</Text>
                                        <Text className="text-lg font-bold text-gray-800">{endDate}</Text>
                                    </View>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity onPress={() => setEndDate(addDays(endDate, 1))} className="bg-white border border-gray-200 px-3 py-1 rounded-lg">
                                            <Text className="font-bold text-gray-600">+1일</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setEndDate(null)}>
                                            <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Image Picker */}
                        <TouchableOpacity
                            onPress={pickImage}
                            className="flex-row items-center gap-2 mb-6"
                        >
                            <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center border border-gray-200 border-dashed">
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage }} className="w-full h-full rounded-lg" />
                                ) : (
                                    <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                                )}
                            </View>
                            <Text className="text-gray-500 font-medium">
                                {selectedImage ? "사진 변경" : "사진 추가 (선택)"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onAddEvent}
                            disabled={!eventText.trim()}
                            className={cn(
                                "w-full py-4 rounded-xl items-center shadow-lg shadow-orange-200",
                                eventText.trim() ? themeBg : "bg-gray-200 shadow-none"
                            )}
                        >
                            <Text className="text-white font-bold text-lg">추가하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
