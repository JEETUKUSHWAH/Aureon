
-- Tracks active sessions for stay-logged-in experience

CREATE TABLE sessions (
                          id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          member_id         UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
                          company_id        UUID NOT NULL REFERENCES companies(id)    ON DELETE CASCADE,

    -- The refresh token hash (never store raw token — SHA-256 hash)
                          refresh_token_hash VARCHAR(64) NOT NULL UNIQUE,

    -- Device / browser info for the "active sessions" screen
                          device_name       VARCHAR(255),   -- e.g. "Chrome on Windows"
                          ip_address        inet,
                          user_agent        TEXT,

    -- Expiry behaviour
                          remember_me       BOOLEAN NOT NULL DEFAULT false,
    -- remember_me=false → expires in 24 hours (browser session)
    -- remember_me=true  → expires in 30 days (persistent session)
                          expires_at        TIMESTAMPTZ NOT NULL,
                          last_active_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                          revoked           BOOLEAN NOT NULL DEFAULT false,

                          created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_member    ON sessions(member_id);
CREATE INDEX idx_sessions_token     ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_company   ON sessions(company_id);