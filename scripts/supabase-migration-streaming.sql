-- Supabase Migration: Streaming Records & Token Storage
-- Run this in your Supabase SQL Editor to create the tables

-- ============================================
-- streaming_records 表 - 流媒体播放记录
-- ============================================

CREATE TABLE IF NOT EXISTS streaming_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                          -- wallet address or auth ID
    ts TIMESTAMPTZ NOT NULL,                        -- play timestamp
    ms_played INTEGER NOT NULL,                     -- duration in milliseconds
    track_name TEXT,
    artist_name TEXT,
    album_name TEXT,
    spotify_track_uri TEXT,
    source TEXT NOT NULL CHECK (source IN ('json_import', 'api_sync')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Composite unique constraint for deduplication
    UNIQUE(user_id, ts, spotify_track_uri)
);

-- Index for efficient user queries
CREATE INDEX IF NOT EXISTS idx_records_user_ts ON streaming_records(user_id, ts DESC);

-- Index for source filtering
CREATE INDEX IF NOT EXISTS idx_records_source ON streaming_records(source);

-- ============================================
-- user_spotify_tokens 表 - Spotify Token 存储
-- ============================================

CREATE TABLE IF NOT EXISTS user_spotify_tokens (
    user_id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) - 推荐开启
-- ============================================

-- Enable RLS
ALTER TABLE streaming_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to access only their own data (when using Supabase Auth)
-- Uncomment if using Supabase Auth:
-- CREATE POLICY "Users can access own records" ON streaming_records
--     FOR ALL USING (auth.uid()::text = user_id);
-- 
-- CREATE POLICY "Users can access own tokens" ON user_spotify_tokens
--     FOR ALL USING (auth.uid()::text = user_id);

-- For wallet-based auth (Privy), use service role key or create custom policies

-- ============================================
-- Optional: Function to aggregate stats
-- ============================================

-- This function can be used to compute stats on-demand
CREATE OR REPLACE FUNCTION get_user_streaming_stats(p_user_id TEXT)
RETURNS TABLE (
    total_streams BIGINT,
    total_ms BIGINT,
    unique_artists BIGINT,
    unique_tracks BIGINT,
    first_stream TIMESTAMPTZ,
    last_stream TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_streams,
        COALESCE(SUM(ms_played), 0)::BIGINT as total_ms,
        COUNT(DISTINCT artist_name)::BIGINT as unique_artists,
        COUNT(DISTINCT track_name)::BIGINT as unique_tracks,
        MIN(ts) as first_stream,
        MAX(ts) as last_stream
    FROM streaming_records
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
