/**
 * lib/web3/abi.ts - MusicConsensusSBT 合约 ABI
 * 
 * 简化版 ABI，只包含需要的函数
 */

export const MusicConsensusSBTAbi = [
    // 铸造单个徽章
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
    // 批量铸造
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
    // 销毁徽章
    {
        name: "burnBadge",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "genreId", type: "uint256" }],
        outputs: [],
    },
    // 检查徽章
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
    // 获取用户所有徽章
    {
        name: "getUserBadges",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [{ name: "badges", type: "uint256[]" }],
    },
    // 获取流派名称
    {
        name: "genreNames",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "genreId", type: "uint256" }],
        outputs: [{ name: "", type: "string" }],
    },
    // 是否已有徽章
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
    // 徽章铸造事件
    {
        name: "BadgeMinted",
        type: "event",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "genreId", type: "uint256", indexed: true },
            { name: "genreName", type: "string", indexed: false },
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
