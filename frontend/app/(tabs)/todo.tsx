import { View, Text, TouchableOpacity, Image, Modal, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useUserStore, Todo } from '../../store/userStore';
import { cn } from '../../lib/utils';
import { AVATARS, THEMES } from '../../constants/data';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { translations } from '../../constants/I18n';

export default function TodoScreen() {
    const { todos, addTodo, toggleTodo, deleteTodo, nestTheme, members, language } = useUserStore();
    const router = useRouter();
    const t = translations[language].tabs;

    const labels = {
        ko: {
            title: "우리의 미션 🚀",
            success: "모든 미션을 완료했습니다!",
            add_new: "새로운 미션을 추가해보세요.",
            today: "오늘의 미션 🔥",
            weekly: "이번 주 미션 ✨",
            empty_today: "오늘 예정된 미션이 없어요.",
            empty_weekly: "이번 주 미션이 없어요.",
            add_modal: "미션 추가",
            cancel: "취소",
            placeholder_label: "어떤 미션인가요?",
            placeholder: "예: 분리수거 대장, 빨래 개기 마스터",
            image_add: "인증샷 예시 추가 (선택)",
            image_change: "사진 변경하기",
            repeat_label: "반복 설정",
            repeats: { none: '반복 없음', daily: '매일 반복', weekly: '매주 반복' },
            assignee_label: "누구의 미션인가요?",
            submit: "미션 등록하기",
            unknown: "알 수 없음",
            daily_badge: "매일"
        },
        en: {
            title: "Missions 🚀",
            success: "All missions completed!",
            add_new: "Try adding a new mission.",
            today: "Today's Missions 🔥",
            weekly: "This Week's Missions ✨",
            empty_today: "No missions scheduled for today.",
            empty_weekly: "No weekly missions.",
            add_modal: "Add Mission",
            cancel: "Cancel",
            placeholder_label: "What's the mission?",
            placeholder: "e.g. Trash Hero, Laundry Master",
            image_add: "Add proof photo example (Optional)",
            image_change: "Change photo",
            repeat_label: "Repeat Setting",
            repeats: { none: 'None', daily: 'Daily', weekly: 'Weekly' },
            assignee_label: "Whose mission is it?",
            submit: "Register Mission",
            unknown: "Unknown",
            daily_badge: "Daily"
        }
    }[language];

    // Theme Colors
    const themeBg = THEMES[nestTheme]?.color || 'bg-orange-500';
    const themeText = THEMES[nestTheme]?.color?.replace('bg-', 'text-') || 'text-orange-600';
    const themeBorder = THEMES[nestTheme]?.color?.replace('bg-', 'border-') || 'border-orange-500';

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([members[0]?.id || '0']);
    const [repeatOption, setRepeatOption] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);

    // Grouping
    const dailyMissions = todos.filter(t => t.repeat !== 'weekly');
    const weeklyMissions = todos.filter(t => t.repeat === 'weekly');

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

    const toggleAssignee = (id: string) => {
        if (selectedAssigneeIds.includes(id)) {
            if (selectedAssigneeIds.length > 1) {
                setSelectedAssigneeIds(prev => prev.filter(mid => mid !== id));
            }
        } else {
            setSelectedAssigneeIds(prev => [...prev, id]);
        }
    };

    const handleAddTodo = () => {
        if (newTodoTitle.trim()) {
            addTodo(newTodoTitle, selectedAssigneeIds, repeatOption, selectedImage || undefined);
            setNewTodoTitle('');
            setRepeatOption('none');
            setIsRepeatEnabled(false);
            setSelectedImage(null);
            setModalVisible(false);
        }
    };

    const getMemberAvatar = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        return AVATARS[member?.avatarId || 0].image;
    };

    const TodoItem = ({ item, index }: { item: Todo, index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 50)}
            layout={Layout.springify()}
            className={cn(
                "flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border",
                item.isCompleted ? "border-gray-100 opacity-60" : "border-gray-100"
            )}
        >
            <TouchableOpacity
                onPress={() => toggleTodo(item.id, '0')} // '0' is current user ID for mock
                className={cn(
                    "w-6 h-6 rounded-md border-2 mr-3 items-center justify-center",
                    item.isCompleted ? `${themeBg} ${themeBorder}` : "border-gray-300 bg-white"
                )}
            >
                {item.isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
            </TouchableOpacity>

            <View className="flex-1 mr-2">
                <View className="flex-row items-center gap-1 mb-1">
                    {item.repeat === 'daily' && <View className="bg-blue-100 px-1.5 py-0.5 rounded text-xs"><Text className="text-blue-600 text-[10px] font-bold">{labels.daily_badge}</Text></View>}
                    <Text className={cn(
                        "text-lg font-medium",
                        item.isCompleted ? "text-gray-400 line-through" : "text-gray-800"
                    )}>
                        {item.title}
                    </Text>
                </View>
                {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} className="w-16 h-16 rounded-lg mb-1" />
                )}
            </View>

            {/* Assigned / Completed UI */}
            <View className="items-end justify-center">
                {item.isCompleted ? (
                    <View className="flex-row items-center">
                        <View className="items-end mr-2">
                            {/* Show completer name */}
                            <Text className={cn("text-xs font-bold", themeText)}>Completed</Text>
                        </View>
                        <View>
                            <Image
                                source={getMemberAvatar(item.completedBy || item.assignees[0]?.id)}
                                className={cn("w-10 h-10 rounded-full border-2", themeBorder)}
                            />
                            <View className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full items-center justify-center border border-white", themeBg)}>
                                <Ionicons name="checkmark" size={10} color="white" />
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="items-center">
                        <Text className="text-[10px] text-gray-400 mb-0.5">To.</Text>
                        <View className="flex-row pl-2">
                            {item.assignees?.map((assignee, i) => (
                                <Image
                                    key={assignee.id}
                                    source={AVATARS[assignee.avatarId].image}
                                    className="w-8 h-8 rounded-full border-2 border-white -ml-2"
                                    style={{ zIndex: 10 - i }}
                                />
                            ))}
                        </View>
                        {item.assignees?.length === 1 && (
                            <Text className="text-[10px] text-gray-500 mt-0.5">{item.assignees[0].nickname}</Text>
                        )}
                    </View>
                )}
            </View>

            <TouchableOpacity onPress={() => deleteTodo(item.id)} className="ml-2 pl-2 border-l border-gray-100">
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </Animated.View>
    );

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
                {todos.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-5xl mb-4">🎉</Text>
                        <Text className="text-gray-400 text-lg">{labels.success}</Text>
                        <Text className="text-gray-300 text-sm mt-2">{labels.add_new}</Text>
                    </View>
                ) : (
                    <>
                        <Text className="text-lg font-bold text-gray-800 mb-3 ml-1">{labels.today}</Text>
                        {dailyMissions.length > 0 ? (
                            dailyMissions.map((item, index) => (
                                <TodoItem key={item.id} item={item} index={index} />
                            ))
                        ) : (
                            <Text className="text-gray-400 ml-1 mb-6">{labels.empty_today}</Text>
                        )}

                        <View className="h-6" />

                        <Text className="text-lg font-bold text-gray-800 mb-3 ml-1">{labels.weekly}</Text>
                        {weeklyMissions.length > 0 ? (
                            weeklyMissions.map((item, index) => (
                                <TodoItem key={item.id} item={item} index={index} />
                            ))
                        ) : (
                            <Text className="text-gray-400 ml-1">{labels.empty_weekly}</Text>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Add Todo Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">{labels.add_modal}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-gray-400 font-medium">{labels.cancel}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-bold text-gray-500 mb-2">{labels.placeholder_label}</Text>
                        <TextInput
                            value={newTodoTitle}
                            onChangeText={setNewTodoTitle}
                            placeholder={labels.placeholder}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-lg mb-4"
                            autoFocus
                        />

                        {/* Image Picker */}
                        <TouchableOpacity
                            onPress={pickImage}
                            className="flex-row items-center gap-2 mb-6"
                        >
                            <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center border border-gray-200 border-dashed">
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage }} className="w-full h-full rounded-lg" />
                                ) : (
                                    <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
                                )}
                            </View>
                            <Text className="text-gray-500 font-medium">
                                {selectedImage ? labels.image_change : labels.image_add}
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-sm font-bold text-gray-500 mb-3">{labels.repeat_label}</Text>
                        <View className="mb-6">
                            <View className="flex-row items-center gap-3 mb-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsRepeatEnabled(!isRepeatEnabled);
                                        if (isRepeatEnabled) setRepeatOption('none');
                                        else setRepeatOption('daily');
                                    }}
                                    className={cn("px-4 py-2 rounded-full border", isRepeatEnabled ? `${themeBg} border-transparent` : "bg-gray-100 border-gray-200")}
                                >
                                    <Text className={cn("font-bold text-xs", isRepeatEnabled ? "text-white" : "text-gray-500")}>
                                        {isRepeatEnabled ? "반복 설정 ON" : "반복 안함"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {isRepeatEnabled && (
                                <View className="flex-row gap-2 bg-gray-50 p-2 rounded-xl">
                                    {(['daily', 'weekly', 'monthly'] as const).map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            onPress={() => setRepeatOption(opt)}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg items-center",
                                                repeatOption === opt ? "bg-white shadow-sm" : ""
                                            )}
                                        >
                                            <Text className={cn(
                                                "font-bold text-xs",
                                                repeatOption === opt ? themeText : "text-gray-400"
                                            )}>
                                                {opt === 'daily' ? '매일' : opt === 'weekly' ? '매주' : '매월'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <Text className="text-sm font-bold text-gray-500 mb-3">{labels.assignee_label}</Text>
                        <View className="flex-row flex-wrap gap-4 mb-8">
                            {members.map((member) => {
                                const isSelected = selectedAssigneeIds.includes(member.id);
                                return (
                                    <TouchableOpacity
                                        key={member.id}
                                        onPress={() => toggleAssignee(member.id)}
                                        className={cn(
                                            "items-center p-1 rounded-full border-2 relative",
                                            isSelected ? themeBorder : "border-transparent"
                                        )}
                                    >
                                        <Image source={AVATARS[member.avatarId].image} className="w-12 h-12 rounded-full bg-gray-100" />
                                        {isSelected && (
                                            <View className={cn("absolute top-0 right-0 w-4 h-4 rounded-full items-center justify-center border border-white", themeBg)}>
                                                <Ionicons name="checkmark" size={10} color="white" />
                                            </View>
                                        )}
                                        <Text className={cn(
                                            "text-xs mt-1 font-medium",
                                            isSelected ? themeText : "text-gray-400"
                                        )}>{member.nickname}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            onPress={handleAddTodo}
                            disabled={!newTodoTitle.trim()}
                            className={cn(
                                "w-full py-4 rounded-xl items-center shadow-lg",
                                newTodoTitle.trim() ? themeBg : "bg-gray-200 shadow-none"
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
