import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../../store/userStore';
import { useRouter } from 'expo-router';
import { cn } from '../../../lib/utils';
import { AVATARS } from '../../../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '../../../constants/I18n';
import Avatar from '../../../components/Avatar';
import * as Clipboard from 'expo-clipboard';
import { Dimensions } from 'react-native';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
    const {
        nickname, avatarId, nestName, logout, members, nestId, inviteCode,
        pendingRequests, fetchJoinRequests, approveJoinRequest,
        language, setLanguage, isMaster
    } = useUserStore();
    const router = useRouter();
    const t = (translations[language as keyof typeof translations] as any).settings;

    const [localInviteCode, setLocalInviteCode] = useState<string>('');

    useEffect(() => {
        if (nestId) {
            fetchJoinRequests();
            if (!inviteCode) {
                const randomCode = 'MC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                setLocalInviteCode(randomCode);
            } else {
                setLocalInviteCode(inviteCode);
            }
        }
    }, [nestId, inviteCode]);

    const handleUnlink = () => {
        Alert.alert(
            "서비스 연동 해제",
            "토스 앱과의 연동을 해제하시겠습니까?\n모든 데이터가 초기화됩니다.",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "해제하기",
                    style: "destructive",
                    onPress: () => {
                        logout();
                        router.replace('/toss'); // Go back to Toss Intro
                    }
                }
            ]
        );
    };

    const toggleLanguage = () => {
        const nextLang = language === 'ko' ? 'en' : 'ko';
        setLanguage(nextLang);
    };

    const onCopyCode = async () => {
        if (!localInviteCode) return;
        await Clipboard.setStringAsync(localInviteCode);
        const message = language === 'ko' ? "초대 코드가 복사되었습니다." : "Invite code copied.";
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(language === 'ko' ? "복사 완료" : "Copied", message);
        }
    };

    const SettingItem = ({ icon, label, value, onPress, isDestructive = false }: any) => (
        <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between py-5 px-6 active:bg-gray-50">
            <View className="flex-row items-center gap-4">
                <View className={cn("w-10 h-10 rounded-2xl items-center justify-center", isDestructive ? "bg-red-50" : "bg-gray-50")}>
                    <Ionicons name={icon} size={20} color={isDestructive ? "#EF4444" : "#4B5563"} />
                </View>
                <Text className={cn("text-base font-bold", isDestructive ? "text-red-500" : "text-gray-900")}>{label}</Text>
            </View>
            <View className="flex-row items-center gap-2">
                {value && <Text className="text-gray-400 font-medium text-sm">{value}</Text>}
                {!isDestructive && <Ionicons name="chevron-forward" size={18} color="#E5E7EB" />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ title: language === 'ko' ? "더보기" : "Settings" }} />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-6 pt-6">

                {/* Profile Card */}
                <View className="flex-row items-center gap-5 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <View>
                        <Avatar
                            source={(AVATARS[avatarId] || AVATARS[0]).image}
                            size="lg"
                            borderColor="#FFFFFF"
                            borderWidth={4}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900 mb-1">{nickname}</Text>
                        <Text className="text-gray-500 font-medium text-sm">@{nestName}</Text>
                    </View>
                </View>

                {/* Join Requests */}
                {pendingRequests.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-sm font-bold text-gray-900 mb-3 px-2">🔔 {t.join_requests}</Text>
                        <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 gap-2">
                            {pendingRequests.map((req: any) => (
                                <View key={req.id} className="flex-row items-center justify-between p-4 bg-orange-50 rounded-2xl">
                                    <View className="flex-row items-center gap-3">
                                        <Avatar source={(AVATARS[req.avatarId] || AVATARS[0]).image} size="sm" />
                                        <Text className="text-base font-bold text-gray-900">{req.nickname}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => approveJoinRequest(req.id)}
                                        className="bg-[#3182F6] w-10 h-10 rounded-full items-center justify-center shadow-sm"
                                    >
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Settings List */}
                <View className="gap-6">
                    {/* Management */}
                    <View>
                        <Text className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">관리</Text>
                        <View className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm">
                            <SettingItem
                                icon="home"
                                label="보금자리 관리"
                                value={nestName}
                                onPress={() => router.push('/toss/nest_management')}
                            />
                            <View className="h-[1px] bg-gray-50 mx-6" />
                            <SettingItem
                                icon="people"
                                label="구성원 관리"
                                onPress={() => router.push('/toss/member_management')}
                            />
                            <View className="h-[1px] bg-gray-50 mx-6" />
                            <SettingItem
                                icon="share-social"
                                label="초대 코드 복사"
                                value={localInviteCode}
                                onPress={onCopyCode}
                            />
                        </View>
                    </View>

                    {/* App Settings */}
                    <View>
                        <Text className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">설정</Text>
                        <View className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm">
                            <SettingItem
                                icon="notifications"
                                label="알림 설정"
                                value="On"
                            />
                            <View className="h-[1px] bg-gray-50 mx-6" />
                            <SettingItem
                                icon="globe"
                                label="언어 / Language"
                                value={language === 'ko' ? "한국어" : "English"}
                                onPress={toggleLanguage}
                            />
                        </View>
                    </View>

                    {/* Account */}
                    <View>
                        <View className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm">
                            <SettingItem
                                icon="log-out"
                                label="서비스 연동 해제"
                                isDestructive
                                onPress={handleUnlink}
                            />
                        </View>
                    </View>

                    <View className="items-center py-4">
                        <Text className="text-gray-300 text-xs font-bold">Version 1.0.0 (Toss App)</Text>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}
