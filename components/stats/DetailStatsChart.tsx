/**
 * components/stats/DetailStatsChart.tsx - 详情页复用的统计图表组件
 * 
 * 用于 Track/Artist/Album 详情页底部，展示：
 * - 播放趋势图
 * - 月度统计
 * - 收听时段分布
 */

import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// 类型定义
// ============================================

export type DetailType = "track" | "artist" | "album";

export interface DetailStatsData {
    // 月度播放数据
    monthlyPlays: { month: string; count: number }[];
    // 时段分布
    hourlyDistribution: { hour: string; percentage: number }[];
    // 综合统计
    totalPlays: number;
    totalMinutes: number;
    avgPerSession: number;
    streak?: number; // 连续收听天数
}

interface DetailStatsChartProps {
    type: DetailType;
    data: DetailStatsData;
}

// ============================================
// Mini Bar Chart 组件
// ============================================

function MiniBarChart({
    data,
    maxValue,
    color = "#8b5cf6"
}: {
    data: { label: string; value: number }[];
    maxValue: number;
    color?: string;
}) {
    return (
        <View style={styles.barChartContainer}>
            {data.map((item, index) => (
                <View key={index} style={styles.barWrapper}>
                    <View style={styles.barBackground}>
                        <LinearGradient
                            colors={[color, `${color}99`]}
                            style={[
                                styles.bar,
                                { height: `${Math.max((item.value / maxValue) * 100, 5)}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.barLabel}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
}

// ============================================
// Hourly Heatmap 组件
// ============================================

function HourlyHeatmap({ distribution }: { distribution: { hour: string; percentage: number }[] }) {
    const getIntensityColor = (percentage: number) => {
        if (percentage > 15) return "#1db954";
        if (percentage > 10) return "#34d765";
        if (percentage > 5) return "#65e085";
        if (percentage > 2) return "#a5f0b5";
        return "#27272a";
    };

    return (
        <View style={styles.heatmapContainer}>
            <View style={styles.heatmapRow}>
                {distribution.slice(0, 12).map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.heatmapCell,
                            { backgroundColor: getIntensityColor(item.percentage) }
                        ]}
                    >
                        <Text style={styles.heatmapValue}>{item.hour}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.heatmapRow}>
                {distribution.slice(12, 24).map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.heatmapCell,
                            { backgroundColor: getIntensityColor(item.percentage) }
                        ]}
                    >
                        <Text style={styles.heatmapValue}>{item.hour}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ============================================
// 主组件
// ============================================

export function DetailStatsChart({ type, data }: DetailStatsChartProps) {
    const typeLabel = type === "track" ? "Track" : type === "artist" ? "Artist" : "Album";

    // 转换月度数据为图表格式
    const chartData = data.monthlyPlays.map(item => ({
        label: item.month,
        value: item.count
    }));

    const maxMonthlyPlays = Math.max(...data.monthlyPlays.map(m => m.count), 1);

    return (
        <View style={styles.container}>
            {/* 趋势图 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Monthly Trend</Text>
                <View style={styles.chartCard}>
                    <MiniBarChart
                        data={chartData}
                        maxValue={maxMonthlyPlays}
                        color="#8b5cf6"
                    />
                </View>
            </View>

            {/* 时段分布 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Listening Hours</Text>
                <View style={styles.chartCard}>
                    <HourlyHeatmap distribution={data.hourlyDistribution} />
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: "#27272a" }]} />
                        <Text style={styles.legendText}>Low</Text>
                        <View style={[styles.legendDot, { backgroundColor: "#65e085" }]} />
                        <Text style={styles.legendText}>Medium</Text>
                        <View style={[styles.legendDot, { backgroundColor: "#1db954" }]} />
                        <Text style={styles.legendText}>High</Text>
                    </View>
                </View>
            </View>

            {/* 综合统计 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{typeLabel} Stats</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{data.totalPlays.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Total Plays</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{data.totalMinutes.toLocaleString()} min</Text>
                        <Text style={styles.statLabel}>Total Time</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{data.avgPerSession.toFixed(1)} min</Text>
                        <Text style={styles.statLabel}>Avg/Session</Text>
                    </View>
                    {data.streak && (
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{data.streak}</Text>
                            <Text style={styles.statLabel}>Day Streak</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

// ============================================
// 样式
// ============================================

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    chartCard: {
        backgroundColor: "#18181b",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    barChartContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 120,
    },
    barWrapper: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 2,
    },
    barBackground: {
        width: "100%",
        height: 100,
        backgroundColor: "#27272a",
        borderRadius: 4,
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    bar: {
        width: "100%",
        borderRadius: 4,
    },
    barLabel: {
        color: "#71717a",
        fontSize: 10,
        marginTop: 6,
    },
    heatmapContainer: {
        gap: 4,
    },
    heatmapRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    heatmapCell: {
        width: (SCREEN_WIDTH - 80) / 12,
        height: 28,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    heatmapValue: {
        color: "#ffffff",
        fontSize: 8,
        fontWeight: "600",
    },
    legendRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    legendText: {
        color: "#71717a",
        fontSize: 11,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    statItem: {
        width: (SCREEN_WIDTH - 56) / 2,
        backgroundColor: "#18181b",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#27272a",
    },
    statValue: {
        color: "#1db954",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    statLabel: {
        color: "#71717a",
        fontSize: 12,
    },
});

export default DetailStatsChart;
