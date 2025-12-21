/**
 * usePrivyUnified.web.ts - Web 平台专用 Privy Hooks
 * 
 * 使用 @privy-io/react-auth SDK 的 hooks。
 * Metro bundler 会根据 .web.ts 后缀自动在 Web 平台使用此文件。
 */

import {
    usePrivy,
    useLogin,
    useLogout,
} from "@privy-io/react-auth";

/**
 * 统一的用户状态 Hook - Web 版
 */
export function usePrivyUnified() {
    const { user, ready, authenticated } = usePrivy();
    return {
        user,
        isReady: ready,
        authenticated,
    };
}

/**
 * 统一的 OAuth 登录 Hook - Web 版
 */
export function useLoginWithOAuthUnified() {
    const { login: loginWeb } = useLogin();

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
 * 统一的登出 Hook - Web 版
 */
export function useLogoutUnified() {
    const { logout } = useLogout();
    return { logout };
}

/**
 * 统一的嵌入式钱包 Hook - Web 版
 */
export function useEmbeddedWalletUnified() {
    const { user } = usePrivy();
    const embeddedWallet = user?.linkedAccounts?.find(
        (account): account is any =>
            account.type === "wallet" && account.walletClientType === "privy"
    );

    return {
        wallet: embeddedWallet ? {
            status: "connected" as const,
            address: embeddedWallet.address as string,
        } : {
            status: "not-created" as const,
            address: undefined as undefined,
        },
    };
}

/**
 * 获取钱包地址的便捷函数 - Web 版
 */
export function useWalletAddress(): string | undefined {
    const { wallet } = useEmbeddedWalletUnified();

    if ('address' in wallet && wallet.address) {
        return wallet.address;
    }
    return undefined;
}
