import React, { useEffect, useState } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "../store/userStore";
import TossNavBar from "../components/TossNavBar";

export default function Layout() {
    const { appMode } = useUserStore();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) return null; // Prevent hydration mismatch or flash

    const isTossMode = appMode === 'roommatecheck';

    return (
        <>
            <StatusBar style={isTossMode ? "dark" : "auto"} />
            <Stack
                screenOptions={{
                    headerShown: isTossMode,
                    header: isTossMode ? (props) => (
                        <TossNavBar
                            title={props.options.title}
                            canGoBack={props.navigation.canGoBack()}
                        />
                    ) : undefined,
                    contentStyle: isTossMode ? { backgroundColor: '#FFFFFF' } : undefined, // Force white background
                    animation: isTossMode ? 'slide_from_right' : 'default', // Toss-like transition
                }}
            />
        </>
    );
}
