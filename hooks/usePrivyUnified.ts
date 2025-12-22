/**
 * usePrivyUnified.ts - Web 平台 Privy Hooks (SSR-Safe)
 * 
 * 使用 @privy-io/react-auth SDK 的 hooks。
 * SSR 安全：在服务端渲染时返回空状态，避免 uuid 包的问题。
 */

import { useState, useEffect, useCallback } from "react";

// 检测是否在服务端
const isServer = typeof window === "undefined";

// SSR-safe 懒加载 Privy hooks
let privyHooks: {
    usePrivy: typeof import("@privy-io/react-auth").usePrivy;
    useLogin: typeof import("@privy-io/react-auth").useLogin;
    useLogout: typeof import("@privy-io/react-auth").useLogout;
} | null = null;

// 仅在客户端加载 Privy
if (!isServer) {
    // 同步导入 - 这只会在客户端执行
    const privy = require("@privy-io/react-auth");
    privyHooks = {
        usePrivy: privy.usePrivy,
        useLogin: privy.useLogin,
        useLogout: privy.useLogout,
    };
}

/**
 * 统一的用户状态 Hook - Web 版 (SSR-Safe)
 */
export function usePrivyUnified() {
    // SSR 时返回空状态
    if (isServer || !privyHooks) {
        return {
            user: null,
            isReady: false,
            authenticated: false,
        };
    }

    // 客户端使用真实的 Privy hook
    const { user, ready, authenticated } = privyHooks.usePrivy();
    return {
        user,
        isReady: ready,
        authenticated,
    };
}

/**
 * 统一的 OAuth 登录 Hook - Web 版 (SSR-Safe)
 */
export function useLoginWithOAuthUnified() {
    // SSR 时返回空操作
    if (isServer || !privyHooks) {
        return {
            login: async () => {
                console.warn("Login not available during SSR");
            },
            state: { status: "idle" as const },
        };
    }

    const { login: loginWeb } = privyHooks.useLogin();

    return {
        login: async () => {
            // Web SDK 的 login 会自动弹出登录模态框
            await loginWeb();
        },
        // Web SDK 不提供细粒度状态，返回简化状态
        state: { status: "idle" as const },
    };
}

/**
 * 统一的登出 Hook - Web 版 (SSR-Safe)
 */
export function useLogoutUnified() {
    // SSR 时返回空操作
    if (isServer || !privyHooks) {
        return {
            logout: async () => {
                console.warn("Logout not available during SSR");
            },
        };
    }

    const { logout } = privyHooks.useLogout();
    return { logout };
}

/**
 * 统一的嵌入式钱包 Hook - Web 版 (SSR-Safe)
 */
export function useEmbeddedWalletUnified() {
    // SSR 时返回 not-created 状态
    if (isServer || !privyHooks) {
        return {
            status: "not-created" as const,
            account: undefined,
            wallet: undefined,
            getProvider: async () => {
                throw new Error("Wallet not available during SSR");
            },
        };
    }

    const { user } = privyHooks.usePrivy();
    const embeddedWallet = user?.linkedAccounts?.find(
        (account): account is any =>
            account.type === "wallet" && account.walletClientType === "privy"
    );

    // 返回类似 Expo SDK 的接口
    if (embeddedWallet) {
        return {
            status: "connected" as const,
            account: {
                address: embeddedWallet.address as string,
            },
            wallet: embeddedWallet,
            getProvider: async () => {
                // Web 版使用 window.ethereum 或 Privy 提供的 provider
                if (typeof window !== "undefined" && (window as any).ethereum) {
                    return (window as any).ethereum;
                }
                throw new Error("No Ethereum provider found");
            },
        };
    }

    return {
        status: "not-created" as const,
        account: undefined,
        wallet: undefined,
        getProvider: async () => {
            throw new Error("Wallet not created");
        },
    };
}

/**
 * 获取钱包地址的便捷函数 - Web 版 (SSR-Safe)
 */
export function useWalletAddress(): string | undefined {
    const wallet = useEmbeddedWalletUnified();

    if (wallet.status === "connected" && wallet.account) {
        return wallet.account.address;
    }
    return undefined;
}
