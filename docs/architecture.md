# ContextOps — Architecture (Phase 1)

## Product boundary

ContextOps is a shared, reviewable context layer for a team using different AI assistants. It preserves a useful decision trail from an iterative discussion so another teammate and their AI can retrieve both the outcome and the reasons behind it.

The first use case is Person A discussing PostgreSQL versus MySQL with ChatGPT, then submitting the final decision, rationale, constraints, alternatives, and selected discussion notes for review. After approval, Person B can ask Claude Code and receive that approved context while coding.

## Architecture decisions

| Area | Decision |
|---|---|
| Frontend | Next.js dashboard using shadcn/ui components. |
| Backend | NestJS service for the product API, GitHub integration, validation, release operations, and MCP server. |
| Approved context source of truth | A `context/` folder in the project's existing GitHub code repository, using Markdown records and YAML front matter. A separate context repository is optional, not required for the MVP. |
| Application storage | Supabase PostgreSQL stores GitHub sign-in sessions, the selected repository, and later saved proposal drafts. It does not replace GitHub as the source of truth for approved context. |
| Approval | GitHub pull requests and human review control acceptance. The application and MCP proposal tool cannot approve or merge. |
| Published context | Immutable Git tag or commit-pinned snapshot, selected by one active release reference per project. |
| Search | Begin with keyword and metadata search over approved GitHub-backed context. PostgreSQL also stores app configuration and drafts; drafts are excluded from approved-context retrieval. |
| Development and local run | Ubuntu through WSL on Windows; Docker Compose for the dashboard and backend. |
| Deployment demo | Add Kubernetes only after the core context workflow works. |

## Main components

```mermaid
flowchart LR
  U[User] -->|GitHub sign-in and app install| GH[GitHub]
  U -->|choose one repository| W[Next.js dashboard]
  W -->|REST API| API[NestJS API and MCP service]
  API -->|save session and selected project| DB[(Supabase PostgreSQL)]
  API -->|read or initialize context folder| GH
  A[Person A and AI assistant] -->|write proposal draft| W
  API -->|save draft| DB
  API -->|Phase 3: branch and pull request| GH
  B[Person B and reviewer] -->|review and approve| GH
  GH -->|approved merge| CI[Jenkins validation and publish pipeline]
  CI -->|validated immutable release| GH
  C[Person B and another AI assistant] -->|MCP query| API
  API -->|read active approved release only| GH
  API -->|decision plus rationale and sources| C
```

## Context record

The record must explain the team's reasoning, not only store a final label such as “PostgreSQL.” The first version should support these common fields:

- `id`, `title`, `type`, `project_id`, `created_at`, `updated_at`, and tags
- question or problem being discussed
- final decision or current conclusion
- rationale and relevant constraints
- alternatives considered and tradeoffs
- selected discussion notes, excerpts, or a source reference
- status and reviewer/publisher metadata where applicable

The record types are Decision, Requirement, Constraint, Research, Rejected Approach, Open Question, and Project State. A teammate or AI client submits a curated context record. The first version does not automatically ingest every private conversation.

## Core information flow

1. A teammate discusses a project question with an AI assistant.
2. The teammate or assistant saves a proposal draft with the useful reasoning trail; in Phase 2B, the draft is stored in PostgreSQL.
3. In Phase 3, ContextOps opens a branch and pull request in the project's existing GitHub code repository, placing the proposed approved record under `context/`.
4. Validation checks the record structure and required metadata.
5. A human reviewer approves and merges the pull request in GitHub.
6. Jenkins publishes a validated, immutable context release. A failed publish leaves the previous release active.
7. Another teammate's AI asks the NestJS MCP service for relevant context.
8. The MCP service reads only the active approved release and returns the decision with its rationale and source references.

## Repository layout

```text
contextrepo/
├── apps/
│   ├── web/                 # Next.js user interface
│   └── api/                 # NestJS REST API and MCP service
├── docs/
│   ├── architecture.md
│   └── implementation-plan.md
└── examples/
    └── demo-context/        # Local Markdown fixtures for the first read-only slice
        ├── decisions/
        ├── requirements/
        ├── constraints/
        ├── research/
        ├── rejected-approaches/
        ├── open-questions/
        └── project-state/
```

The first read-only slice loads Markdown fixtures from `examples/demo-context/` through a repository adapter. In Phase 2B, the demo project connects to its existing GitHub code repository and reads approved records from `context/`; a separate context repository remains an optional choice. PostgreSQL stores project connection settings and saved drafts, while approved context stays in GitHub. Organization membership, teams, and multi-project access are deferred to the final phase.

The first Phase 2B onboarding slice is implemented: a user signs in with GitHub, installs the ContextOps GitHub App with repository access they select, connects one repository, and can ask ContextOps to add `context/README.md` on that repository's default branch. Supabase PostgreSQL stores the account, hashed ContextOps sessions, GitHub installation, and one connected project per user. Logout removes only the current session; the project and GitHub installation remain saved. GitHub access is checked and its status appears on the dashboard and in Settings. The dashboard's context library still displays clearly labeled local demo fixtures until the GitHub-backed reader is implemented. The detailed callback, session, and revocation flow is in `docs/github-account-and-repository-connection.md`.

## Trust and access boundaries

- MCP retrieval returns published context only; drafts stay in pull requests.
- MCP proposals create a reviewable pull request and cannot approve or merge it.
- Only validated merged content can be published.
- Publishing a new release does not replace the active release until publishing succeeds.
- Rollback changes the active release reference and keeps the original Git history.
- Secrets are supplied through local environment configuration or a secret manager, never committed.

## Still to design

MCP tool signatures, the GitHub-backed context reader, proposal API and screens, exact CI pipeline stages, and production hosting will be designed in later phases against this architecture and the first end-to-end use case. The current GitHub onboarding flow and shared UI rules are documented in `docs/github-account-and-repository-connection.md` and `docs/ui-guidelines.md`.
