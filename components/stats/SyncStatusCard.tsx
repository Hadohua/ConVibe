/**
 * components/stats/SyncStatusCard.tsx - 数据同步状态卡片
 * 
 * 显示同步状态并提供手动同步按钮
 */

import { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { usePrivyUnified, useEmbeddedWalletUnified } from "../../hooks/usePrivyUnified";
import {
    syncRecentPlays,
    isCloudSyncAvailable,
    loadSpotifyTokens,
    refreshAccessToken,
    saveSpotifyTokens,
    getRecordCount,
    getRecordCountBySource,
    type SyncResult,
} from "../../lib/spotify/streaming-sync";

// ============================================
// 类型定义
// ============================================

interface SyncStatusCardProps {
    /** 上次同步时间 */
    lastSyncAt?: Date | null;
    /** 同步完成回调 */
    onSyncComplete?: (result: SyncResult) => void;
}

// ============================================
// SyncStatusCard 组件
// ============================================

export default function SyncStatusCard({
    lastSyncAt,
    onSyncComplete,
}: SyncStatusCardProps) {
    const { user } = usePrivyUnified();
    const wallet = useEmbeddedWalletUnified();
    const [syncing, setSyncing] = useState(false);
    const [lastResult, setLastResult] = useState<SyncResult | null>(null);
    const [recordStats, setRecordStats] = useState<{
        jsonImport: number;
        apiSync: number;
        total: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    // 获取用户 ID (钱包地址)
    const userId = wallet.status === "connected" && wallet.account
        ? wallet.account.address
        : undefined;

    // 检查是否可用
    const isAvailable = isCloudSyncAvailable() && !!userId;

    // 初始化加载记录统计
    useEffect(() => {
        if (userId && isCloudSyncAvailable()) {
            getRecordCountBySource(userId).then(stats => {
                setRecordStats(stats);
                setLoading(false);
            }).catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [userId]);

    // 格式化时间
    const formatTime = (date: Date | null | undefined): string => {
        if (!date) return "从未同步";
        return date.toLocaleString("zh-CN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // 执行同步
    const handleSync = useCallback(async () => {
        if (!userId || syncing) return;

        setSyncing(true);
        setLastResult(null);

        try {
            // 加载 tokens
            const storedTokens = await loadSpotifyTokens(userId);
            if (!storedTokens) {
                setLastResult({
                    success: false,
                    recordsAdded: 0,
                    recordsSkipped: 0,
                    lastPlayedAt: null,
                    error: "未找到 Spotify Token，请先连接 Spotify",
                });
                return;
            }

            // 检查是否过期，需要刷新
            let accessToken = storedTokens.access_token;
            const expiresAt = new Date(storedTokens.expires_at);

            if (expiresAt < new Date() && storedTokens.refresh_token) {
                const refreshed = await refreshAccessToken(storedTokens.refresh_token);
                if (refreshed) {
                    accessToken = refreshed.accessToken;
                    await saveSpotifyTokens(userId, refreshed);
                } else {
                    setLastResult({
                        success: false,
                        recordsAdded: 0,
                        recordsSkipped: 0,
                        lastPlayedAt: null,
                        error: "Token 刷新失败，请重新连接 Spotify",
                    });
                    return;
                }
            }

            // 执行同步
            const result = await syncRecentPlays(userId, accessToken);
            setLastResult(result);
            onSyncComplete?.(result);

            // 更新记录统计
            const stats = await getRecordCountBySource(userId);
            setRecordStats(stats);
        } catch (error) {
            setLastResult({
                success: false,
                recordsAdded: 0,
                recordsSkipped: 0,
                lastPlayedAt: null,
                error: error instanceof Error ? error.message : "同步失败",
            });
        } finally {
            setSyncing(false);
        }
    }, [userId, syncing, onSyncComplete]);

    // 未配置 Supabase
    if (!isCloudSyncAvailable()) {
        return (
            <View className="bg-dark-200 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center">
                    <Text className="text-xl mr-2">☁️</Text>
                    <View className="flex-1">
                        <Text className="text-white font-semibold">云端同步</Text>
                        <Text className="text-gray-500 text-sm">
                            未配置 Supabase，数据仅保存在本地
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // 未登录
    if (!userId) {
        return (
            <View className="bg-dark-200 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center">
                    <Text className="text-xl mr-2">☁️</Text>
                    <View className="flex-1">
                        <Text className="text-white font-semibold">云端同步</Text>
                        <Text className="text-gray-500 text-sm">
                            请先连接钱包以启用云端同步
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-dark-200 rounded-2xl p-4 mb-4">
            {/* 标题行 */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                    <Text className="text-xl mr-2">☁️</Text>
                    <View>
                        <Text className="text-white font-semibold">实时同步</Text>
                        <Text className="text-gray-500 text-xs">
                            上次: {formatTime(lastSyncAt)}
                        </Text>
                    </View>
                </View>

                {/* 同步按钮 */}
                <Pressable
                    onPress={handleSync}
                    disabled={syncing}
                    className={`px-4 py-2 rounded-lg ${syncing ? "bg-dark-50" : "bg-green-600"
                        }`}
                >
                    {syncing ? (
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#fff" />
                            <Text className="text-white ml-2">同步中...</Text>
                        </View>
                    ) : (
                        <Text className="text-white font-medium">立即同步</Text>
                    )}
                </Pressable>
            </View>

            {/* 记录数量 - 按来源显示 */}
            {recordStats !== null && recordStats.total > 0 && (
                <View className="mb-3">
                    <Text className="text-gray-400 text-sm mb-1">
                        ☁️ 云端已存储 {recordStats.total.toLocaleString()} 条播放记录
                    </Text>
                    <View className="flex-row gap-3">
                        {recordStats.jsonImport > 0 && (
                            <View className="bg-purple-900/20 px-2 py-1 rounded">
                                <Text className="text-purple-400 text-xs">
                                    📂 历史导入 {recordStats.jsonImport.toLocaleString()}
                                </Text>
                            </View>
                        )}
                        {recordStats.apiSync > 0 && (
                            <View className="bg-green-900/20 px-2 py-1 rounded">
                                <Text className="text-green-400 text-xs">
                                    🔄 实时同步 {recordStats.apiSync.toLocaleString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* 同步结果 */}
            {lastResult && (
                <View
                    className={`rounded-lg p-3 ${lastResult.success
                        ? "bg-green-900/20 border border-green-700/30"
                        : "bg-red-900/20 border border-red-700/30"
                        }`}
                >
                    {lastResult.success ? (
                        <Text className="text-green-400 text-sm">
                            ✓ 同步完成: 新增 {lastResult.recordsAdded} 条
                            {lastResult.recordsSkipped > 0 &&
                                `，跳过 ${lastResult.recordsSkipped} 条重复`}
                        </Text>
                    ) : (
                        <Text className="text-red-400 text-sm">
                            ✕ {lastResult.error}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}
