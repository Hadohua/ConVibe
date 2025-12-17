/**
 * PrivyProviderWeb.tsx - Web 专用 Privy Provider
 * 
 * 使用 @privy-io/react-auth 为 Web 平台提供 Privy 认证服务。
 */

import { PrivyProvider as PrivyWebProvider } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { getPrivyAppId } from "../../lib/web3/privy-config";

interface PrivyProviderWebProps {
    children: React.ReactNode;
}

/**
 * Web 专用 Privy Provider
 * 
 * 配置说明：
 * - loginMethods: ["google"] - 使用 Google OAuth 登录
 * - appearance: 深色主题，符合应用整体风格
 * - embeddedWallets: 为没有钱包的用户自动创建
 * - defaultChain: Base Sepolia 测试网
 */
export function PrivyProviderWeb({ children }: PrivyProviderWebProps) {
    const appId = getPrivyAppId();

    if (!appId) {
        return <>{children}</>;
    }

    return (
        <PrivyWebProvider
            appId={appId}
            config={{
                // 登录方式配置
                loginMethods: ["google"],

                // 外观配置 - 深色主题
                appearance: {
                    theme: "dark",
                    accentColor: "#9333ea", // 紫色主题色
                    logo: undefined,
                },

                // 嵌入式钱包配置 - 新 API 结构
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: "users-without-wallets",
                    },
                },

                // 链配置 - Base Sepolia
                defaultChain: baseSepolia,
                supportedChains: [baseSepolia],
            }}
        >
            {children}
        </PrivyWebProvider>
    );
}
