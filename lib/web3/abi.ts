/**
 * lib/web3/abi.ts - MusicConsensusSBT V4 & VibeToken 合约 ABI
 * 
 * 功能：
 * - VibeToken ($CVIB) ERC-20 代币
 * - 链上 Reclaim 验证 (V3 核心)
 * - $CVIB 铸造 (V4 核心)
 * - 分层徽章 (Tiered Badges)
 * - 动态生命周期 (Decay Mechanism)
 */

// ============================================
// VibeToken ($CVIB) ABI
// ============================================

export const VibeTokenAbi = [
    // ERC-20 Standard Functions
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "approve",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    {
        name: "allowance",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "transfer",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    {
        name: "totalSupply",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    // Burn Functions
    {
        name: "burn",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "amount", type: "uint256" }],
        outputs: [],
    },
    {
        name: "burnFrom",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "account", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [],
    },
    // Metadata
    {
        name: "name",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
    },
    {
        name: "symbol",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
    },
    {
        name: "decimals",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
    },
    // Minting (authorized only)
    {
        name: "mint",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [],
    },
    {
        name: "mintForListening",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "hoursListened", type: "uint256" },
        ],
        outputs: [],
    },
    // Query Functions
    {
        name: "calculateReward",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "hoursListened", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "rewardPerHour",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "isMinter",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "minter", type: "address" }],
        outputs: [{ name: "", type: "bool" }],
    },
    // Events
    {
        name: "Transfer",
        type: "event",
        inputs: [
            { name: "from", type: "address", indexed: true },
            { name: "to", type: "address", indexed: true },
            { name: "value", type: "uint256", indexed: false },
        ],
    },
    {
        name: "Approval",
        type: "event",
        inputs: [
            { name: "owner", type: "address", indexed: true },
            { name: "spender", type: "address", indexed: true },
            { name: "value", type: "uint256", indexed: false },
        ],
    },
    {
        name: "TokensMinted",
        type: "event",
        inputs: [
            { name: "to", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "reason", type: "string", indexed: false },
        ],
    },
] as const;

// ============================================
// Reclaim Proof 结构类型
// ============================================

// Reclaim Proof 结构类型
const ProofTuple = {
    name: "proof",
    type: "tuple",
    components: [
        {
            name: "claimInfo",
            type: "tuple",
            components: [
                { name: "provider", type: "string" },
                { name: "parameters", type: "string" },
                { name: "context", type: "string" },
            ],
        },
        {
            name: "signedClaim",
            type: "tuple",
            components: [
                {
                    name: "claim",
                    type: "tuple",
                    components: [
                        { name: "identifier", type: "bytes32" },
                        { name: "owner", type: "address" },
                        { name: "timestampS", type: "uint32" },
                        { name: "epoch", type: "uint32" },
                    ],
                },
                { name: "signatures", type: "bytes[]" },
            ],
        },
    ],
};

export const MusicConsensusSBTAbi = [
    // ============================================
    // V4 $CVIB 铸造函数 (核心)
    // ============================================

    // 通过销毁 $CVIB 铸造徽章
    {
        name: "mintWithCVIB",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "genreId", type: "uint256" },
            { name: "tier", type: "uint8" },
        ],
        outputs: [],
    },
    // 批量通过 $CVIB 铸造
    {
        name: "mintBatchWithCVIB",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "genreIds", type: "uint256[]" },
            { name: "tiers", type: "uint8[]" },
        ],
        outputs: [],
    },
    // 升级徽章等级 (补差价)
    {
        name: "upgradeBadgeWithCVIB",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "genreId", type: "uint256" },
            { name: "newTier", type: "uint8" },
        ],
        outputs: [],
    },
    // 获取铸造成本
    {
        name: "getMintCost",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "tier", type: "uint8" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    // 获取升级成本
    {
        name: "getUpgradeCost",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
            { name: "newTier", type: "uint8" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },
    // 获取 Tier 成本
    {
        name: "tierCost",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "tier", type: "uint8" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    // 获取 VibeToken 地址
    {
        name: "vibeTokenAddress",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
    },

    // ============================================
    // V3 链上验证铸造函数 (Reclaim Proof)
    // ============================================

    // 通过 Reclaim Proof 铸造徽章
    {
        name: "mintWithProof",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            ProofTuple,
            { name: "genreId", type: "uint256" },
            { name: "tier", type: "uint8" },
        ],
        outputs: [],
    },
    // 批量铸造 (需要 Proof)
    {
        name: "mintBatchWithProof",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            ProofTuple,
            { name: "genreIds", type: "uint256[]" },
            { name: "tiers", type: "uint8[]" },
        ],
        outputs: [],
    },
    // 刷新徽章 (需要 Proof)
    {
        name: "refreshBadgeWithProof",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            ProofTuple,
            { name: "genreId", type: "uint256" },
            { name: "newTier", type: "uint8" },
        ],
        outputs: [],
    },

    // ============================================
    // 分层铸造函数 (V2 兼容，但 V3 合约不支持)
    // ============================================

    // 铸造分层徽章
    {
        name: "mintTieredBadge",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
            { name: "tier", type: "uint8" },
            { name: "data", type: "bytes" },
        ],
        outputs: [],
    },
    // 批量分层铸造
    {
        name: "mintBatchTieredBadges",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreIds", type: "uint256[]" },
            { name: "tiers", type: "uint8[]" },
            { name: "data", type: "bytes" },
        ],
        outputs: [],
    },

    // ============================================
    // 兼容旧版函数
    // ============================================

    // 铸造单个徽章 (默认 tier=1)
    {
        name: "mintBadge",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
            { name: "data", type: "bytes" },
        ],
        outputs: [],
    },
    // 批量铸造 (默认 tier=1)
    {
        name: "mintBatchBadges",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreIds", type: "uint256[]" },
            { name: "data", type: "bytes" },
        ],
        outputs: [],
    },

    // ============================================
    // 刷新 & 衰减
    // ============================================

    // 刷新徽章
    {
        name: "refreshBadge",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "genreId", type: "uint256" },
            { name: "newTier", type: "uint8" },
        ],
        outputs: [],
    },
    // 检查并衰减单个徽章
    {
        name: "checkAndDecayBadge",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
        ],
        outputs: [],
    },
    // 批量检查衰减
    {
        name: "checkAllBadgesDecay",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "user", type: "address" }],
        outputs: [],
    },

    // ============================================
    // 销毁
    // ============================================

    {
        name: "burnBadge",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "genreId", type: "uint256" }],
        outputs: [],
    },

    // ============================================
    // 查询函数
    // ============================================

    // 检查徽章 (兼容旧版)
    {
        name: "checkBadge",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    // hasBadge (兼容旧版)
    {
        name: "hasBadge",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    // 获取用户所有徽章
    {
        name: "getUserBadges",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [{ name: "badges", type: "uint256[]" }],
    },
    // 获取徽章状态
    {
        name: "getBadgeStatus",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
        ],
        outputs: [{ name: "isActive", type: "bool" }],
    },
    // 获取徽章详细信息
    {
        name: "getBadgeInfo",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "user", type: "address" },
            { name: "genreId", type: "uint256" },
        ],
        outputs: [
            { name: "tier", type: "uint8" },
            { name: "lastVerified", type: "uint64" },
            { name: "status", type: "uint8" },
            { name: "isExpired", type: "bool" },
        ],
    },
    // 获取所有活跃徽章详情
    {
        name: "getActiveBadgesWithInfo",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [
            { name: "genreIds", type: "uint256[]" },
            { name: "tiers", type: "uint8[]" },
            { name: "isActives", type: "bool[]" },
        ],
    },
    // 获取流派名称
    {
        name: "genreNames",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "genreId", type: "uint256" }],
        outputs: [{ name: "", type: "string" }],
    },
    // 余额查询 (ERC1155)
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "account", type: "address" },
            { name: "id", type: "uint256" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },

    // ============================================
    // 常量
    // ============================================

    {
        name: "VERIFICATION_VALIDITY",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint64" }],
    },
    {
        name: "TIER_ENTRY",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
    },
    {
        name: "TIER_VETERAN",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
    },
    {
        name: "TIER_OG",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
    },

    // ============================================
    // 事件
    // ============================================

    {
        name: "BadgeMinted",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "genreId", type: "uint256", indexed: true },
            { name: "genreName", type: "string", indexed: false },
            { name: "tier", type: "uint8", indexed: false },
        ],
    },
    {
        name: "BadgeRefreshed",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "genreId", type: "uint256", indexed: true },
            { name: "oldTier", type: "uint8", indexed: false },
            { name: "newTier", type: "uint8", indexed: false },
        ],
    },
    {
        name: "BadgeDecayed",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "genreId", type: "uint256", indexed: true },
        ],
    },
    {
        name: "BadgeBurned",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "genreId", type: "uint256", indexed: true },
        ],
    },
] as const;

// ============================================
// 流派 ID 映射
// ============================================

export const GENRE_ID_MAP: Record<string, number> = {
    // English
    "pop": 1,
    "rock": 2,
    "hip-hop": 3,
    "hip hop": 3,
    "rap": 3,
    "r&b": 4,
    "rnb": 4,
    "electronic": 5,
    "edm": 5,
    "jazz": 6,
    "classical": 7,
    "country": 8,
    "indie": 9,
    "metal": 10,

    // Chinese 中文
    "说唱": 3,
    "嘻哈": 3,
    "饶舌": 3,
    "东海岸嘻哈": 3,
    "云雾说唱": 3,
    "中国嘻哈": 3,
    "华语说唱": 3,
    "流行": 1,
    "华语流行": 1,
    "摇滚": 2,
    "中国摇滚": 2,
    "节奏蓝调": 4,
    "电子": 5,
    "电子音乐": 5,
    "爵士": 6,
    "古典": 7,
    "乡村": 8,
    "独立": 9,
    "独立音乐": 9,
    "金属": 10,

    // Partial matches for Chinese
    "trap": 3,
    "drill": 3,
    "中国": 3, // Chinese hip-hop often has "中国" in genre
};

/**
 * 根据流派名称获取 ID
 */
export function getGenreId(genreName: string): number | null {
    const normalized = genreName.toLowerCase().trim();
    return GENRE_ID_MAP[normalized] || null;
}

/**
 * 根据流派字符串数组获取可用的 genre IDs
 */
export function getGenreIds(genres: string[]): number[] {
    const ids: number[] = [];
    const seen = new Set<number>();

    for (const genre of genres) {
        const id = getGenreId(genre);
        if (id && !seen.has(id)) {
            ids.push(id);
            seen.add(id);
        }
    }

    return ids;
}

// ============================================
// Tier 等级常量 & 辅助函数
// ============================================

export const TIER = {
    ENTRY: 1,    // 入门
    VETERAN: 2,  // 资深
    OG: 3,       // OG
} as const;

export const TIER_NAMES: Record<number, string> = {
    1: "入门",
    2: "资深",
    3: "OG",
};

export const TIER_NAMES_EN: Record<number, string> = {
    1: "Entry",
    2: "Veteran",
    3: "OG",
};
