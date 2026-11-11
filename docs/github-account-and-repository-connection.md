# GitHub account and repository connection

This document explains the current single-user, single-project onboarding flow. Organization workspaces, team invitations, and multiple projects per account are deferred.

## What the user experiences

1. A new user opens `/signup`; a returning user opens `/login`. The login page links to signup, and signup links back to login.
2. GitHub verifies the person. The API creates an account only from the signup flow; login requires an existing ContextOps account.
3. A new account continues to GitHub App installation, then repository selection. A returning account with a saved repository goes directly to its dashboard. An account that has not finished setup resumes at repository selection.
4. ContextOps lists only repositories the GitHub App can access. The user selects one repository.
5. ContextOps saves that project in Supabase. It checks whether `context/` exists and offers to create `context/README.md` if it does not.
6. The selected repository appears in the app navigation and dashboard; Settings shows the account, repository, visibility, default branch, context-folder status, and latest access check.
7. Signing out ends the ContextOps session only. It does not delete the saved project or uninstall the GitHub App. The user can sign in again, change the selected repository, reconnect access, or revoke the app from GitHub Settings.

## Where the data lives

| Data | Stored in | Purpose |
|---|---|---|
| GitHub user ID, username, avatar | Supabase `app_users` | Recognize the same person on later sign-ins. |
| ContextOps session hash and expiry | Supabase `app_sessions` | Keep the user signed in without storing the raw browser token. |
| GitHub App installation and account | Supabase `github_installations` | Find the installation used to request repository access. |
| Selected repository and setup status | Supabase `connected_projects` | Restore the user's project after logout and show it in the app. |
| Approved project knowledge | The selected project's GitHub `context/` folder | Keep approved context in the existing project repository and Git history. |
| Supabase URL and GitHub App credentials | `apps/api/.env` (ignored by Git) | Let the API connect to Supabase and GitHub. Never commit these secrets. |

Supabase stores ContextOps account and connection metadata. It does not replace GitHub as the future source of truth for approved context records. The library currently shows demo records; GitHub-backed reading is a later Phase 2B task.

## Session and security behavior

- GitHub OAuth `state` values are random and checked against short-lived, HttpOnly cookies to protect callbacks against request forgery.
- The GitHub OAuth user token is needed briefly to confirm that the installation callback belongs to the signed-in user. It is encrypted before temporary storage, expires after 10 minutes, and is deleted after verification. It is not used as the long-term repository credential.
- Repository operations use short-lived GitHub App installation access tokens created by the API. The GitHub App private key stays on the API server.
- The browser gets a random seven-day session token in an HttpOnly, SameSite=Lax cookie. It is Secure when the API uses HTTPS. Supabase stores only its SHA-256 hash. Logout deletes that session record.
- State-changing browser requests require the configured ContextOps web origin.
- The API verifies the installation against GitHub and checks that the selected repository is still available. Settings/dashboard display `Connected`, `Access revoked`, `App suspended`, `Repository access removed`, or a temporary verification warning.
- Revoking or suspending the GitHub App stops repository operations. It does not silently erase the saved project metadata. Reinstalling the app for the same repository can reconnect it.
- The current database constraint allows one connected project per account. Selecting a new repository replaces the current selection.

## Database update

The base onboarding schema is `apps/api/database/migrations/001_github_onboarding.sql`. Apply `apps/api/database/migrations/002_persistent_github_connection.sql` in the Supabase SQL Editor before running this application version. It adds repository connection status and last-check time, plus a short-lived table for encrypted OAuth callback data.

After applying the migration, the API uses `DATABASE_URL` from `apps/api/.env`. Do not paste the URL, OAuth client secret, or GitHub private key into source files, issue comments, or committed documentation.

## GitHub App callback values for local development

- User authorization callback: `http://localhost:4000/api/auth/github/callback`
- Setup URL: `http://localhost:4000/api/auth/github/install/callback`
- Required repository permissions: Contents read/write and Metadata read-only.

For a hosted deployment, use HTTPS URLs that match the deployed API exactly and set `WEB_ORIGIN` and `API_ORIGIN` to the deployed origins.
