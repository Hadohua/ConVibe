-- ============================================
-- Vibe Consensus - Supabase 初始化脚本
-- ============================================
-- 在 Supabase Dashboard > SQL Editor 中执行此脚本

-- 1. 创建 proposals 表
CREATE TABLE IF NOT EXISTS proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    track_name TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre_id INT NOT NULL,
    cover_url TEXT,
    vote_count INT DEFAULT 0,
    is_gated BOOLEAN DEFAULT false,
    required_tier INT DEFAULT 0,
    proposer_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建 votes 表
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    voter_address TEXT NOT NULL,
    weight INT NOT NULL,
    genre_match BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- 确保每个用户每个提案只能投一次票
    UNIQUE(proposal_id, voter_address)
);

-- 3. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_proposals_gated ON proposals(is_gated);
CREATE INDEX IF NOT EXISTS idx_proposals_vote_count ON proposals(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_address);

-- 4. 启用实时更新
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;

-- 5. 插入测试数据 (公开区)
INSERT INTO proposals (track_name, artist, genre_id, cover_url, vote_count, is_gated) VALUES
('Shape of You', 'Ed Sheeran', 1, 'https://i.scdn.co/image/ab67616d0000b2736ff0cd5ef2ecf003c5636ce8', 156, false),
('HUMBLE.', 'Kendrick Lamar', 3, 'https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699', 243, false),
('Take Five', 'Dave Brubeck', 6, 'https://i.scdn.co/image/ab67616d0000b273b4d7c4c9e7ccacf26c2cf4f4', 89, false),
('Bohemian Rhapsody', 'Queen', 2, 'https://i.scdn.co/image/ab67616d0000b2730e8f0e4f69f8e0d7f4e6c2a3', 312, false),
('Blinding Lights', 'The Weeknd', 4, 'https://i.scdn.co/image/ab67616d0000b273ef017e899c0547766997d874', 198, false);

-- 6. 插入测试数据 (深水区 - Token Gated)
INSERT INTO proposals (track_name, artist, genre_id, cover_url, vote_count, is_gated, required_tier) VALUES
('m.A.A.d city', 'Kendrick Lamar', 3, 'https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699', 456, true, 2),
('DNA.', 'Kendrick Lamar', 3, 'https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699', 389, true, 2),
('Nuthin'' but a ''G'' Thang', 'Dr. Dre', 3, 'https://i.scdn.co/image/ab67616d0000b273e02589301e7f4b222e44528e', 567, true, 3),
('Mask Off', 'Future', 3, 'https://i.scdn.co/image/ab67616d0000b2739a3d0a0c67abcae8f0fa8c71', 234, true, 1);

-- 7. Row Level Security (可选，增加安全性)
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 8. 查看创建的表
SELECT 'proposals' as table_name, count(*) as rows FROM proposals
UNION ALL
SELECT 'votes' as table_name, count(*) as rows FROM votes;
