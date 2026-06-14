-- V5__password_reset.sql
-- Add password reset functionality

CREATE TABLE password_reset_tokens (
                                       id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       member_id       UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
                                       token           VARCHAR(64) NOT NULL UNIQUE,
                                       expires_at      TIMESTAMPTZ NOT NULL,
                                       used            BOOLEAN NOT NULL DEFAULT false,
                                       used_at         TIMESTAMPTZ,
                                       ip_address      INET,
                                       user_agent      TEXT,
                                       created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_member ON password_reset_tokens(member_id);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Add last_password_changed to track password change history
ALTER TABLE team_members
    ADD COLUMN last_password_changed TIMESTAMPTZ;

-- Set existing members' last_password_changed to created_at
UPDATE team_members
SET last_password_changed = created_at
WHERE last_password_changed IS NULL;