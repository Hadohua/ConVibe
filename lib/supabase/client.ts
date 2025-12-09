/**
 * lib/supabase/client.ts - Supabase 客户端配置
 * 
 * 初始化 Supabase 客户端，使用 AsyncStorage 适配 React Native
 * 注意：使用延迟初始化，只在配置了 URL 时才创建客户端
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================
// 环境变量
// ============================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// ============================================
// 延迟初始化的客户端
// ============================================

let _supabase: SupabaseClient | null = null;

/**
 * 获取 Supabase 客户端（延迟初始化）
 * 只在配置了 URL 时才创建客户端
 */
export function getSupabase(): SupabaseClient | null {
    // 如果未配置，返回 null
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return null;
    }

    // 延迟初始化
    if (!_supabase) {
        _supabase = createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
                auth: {
                    storage: AsyncStorage,
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false,
                },
            }
        );
    }

    return _supabase;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 检查 Supabase 是否已配置
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// 为了向后兼容，导出一个 getter（但不推荐直接使用）
export const supabase = {
    get client() {
        return getSupabase();
    }
};

