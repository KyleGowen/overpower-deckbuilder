-- Add optional display_name to users.
-- For SSO (Google) users this is the editable, user-chosen public name. Password
-- users continue to display their (editable, unique) username; display_name may stay null.
-- Name resolution is centralized in resolveUserDisplayName().

ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255) NULL;

COMMENT ON COLUMN users.display_name IS 'Optional public display name. Primarily used by SSO users who cannot rename their username. Password users display their username instead.';
