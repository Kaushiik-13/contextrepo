ALTER TABLE context_proposals
  DROP CONSTRAINT IF EXISTS context_proposals_status_check;

ALTER TABLE context_proposals
  ADD CONSTRAINT context_proposals_status_check
  CHECK (status IN ('draft', 'approved', 'rejected'));

ALTER TABLE context_proposals
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_note TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS published_path TEXT,
  ADD COLUMN IF NOT EXISTS published_commit_sha TEXT;

CREATE TABLE IF NOT EXISTS mcp_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  token_prefix TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS mcp_access_tokens_user_id_idx
  ON mcp_access_tokens(user_id, created_at DESC);
