/**
 * lib/spotify/streaming-history-storage.ts
 * 
 * Spotify 流媒体历史数据本地存储管理
 * 使用 AsyncStorage 存储解析后的统计数据
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StreamingStats, StreamingRecord } from './streaming-history-parser';

const STORAGE_KEY = '@vibe_consensus/spotify_streaming_stats';
const RAW_RECORDS_KEY = '@vibe_consensus/spotify_raw_records';

/**
 * 保存统计数据到本地存储
 */
export async function saveStreamingStats(stats: StreamingStats): Promise<void> {
    try {
        const jsonValue = JSON.stringify(stats);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        console.log('Streaming stats saved successfully');
    } catch (error) {
        console.error('Failed to save streaming stats:', error);
        throw error;
    }
}

/**
 * 从本地存储读取统计数据
 */
export async function loadStreamingStats(): Promise<StreamingStats | null> {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue === null) {
            return null;
        }
        return JSON.parse(jsonValue) as StreamingStats;
    } catch (error) {
        console.error('Failed to load streaming stats:', error);
        return null;
    }
}

/**
 * 检查是否有已导入的数据
 */
export async function hasImportedData(): Promise<boolean> {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue !== null;
    } catch {
        return false;
    }
}

/**
 * 清除已导入的数据
 */
export async function clearStreamingStats(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log('Streaming stats cleared');
    } catch (error) {
        console.error('Failed to clear streaming stats:', error);
        throw error;
    }
}

/**
 * 获取数据导入时间
 */
export async function getImportTime(): Promise<Date | null> {
    const stats = await loadStreamingStats();
    if (stats?.importedAt) {
        return new Date(stats.importedAt);
    }
    return null;
}

/**
 * 保存原始播放记录到本地存储
 */
export async function saveRawStreamingRecords(records: StreamingRecord[]): Promise<void> {
    try {
        const jsonValue = JSON.stringify(records);
        await AsyncStorage.setItem(RAW_RECORDS_KEY, jsonValue);
        console.log('Raw streaming records saved successfully');
    } catch (error) {
        console.error('Failed to save raw streaming records:', error);
        throw error;
    }
}

/**
 * 从本地存储读取原始播放记录（未聚合的 JSON 数组）
 * 用于 stats.fm 风格的时间筛选功能
 */
export async function loadRawStreamingRecords(): Promise<StreamingRecord[]> {
    try {
        const jsonValue = await AsyncStorage.getItem(RAW_RECORDS_KEY);
        if (jsonValue === null) {
            return [];
        }
        return JSON.parse(jsonValue) as StreamingRecord[];
    } catch (error) {
        console.error('Failed to load raw streaming records:', error);
        return [];
    }
}
