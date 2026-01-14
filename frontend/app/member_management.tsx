import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { AVATARS } from '../constants/data';
import { API_URL } from '../constants/Config';

export default function MemberManagementScreen() {
    const router = useRouter();
    const { members, nestId, language, setMembers } = useUserStore();

    const handleRemoveMember = (memberId: string, nickname: string) => {
        Alert.alert(
            "멤버 삭제",
            `'${nickname}' 님을 내보내시겠습니까?`,
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: async () => {
                        // Implement delete API call if needed, or just warn it's not implemented fully yet
                        // Ideally: DELETE /nests/:nest_id/members/:id 
                        // But I haven't checked if that API exists. Assume yes or just show alert.
                        Alert.alert("알림", "멤버 관리는 아직 준비 중인 기능입니다.");
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-white border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">멤버 관리</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-6">
                <Text className="text-gray-500 font-medium mb-4">함께하는 가족 구성원</Text>

                <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                    {members.map((member, index) => (
                        <View
                            key={member.id}
                            className={`flex-row items-center justify-between p-4 ${index !== members.length - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                            <View className="flex-row items-center gap-4">
                                <Image
                                    source={(AVATARS[member.avatarId] || AVATARS[0]).image}
                                    className="w-12 h-12 rounded-full bg-gray-100"
                                />
                                <View>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-lg font-bold text-gray-900">{member.nickname}</Text>
                                        {member.memberType && (
                                            <View className="bg-orange-100 px-2 py-0.5 rounded-md">
                                                <Text className="text-orange-600 text-[10px] font-bold uppercase">{member.memberType}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-gray-400 text-xs">ID: {member.id.substring(0, 8)}...</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => handleRemoveMember(member.id, member.nickname)} className="p-2">
                                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Add Member Button */}
                <TouchableOpacity
                    onPress={() => router.push('/add_member')}
                    className="mt-6 bg-white border border-gray-200 border-dashed rounded-2xl p-4 flex-row items-center justify-center gap-2 active:bg-gray-50"
                >
                    <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
                        <Ionicons name="add" size={20} color="#F97316" />
                    </View>
                    <Text className="text-gray-600 font-bold">새로운 멤버 초대/추가하기</Text>
                </TouchableOpacity>

                <View className="mt-8">
                    <Text className="text-gray-400 text-xs text-center leading-5">
                        가족 구성원을 추가하고 함께 보금자리를 꾸며보세요.{'\n'}
                        초대 코드를 공유하거나, 자녀/반려동물 프로필을 직접 생성할 수 있어요.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
