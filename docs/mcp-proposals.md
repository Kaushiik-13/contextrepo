# Submit ContextOps drafts from an AI assistant

ContextOps exposes a Streamable HTTP MCP endpoint for creating proposal drafts and searching approved context.

- Endpoint: `http://localhost:4000/api/mcp` for local development.
- Tools: `submit_context_proposal` and `search_approved_context`.
- `search_approved_context` can filter by words and optional context type. It searches the active commit-pinned snapshot and returns its commit SHA and source file path.
- The tool stores a draft in Supabase. It does not approve, reject, read, or publish context.
- Search returns only validated `approved` Markdown records. Drafts and rejected proposals are omitted.
- A person signs in to ContextOps, reviews the proposal on the Proposals page, then approves or rejects it.
- Approval writes a Markdown file with YAML front matter to the selected repository and default branch.

## Connect an AI assistant on Windows

1. Sign in to ContextOps and open **Settings** by clicking your account at the bottom of the sidebar.
2. Under **Connect an AI assistant**, choose **Create MCP key** and copy the key. ContextOps shows it only once; replace or revoke it from Settings if needed.
3. In Settings, select your assistant and follow the three on-screen steps. The first step saves the key as a Windows user environment variable. The agent setup command or config uses that variable, so the key is not written into your project files.
4. Restart the assistant and ask it to search ContextOps for an approved decision. Keep the ContextOps API running.

The current guide includes Codex, Claude Code, Cursor, and generic MCP apps. ChatGPT in a browser cannot connect to this local `localhost` endpoint; that requires a public HTTPS deployment and compatible sign-in.

For other MCP apps, use the Streamable HTTP endpoint `http://localhost:4000/api/mcp` and the header `Authorization: Bearer <your ContextOps key>`. Do not paste the key into a public repository, shared prompt, or screenshot. This local endpoint works only while the ContextOps API is running on the same machine/network; remote AI services need a securely reachable HTTPS deployment.

The tool accepts a title, one of the seven context types, question, summary, rationale, and optional tags, constraints, alternatives, discussion notes, and references. It returns the saved draft ID and confirms that human review is required.

## Database

Apply `apps/api/database/migrations/004_proposal_review_mcp.sql` after `003_context_proposal_drafts.sql`, then apply `apps/api/database/migrations/005_active_context_release.sql`. Migration 005 stores the active approved Git commit for each project. Do not put the raw MCP key in SQL or `.env`.
