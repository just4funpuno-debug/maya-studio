-- ============================================================
-- Maya Studio — Perfil de usuario ligado a Supabase Auth
-- Ejecutar en Supabase → SQL Editor (o vía MCP)
-- ============================================================

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS username    text,
  ADD COLUMN IF NOT EXISTS nombre      text,
  ADD COLUMN IF NOT EXISTS apellidos   text,
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_username
  ON usuarios (lower(username))
  WHERE username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_auth_user_id
  ON usuarios (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

ALTER TABLE usuarios
  DROP CONSTRAINT IF EXISTS usuarios_auth_user_id_fkey;

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_auth_user_id_fkey
  FOREIGN KEY (auth_user_id)
  REFERENCES auth.users (id)
  ON DELETE CASCADE;
