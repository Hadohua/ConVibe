/**
 * components/SpotifyDataImport.tsx
 * 
 * Spotify 数据导入组件
 * 允许用户上传 Spotify 数据导出的 JSON 文件
 */

import { useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
// Web 平台使用 fetch，Native 使用 expo-file-system
import * as FileSystem from "expo-file-system/legacy";
import {
    parseStreamingHistory,
    type StreamingStats,
    type StreamingRecord,
} from "../lib/spotify/streaming-history-parser";
import {
    saveStreamingStats,
    saveRawStreamingRecords,
    loadStreamingStats,
    clearStreamingStats,
} from "../lib/spotify/streaming-history-storage";
import {
    importJsonRecords,
    isCloudSyncAvailable,
} from "../lib/spotify/streaming-sync";
import { usePrivyUnified, useEmbeddedWalletUnified } from "../hooks/usePrivyUnified";

/**
 * 跨平台读取文件内容
 * Web: 使用 fetch API
 * Native: 使用 expo-file-system
 */
async function readFileContent(uri: string): Promise<string> {
    if (Platform.OS === "web") {
        // Web 平台: 使用 fetch API 读取 blob URL
        const response = await fetch(uri);
        return await response.text();
    } else {
        // Native 平台: 使用 expo-file-system
        return await FileSystem.readAsStringAsync(uri);
    }
}

// ============================================
// 类型定义
// ============================================

type ImportStatus = "idle" | "selecting" | "parsing" | "uploading" | "success" | "error";

interface SpotifyDataImportProps {
    onImportComplete?: (stats: StreamingStats) => void;
    onError?: (error: Error) => void;
}

// ============================================
// SpotifyDataImport 组件
// ============================================

export default function SpotifyDataImport({
    onImportComplete,
    onError,
}: SpotifyDataImportProps) {
    const wallet = useEmbeddedWalletUnified();
    const [status, setStatus] = useState<ImportStatus>("idle");
    const [stats, setStats] = useState<StreamingStats | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [progress, setProgress] = useState<string>("");
    const [cloudUploadResult, setCloudUploadResult] = useState<{
        recordsAdded: number;
        recordsSkipped: number;
    } | null>(null);

    // 获取用户 ID (钱包地址)
    const userId = wallet.status === "connected" && wallet.account
        ? wallet.account.address
        : undefined;

    /**
     * 加载已保存的数据
     */
    const loadSavedData = useCallback(async () => {
        const saved = await loadStreamingStats();
        if (saved) {
            setStats(saved);
            setStatus("success");
            onImportComplete?.(saved);
        }
    }, [onImportComplete]);

    /**
     * 选择并解析文件
     */
    const handleSelectFile = useCallback(async () => {
        try {
            setStatus("selecting");
            setErrorMessage(null);

            // 打开文件选择器
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/json",
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (result.canceled) {
                setStatus("idle");
                return;
            }

            setStatus("parsing");
            setProgress("正在读取文件...");

            const allStats: StreamingStats[] = [];
            const allRawRecords: StreamingRecord[] = [];

            for (let i = 0; i < result.assets.length; i++) {
                const asset = result.assets[i];
                setProgress(`正在解析 ${asset.name} (${i + 1}/${result.assets.length})...`);

                // 读取文件内容（跨平台兼容）
                const content = await readFileContent(asset.uri);

                // 保存原始记录用于云端上传
                const rawRecords: StreamingRecord[] = JSON.parse(content);
                allRawRecords.push(...rawRecords);

                // 解析 JSON 生成统计
                const parsed = parseStreamingHistory(content);
                allStats.push(parsed);

                console.log(`Parsed ${asset.name}:`, {
                    streams: parsed.totalStreams,
                    hours: parsed.totalHours,
                });
            }

            // 合并所有统计（如果有多个文件）
            setProgress("正在汇总数据...");
            let finalStats: StreamingStats;

            if (allStats.length === 1) {
                finalStats = allStats[0];
            } else {
                // 简单合并
                finalStats = allStats.reduce((acc, s) => ({
                    ...acc,
                    totalStreams: acc.totalStreams + s.totalStreams,
                    totalMs: acc.totalMs + s.totalMs,
                    totalMinutes: acc.totalMinutes + s.totalMinutes,
                    totalHours: Math.round((acc.totalHours + s.totalHours) * 10) / 10,
                    uniqueArtists: acc.uniqueArtists + s.uniqueArtists,
                    uniqueTracks: acc.uniqueTracks + s.uniqueTracks,
                    topArtists: [...acc.topArtists, ...s.topArtists]
                        .sort((a, b) => b.totalMs - a.totalMs)
                        .slice(0, 50),
                    topTracks: [...acc.topTracks, ...s.topTracks]
                        .sort((a, b) => b.streamCount - a.streamCount)
                        .slice(0, 50),
                    firstStream: !acc.firstStream || (s.firstStream && s.firstStream < acc.firstStream)
                        ? s.firstStream : acc.firstStream,
                    lastStream: !acc.lastStream || (s.lastStream && s.lastStream > acc.lastStream)
                        ? s.lastStream : acc.lastStream,
                    importedAt: Date.now(),
                }));
            }

            // 保存到本地存储
            setProgress("正在保存到本地...");
            await saveStreamingStats(finalStats);

            // 保存原始记录（用于 stats.fm 风格的时间范围筛选）
            await saveRawStreamingRecords(allRawRecords);
            console.log(`Saved ${allRawRecords.length} raw records for time filtering`);

            // 尝试上传到云端
            if (isCloudSyncAvailable() && userId && allRawRecords.length > 0) {
                setStatus("uploading");
                setProgress(`正在上传 ${allRawRecords.length} 条记录到云端...`);

                try {
                    const uploadResult = await importJsonRecords(userId, allRawRecords);
                    setCloudUploadResult({
                        recordsAdded: uploadResult.recordsAdded,
                        recordsSkipped: uploadResult.recordsSkipped,
                    });
                    console.log("Cloud upload complete:", uploadResult);
                } catch (uploadError) {
                    console.warn("Cloud upload failed, data saved locally:", uploadError);
                    // 不影响本地导入成功
                }
            }

            setStats(finalStats);
            setStatus("success");
            onImportComplete?.(finalStats);

            console.log("Import complete:", {
                streams: finalStats.totalStreams,
                hours: finalStats.totalHours,
                artists: finalStats.uniqueArtists,
            });
        } catch (error) {
            console.error("Import failed:", error);
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "导入失败");
            onError?.(error instanceof Error ? error : new Error("导入失败"));
        }
    }, [onImportComplete, onError]);

    /**
     * 清除数据
     */
    const handleClear = useCallback(async () => {
        Alert.alert(
            "确认清除",
            "确定要清除已导入的数据吗？",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "确定",
                    style: "destructive",
                    onPress: async () => {
                        await clearStreamingStats();
                        setStats(null);
                        setStatus("idle");
                    },
                },
            ]
        );
    }, []);

    // ============================================
    // 渲染
    // ============================================

    return (
        <View className="bg-dark-200 rounded-2xl overflow-hidden">
            {/* 头部 */}
            <View className="p-6 border-b border-dark-50/50">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-purple-600 rounded-full items-center justify-center mr-3">
                        <Text className="text-white text-lg">📊</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">
                            数据导入
                        </Text>
                        <Text className="text-gray-400 text-sm">
                            上传 Spotify 数据导出文件
                        </Text>
                    </View>
                    {status === "success" && (
                        <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center">
                            <Text className="text-white">✓</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 内容 */}
            <View className="p-6">
                {/* 未导入状态 */}
                {status === "idle" && (
                    <View>
                        <Text className="text-gray-400 mb-4 leading-5">
                            上传你从 Spotify 下载的数据导出文件，获取精确的播放统计。
                        </Text>

                        <View className="bg-dark-50 rounded-lg p-4 mb-4">
                            <Text className="text-gray-400 text-sm mb-2">📁 如何获取数据文件？</Text>
                            <Text className="text-gray-500 text-xs leading-4">
                                1. 访问 spotify.com/account/privacy{"\n"}
                                2. 点击 "Request data"{"\n"}
                                3. 等待邮件（几天到几周）{"\n"}
                                4. 下载并解压 ZIP 文件{"\n"}
                                5. 选择 Streaming_History_*.json
                            </Text>
                        </View>

                        <Pressable
                            onPress={handleSelectFile}
                            className="bg-purple-600 py-4 rounded-xl"
                            style={({ pressed }) => [
                                { transform: [{ scale: pressed ? 0.98 : 1 }] },
                            ]}
                        >
                            <View className="flex-row items-center justify-center">
                                <Text className="text-2xl mr-2">📁</Text>
                                <Text className="text-white font-semibold text-lg">
                                    选择 JSON 文件
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                )}

                {/* 选择/解析/上传中 */}
                {(status === "selecting" || status === "parsing" || status === "uploading") && (
                    <View className="items-center py-6">
                        <ActivityIndicator size="large" color="#9333ea" />
                        <Text className="text-white mt-4">
                            {status === "selecting" ? "选择文件..." : progress}
                        </Text>
                        {status === "uploading" && (
                            <Text className="text-gray-500 text-xs mt-2">
                                ☁️ 同步到云端以启用实时数据合并
                            </Text>
                        )}
                    </View>
                )}

                {/* 成功状态 - 显示统计 */}
                {status === "success" && stats && (
                    <View>
                        {/* 总体统计 */}
                        <View className="flex-row flex-wrap gap-3 mb-4">
                            <View className="bg-dark-50 rounded-lg p-3 flex-1 min-w-[45%]">
                                <Text className="text-purple-400 text-2xl font-bold">
                                    {stats.totalStreams.toLocaleString()}
                                </Text>
                                <Text className="text-gray-500 text-xs">播放次数</Text>
                            </View>
                            <View className="bg-dark-50 rounded-lg p-3 flex-1 min-w-[45%]">
                                <Text className="text-purple-400 text-2xl font-bold">
                                    {stats.totalHours}h
                                </Text>
                                <Text className="text-gray-500 text-xs">总时长</Text>
                            </View>
                            <View className="bg-dark-50 rounded-lg p-3 flex-1 min-w-[45%]">
                                <Text className="text-purple-400 text-2xl font-bold">
                                    {stats.uniqueArtists}
                                </Text>
                                <Text className="text-gray-500 text-xs">艺人数</Text>
                            </View>
                            <View className="bg-dark-50 rounded-lg p-3 flex-1 min-w-[45%]">
                                <Text className="text-purple-400 text-2xl font-bold">
                                    {stats.uniqueTracks}
                                </Text>
                                <Text className="text-gray-500 text-xs">歌曲数</Text>
                            </View>
                        </View>

                        {/* 云端同步状态 */}
                        {cloudUploadResult && (
                            <View className="bg-green-900/20 border border-green-700/30 rounded-lg p-3 mb-4">
                                <Text className="text-green-400 text-sm">
                                    ☁️ 云端同步完成: 新增 {cloudUploadResult.recordsAdded} 条
                                    {cloudUploadResult.recordsSkipped > 0 && (
                                        <Text className="text-gray-500">
                                            ，跳过 {cloudUploadResult.recordsSkipped} 条重复
                                        </Text>
                                    )}
                                </Text>
                            </View>
                        )}
                        {!cloudUploadResult && isCloudSyncAvailable() && userId && (
                            <View className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-4">
                                <Text className="text-yellow-400 text-sm">
                                    ⚠️ 数据仅保存在本地
                                </Text>
                            </View>
                        )}

                        {/* Top 3 Artists */}
                        {stats.topArtists.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-400 text-sm mb-2">Top Artists</Text>
                                {stats.topArtists.slice(0, 3).map((artist, index) => (
                                    <View
                                        key={artist.name}
                                        className="flex-row items-center py-2 border-b border-dark-50/30"
                                    >
                                        <Text className="text-gray-500 w-6">#{index + 1}</Text>
                                        <View className="flex-1">
                                            <Text className="text-white font-medium">{artist.name}</Text>
                                            <Text className="text-gray-500 text-xs">
                                                {artist.totalHours}h · {artist.streamCount} streams
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* 操作按钮 */}
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={handleSelectFile}
                                className="flex-1 py-3 rounded-xl bg-dark-50"
                            >
                                <Text className="text-gray-400 text-center">重新导入</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleClear}
                                className="py-3 px-4 rounded-xl bg-red-900/30 border border-red-700/50"
                            >
                                <Text className="text-red-400">清除</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* 错误状态 */}
                {status === "error" && (
                    <View>
                        <View className="bg-red-900/30 rounded-xl p-4 mb-4 border border-red-700/50">
                            <Text className="text-red-400 font-semibold mb-2">导入失败</Text>
                            <Text className="text-gray-300 text-sm">{errorMessage}</Text>
                        </View>

                        <Pressable
                            onPress={handleSelectFile}
                            className="py-3 rounded-xl bg-purple-600"
                        >
                            <Text className="text-white text-center font-semibold">重试</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            {/* 隐私说明 */}
            <View className="px-6 pb-6">
                <Text className="text-gray-600 text-xs text-center">
                    🔒 数据仅保存在你的设备本地，不会上传到任何服务器
                </Text>
            </View>
        </View>
    );
}

// 导出统计类型
export type { StreamingStats };
