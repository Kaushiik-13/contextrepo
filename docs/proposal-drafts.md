# Proposal drafts

Proposal drafts are saved in Supabase PostgreSQL and do not appear in the approved GitHub context library. A person can submit a draft in ContextOps or an AI assistant can submit one through the MCP tool. Only the signed-in person can approve or reject a proposal.

## Enable draft saving in Supabase

The form and API are ready, but the database needs the new table first:

1. Open the Supabase project and go to **SQL Editor**.
2. Open `apps/api/database/migrations/003_context_proposal_drafts.sql` in this repository.
3. Copy the complete SQL into the Supabase editor and run it once.
4. Apply migration `004_proposal_review_mcp.sql` as described below, restart the NestJS API, then refresh ContextOps.

Do not rerun migrations `001` or `002`. Migration `003` creates the proposal table. Migration `004` adds review states/publication details and the MCP token table.

## Enable review and MCP

1. In Supabase **SQL Editor**, open and run `apps/api/database/migrations/004_proposal_review_mcp.sql` once.
2. Restart the API and web app.
3. Open **Proposals**, select a draft, review it, and choose **Approve & publish** or **Reject**.
4. Approval validates required information and writes a Markdown record under `context/<type>/` on the connected GitHub repository's default branch. The page displays the result and GitHub commit path.
5. Open **Settings**, create an MCP access key, and follow [`mcp-proposals.md`](mcp-proposals.md) to connect an MCP client. The key is shown only once.

## Use the form

1. Open **Proposals** in ContextOps and choose **New draft**.
2. Enter a title and choose one of the seven context types.
3. Add the question, outcome, and reasoning. Constraints, alternatives, tags, and sources can be entered one item per line.
4. Choose **Save draft**. The editor closes and the refreshed draft list shows the saved item.
5. Select it later to edit. Choosing **Save changes** closes the editor and refreshes the list again.

The title is required to save a draft. Question, outcome, and rationale must be completed before approval.

## Verify the phase manually

- Create a draft, refresh the page, and confirm it is still listed.
- Reopen it, change its title or reasoning, save, and confirm the update appears.
- Open the Context library and confirm the draft does not appear there.
- Try the seven type choices and verify the selected type remains after saving and re-opening.
- Select a draft and choose **Approve & publish**. Check the new file in the connected GitHub repository and confirm it appears in Context library.
- Create a second draft and reject it. Confirm it shows as rejected and does not appear in Context library or GitHub.
- Try approving a draft with missing question, outcome, or rationale; confirm the API blocks it.
- In Settings, create an MCP key and confirm it is shown once; revoke it and confirm the old key no longer authenticates.
- Connect an MCP client to `/api/mcp`, submit a proposal, and confirm it appears as a draft. Verify the MCP tool offers no approval or publish action.

## Data and security

- Each draft belongs to the signed-in user and their connected project.
- The API checks the ContextOps session and scopes reads and edits to that user and project.
- Create and edit requests are checked against the configured ContextOps web origin.
- Draft status is set by the API. The MCP tool cannot set review status.
- MCP access keys are random, user-scoped, revocable, and stored as SHA-256 hashes. GitHub installation tokens and ContextOps browser sessions are not used by MCP clients.
- Approval runs required-field checks and warns about a likely conflict with an approved record before the user confirms.
- GitHub access failure prevents the proposal being marked approved. Rejected and draft records remain out of the GitHub context library.
