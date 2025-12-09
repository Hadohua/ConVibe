/**
 * hooks/useGatedAccess.ts - 圈层权限检查 Hook
 * 
 * 检查用户是否有权限访问深水区内容
 */

import { useCallback, useState } from "react";
import { useEmbeddedWallet } from "@privy-io/expo";
import { publicClient, MUSIC_CONSENSUS_SBT_ADDRESS } from "../lib/web3/client";
import { MusicConsensusSBTAbi } from "../lib/web3/abi";

// ============================================
// 类型定义
// ============================================

export interface BadgeInfo {
    genreId: number;
    tier: number;
    isActive: boolean;
}

export interface AccessCheckResult {
    hasAccess: boolean;
    userTier: number;
    requiredTier: number;
    genreId: number;
}

export interface UseGatedAccessReturn {
    /** 检查对特定内容的访问权限 */
    checkAccess: (requiredGenreId: number, requiredTier: number) => Promise<AccessCheckResult>;
    /** 获取用户最高等级的徽章 */
    getHighestTierBadge: () => Promise<BadgeInfo | null>;
    /** 获取用户特定流派的徽章 */
    getBadgeForGenre: (genreId: number) => Promise<BadgeInfo | null>;
    /** 是否正在加载 */
    loading: boolean;
}

// ============================================
// useGatedAccess Hook
// ============================================

export function useGatedAccess(): UseGatedAccessReturn {
    const wallet = useEmbeddedWallet();
    const [loading, setLoading] = useState(false);

    /**
     * 获取用户在特定流派的徽章信息
     */
    const getBadgeForGenre = useCallback(
        async (genreId: number): Promise<BadgeInfo | null> => {
            if (!wallet.account?.address) {
                return null;
            }

            try {
                // 检查余额
                const balance = await publicClient.readContract({
                    address: MUSIC_CONSENSUS_SBT_ADDRESS,
                    abi: MusicConsensusSBTAbi,
                    functionName: "balanceOf",
                    args: [wallet.account.address as `0x${string}`, BigInt(genreId)],
                });

                if ((balance as bigint) === 0n) {
                    return null;
                }

                // 获取徽章信息
                try {
                    const info = await publicClient.readContract({
                        address: MUSIC_CONSENSUS_SBT_ADDRESS,
                        abi: MusicConsensusSBTAbi,
                        functionName: "getBadgeInfo",
                        args: [wallet.account.address as `0x${string}`, BigInt(genreId)],
                    });

                    const [tier, , , isExpired] = info as [number, bigint, number, boolean];

                    return {
                        genreId,
                        tier,
                        isActive: !isExpired,
                    };
                } catch {
                    // 如果 getBadgeInfo 失败，返回默认 tier 1
                    return {
                        genreId,
                        tier: 1,
                        isActive: true,
                    };
                }
            } catch (err) {
                console.error("获取徽章信息失败:", err);
                return null;
            }
        },
        [wallet.account?.address]
    );

    /**
     * 获取用户最高等级的徽章
     */
    const getHighestTierBadge = useCallback(async (): Promise<BadgeInfo | null> => {
        if (!wallet.account?.address) {
            return null;
        }

        try {
            // 获取用户所有徽章
            const badges = await publicClient.readContract({
                address: MUSIC_CONSENSUS_SBT_ADDRESS,
                abi: MusicConsensusSBTAbi,
                functionName: "getUserBadges",
                args: [wallet.account.address as `0x${string}`],
            });

            const genreIds = (badges as bigint[]).map((id) => Number(id));

            if (genreIds.length === 0) {
                return null;
            }

            // 获取每个徽章的信息并找出最高等级
            let highest: BadgeInfo | null = null;

            for (const genreId of genreIds) {
                const badge = await getBadgeForGenre(genreId);
                if (badge && (!highest || badge.tier > highest.tier)) {
                    highest = badge;
                }
            }

            return highest;
        } catch (err) {
            console.error("获取最高等级徽章失败:", err);
            return null;
        }
    }, [wallet.account?.address, getBadgeForGenre]);

    /**
     * 检查用户对特定内容的访问权限
     */
    const checkAccess = useCallback(
        async (requiredGenreId: number, requiredTier: number): Promise<AccessCheckResult> => {
            setLoading(true);

            try {
                // 首先检查是否有该流派的徽章
                const genreBadge = await getBadgeForGenre(requiredGenreId);

                if (genreBadge && genreBadge.isActive && genreBadge.tier >= requiredTier) {
                    return {
                        hasAccess: true,
                        userTier: genreBadge.tier,
                        requiredTier,
                        genreId: requiredGenreId,
                    };
                }

                // 如果没有该流派徽章，检查是否有更高等级的任何徽章
                const highestBadge = await getHighestTierBadge();

                if (highestBadge && highestBadge.isActive && highestBadge.tier >= requiredTier + 1) {
                    // 高一级的任何徽章也可以访问
                    return {
                        hasAccess: true,
                        userTier: highestBadge.tier,
                        requiredTier,
                        genreId: requiredGenreId,
                    };
                }

                return {
                    hasAccess: false,
                    userTier: genreBadge?.tier || highestBadge?.tier || 0,
                    requiredTier,
                    genreId: requiredGenreId,
                };
            } finally {
                setLoading(false);
            }
        },
        [getBadgeForGenre, getHighestTierBadge]
    );

    return {
        checkAccess,
        getHighestTierBadge,
        getBadgeForGenre,
        loading,
    };
}
