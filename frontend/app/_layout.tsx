import React, { useEffect, useState } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useUserStore } from "../store/userStore";

export default function Layout() {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const checkHydration = async () => {
            // Wait for rehydration
            while (!useUserStore.persist.hasHydrated()) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            setIsHydrated(true);
        };
        checkHydration();
    }, []);

    if (!isHydrated) return null;

    return (
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}
