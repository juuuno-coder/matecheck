import React, { useEffect, useState } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useUserStore } from "../store/userStore";

export default function Layout() {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Subscribe to hydration changes
        const unsub = useUserStore.persist.onFinishHydration(() => {
            setIsHydrated(true);
        });

        // Check if already hydrated (sometimes happens before listener attaches)
        if (useUserStore.persist.hasHydrated()) {
            setIsHydrated(true);
        }

        return () => unsub();
    }, []);

    if (!isHydrated) return null;

    return (
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}
