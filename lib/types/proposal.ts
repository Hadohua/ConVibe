/**
 * lib/types/proposal.ts - 提案数据类型
 * 
 * 定义音乐提案接口和 mock 数据
 */

// ============================================
// 流派枚举
// ============================================

export enum Genre {
    POP = 1,
    ROCK = 2,
    HIPHOP = 3,
    RNB = 4,
    ELECTRONIC = 5,
    JAZZ = 6,
    CLASSICAL = 7,
    COUNTRY = 8,
    INDIE = 9,
    METAL = 10,
}

// 流派信息
export const GENRE_INFO: Record<number, { name: string; emoji: string; color: string }> = {
    1: { name: "Pop", emoji: "🎤", color: "#FF69B4" },
    2: { name: "Rock", emoji: "🎸", color: "#DC143C" },
    3: { name: "Hip-Hop", emoji: "🎧", color: "#FFD700" },
    4: { name: "R&B", emoji: "💜", color: "#9370DB" },
    5: { name: "Electronic", emoji: "🎹", color: "#00CED1" },
    6: { name: "Jazz", emoji: "🎷", color: "#8B4513" },
    7: { name: "Classical", emoji: "🎻", color: "#4169E1" },
    8: { name: "Country", emoji: "🤠", color: "#DAA520" },
    9: { name: "Indie", emoji: "🌙", color: "#708090" },
    10: { name: "Metal", emoji: "🤘", color: "#2F4F4F" },
};

// ============================================
// 提案接口
// ============================================

export interface Proposal {
    id: string;
    /** 歌曲名称 */
    trackName: string;
    /** 艺术家 */
    artist: string;
    /** 流派 ID */
    genreId: number;
    /** 专辑封面 URL */
    coverUrl: string;
    /** 投票总分 */
    voteCount: number;
    /** 创建时间 */
    createdAt: Date;
    /** 提议者地址 */
    proposer?: string;
}

// ============================================
// Mock 数据
// ============================================

export const MOCK_PROPOSALS: Proposal[] = [
    {
        id: "1",
        trackName: "Shape of You",
        artist: "Ed Sheeran",
        genreId: Genre.POP,
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2736ff0cd5ef2ecf003c5636ce8",
        voteCount: 156,
        createdAt: new Date("2024-01-15"),
    },
    {
        id: "2",
        trackName: "HUMBLE.",
        artist: "Kendrick Lamar",
        genreId: Genre.HIPHOP,
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699",
        voteCount: 243,
        createdAt: new Date("2024-01-14"),
    },
    {
        id: "3",
        trackName: "Take Five",
        artist: "Dave Brubeck",
        genreId: Genre.JAZZ,
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273b4d7c4c9e7ccacf26c2cf4f4",
        voteCount: 89,
        createdAt: new Date("2024-01-13"),
    },
    {
        id: "4",
        trackName: "Bohemian Rhapsody",
        artist: "Queen",
        genreId: Genre.ROCK,
        coverUrl: "https://i.scdn.co/image/ab67616d0000b2730e8f0e4f69f8e0d7f4e6c2a3",
        voteCount: 312,
        createdAt: new Date("2024-01-12"),
    },
    {
        id: "5",
        trackName: "Blinding Lights",
        artist: "The Weeknd",
        genreId: Genre.RNB,
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273ef017e899c0547766997d874",
        voteCount: 198,
        createdAt: new Date("2024-01-11"),
    },
];
