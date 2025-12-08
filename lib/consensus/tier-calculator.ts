/**
 * lib/consensus/tier-calculator.ts - 品味浓度等级计算器
 * 
 * 根据 Spotify 数据计算用户的"品味浓度"等级
 * 
 * 等级划分：
 * - Tier 1 (入门): popularity < 50 或数据不足
 * - Tier 2 (资深): popularity 50-79
 * - Tier 3 (OG):   popularity >= 80
 */

// ============================================
// 常量
// ============================================

export const TIER = {
    ENTRY: 1,    // 入门
    VETERAN: 2,  // 资深
    OG: 3,       // OG
} as const;

export type TierLevel = typeof TIER[keyof typeof TIER];

/** Tier 阈值 */
export const TIER_THRESHOLDS = {
    VETERAN_MIN: 50,  // 资深最低 popularity
    OG_MIN: 80,       // OG 最低 popularity
} as const;

/** Tier 显示信息 */
export const TIER_INFO: Record<TierLevel, {
    name: string;
    nameEn: string;
    emoji: string;
    description: string;
    color: string;
    glowColor: string;
}> = {
    [TIER.ENTRY]: {
        name: "入门",
        nameEn: "Entry",
        emoji: "🌱",
        description: "开始探索这个流派",
        color: "#9CA3AF",   // gray-400
        glowColor: "rgba(156, 163, 175, 0.3)",
    },
    [TIER.VETERAN]: {
        name: "资深",
        nameEn: "Veteran",
        emoji: "⭐",
        description: "对这个流派有深入了解",
        color: "#C0C0C0",   // silver
        glowColor: "rgba(192, 192, 192, 0.4)",
    },
    [TIER.OG]: {
        name: "OG",
        nameEn: "OG",
        emoji: "👑",
        description: "这个流派的骨灰级粉丝",
        color: "#FFD700",   // gold
        glowColor: "rgba(255, 215, 0, 0.5)",
    },
};

// ============================================
// 计算函数
// ============================================

/**
 * 根据 Spotify popularity 计算 Tier
 * 
 * @param popularity - Spotify artist popularity (0-100)
 * @returns TierLevel - 计算出的等级
 */
export function calculateTierFromPopularity(popularity: number): TierLevel {
    if (popularity >= TIER_THRESHOLDS.OG_MIN) {
        return TIER.OG;
    }
    if (popularity >= TIER_THRESHOLDS.VETERAN_MIN) {
        return TIER.VETERAN;
    }
    return TIER.ENTRY;
}

/**
 * 根据收听时长计算 Tier (备用方案)
 * 
 * @param hoursListened - 该流派收听小时数
 * @returns TierLevel
 */
export function calculateTierFromListeningTime(hoursListened: number): TierLevel {
    if (hoursListened >= 500) {
        return TIER.OG;
    }
    if (hoursListened >= 100) {
        return TIER.VETERAN;
    }
    return TIER.ENTRY;
}

/**
 * 综合计算 Tier (考虑多个因素)
 * 
 * @param data - 包含 popularity 和/或 listeningHours 的对象
 * @returns TierLevel - 取最高的等级
 */
export function calculateTier(data: {
    popularity?: number;
    listeningHours?: number;
}): TierLevel {
    let tier: TierLevel = TIER.ENTRY;

    if (data.popularity !== undefined) {
        const popTier = calculateTierFromPopularity(data.popularity);
        if (popTier > tier) tier = popTier;
    }

    if (data.listeningHours !== undefined) {
        const timeTier = calculateTierFromListeningTime(data.listeningHours);
        if (timeTier > tier) tier = timeTier;
    }

    return tier;
}

/**
 * 获取 Tier 显示信息
 */
export function getTierInfo(tier: TierLevel) {
    return TIER_INFO[tier] || TIER_INFO[TIER.ENTRY];
}

/**
 * 为多个流派计算各自的 Tier
 * 
 * @param genreData - 流派到数据的映射
 * @returns 流派到 Tier 的映射
 */
export function calculateTiersForGenres(
    genreData: Record<string, { popularity?: number; listeningHours?: number }>
): Record<string, TierLevel> {
    const result: Record<string, TierLevel> = {};

    for (const [genre, data] of Object.entries(genreData)) {
        result[genre] = calculateTier(data);
    }

    return result;
}

// ============================================
// 验证状态
// ============================================

/** 90天有效期 (毫秒) */
export const VERIFICATION_VALIDITY_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * 检查验证是否过期
 * 
 * @param lastVerifiedTimestamp - 最后验证时间戳 (秒，区块链格式)
 * @returns 是否已过期
 */
export function isVerificationExpired(lastVerifiedTimestamp: number): boolean {
    const lastVerifiedMs = lastVerifiedTimestamp * 1000;
    const now = Date.now();
    return now > lastVerifiedMs + VERIFICATION_VALIDITY_MS;
}

/**
 * 计算距离过期还有多少天
 * 
 * @param lastVerifiedTimestamp - 最后验证时间戳 (秒)
 * @returns 剩余天数，负数表示已过期
 */
export function getDaysUntilExpiry(lastVerifiedTimestamp: number): number {
    const expiryMs = lastVerifiedTimestamp * 1000 + VERIFICATION_VALIDITY_MS;
    const now = Date.now();
    return Math.floor((expiryMs - now) / (24 * 60 * 60 * 1000));
}
