import React, { useEffect, useState } from "react";
import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "../../store/userStore";
import TossNavBar from "../../components/TossNavBar";
import { TDSProvider } from "@toss/tds-react-native";

export default function Layout() {
    const { setAppMode } = useUserStore();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setAppMode('roommatecheck');
        setHydrated(true);
    }, []);

    if (!hydrated) return null;

    return (
        <TDSProvider>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: true,
                    header: (props) => (
                        <TossNavBar
                            title={props.options.title}
                            canGoBack={props.navigation.canGoBack()}
                        />
                    ),
                    contentStyle: { backgroundColor: '#FFFFFF' },
                    animation: 'slide_from_right',
                }}
            />
        </TDSProvider>
    );
}
