/**
 * lib/api/claim-cvib.ts - $CVIB 领取 API 模块
 * 
 * MVP 阶段：调用后端服务铸造 $CVIB 到用户钱包
 * 
 * 工作流程：
 * 1. 用户验证 Spotify 数据
 * 2. 前端调用 claimCVIB() 
 * 3. 后端验证用户身份并铸造 $CVIB
 * 4. 用户获得 $CVIB 后可铸造 SBT
 */

import { createWalletClient, createPublicClient, http, encodeFunctionData, formatEther, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { publicClient, VIBE_TOKEN_ADDRESS } from "../web3/client";
import { VibeTokenAbi } from "../web3/abi";
import { calculateCVIBFromStats } from "../consensus/tier-calculator";
import type { StreamingStats } from "../spotify/streaming-history-parser";

// ============================================
// 类型定义
// ============================================

export interface ClaimResult {
    success: boolean;
    txHash?: string;
    amount?: string;
    error?: string;
}

export interface CVIBEstimate {
    baseCVIB: number;
    bonusCVIB: number;
    totalCVIB: number;
}

// ============================================
// 估算函数
// ============================================

/**
 * 根据 Spotify 统计数据估算可获得的 $CVIB
 * 
 * @param stats - StreamingStats 对象
 * @returns CVIBEstimate - 预估的 $CVIB 数量
 */
export function estimateCVIBReward(stats: StreamingStats): CVIBEstimate {
    return calculateCVIBFromStats({
        totalHours: stats.totalHours,
        topArtists: stats.topArtists,
    });
}

/**
 * 根据听歌小时数估算 $CVIB (简化版)
 * 
 * @param hoursListened - 听歌小时数
 * @returns 预估 $CVIB 数量
 */
export function estimateCVIBFromHours(hoursListened: number): number {
    // 基础: 10 CVIB/小时
    const baseCVIB = Math.floor(hoursListened * 10);

    // 额外奖励
    let bonusCVIB = 0;
    if (hoursListened >= 100) bonusCVIB += 100;  // 100小时以上: +100
    if (hoursListened >= 50) bonusCVIB += 50;    // 50小时以上: +50

    return baseCVIB + bonusCVIB;
}

// ============================================
// 领取函数 (MVP - 直接调用)
// ============================================

/**
 * 领取 $CVIB (MVP 版本 - 需要后端支持)
 * 
 * 注意：此函数需要后端服务来执行实际的铸造操作
 * 因为 VibeToken.mint() 只能由 owner 或 authorizedMinters 调用
 * 
 * @param userAddress - 用户钱包地址
 * @param amount - 领取数量 (整数，例如 1000 表示 1000 CVIB)
 * @returns ClaimResult
 */
export async function claimCVIB(
    userAddress: string,
    amount: number
): Promise<ClaimResult> {
    try {
        // TODO: 在生产环境中，这里应该调用后端 API
        // 后端 API 会验证用户身份并使用 minter 私钥铸造代币

        // 临时方案：返回需要后端支持的错误
        // 实际实现需要 Supabase Edge Function 或自建后端

        console.log(`[claimCVIB] Request: ${amount} CVIB to ${userAddress}`);

        // MVP 阶段：假设有一个后端端点
        // const response = await fetch('/api/claim-cvib', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ userAddress, amount }),
        // });
        // const result = await response.json();

        return {
            success: false,
            error: "需要后端服务支持。请使用 mint-cvib.js 脚本手动铸造测试代币",
        };
    } catch (error) {
        console.error("[claimCVIB] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "领取失败",
        };
    }
}

/**
 * 检查用户 $CVIB 余额
 * 
 * @param userAddress - 用户钱包地址
 * @returns 余额字符串 (格式化后)
 */
export async function getCVIBBalance(userAddress: string): Promise<string> {
    try {
        const balance = await publicClient.readContract({
            address: VIBE_TOKEN_ADDRESS,
            abi: VibeTokenAbi,
            functionName: "balanceOf",
            args: [userAddress as `0x${string}`],
        }) as bigint;

        return formatEther(balance);
    } catch (error) {
        console.error("[getCVIBBalance] Error:", error);
        return "0";
    }
}

/**
 * 检查用户是否有足够的 $CVIB 铸造指定 Tier
 * 
 * @param userAddress - 用户钱包地址  
 * @param tier - 等级 (1=Entry 100, 2=Veteran 500, 3=OG 1000)
 * @returns { sufficient, balance, required }
 */
export async function checkCVIBSufficiency(
    userAddress: string,
    tier: 1 | 2 | 3
): Promise<{
    sufficient: boolean;
    balance: string;
    required: string;
    shortfall: string;
}> {
    const TIER_COSTS = { 1: 100, 2: 500, 3: 1000 };
    const required = TIER_COSTS[tier];

    const balance = await getCVIBBalance(userAddress);
    const balanceNum = parseFloat(balance);

    return {
        sufficient: balanceNum >= required,
        balance: balanceNum.toFixed(0),
        required: required.toString(),
        shortfall: Math.max(0, required - balanceNum).toFixed(0),
    };
}
