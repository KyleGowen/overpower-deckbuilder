-- Phase 2 (§6.1.6) — async per-request audit log for /api/v1/*. Retention 90 days
-- enforced by a nightly job; additive (no drops/renames). user_id may be NULL for
-- anonymous catalog reads. ip relies on `trust proxy` from Phase 0.
CREATE TABLE api_access_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    route_key TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    status INTEGER NOT NULL,
    ip VARCHAR(64),
    request_id VARCHAR(128),
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_access_log_ts ON api_access_log(ts);
CREATE INDEX idx_api_access_log_user_id ON api_access_log(user_id);
CREATE INDEX idx_api_access_log_request_id ON api_access_log(request_id);
CREATE INDEX idx_api_access_log_route_key ON api_access_log(route_key);
