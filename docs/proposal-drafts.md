# Proposal drafts

Proposal drafts are private-to-the-user working copies for the user's one connected project. They are saved in Supabase PostgreSQL and do not appear in the approved GitHub context library. This phase supports saving and editing; it does not include AI/MCP submission, approval, or publishing.

## Enable draft saving in Supabase

The form and API are ready, but the database needs the new table first:

1. Open the Supabase project and go to **SQL Editor**.
2. Open `apps/api/database/migrations/003_context_proposal_drafts.sql` in this repository.
3. Copy the complete SQL into the Supabase editor and run it once.
4. Restart the NestJS API if it is already running, then refresh the ContextOps Proposals page.

Do not rerun migrations `001` or `002`; this step only adds the `context_proposals` table and its lookup index.

## Use the form

1. Open **Proposals** in ContextOps and choose **New draft**.
2. Enter a title and choose one of the seven context types.
3. Add the question, outcome, and reasoning. Constraints, alternatives, tags, and sources can be entered one item per line.
4. Choose **Save draft**. The editor closes and the refreshed draft list shows the saved item.
5. Select it later to edit. Choosing **Save changes** closes the editor and refreshes the list again.

The title is required so the draft is easy to find. Other fields can be filled in gradually.

## Verify the phase manually

- Create a draft, refresh the page, and confirm it is still listed.
- Reopen it, change its title or reasoning, save, and confirm the update appears.
- Open the Context library and confirm the draft does not appear there.
- Try the seven type choices and verify the selected type remains after saving and re-opening.

## Data and security

- Each draft belongs to the signed-in user and their connected project.
- The API checks the ContextOps session and scopes reads and edits to that user and project.
- Create and edit requests are checked against the configured ContextOps web origin.
- Draft status is set by the API/database. The form cannot turn a draft into approved context.
- Approved records remain Markdown files in the connected GitHub repository. Publishing happens only in a later phase after a person approves the proposal in ContextOps.
