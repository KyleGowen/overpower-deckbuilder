-- Running hit counts per Express route key (METHOD + path pattern), seeded at zero on server boot.
CREATE TABLE endpoint_hit_counts (
    endpoint_key TEXT PRIMARY KEY,
    hit_count BIGINT NOT NULL DEFAULT 0
);
