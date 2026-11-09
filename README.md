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

The records are local demo fixtures. GitHub repository linking, pull-request proposals/review, publishing, and MCP retrieval are still upcoming phases.

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
