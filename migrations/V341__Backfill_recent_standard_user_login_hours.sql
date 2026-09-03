-- Seed the first rolling login window from the best historical signal available:
-- each standard account's most recent login. Hours at or after the first live
-- counter are excluded so migration backfill cannot double-count live telemetry.
WITH telemetry_boundary AS (
    SELECT COALESCE(MIN(hour_start), CURRENT_TIMESTAMP) AS started_at
    FROM standard_user_login_hourly_counts
), recent_login_backfill AS (
    SELECT
        DATE_TRUNC('hour', users.last_login_at) AS hour_start,
        COUNT(*)::bigint AS login_count
    FROM users
    CROSS JOIN telemetry_boundary
    WHERE users.role = 'USER'
      AND NOT (LOWER(users.username) = ANY(ARRAY['community_decks', 'tournament_decks']::text[]))
      AND users.last_login_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      AND users.last_login_at < telemetry_boundary.started_at
    GROUP BY DATE_TRUNC('hour', users.last_login_at)
)
INSERT INTO standard_user_login_hourly_counts (hour_start, login_count)
SELECT hour_start, login_count
FROM recent_login_backfill
ON CONFLICT (hour_start)
DO UPDATE SET login_count = standard_user_login_hourly_counts.login_count + EXCLUDED.login_count;
