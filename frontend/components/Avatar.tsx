import { View, Image, ImageSourcePropType } from 'react-native';
import React from 'react';
import { cn } from '../lib/utils';

interface AvatarProps {
    source: ImageSourcePropType;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
    borderColor?: string;
    borderWidth?: number;
}

const sizeMap = {
    xs: { width: 32, height: 45 },   // 32 * 1.4 ≈ 45
    sm: { width: 48, height: 67 },   // 48 * 1.4 ≈ 67
    md: { width: 64, height: 90 },   // 64 * 1.4 ≈ 90
    lg: { width: 80, height: 112 },  // 80 * 1.4 = 112
    xl: { width: 96, height: 134 },  // 96 * 1.4 ≈ 134
    '2xl': { width: 128, height: 179 } // 128 * 1.4 ≈ 179
};

export default function Avatar({
    source,
    size = 'md',
    className = '',
    borderColor = '#FFFFFF',
    borderWidth = 0
}: AvatarProps) {
    const dimensions = sizeMap[size];

    return (
        <View
            style={{
                width: dimensions.width,
                height: dimensions.height,
                borderRadius: dimensions.width * 0.25, // 25% radius for squircle effect
                borderColor,
                borderWidth,
                overflow: 'hidden',
                backgroundColor: '#F9FAFB'
            }}
            className={cn("shadow-sm items-center justify-center", className)}
        >
            <Image
                source={source}
                style={{
                    width: dimensions.width * 0.85,
                    height: dimensions.height * 0.85,
                }}
                resizeMode="contain"
            />
        </View>
    );
}
