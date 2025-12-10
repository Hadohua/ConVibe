/**
 * components/stats/DateRangePicker.tsx - 日期范围选择器
 * 
 * Stats.fm 风格的自定义时间范围选择
 */

import { useState, useCallback } from "react";
import { View, Text, Pressable, Modal, Platform } from "react-native";

// ============================================
// 类型定义
// ============================================

interface DateRangePickerProps {
    /** 数据的最早日期 */
    dataStartDate: Date | null;
    /** 数据的最晚日期 */
    dataEndDate: Date | null;
    /** 当前选中的开始日期 */
    startDate: Date | null;
    /** 当前选中的结束日期 */
    endDate: Date | null;
    /** 日期范围变化回调 */
    onRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

type PresetKey = "all" | "1month" | "3months" | "6months" | "1year";

interface Preset {
    key: PresetKey;
    label: string;
    getRange: (dataEnd: Date) => { start: Date; end: Date };
}

// ============================================
// 预设配置
// ============================================

const PRESETS: Preset[] = [
    {
        key: "all",
        label: "全部时间",
        getRange: () => ({ start: new Date(0), end: new Date() }),
    },
    {
        key: "1month",
        label: "最近1个月",
        getRange: (dataEnd) => {
            const start = new Date(dataEnd);
            start.setMonth(start.getMonth() - 1);
            return { start, end: dataEnd };
        },
    },
    {
        key: "3months",
        label: "最近3个月",
        getRange: (dataEnd) => {
            const start = new Date(dataEnd);
            start.setMonth(start.getMonth() - 3);
            return { start, end: dataEnd };
        },
    },
    {
        key: "6months",
        label: "最近6个月",
        getRange: (dataEnd) => {
            const start = new Date(dataEnd);
            start.setMonth(start.getMonth() - 6);
            return { start, end: dataEnd };
        },
    },
    {
        key: "1year",
        label: "最近1年",
        getRange: (dataEnd) => {
            const start = new Date(dataEnd);
            start.setFullYear(start.getFullYear() - 1);
            return { start, end: dataEnd };
        },
    },
];

// ============================================
// DateRangePicker 组件
// ============================================

export default function DateRangePicker({
    dataStartDate,
    dataEndDate,
    startDate,
    endDate,
    onRangeChange,
}: DateRangePickerProps) {
    const [activePreset, setActivePreset] = useState<PresetKey>("all");

    // 处理预设选择
    const handlePresetSelect = useCallback((preset: Preset) => {
        setActivePreset(preset.key);

        if (preset.key === "all") {
            // 全部时间 = 不过滤
            onRangeChange(null, null);
        } else {
            const referenceDate = dataEndDate || new Date();
            const { start, end } = preset.getRange(referenceDate);
            onRangeChange(start, end);
        }
    }, [dataEndDate, onRangeChange]);

    // 格式化日期显示
    const formatDateShort = (date: Date | null): string => {
        if (!date) return "未知";
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // 计算当前显示的范围
    const displayRange = startDate && endDate
        ? `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`
        : dataStartDate && dataEndDate
            ? `${formatDateShort(dataStartDate)} - ${formatDateShort(dataEndDate)}`
            : "全部时间";

    return (
        <View className="bg-dark-200 rounded-2xl p-4 mb-4">
            {/* 标题和当前范围 */}
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-semibold">📅 时间范围</Text>
                <Text className="text-gray-500 text-sm">{displayRange}</Text>
            </View>

            {/* 预设按钮 */}
            <View className="flex-row flex-wrap gap-2">
                {PRESETS.map((preset) => (
                    <Pressable
                        key={preset.key}
                        onPress={() => handlePresetSelect(preset)}
                        className={`px-3 py-2 rounded-lg ${activePreset === preset.key
                                ? "bg-purple-600"
                                : "bg-dark-50"
                            }`}
                    >
                        <Text
                            className={`text-sm ${activePreset === preset.key
                                    ? "text-white font-medium"
                                    : "text-gray-400"
                                }`}
                        >
                            {preset.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* 数据范围提示 */}
            {dataStartDate && dataEndDate && (
                <Text className="text-gray-600 text-xs mt-3">
                    数据范围: {formatDateShort(dataStartDate)} - {formatDateShort(dataEndDate)}
                </Text>
            )}
        </View>
    );
}
