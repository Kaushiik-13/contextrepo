ALTER TABLE connected_projects
  ADD COLUMN IF NOT EXISTS connection_status TEXT NOT NULL DEFAULT 'connected';

ALTER TABLE connected_projects
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

DO $$
BEGIN
  ALTER TABLE connected_projects
    ADD CONSTRAINT connected_projects_connection_status_check
    CHECK (connection_status IN ('connected', 'revoked', 'suspended', 'repository_access_removed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS github_pending_authorizations (
  state_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  encrypted_access_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS github_pending_authorizations_expires_at_idx
  ON github_pending_authorizations(expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS connected_projects_one_per_user_idx
  ON connected_projects(user_id);
