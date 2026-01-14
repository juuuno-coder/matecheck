import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    height: 90, // Reduced height for better balance
                    paddingBottom: 20, // Reduced padding
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#FF7F50',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 4, // Gap between icon and label
                }
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "보금자리",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="todo"
                options={{
                    title: "미션",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "checkbox" : "checkbox-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="goal"
                options={{
                    title: "목표",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "trophy" : "trophy-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: "일정",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="budget"
                options={{
                    title: "가계부",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "설정",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}
