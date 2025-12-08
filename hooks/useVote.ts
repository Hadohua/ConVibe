/**
 * hooks/useVote.ts - 投票逻辑 Hook
 * 
 * 实现加权投票算法，检查用户 SBT 余额
 */

import { useState, useCallback } from "react";
import { useEmbeddedWallet } from "@privy-io/expo";
import * as Haptics from "expo-haptics";
import { publicClient, MUSIC_CONSENSUS_SBT_ADDRESS } from "../lib/web3/client";
import { MusicConsensusSBTAbi } from "../lib/web3/abi";

// ============================================
// 投票权重常量
// ============================================

const V_BASE = 1;      // 基础票权
const W_SBT = 5;       // SBT 额外权重
const M_MATCH = 2;     // 流派匹配系数
const M_DEFAULT = 1;   // 默认系数

// ============================================
// 类型定义
// ============================================

export interface VoteResult {
    /** 计算后的权重 */
    weight: number;
    /** 是否持有 SBT */
    hasSBT: boolean;
    /** 是否流派匹配 */
    isGenreMatch: boolean;
    /** 成功 */
    success: boolean;
}

export interface UseVoteReturn {
    /** 投票 */
    vote: (proposalId: string, genreId: number) => Promise<VoteResult>;
    /** 检查用户对某流派的权重 */
    getVoteWeight: (genreId: number) => Promise<{ weight: number; hasSBT: boolean }>;
    /** 获取用户所有 SBT */
    getUserBadges: () => Promise<number[]>;
}

// ============================================
// useVote Hook
// ============================================

export function useVote(): UseVoteReturn {
    const wallet = useEmbeddedWallet();

    /**
     * 获取用户所有徽章
     */
    const getUserBadges = useCallback(async (): Promise<number[]> => {
        if (!wallet.account?.address) {
            return [];
        }

        try {
            const result = await publicClient.readContract({
                address: MUSIC_CONSENSUS_SBT_ADDRESS,
                abi: MusicConsensusSBTAbi,
                functionName: "getUserBadges",
                args: [wallet.account.address as `0x${string}`],
            });

            return (result as bigint[]).map((id) => Number(id));
        } catch (err) {
            console.error("获取徽章失败:", err);
            return [];
        }
    }, [wallet.account?.address]);

    /**
     * 检查用户对某流派的投票权重
     */
    const getVoteWeight = useCallback(
        async (genreId: number): Promise<{ weight: number; hasSBT: boolean }> => {
            if (!wallet.account?.address) {
                return { weight: V_BASE, hasSBT: false };
            }

            try {
                // 检查用户是否持有该流派的 SBT
                const balance = await publicClient.readContract({
                    address: MUSIC_CONSENSUS_SBT_ADDRESS,
                    abi: MusicConsensusSBTAbi,
                    functionName: "balanceOf",
                    args: [wallet.account.address as `0x${string}`, BigInt(genreId)],
                });

                const hasSBT = (balance as bigint) > 0n;

                if (hasSBT) {
                    // 持有匹配流派 SBT: 1 + 5 * 2 = 11
                    const weight = V_BASE + W_SBT * M_MATCH;
                    return { weight, hasSBT: true };
                }

                // 检查是否持有任何 SBT
                const badges = await getUserBadges();
                if (badges.length > 0) {
                    // 持有其他 SBT: 1 + 5 * 1 = 6
                    const weight = V_BASE + W_SBT * M_DEFAULT;
                    return { weight, hasSBT: true };
                }

                // 无 SBT: 1
                return { weight: V_BASE, hasSBT: false };
            } catch (err) {
                console.error("检查权重失败:", err);
                return { weight: V_BASE, hasSBT: false };
            }
        },
        [wallet.account?.address, getUserBadges]
    );

    /**
     * 执行投票
     */
    const vote = useCallback(
        async (proposalId: string, genreId: number): Promise<VoteResult> => {
            try {
                // 获取权重
                const { weight, hasSBT } = await getVoteWeight(genreId);

                // 检查是否流派匹配
                let isGenreMatch = false;
                if (hasSBT && wallet.account?.address) {
                    const balance = await publicClient.readContract({
                        address: MUSIC_CONSENSUS_SBT_ADDRESS,
                        abi: MusicConsensusSBTAbi,
                        functionName: "balanceOf",
                        args: [wallet.account.address as `0x${string}`, BigInt(genreId)],
                    });
                    isGenreMatch = (balance as bigint) > 0n;
                }

                // Haptic Feedback
                if (hasSBT) {
                    // SBT 用户：更强的震动
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                    // 普通用户：轻微震动
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }

                console.log(`投票成功: proposal=${proposalId}, weight=${weight}, hasSBT=${hasSBT}`);

                return {
                    weight,
                    hasSBT,
                    isGenreMatch,
                    success: true,
                };
            } catch (err) {
                console.error("投票失败:", err);
                return {
                    weight: 0,
                    hasSBT: false,
                    isGenreMatch: false,
                    success: false,
                };
            }
        },
        [getVoteWeight, wallet.account?.address]
    );

    return {
        vote,
        getVoteWeight,
        getUserBadges,
    };
}
