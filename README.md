# ContextOps

ContextOps is a shared context layer for teams using different AI assistants. It preserves important project decisions and the reasoning behind them, then makes approved context available to teammates and their assistants.

## Phase 1 architecture

- `apps/web`: Next.js dashboard with shadcn/ui.
- `apps/api`: NestJS REST API and MCP service.
- GitHub Markdown/YAML context repository: source of truth, pull-request review, and release history.
- Docker Compose: local development; Kubernetes comes after the core workflow.

See [the architecture](docs/architecture.md) and [the implementation plan](docs/implementation-plan.md).

## Current progress

Phase 1 is the architecture and project skeleton. The dashboard and API are scaffolds; the ContextOps workflow has not been implemented yet.

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
