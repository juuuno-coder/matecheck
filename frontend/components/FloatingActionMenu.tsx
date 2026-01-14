import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cn } from '../lib/utils'; // Assuming this exists or similar

interface FloatingActionMenuProps {
    themeBg?: string; // e.g. 'bg-orange-500'
}

export default function FloatingActionMenu({ themeBg = 'bg-orange-500' }: FloatingActionMenuProps) {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleMenu = () => {
        const toValue = visible ? 0 : 1;

        Animated.spring(animation, {
            toValue,
            useNativeDriver: true,
            friction: 5,
        }).start();

        setVisible(!visible);
    };

    const handleAction = (path: any) => {
        toggleMenu(); // Close menu
        // Small timeout to allow animation close before nav if needed, but not strictly necessary
        setTimeout(() => {
            router.push(path);
        }, 100);
    };

    const menuItems = [
        {
            label: '미션',
            icon: 'checkbox-outline',
            color: 'bg-green-500',
            path: { pathname: '/(tabs)/todo', params: { action: 'add' } }
        },
        {
            label: '일정',
            icon: 'calendar-outline',
            color: 'bg-blue-500',
            path: { pathname: '/(tabs)/calendar', params: { action: 'add' } }
        },
        {
            label: '목표',
            icon: 'trophy-outline',
            color: 'bg-yellow-500',
            path: { pathname: '/(tabs)/goal', params: { action: 'add' } }
        },
        {
            label: '가계부',
            icon: 'wallet-outline',
            color: 'bg-purple-500',
            path: { pathname: '/(tabs)/budget', params: { action: 'add' } }
        },
    ];

    const rotateInterp = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    const bgStyle = {
        transform: [{ scale: animation }],
        opacity: animation
    };

    return (
        <>
            {/* Backdrop Modal */}
            <Modal visible={visible} transparent animationType="none">
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <View className="flex-1 bg-black/30 w-full h-full relative" />
                </TouchableWithoutFeedback>

                {/* Menu Items */}
                <View className="absolute bottom-28 right-8 items-end gap-4 pointer-events-box-none">
                    {menuItems.map((item, index) => {
                        const translateY = animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20 * (menuItems.length - index), 0]
                        });
                        const opacity = animation;

                        return (
                            <Animated.View
                                key={item.label}
                                style={{ transform: [{ translateY }], opacity }}
                                className="flex-row items-center gap-3"
                            >
                                <View className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                                    <Text className="font-bold text-gray-700">{item.label}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleAction(item.path)}
                                    className={cn("w-12 h-12 rounded-full items-center justify-center shadow-lg", item.color)}
                                >
                                    <Ionicons name={item.icon as any} size={24} color="white" />
                                </TouchableOpacity>
                            </Animated.View>
                        )
                    })}
                </View>
            </Modal>

            {/* FAB Button */}
            <TouchableOpacity
                onPress={toggleMenu}
                activeOpacity={0.8}
                className={cn(
                    "absolute bottom-8 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-orange-300 z-50",
                    themeBg
                )}
            >
                <Animated.View style={{ transform: [{ rotate: rotateInterp }] }}>
                    <Ionicons name="add" size={32} color="white" />
                </Animated.View>
            </TouchableOpacity>
        </>
    );
}
