ALTER TABLE endpoint_hit_counts
    ADD COLUMN IF NOT EXISTS last_hit_at TIMESTAMPTZ NULL;
