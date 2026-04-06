-- Idempotent: ensure guest login uses the canonical bcrypt hash for password 'guest'
-- (matches V125 / V126).

DO $$
DECLARE
  correct_password_hash TEXT := '$2b$10$ioMj79hxy/3SltPaAV3SK.4ScRSjeHq06nPqGCOoAx8EAHIqyRkj6';
BEGIN
  UPDATE users
  SET password_hash = correct_password_hash,
      updated_at = NOW()
  WHERE username = 'guest';
END $$;
