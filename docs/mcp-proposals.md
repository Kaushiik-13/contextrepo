# Submit ContextOps drafts from an AI assistant

ContextOps exposes a Streamable HTTP MCP endpoint for creating proposal drafts and searching approved context.

- Endpoint: `http://localhost:4000/api/mcp` for local development.
- Tools: `submit_context_proposal` and `search_approved_context`.
- `search_approved_context` can filter by words and optional context type. It searches the active commit-pinned snapshot and returns its commit SHA and source file path.
- The tool stores a draft in Supabase. It does not approve, reject, read, or publish context.
- Search returns only validated `approved` Markdown records. Drafts and rejected proposals are omitted.
- A person signs in to ContextOps, reviews the proposal on the Proposals page, then approves or rejects it.
- Approval writes a Markdown file with YAML front matter to the selected repository and default branch.

## Create an access key

1. Sign in to ContextOps and open **Settings** by clicking your account at the bottom of the sidebar.
2. Under **Connect an AI assistant (MCP)**, select **Create MCP access key**.
3. Copy it immediately. ContextOps stores only a hash and cannot display the key again. Replace or revoke it from Settings if needed.
4. Configure your MCP client to use the endpoint above and send this HTTP header:

```text
Authorization: Bearer <your ContextOps key>
```

For an MCP client that supports Streamable HTTP, add `http://localhost:4000/api/mcp` as the server URL and provide the bearer header. The exact config format depends on the client. Do not paste the key into a public repository, shared prompt, or screenshot. This local endpoint works only while the ContextOps API is running on the same machine/network; remote AI services need a securely reachable HTTPS deployment.

The tool accepts a title, one of the seven context types, question, summary, rationale, and optional tags, constraints, alternatives, discussion notes, and references. It returns the saved draft ID and confirms that human review is required.

## Database

Apply `apps/api/database/migrations/004_proposal_review_mcp.sql` after `003_context_proposal_drafts.sql`, then apply `apps/api/database/migrations/005_active_context_release.sql`. Migration 005 stores the active approved Git commit for each project. Do not put the raw MCP key in SQL or `.env`.
