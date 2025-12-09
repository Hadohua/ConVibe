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

// ============================================
// $CVIB 代币常量
// ============================================

/** 每小时听歌奖励的 $CVIB 数量 */
export const CVIB_PER_HOUR = 10;

/** 各 Tier 需要的 $CVIB 数量 */
export const CVIB_TIER_COST = {
    [TIER.ENTRY]: 100,
    [TIER.VETERAN]: 500,
    [TIER.OG]: 1000,
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

// ============================================
// $CVIB 计算函数
// ============================================

/**
 * 根据收听时长计算应获得的 $CVIB 数量
 * 
 * @param hoursListened - 听歌小时数
 * @returns $CVIB 数量
 */
export function calculateCVIBFromListeningTime(hoursListened: number): number {
    return Math.floor(hoursListened * CVIB_PER_HOUR);
}

/**
 * 根据用户的 Spotify 数据计算总 $CVIB
 * 
 * @param data - 包含听歌数据的对象
 * @returns 总 $CVIB 数量
 */
export function calculateTotalCVIB(data: {
    totalHours: number;
    genreHours?: Record<string, number>;
}): number {
    let total = 0;

    // 基础奖励: 总听歌时长
    total += calculateCVIBFromListeningTime(data.totalHours);

    // 流派专注度奖励 (可选)
    if (data.genreHours) {
        for (const hours of Object.values(data.genreHours)) {
            if (hours >= 50) {
                total += 50;      // 50小时以上: +50 CVIB 专注奖励
            } else if (hours >= 20) {
                total += 20;      // 20小时以上: +20 CVIB 专注奖励
            }
        }
    }

    return total;
}

/**
 * 根据 $CVIB 数量计算可铸造的最高 Tier
 * 
 * @param cvibAmount - 用户拥有的 $CVIB 数量
 * @returns 可铸造的最高 Tier，0 表示不够铸造任何 Tier
 */
export function getMaxTierForCVIB(cvibAmount: number): TierLevel | 0 {
    if (cvibAmount >= CVIB_TIER_COST[TIER.OG]) return TIER.OG;
    if (cvibAmount >= CVIB_TIER_COST[TIER.VETERAN]) return TIER.VETERAN;
    if (cvibAmount >= CVIB_TIER_COST[TIER.ENTRY]) return TIER.ENTRY;
    return 0;
}

/**
 * 计算铸造指定 Tier 需要的 $CVIB
 * 
 * @param tier - 目标 Tier
 * @returns 所需 $CVIB 数量
 */
export function getCVIBCostForTier(tier: TierLevel): number {
    return CVIB_TIER_COST[tier] || 0;
}

/**
 * 根据 StreamingStats 计算用户应获得的 $CVIB
 * 
 * @param stats - 流媒体统计数据
 * @returns CVIB 计算结果
 */
export function calculateCVIBFromStats(stats: {
    totalHours: number;
    topArtists?: Array<{ totalHours: number }>;
}): {
    baseCVIB: number;
    bonusCVIB: number;
    totalCVIB: number;
} {
    // 基础奖励
    const baseCVIB = calculateCVIBFromListeningTime(stats.totalHours);

    // 艺术家专注度奖励
    let bonusCVIB = 0;
    if (stats.topArtists) {
        for (const artist of stats.topArtists.slice(0, 10)) { // 前10个艺人
            if (artist.totalHours >= 20) {
                bonusCVIB += 30; // 每个深度艺人 +30 CVIB
            } else if (artist.totalHours >= 10) {
                bonusCVIB += 15;
            } else if (artist.totalHours >= 5) {
                bonusCVIB += 5;
            }
        }
    }

    return {
        baseCVIB,
        bonusCVIB,
        totalCVIB: baseCVIB + bonusCVIB,
    };
}
