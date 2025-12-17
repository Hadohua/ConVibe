/**
 * Web shim for expo-secure-store
 * 
 * expo-secure-store is native-only, but Privy needs it for storing auth tokens.
 * On web, we use localStorage as a fallback (less secure, but functional).
 */

const PREFIX = "__expo_secure_store__";

export async function getItemAsync(key: string): Promise<string | null> {
    if (typeof window === "undefined" || !window.localStorage) {
        return null;
    }
    try {
        return localStorage.getItem(`${PREFIX}${key}`);
    } catch (error) {
        console.warn("SecureStore.getItemAsync failed:", error);
        return null;
    }
}

export async function setItemAsync(key: string, value: string): Promise<void> {
    if (typeof window === "undefined" || !window.localStorage) {
        return;
    }
    try {
        localStorage.setItem(`${PREFIX}${key}`, value);
    } catch (error) {
        console.warn("SecureStore.setItemAsync failed:", error);
    }
}

export async function deleteItemAsync(key: string): Promise<void> {
    if (typeof window === "undefined" || !window.localStorage) {
        return;
    }
    try {
        localStorage.removeItem(`${PREFIX}${key}`);
    } catch (error) {
        console.warn("SecureStore.deleteItemAsync failed:", error);
    }
}

// Legacy API compatibility (some versions use these names)
export async function getValueWithKeyAsync(key: string): Promise<string | null> {
    return getItemAsync(key);
}

export async function setValueWithKeyAsync(key: string, value: string): Promise<void> {
    return setItemAsync(key, value);
}

export async function deleteValueWithKeyAsync(key: string): Promise<void> {
    return deleteItemAsync(key);
}

export const AFTER_FIRST_UNLOCK = 0;
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 1;
export const ALWAYS = 2;
export const ALWAYS_THIS_DEVICE_ONLY = 3;
export const WHEN_UNLOCKED = 4;
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 5;
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 6;

export function canUseBiometricAuthentication(): boolean {
    return false;
}

export async function isAvailableAsync(): Promise<boolean> {
    return typeof window !== "undefined" && !!window.localStorage;
}

export default {
    getItemAsync,
    setItemAsync,
    deleteItemAsync,
    getValueWithKeyAsync,
    setValueWithKeyAsync,
    deleteValueWithKeyAsync,
    canUseBiometricAuthentication,
    isAvailableAsync,
    AFTER_FIRST_UNLOCK,
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    ALWAYS,
    ALWAYS_THIS_DEVICE_ONLY,
    WHEN_UNLOCKED,
    WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
};
