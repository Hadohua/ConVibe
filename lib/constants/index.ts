/**
 * lib/constants/index.ts
 * 
 * 应用常量定义文件
 * 存放全局不变的配置值，例如：
 * - 颜色定义
 * - API 端点
 * - 合约地址
 * - 链 ID
 */

// VibeConsensus 品牌颜色 (与 tailwind.config.js 保持同步)
export const COLORS = {
    primary: {
        main: "#9333ea",
        light: "#a855f7",
        dark: "#7c3aed",
    },
    dark: {
        background: "#18181b",
        surface: "#27272a",
        border: "#3f3f46",
    },
} as const;

// 应用元信息
export const APP_CONFIG = {
    name: "VibeConsensus",
    tagline: "Prove your music taste, on-chain.",
    version: "1.0.0",
} as const;
