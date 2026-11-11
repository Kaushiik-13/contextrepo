CREATE UNIQUE INDEX IF NOT EXISTS connected_projects_user_id_id_uidx
  ON connected_projects(user_id, id);

CREATE TABLE IF NOT EXISTS context_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES connected_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'decision',
      'requirement',
      'constraint',
      'research',
      'rejected-approach',
      'open-question',
      'project-state'
    )
  ),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status = 'draft'),
  question TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  rationale TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  constraints TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  alternatives TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  discussion_summary TEXT NOT NULL DEFAULT '',
  source_references TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT context_proposals_user_project_fk
    FOREIGN KEY (user_id, project_id)
    REFERENCES connected_projects(user_id, id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS context_proposals_user_project_updated_idx
  ON context_proposals(user_id, project_id, updated_at DESC);
