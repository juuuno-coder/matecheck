import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Share, Platform, ToastAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import { cn } from '../../lib/utils';
import { AVATARS } from '../../constants/data';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '../../constants/I18n';
import Avatar from '../../components/Avatar';
import * as Clipboard from 'expo-clipboard';
import TutorialOverlay from '../../components/TutorialOverlay';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
    const {
        nickname, avatarId, nestName, logout, members, nestId, inviteCode,
        pendingRequests, fetchJoinRequests, approveJoinRequest,
        language, setLanguage
    } = useUserStore();
    const router = useRouter();
    const t = (translations[language as keyof typeof translations] as any).settings;

    const [localInviteCode, setLocalInviteCode] = useState<string>('');
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        if (nestId) {
            fetchJoinRequests();

            // Mock invite code generation for functionality
            if (!inviteCode) {
                // Generate a random code if not provided by backend yet
                const randomCode = 'MC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                setLocalInviteCode(randomCode);
            } else {
                setLocalInviteCode(inviteCode);
            }
        }
    }, [nestId, inviteCode]);

    const handleLogout = () => {
        Alert.alert(
            t.logout,
            t.confirm_logout,
            [
                { text: t.cancel, style: "cancel" },
                {
                    text: t.logout,
                    style: "destructive",
                    onPress: () => {
                        logout();
                        router.replace('/');
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

    const onShareInvite = async () => {
        if (!localInviteCode) return;
        const url = `https://matecheck-pearl.vercel.app/join_nest?code=${localInviteCode}`;
        try {
            await Share.share({
                message: language === 'ko'
                    ? `[MateCheck] 메이트체크에 초대합니다!\n\n초대 코드: ${localInviteCode}\n\n함께 즐거운 동거 생활을 시작해보세요!\n${url}`
                    : `[MateCheck] Join my nest!\n\nInvite Code: ${localInviteCode}\n\nStart your happy co-living journey!\n${url}`,
                url: url,
                title: language === 'ko' ? "메이트체크 초대" : "MateCheck Invitation"
            });
        } catch (error) {
            console.error(error);
        }
    };

    const SettingItem = ({ icon, label, value, onPress, isDestructive = false }: any) => (
        <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between py-4 border-b border-gray-100 bg-white px-6 active:bg-gray-50">
            <View className="flex-row items-center gap-3">
                <View className={cn("w-8 h-8 rounded-full items-center justify-center", isDestructive ? "bg-red-50" : "bg-gray-50")}>
                    <Ionicons name={icon} size={18} color={isDestructive ? "#EF4444" : "#4B5563"} />
                </View>
                <Text className={cn("text-base font-medium", isDestructive ? "text-red-500" : "text-gray-700")}>{label}</Text>
            </View>
            <View className="flex-row items-center gap-2">
                {value && <Text className="text-gray-400 text-sm">{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <View className="pt-16 pb-6 px-6 bg-white mb-4 shadow-sm flex-row justify-between items-start">
                <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-6">
                        <Text className="text-2xl font-bold text-gray-800 font-primary">{t.title}</Text>
                        <TouchableOpacity onPress={() => setShowTutorial(true)}>
                            <Ionicons name="help-circle-outline" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center gap-4">
                        <Avatar
                            source={(AVATARS[avatarId] || AVATARS[0]).image}
                            size="lg"
                            borderColor="#E5E7EB"
                            borderWidth={1}
                        />
                        <View>
                            <Text className="text-xl font-bold text-gray-900">{nickname}</Text>
                            <Text className="text-gray-500">{nestName}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                {/* Join Requests Section */}
                {pendingRequests.length > 0 && (
                    <View className="mb-4">
                        <Text className="px-6 py-2 text-xs font-bold text-orange-500 uppercase">{t.join_requests} ({pendingRequests.length})</Text>
                        {pendingRequests.map((req: any) => (
                            <View key={req.id} className="flex-row items-center justify-between py-4 border-b border-gray-100 bg-orange-50/30 px-6">
                                <View className="flex-row items-center gap-3">
                                    <Avatar source={(AVATARS[req.avatarId] || AVATARS[0]).image} size="sm" />
                                    <View>
                                        <Text className="text-base font-bold text-gray-800">{req.nickname}</Text>
                                        <Text className="text-gray-400 text-xs">{language === 'ko' ? '보금자리 참여를 요청했습니다.' : 'Requested to join MateHome.'}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => approveJoinRequest(req.id)}
                                    className="bg-orange-500 px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white font-bold text-sm">{language === 'ko' ? '수락' : 'Approve'}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <View className="mb-2">
                    <Text className="px-6 py-2 text-xs font-bold text-gray-400 uppercase">{t.account_section}</Text>
                    <SettingItem icon="person-outline" label={t.profile_edit} onPress={() => router.push('/profile_edit')} />
                    <SettingItem icon="notifications-outline" label={t.notifications} value="On" />
                    <SettingItem
                        icon="earth-outline"
                        label={language === 'ko' ? "언어 (Language)" : "Language"}
                        value={language === 'ko' ? "한국어" : "English"}
                        onPress={toggleLanguage}
                    />
                </View>

                <View className="mb-2">
                    <Text className="px-6 py-2 text-xs font-bold text-gray-400 uppercase">{t.nest_section}</Text>
                    {/* Nest Management (New) */}
                    <SettingItem
                        icon="home-outline"
                        label={language === 'ko' ? "보금자리 관리" : "Nest Management"}
                        value={nestName}
                        onPress={() => router.push('/nest_management')}
                    />

                    {/* Member Management (Old "Basic Management" / "Member Management") */}
                    <TouchableOpacity onPress={() => router.push('/member_management')} className="flex-row items-center justify-between py-4 border-b border-gray-100 bg-white px-6 active:bg-gray-50">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-50">
                                <Ionicons name="people-outline" size={18} color="#4B5563" />
                            </View>
                            <Text className="text-base font-medium text-gray-700">{t.member_mgmt}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="flex-row pl-2">
                                {members.slice(0, 3).map((m: any, i: number) => (
                                    <Avatar
                                        key={m.id}
                                        source={(AVATARS[m.avatarId] || AVATARS[0]).image}
                                        size="xs"
                                        className="-ml-2"
                                        borderColor="#FFFFFF"
                                        borderWidth={1}
                                    />
                                ))}
                            </View>
                            <View className="w-6 h-6 rounded-full bg-gray-100 border border-white -ml-2 items-center justify-center z-20">
                                <Ionicons name="add" size={14} color="#6B7280" />
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" className="ml-2" />
                        </View>
                    </TouchableOpacity>

                    <SettingItem
                        icon="copy-outline"
                        label={language === 'ko' ? "초대 코드 복사" : "Copy Invite Code"}
                        value={localInviteCode || "Loading..."}
                        onPress={onCopyCode}
                    />
                    <SettingItem
                        icon="share-social-outline"
                        label={language === 'ko' ? "초대 링크 공유하기" : "Share Invitation Link"}
                        onPress={onShareInvite}
                    />
                </View>

                <View className="mb-8">
                    <Text className="px-6 py-2 text-xs font-bold text-gray-400 uppercase">{language === 'ko' ? "기타" : "Etc"}</Text>
                    <SettingItem
                        icon="document-text-outline"
                        label={language === 'ko' ? "공지사항" : "Announcements"}
                        onPress={() => router.push('/announcements')}
                    />
                    <SettingItem icon="help-circle-outline" label={language === 'ko' ? "지원센터" : "Support Center"} onPress={() => router.push('/support')} />
                    <SettingItem icon="log-out-outline" label={t.logout} isDestructive onPress={handleLogout} />
                    <View className="items-center py-6">
                        <Text className="text-gray-300 text-xs">Version 1.0.0 (Alpha)</Text>
                    </View>
                </View>
            </ScrollView>

            <TutorialOverlay
                visible={showTutorial}
                onComplete={() => setShowTutorial(false)}
                steps={[
                    {
                        target: { x: 20, y: 100, width: width - 40, height: 100, borderRadius: 24 },
                        title: "내 프로필 관리 👤",
                        description: "나만의 닉네임과 아바타를 변경하고 계정 설정을 관리하세요.",
                        position: "bottom"
                    },
                    {
                        target: { x: 20, y: 400, width: width - 40, height: 200, borderRadius: 24 },
                        title: "보금자리(Nest) 설정 🏠",
                        description: "우리 집의 이름, 테마를 바꾸고 새로운 메이트를 초대할 수 있는 기능들이 모여있어요.",
                        position: "top"
                    },
                    {
                        target: { x: 20, y: 550, width: width - 40, height: 100, borderRadius: 24 },
                        title: "초대 코드 복사 🔗",
                        description: "초대 코드를 복사해서 함께 살 룸메이트에게 보내보세요!",
                        position: "top"
                    }
                ]}
            />
        </View>
    );
}
