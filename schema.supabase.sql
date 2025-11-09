-- ============================================================================
-- T-CARE DATABASE SCHEMA (SUPABASE VERSION)
-- Automated Customer Support System
-- Optimized for Supabase with optional RLS policies
-- ============================================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    zip_code VARCHAR(10),
    device_type VARCHAR(50),  -- e.g., "iPhone 15 Pro", "Galaxy S24"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- SESSIONS
-- ============================================================================

CREATE TABLE sessions (
    id VARCHAR(100) PRIMARY KEY,  -- "session_1699123456789_abc123"
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    issue_type VARCHAR(100),  -- "connectivity_down", "performance_issue", "general_inquiry"
    zip_code VARCHAR(10),
    voice_enabled BOOLEAN DEFAULT FALSE,
    camera_enabled BOOLEAN DEFAULT FALSE,
    outcome VARCHAR(50),  -- "resolved", "escalated", "abandoned"
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_sessions_active ON sessions(ended_at) WHERE ended_at IS NULL;

-- ============================================================================
-- MESSAGES
-- ============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,  -- "user" (voice/transcribed), "assistant", "system"
    content TEXT NOT NULL,  -- Transcribed text from voice (via Vapi) or AI response
    sentiment_score DECIMAL(3, 2),  -- -1.00 to 1.00 (from voice analysis via Vapi for user messages)
    metadata JSONB,  -- Vapi metadata: { "audio_url", "duration", "transcription_confidence", "voice_analysis" } or evidence links
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id, created_at);
CREATE INDEX idx_messages_sentiment ON messages(session_id, created_at) WHERE sentiment_score IS NOT NULL;

-- ============================================================================
-- SENTIMENT HISTORY (Happiness scores over time during conversation)
-- ============================================================================

CREATE TABLE sentiment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sentiment_score DECIMAL(3, 2) NOT NULL,  -- -1.00 to 1.00 (from voice analysis via Vapi)
    happiness_score DECIMAL(3, 2) NOT NULL,  -- 0.00 to 1.00 (computed from sentiment + context)
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,  -- Link to transcribed message from voice
    voice_metadata JSONB,  -- Voice-specific: { "tone", "emotion", "stress_level", "speech_rate" } from Vapi
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sentiment_session ON sentiment_history(session_id, measured_at);
CREATE INDEX idx_sentiment_message ON sentiment_history(message_id);

-- ============================================================================
-- STATUS SNAPSHOTS
-- ============================================================================

CREATE TABLE status_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) REFERENCES sessions(id) ON DELETE SET NULL,
    region VARCHAR(100) NOT NULL,  -- "Midtown ATL", "Austin Metro"
    tower_id VARCHAR(50),  -- "eNB-123" or NULL
    health VARCHAR(20) NOT NULL,  -- "ok", "degraded", "down"
    eta_minutes INTEGER,
    network_happiness_score DECIMAL(3, 2),  -- 0.00 to 1.00 (network/regional level)
    sparkline DECIMAL(3, 2)[],  -- Array of last 6-12 network health scores (regional)
    source_url TEXT,  -- Evidence link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_status_session ON status_snapshots(session_id);
CREATE INDEX idx_status_created ON status_snapshots(created_at DESC);

-- ============================================================================
-- PLAYBOOK RUNS
-- ============================================================================

CREATE TABLE playbook_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,  -- "toggle_airplane", "apn_check", "dns_probe"
    step_order INTEGER NOT NULL,
    result VARCHAR(50),  -- "success", "failure", "skipped", "completed"
    metrics JSONB,  -- { "latency_ms": 45, "packet_loss": 0, "apn": "fast.tmobile.com" }
    evidence_url TEXT,  -- Link to test logs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playbook_session ON playbook_runs(session_id, step_order);

-- ============================================================================
-- TICKETS
-- ============================================================================

CREATE TABLE tickets (
    id VARCHAR(50) PRIMARY KEY,  -- "INC-123456"
    session_id VARCHAR(100) REFERENCES sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    summary VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',  -- "open", "in_progress", "resolved", "closed"
    context JSONB,  -- { "zip", "issue", "steps_tried", "sentiment" }
    jira_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_session ON tickets(session_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created ON tickets(created_at DESC);

-- ============================================================================
-- EVENTS (AUDIT TRAIL)
-- ============================================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) REFERENCES sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,  -- "classified", "status_checked", "playbook_executed", "ticket_created", "sentiment_checked", "recovery_checked"
    payload JSONB NOT NULL,  -- Full event data
    source_url TEXT,  -- Evidence link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_session ON events(session_id, created_at);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_created ON events(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Uncomment and customize these policies based on your needs
-- For development, you can disable RLS: ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Enable RLS on all tables
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE status_snapshots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE playbook_runs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Example: Allow users to read their own data
-- CREATE POLICY "Users can read own data" ON users
--     FOR SELECT USING (auth.uid() = id);

-- Example: Allow users to create their own sessions
-- CREATE POLICY "Users can create own sessions" ON sessions
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Example: Allow users to read their own sessions
-- CREATE POLICY "Users can read own sessions" ON sessions
--     FOR SELECT USING (auth.uid() = user_id);

-- Example: Allow users to read messages in their sessions
-- CREATE POLICY "Users can read own messages" ON messages
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM sessions 
--             WHERE sessions.id = messages.session_id 
--             AND sessions.user_id = auth.uid()
--         )
--     );

-- ============================================================================
-- SAMPLE DATA (Optional - remove for production)
-- ============================================================================

-- Insert a test user
INSERT INTO users (email, zip_code, device_type) VALUES
('test@example.com', '30332', 'iPhone 15 Pro')
ON CONFLICT (email) DO NOTHING;

-- Insert a test session
INSERT INTO sessions (id, user_id, issue_type, zip_code, voice_enabled, camera_enabled) 
SELECT 
    'session_test_123',
    id,
    'connectivity_down',
    '30332',
    false,
    false
FROM users WHERE email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;

-- Insert test messages with sentiment
INSERT INTO messages (session_id, role, content, sentiment_score) VALUES
('session_test_123', 'user', 'My internet is not working', -0.65),
('session_test_123', 'assistant', 'I understand your frustration. Let me check the network status in your area.', NULL)
ON CONFLICT DO NOTHING;

-- Insert sentiment history (tracks happiness over time during conversation)
-- This creates a record for each user message, showing how sentiment changes over time
INSERT INTO sentiment_history (session_id, sentiment_score, happiness_score, message_id) 
SELECT 
    'session_test_123',
    sentiment_score,
    (sentiment_score + 1.0) / 2.0,  -- Convert -1 to 1 range to 0 to 1 range (happiness)
    id
FROM messages 
WHERE session_id = 'session_test_123' AND role = 'user' AND sentiment_score IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert a test status snapshot (network/regional level)
INSERT INTO status_snapshots (session_id, region, tower_id, health, eta_minutes, network_happiness_score, sparkline) VALUES
('session_test_123', 'Midtown ATL', 'eNB-123', 'degraded', 35, 0.46, ARRAY[0.71, 0.69, 0.65, 0.58, 0.52, 0.46]::DECIMAL[])
ON CONFLICT DO NOTHING;

-- Insert test playbook runs
INSERT INTO playbook_runs (session_id, step_name, step_order, result, metrics) VALUES
('session_test_123', 'toggle_airplane', 1, 'completed', '{"duration_sec": 5}'::jsonb),
('session_test_123', 'apn_check', 2, 'settings_correct', '{"apn": "fast.tmobile.com"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert a test event
INSERT INTO events (session_id, user_id, event_type, payload)
SELECT 
    'session_test_123',
    id,
    'classified',
    '{"intent": "connectivity_down", "sentiment": -0.62, "severity": "high"}'::jsonb
FROM users WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. For development: You can disable RLS on all tables if you don't need security
--    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
--    (Repeat for all tables)
--
-- 2. For production: Enable RLS and create appropriate policies based on your needs
--
-- 3. If using Supabase Auth: You can link to auth.users table instead of custom users table
--    Change user_id references to: REFERENCES auth.users(id)
--
-- 4. Real-time: Supabase enables real-time on all tables by default
--    You can subscribe to changes: supabase.from('messages').on('INSERT', ...)
--
-- 5. Storage: If you need file storage, use Supabase Storage
--    Create buckets in the Storage section of your Supabase dashboard

