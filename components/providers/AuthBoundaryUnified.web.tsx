/**
 * AuthBoundaryUnified.web.tsx - Web 平台专用 Auth Boundary
 * 
 * 使用 @privy-io/react-auth 的 hooks 实现认证边界。
 * Metro bundler 会根据 .web.tsx 后缀自动在 Web 平台使用此文件。
 */

import { ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface AuthBoundaryUnifiedProps {
    children: ReactNode;
    loading: ReactNode;
    unauthenticated: ReactNode;
    error?: (error: Error) => ReactNode;
}

/**
 * Web 平台的 AuthBoundary 实现
 * 
 * 使用 @privy-io/react-auth 的 usePrivy hook 检查认证状态，
 * 手动渲染 loading/unauthenticated/error/authenticated 状态。
 */
export function AuthBoundaryUnified({
    children,
    loading,
    unauthenticated,
}: AuthBoundaryUnifiedProps) {
    const { ready, authenticated } = usePrivy();

    // SDK 未准备好，显示加载状态
    if (!ready) {
        return <>{loading}</>;
    }

    // 未认证，显示未认证状态（通常是重定向到登录页）
    if (!authenticated) {
        return <>{unauthenticated}</>;
    }

    // 已认证，显示子组件
    return <>{children}</>;
}
