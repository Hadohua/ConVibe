/**
 * app/music-vibe-detail.tsx - 音乐 Vibe 详情页
 * 
 * 整合三个核心功能:
 * - 验证: SpotifyVerifier
 * - 统计: SpotifyStats + SpotifyDataImport
 * - 共识: ConsensusFeed
 */

import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import SpotifyVerifier, { type VerificationResult } from "../components/SpotifyVerifier";
import SpotifyStats from "../components/SpotifyStats";
import SpotifyDataImport from "../components/SpotifyDataImport";
import ConsensusFeed from "../components/ConsensusFeed";
import type { StreamingStats } from "../lib/spotify/streaming-history-parser";

// ============================================
// Tab 类型定义
// ============================================

type TabType = "verify" | "stats" | "consensus";

interface TabItem {
    key: TabType;
    label: string;
    emoji: string;
}

const TABS: TabItem[] = [
    { key: "verify", label: "验证", emoji: "🎵" },
    { key: "stats", label: "统计", emoji: "📊" },
    { key: "consensus", label: "共识", emoji: "🔥" },
];

// ============================================
// Music Vibe Detail 主组件
// ============================================

export default function MusicVibeDetail() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("verify");
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [importedStats, setImportedStats] = useState<StreamingStats | null>(null);

    // 处理验证完成
    const handleVerificationComplete = useCallback((result: VerificationResult) => {
        console.log("验证完成:", result);
        setVerificationResult(result);
    }, []);

    // 处理数据导入完成
    const handleImportComplete = useCallback((stats: StreamingStats) => {
        console.log("导入完成:", stats);
        setImportedStats(stats);
    }, []);

    // 渲染当前 Tab 内容
    const renderTabContent = () => {
        switch (activeTab) {
            case "verify":
                return (
                    <View style={styles.tabContent}>
                        <Text style={styles.tabDescription}>
                            使用 Reclaim Protocol 验证你的 Spotify 听歌数据，获取链上证明
                        </Text>
                        <SpotifyVerifier
                            onVerificationComplete={handleVerificationComplete}
                            onError={(error) => console.error("验证错误:", error)}
                        />
                    </View>
                );

            case "stats":
                return (
                    <View style={styles.tabContent}>
                        {importedStats ? (
                            <>
                                <Text style={styles.tabDescription}>
                                    你的 Spotify 听歌统计数据
                                </Text>
                                <SpotifyStats stats={importedStats} showFullDetails />
                            </>
                        ) : (
                            <>
                                <Text style={styles.tabDescription}>
                                    导入 Spotify 数据包，解锁详细统计和高级徽章
                                </Text>
                                <SpotifyDataImport onImportComplete={handleImportComplete} />
                            </>
                        )}
                    </View>
                );

            case "consensus":
                return (
                    <View style={styles.tabContent}>
                        <ConsensusFeed />
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 头部导航 */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 返回</Text>
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerEmoji}>🎵</Text>
                    <Text style={styles.headerTitle}>音乐 Vibe</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* 描述区域 */}
            <LinearGradient
                colors={["#8b5cf6", "#6366f1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.descriptionBanner}
            >
                <Text style={styles.descriptionText}>
                    音乐品味共识社区 · 验证 Spotify 数据 · 铸造 SBT 徽章
                </Text>
            </LinearGradient>

            {/* Tab 切换 */}
            <View style={styles.tabBar}>
                {TABS.map((tab) => (
                    <Pressable
                        key={tab.key}
                        style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                        <Text
                            style={[
                                styles.tabLabel,
                                activeTab === tab.key && styles.tabLabelActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Tab 内容 */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {renderTabContent()}
            </ScrollView>
        </SafeAreaView>
    );
}

// ============================================
// 样式
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#09090b",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#27272a",
    },
    backButton: {
        paddingVertical: 8,
        paddingRight: 16,
    },
    backButtonText: {
        color: "#8b5cf6",
        fontSize: 16,
        fontWeight: "500",
    },
    headerTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerEmoji: {
        fontSize: 24,
        marginRight: 8,
    },
    headerTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
    },
    headerSpacer: {
        width: 60, // Balance the back button
    },
    descriptionBanner: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    descriptionText: {
        color: "#ffffff",
        fontSize: 13,
        textAlign: "center",
        opacity: 0.9,
    },
    tabBar: {
        flexDirection: "row",
        backgroundColor: "#18181b",
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 8,
    },
    tabItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: "#27272a",
        gap: 6,
    },
    tabItemActive: {
        backgroundColor: "#8b5cf6",
    },
    tabEmoji: {
        fontSize: 16,
    },
    tabLabel: {
        color: "#a1a1aa",
        fontSize: 14,
        fontWeight: "500",
    },
    tabLabelActive: {
        color: "#ffffff",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    tabContent: {
        padding: 16,
    },
    tabDescription: {
        color: "#71717a",
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
});
