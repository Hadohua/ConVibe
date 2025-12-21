/**
 * Web-only placeholder for @reclaimprotocol/reactnative-sdk
 * 
 * The Reclaim SDK is not compatible with web environments,
 * so we provide this placeholder for web builds.
 */

export interface Proof {
    identifier?: string;
    claimData?: {
        provider?: string;
        context?: string;
        parameters?: string;
        owner?: string;
        timestampS?: number;
        epoch?: number;
    };
    signatures?: string[];
}

export class ReclaimProofRequest {
    static async init(_appId: string, _appSecret: string, _providerId: string): Promise<ReclaimProofRequest> {
        console.warn("Reclaim SDK is not supported on web platform");
        return new ReclaimProofRequest();
    }

    addContext(_address: string, _message: string): void {
        // No-op on web
    }

    async getRequestUrl(): Promise<string> {
        return "#";
    }

    async startSession(_options: {
        onSuccess: (proof: string | Proof | Proof[]) => void;
        onError: (error: Error) => void;
    }): Promise<void> {
        _options.onError(new Error("Reclaim verification is only available on mobile devices"));
    }
}

export default { ReclaimProofRequest };
