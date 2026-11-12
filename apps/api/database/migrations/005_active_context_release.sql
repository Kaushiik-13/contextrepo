CREATE TABLE IF NOT EXISTS active_context_releases (
  project_id UUID PRIMARY KEY REFERENCES connected_projects(id) ON DELETE CASCADE,
  github_commit_sha TEXT NOT NULL,
  branch TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
