-- Privacy-bounded login telemetry for the admin User Analytics dashboard.
-- Rows contain aggregate counts only; no user identifiers are stored.
CREATE TABLE standard_user_login_hourly_counts (
    hour_start TIMESTAMPTZ PRIMARY KEY,
    login_count BIGINT NOT NULL DEFAULT 0 CHECK (login_count >= 0)
);

COMMENT ON TABLE standard_user_login_hourly_counts IS
    'Aggregate successful standard-user session starts by UTC hour; displayed in America/Los_Angeles time.';
