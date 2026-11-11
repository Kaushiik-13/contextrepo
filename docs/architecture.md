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
| Approval | People review and approve proposals in ContextOps. MCP can read approved context and submit drafts, but cannot approve or publish. After approval, ContextOps publishes the record to GitHub. The exact commit/pull-request method remains to be finalized before that phase. |
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
  A[Person A and AI assistant] -->|MCP: submit proposal draft| API
  API -->|save draft| DB
  B[Person B and reviewer] -->|review, edit, approve or reject| W
  W -->|approval triggers publication| API
  API -->|publish approved Markdown| GH
  GH -->|approved context change| CI[Jenkins validation and release pipeline]
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
2. The teammate or assistant submits a proposal with the useful reasoning trail. In Phase 2B.3, the dashboard saves it as a draft in PostgreSQL; later an AI assistant can submit the same draft through MCP.
3. A person reviews, edits, approves, or rejects the draft in ContextOps. Neither the AI assistant nor an MCP tool can approve it.
4. After approval, ContextOps validates and publishes the Markdown record to the project's existing GitHub code repository under `context/`. The exact GitHub write method is to be chosen before the publishing phase.
5. Jenkins validates and publishes an immutable context release. A failed publish leaves the previous release active.
6. Another teammate's AI asks the NestJS MCP service for relevant context.
7. The MCP service reads only the active approved release and returns the decision with its rationale and source references. Drafts are never included.

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

The Phase 2A read-only slice loaded Markdown fixtures from `examples/demo-context/` through a repository adapter. Phase 2B.2 replaces that adapter with a GitHub-backed reader: the connected project's default branch is scanned under `context/`, and approved Markdown records are validated and displayed. A separate context repository remains optional. PostgreSQL stores project connection settings and proposal drafts; approved context stays in GitHub. Organization membership, teams, and multi-project access are deferred to the final phase.

The Phase 2B onboarding and live context reading slices are implemented: a user signs in with GitHub, installs the ContextOps GitHub App with repository access they select, connects one repository, and can ask ContextOps to add `context/README.md` on that repository's default branch. Supabase PostgreSQL stores the account, hashed ContextOps sessions, GitHub installation, one connected project per user, and proposal drafts. Logout removes only the current session; the project and GitHub installation remain saved. GitHub access is checked and its status appears on the dashboard and in Settings. The library reads approved records from GitHub, skips README and drafts, and warns about invalid Markdown files. The proposal page lets the user create and edit drafts, pending application of migration `003_context_proposal_drafts.sql`. See `docs/context-record-format.md`, `docs/proposal-drafts.md`, and `docs/github-account-and-repository-connection.md` for details.

## Trust and access boundaries

- MCP retrieval returns published context only; drafts stay in PostgreSQL.
- MCP clients can submit drafts but cannot approve proposals or publish records.
- A person approves or rejects each proposal in ContextOps before publication to GitHub.
- Only approved and validated content can be published.
- Publishing a new release does not replace the active release until publishing succeeds.
- Rollback changes the active release reference and keeps the original Git history.
- Secrets are supplied through local environment configuration or a secret manager, never committed.

## Still to design

MCP tool signatures, the GitHub-backed context reader, proposal API and screens, exact CI pipeline stages, GitHub publication method (direct commit or pull request), and production hosting will be designed in later phases against this architecture and the first end-to-end use case. The current GitHub onboarding flow and shared UI rules are documented in `docs/github-account-and-repository-connection.md` and `docs/ui-guidelines.md`.
