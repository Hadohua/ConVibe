/**
 * AuthBoundaryUnified.native.tsx - Native 平台专用 Auth Boundary
 * 
 * 使用 @privy-io/expo 的 AuthBoundary 组件。
 * Metro bundler 会根据 .native.tsx 后缀自动在 iOS/Android 平台使用此文件。
 */

import { ReactNode } from "react";
import { AuthBoundary } from "@privy-io/expo";

interface AuthBoundaryUnifiedProps {
    children: ReactNode;
    loading: ReactNode;
    unauthenticated: ReactNode;
    error?: (error: Error) => ReactNode;
}

/**
 * Native 平台的 AuthBoundary 实现
 * 
 * 直接使用 @privy-io/expo 的 AuthBoundary 组件。
 */
export function AuthBoundaryUnified({
    children,
    loading,
    unauthenticated,
    error,
}: AuthBoundaryUnifiedProps) {
    return (
        <AuthBoundary
            loading={loading}
            unauthenticated={unauthenticated}
            error={error}
        >
            {children}
        </AuthBoundary>
    );
}
