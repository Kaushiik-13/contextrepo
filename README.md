# ContextOps

ContextOps is a shared context layer for teams using different AI assistants. It preserves important project decisions and the reasoning behind them, then makes approved context available to teammates and their assistants.

## Architecture

- `apps/web`: Next.js dashboard with shadcn/ui.
- `apps/api`: NestJS REST API and MCP service.
- GitHub Markdown/YAML context repository: source of truth, pull-request review, and release history.
- Docker Compose: local development; Kubernetes comes after the core workflow.

See [the architecture](docs/architecture.md) and [the implementation plan](docs/implementation-plan.md).

## Current progress

Phase 1 architecture and project skeleton are complete. The first Phase 2 slice is implemented: seven sample Markdown records can be read through the NestJS API, searched/filtered in the Next.js dashboard, and opened to inspect their reasoning trail.

GitHub sign-in, one-repository selection, persistent project settings, and context-folder setup are implemented as the first Phase 2B onboarding slice. The library still displays clearly labeled local demo fixtures; live GitHub context browsing, editable proposals, pull-request review, and MCP retrieval remain upcoming work.

## Start the development servers

Install dependencies from the repository root:

```powershell
corepack pnpm install
```

Start the API and dashboard in separate terminals:

```powershell
corepack pnpm dev:api
```

```powershell
corepack pnpm dev:web
```

The dashboard uses port 3000; the API uses port 4000.

## Supabase database connection

The API reads its local environment from `apps/api/.env`. Copy `apps/api/.env.example` to `apps/api/.env`, then paste the Supabase PostgreSQL connection string after `DATABASE_URL=`. Keep `.env` private; it is ignored by Git. The initial onboarding schema is in `apps/api/database/migrations/001_github_onboarding.sql` and has been applied to the connected Supabase project. Run `apps/api/database/migrations/002_persistent_github_connection.sql` in Supabase before using the updated sign-in and Settings flow.

## GitHub App setup for onboarding

Create a GitHub App and fill its values in `apps/api/.env`:

- App slug, App ID, Client ID, and Client secret.
- Private key as PEM text. In `.env`, keep it on one line and replace each line break with `\n`.
- User authorization callback URL: `http://localhost:4000/api/auth/github/callback`.
- Setup URL: `http://localhost:4000/api/auth/github/install/callback`.
- Repository permissions: **Contents: Read and write** and **Metadata: Read-only**. Users choose which repositories to grant during installation.

Restart the API after filling in these settings. Open `http://localhost:3000/setup` and choose **Continue with GitHub**. GitHub signs the user in and asks them to install the app for a personal account or organization and choose repositories. ContextOps then lets them select one of those repositories. If it has no `context/` folder, the user can ask ContextOps to add `context/README.md` to the default branch.

## Account, repository, and UI behavior

- Each ContextOps account has one saved project for the current MVP.
- The browser receives a seven-day, HttpOnly session cookie. PostgreSQL stores only a hash of its session token. Signing out deletes that session; it does not delete the saved project or uninstall the GitHub App.
- ContextOps periodically checks the GitHub App installation and repository access. The dashboard and Settings show the saved repository and its connection state. The user can reconnect or revoke the app from GitHub.
- See [`docs/github-account-and-repository-connection.md`](docs/github-account-and-repository-connection.md) for the flow and security details, and [`docs/ui-guidelines.md`](docs/ui-guidelines.md) for the shared UI style teammates should follow.
