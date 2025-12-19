/**
 * PrivyProviderWrapper.tsx - 默认导出文件 (Web fallback)
 * 
 * 这个文件作为 Vercel Web 构建的 fallback。
 * 当 Expo 的平台特定文件解析在生产构建中不可用时使用。
 * 
 * 注意：这是 PrivyProviderWrapper.web.tsx 的副本。
 */

import { View, Text } from "react-native";
import { getPrivyAppId } from "../../lib/web3/privy-config";
import { PrivyProviderWeb } from "./PrivyProviderWeb";

interface PrivyProviderWrapperProps {
    children: React.ReactNode;
}

/**
 * Web 平台 Provider Wrapper (Fallback)
 */
export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
    const appId = getPrivyAppId();

    // 调试：在控制台输出 appId 状态
    console.log("[PrivyProviderWrapper] App ID:", appId ? `${appId.substring(0, 8)}...` : "MISSING");
    console.log("[PrivyProviderWrapper] process.env:", {
        EXPO_PUBLIC_PRIVY_APP_ID: process.env.EXPO_PUBLIC_PRIVY_APP_ID,
    });

    if (!appId) {
        console.error("[PrivyProviderWrapper] EXPO_PUBLIC_PRIVY_APP_ID is not set!");
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0f", padding: 32 }}>
                <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
                    ⚠️ 配置缺失
                </Text>
                <Text style={{ color: "#9ca3af", textAlign: "center" }}>
                    请在 .env 文件中配置 Privy 凭证：{"\n\n"}
                    EXPO_PUBLIC_PRIVY_APP_ID{"\n\n"}
                    获取方式：https://dashboard.privy.io
                </Text>
            </View>
        );
    }

    return <PrivyProviderWeb>{children}</PrivyProviderWeb>;
}
