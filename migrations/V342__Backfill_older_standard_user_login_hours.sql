-- Complete the privacy-bounded initial history with one known last-login event
-- per standard account whose most recent login predates V341's 24-hour window.
-- Newer rows were already seeded by V341 or recorded by live telemetry.
WITH v341_window AS (
    SELECT installed_on - INTERVAL '24 hours' AS started_at
    FROM flyway_schema_history
    WHERE version = '341'
      AND success = TRUE
    ORDER BY installed_rank DESC
    LIMIT 1
), older_login_backfill AS (
    SELECT
        DATE_TRUNC('hour', users.last_login_at) AS hour_start,
        COUNT(*)::bigint AS login_count
    FROM users
    CROSS JOIN v341_window
    WHERE users.role = 'USER'
      AND NOT (LOWER(users.username) = ANY(ARRAY['community_decks', 'tournament_decks']::text[]))
      AND users.last_login_at IS NOT NULL
      AND users.last_login_at < v341_window.started_at
    GROUP BY DATE_TRUNC('hour', users.last_login_at)
)
INSERT INTO standard_user_login_hourly_counts (hour_start, login_count)
SELECT hour_start, login_count
FROM older_login_backfill
ON CONFLICT (hour_start)
DO UPDATE SET login_count = standard_user_login_hourly_counts.login_count + EXCLUDED.login_count;
