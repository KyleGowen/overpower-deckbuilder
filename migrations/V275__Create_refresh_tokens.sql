-- Phase 2 (§6.1.1) — refresh tokens for /api/v1/auth/{login,refresh,logout}.
-- Stores one row per issued refresh token. Rotation creates a new row and marks
-- the old one as rotated (rotated_from_jti points back to the parent JTI so a
-- reused old refresh can revoke the whole family).
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jti UUID NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rotated_from_jti UUID
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_rotated_from_jti ON refresh_tokens(rotated_from_jti);
