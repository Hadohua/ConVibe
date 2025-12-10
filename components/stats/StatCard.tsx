/**
 * components/stats/StatCard.tsx - 统计卡片组件
 * 
 * 显示大数字 + 变化百分比，类似 Stats.fm 风格
 */

import { View, Text } from "react-native";

// ============================================
// 类型定义
// ============================================

interface StatCardProps {
    /** 主数值 */
    value: number | string;
    /** 标签文字 */
    label: string;
    /** 变化百分比 (正数=增长，负数=下降) */
    changePercent?: number;
    /** 颜色主题 */
    color?: "green" | "purple" | "yellow" | "blue";
    /** 是否紧凑模式 */
    compact?: boolean;
}

// ============================================
// 颜色配置
// ============================================

const COLORS = {
    green: {
        text: "#1db954",
        bg: "rgba(29, 185, 84, 0.15)",
    },
    purple: {
        text: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.15)",
    },
    yellow: {
        text: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.15)",
    },
    blue: {
        text: "#3b82f6",
        bg: "rgba(59, 130, 246, 0.15)",
    },
};

// ============================================
// StatCard 组件
// ============================================

export default function StatCard({
    value,
    label,
    changePercent,
    color = "green",
    compact = false,
}: StatCardProps) {
    const colorScheme = COLORS[color];
    const isPositive = changePercent !== undefined && changePercent >= 0;
    const changeColor = isPositive ? "#22c55e" : "#ef4444";

    // 格式化数值
    const formattedValue = typeof value === "number"
        ? value.toLocaleString()
        : value;

    return (
        <View
            className={`rounded-xl ${compact ? "p-3" : "p-4"}`}
            style={{ backgroundColor: colorScheme.bg }}
        >
            <View className="flex-row items-baseline">
                {/* 主数值 */}
                <Text
                    className={`font-bold ${compact ? "text-2xl" : "text-3xl"}`}
                    style={{ color: colorScheme.text }}
                >
                    {formattedValue}
                </Text>

                {/* 变化百分比 */}
                {changePercent !== undefined && (
                    <Text
                        className="text-sm ml-2 font-medium"
                        style={{ color: changeColor }}
                    >
                        {isPositive ? "+" : ""}{changePercent}%
                    </Text>
                )}
            </View>

            {/* 标签 */}
            <Text className="text-gray-400 text-sm mt-1">
                {label}
            </Text>
        </View>
    );
}
