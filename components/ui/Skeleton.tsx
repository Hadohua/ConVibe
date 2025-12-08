/**
 * components/ui/Skeleton.tsx - 骨架屏组件
 * 
 * 用于在数据加载时显示占位动画，提升用户体验。
 * 使用标准 React Native Animated API 实现闪烁动画。
 */

import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

interface SkeletonProps {
    /** 宽度 - 可以是数字或百分比字符串 */
    width?: number | string;
    /** 高度 */
    height?: number;
    /** 圆角 */
    borderRadius?: number;
    /** 自定义样式 */
    style?: object;
}

/**
 * Skeleton - 骨架屏基础组件
 * 
 * 特点：
 * - 使用标准 Animated API 的 opacity 动画
 * - 深色主题配色
 * - 可配置尺寸和圆角
 */
export function Skeleton({
    width = "100%",
    height = 20,
    borderRadius = 8,
    style,
}: SkeletonProps) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                {
                    width: width as number | `${number}%`,
                    height,
                    borderRadius,
                    backgroundColor: "#3f3f46", // dark-300
                    opacity,
                },
                style,
            ]}
        />
    );
}

/**
 * SkeletonText - 文本骨架屏
 * 预设的文本行样式
 */
export function SkeletonText({
    width = "100%",
    height = 16,
    style,
}: Omit<SkeletonProps, "borderRadius">) {
    return <Skeleton width={width} height={height} borderRadius={4} style={style} />;
}

/**
 * SkeletonCircle - 圆形骨架屏
 * 用于头像等圆形元素
 */
export function SkeletonCircle({
    size = 48,
    style,
}: {
    size?: number;
    style?: object;
}) {
    return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}

/**
 * SkeletonCard - 卡片骨架屏
 * 预设的卡片占位样式
 */
export function SkeletonCard({ style }: { style?: object }) {
    return (
        <View
            style={[
                {
                    backgroundColor: "#27272a", // dark-200
                    borderRadius: 16,
                    padding: 24,
                },
                style,
            ]}
        >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <SkeletonCircle size={40} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <SkeletonText width="60%" height={14} />
                    <View style={{ height: 8 }} />
                    <SkeletonText width="40%" height={12} />
                </View>
            </View>
            <SkeletonText width="100%" height={14} />
            <View style={{ height: 8 }} />
            <SkeletonText width="80%" height={14} />
        </View>
    );
}

/**
 * BadgeSkeleton - 徽章骨架屏
 * 用于 UserBadges 组件的加载状态
 */
export function BadgeSkeleton() {
    return (
        <View style={styles.badgeContainer}>
            {[1, 2, 3].map((i) => (
                <View key={i} style={styles.badgeItem}>
                    <SkeletonCircle size={48} />
                    <View style={{ height: 8 }} />
                    <SkeletonText width={60} height={12} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    badgeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    badgeItem: {
        alignItems: "center",
        padding: 16,
        backgroundColor: "#27272a20",
        borderRadius: 12,
    },
});

export default Skeleton;
