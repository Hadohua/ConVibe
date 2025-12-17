/**
 * Web shim for expo-application
 * 
 * The expo-application module requires native bundleId/package on mobile
 * but on web we can provide mock values.
 */

export const applicationId = "com.convibe.app";
export const applicationName = "ConVibe";
export const nativeApplicationVersion = "1.0.0";
export const nativeBuildVersion = "1";

export function getInstallReferrerAsync() {
    return Promise.resolve(null);
}

export function getIosIdForVendorAsync() {
    return Promise.resolve(null);
}

export function getInstallationTimeAsync() {
    return Promise.resolve(new Date());
}

export function getLastUpdateTimeAsync() {
    return Promise.resolve(new Date());
}

export function getAndroidId() {
    return null;
}

export default {
    applicationId,
    applicationName,
    nativeApplicationVersion,
    nativeBuildVersion,
    getInstallReferrerAsync,
    getIosIdForVendorAsync,
    getInstallationTimeAsync,
    getLastUpdateTimeAsync,
    getAndroidId,
};
