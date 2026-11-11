# ContextOps — Project-Focused Implementation Plan

## 1. Project idea

ContextOps is a shared, trusted project context for teammates using different AI assistants, such as ChatGPT and Claude. It carries forward important outcomes from iterative conversations so the next person or AI knows both what the team decided and why.

For example, Person A may discuss PostgreSQL versus MySQL with ChatGPT over several rounds. ContextOps captures the final decision, the reasoning, constraints, alternatives considered, and the useful discussion trail. After team review and publication, Person B can ask Claude Code for project context and receive the approved decision with its rationale. The same approach applies to other team knowledge, not only database choices.

## 2. Product priorities

Build the ContextOps product first. Use DevOps tools to deliver and run that product; don’t let infrastructure work become the main project.

**Core product (must work):**
- Connect a ContextOps project to a GitHub context repository.
- Store and browse seven record types: Decision, Requirement, Constraint, Research, Rejected Approach, Open Question, and Project State.
- Preserve each context item's reasoning trail: the question, final outcome, rationale, constraints, alternatives/tradeoffs, and selected discussion notes or source references.
- Search and filter records.
- Propose changes through pull requests, validate them, and require human review.
- Publish approved context as a versioned release.
- Let independent AI clients retrieve only the active approved release through MCP.
- Support project progress handoffs, release history, and rollback.

**Supporting delivery (keep small):**
- Run locally in Docker Compose.
- Use Jenkins for course-aligned automated checks and builds.
- Demonstrate deployment on Kubernetes.
- Add only a small Ansible/Terraform setup and basic monitoring needed for the course demo.

## 3. Build sequence

### Phase 1 — Define the knowledge model and user flow

- Confirm what each of the seven record types means and which fields are required.
- Define shared fields that preserve reasoning: the problem/question, outcome, rationale, constraints, alternatives and tradeoffs, and selected discussion excerpts or source references.
- Decide how records are organized in Markdown with YAML front matter.
- Define the user flow: create project → connect repository → browse context → propose change → review → publish → retrieve through MCP.
- Draw the basic architecture and agree on what belongs in the app versus the context repository.

**Deliverable:** A small design document, sample records, and a clear folder/schema proposal.

**Complete when:** A reviewer can understand how a piece of knowledge moves from draft to approved release.

### Phase 2 — Create and browse project context

#### Phase 2A — Read-only context library (completed)

- [x] Define a shared record shape that carries the question, outcome, rationale, constraints, alternatives, discussion summary, and source notes.
- [x] Add seven sample Markdown records with YAML front matter.
- [x] Add a NestJS repository adapter and read-only API for approved records.
- [x] Build a Next.js dashboard to browse records, search reasoning, filter by type, and inspect a record's decision trail.

This first slice uses `examples/demo-context/` fixtures so the cross-assistant context idea can be seen before GitHub authentication is added.

#### Phase 2B — Project connection and context entry (in progress)

- **2B.1 GitHub onboarding and persistence (implemented):** Show one GitHub sign-in/sign-up screen; let the user authorize ContextOps and install its GitHub App for a selected repository set; show one repository-selection screen; check for `context/`; if missing, offer to create `context/README.md` on the default branch. Store the GitHub identity/session, installation, and one selected project in Supabase PostgreSQL. Sessions expire after seven days; logout preserves the project connection. Verify installation ownership, keep the OAuth token encrypted only for the short setup callback, store session hashes (not raw session tokens), and provide GitHub access status/reconnect actions. Keep the private key and database URL in the ignored API `.env` file. The schema update is migration `002_persistent_github_connection.sql`.
- **2B.2 Read approved context (implemented):** The authenticated library reads Markdown files from the connected repository's `context/` folder on its default branch. It displays only records with `status: approved`, skips drafts and `README.md`, validates record fields, and reports invalid files by path. Search, type filters, record details, and summary cards use GitHub data. Missing folders, empty folders, unreadable files, and API errors have explicit UI states. There is no silent fixture fallback.
- **2B.3 Save proposal drafts:** Add create, save, and edit for all seven record types, preserving the question, outcome, rationale, constraints, alternatives, tags, and selected discussion/source notes. Save drafts in PostgreSQL and keep them out of the approved library and retrieval API.
- Defer pull-request creation for proposals, automated validation, human approval, and publishing to Phase 3. The folder initializer is setup scaffolding only; it does not publish a decision.

**Current deliverable:** The single demo project connects to GitHub and reads approved context from its existing code repository. Saving proposal drafts is the next 2B.3 slice.

**Complete when:** The user can sign in, connect one repo, initialize `context/` when needed, browse and search its approved context, create/edit drafts, and confirm drafts do not appear in approved context or retrieval. Organization onboarding, multiple teams, member invitations, and role-based project access are explicitly deferred to Phase 8.

### Phase 3 — Add review and trust controls

- Make proposals create a branch and pull request in GitHub.
- Validate required fields, metadata, file layout, and references automatically.
- Show validation status and pull-request status in the dashboard.
- Keep approval and merge authority in GitHub; the app and MCP proposal tool cannot approve or merge changes.
- Flag possible conflicting decisions for human review.

**Deliverable:** A safe proposal workflow backed by GitHub pull requests and automated validation.

**Complete when:** Invalid or unreviewed proposals cannot silently become active context.

### Phase 4 — Publish approved context and build MCP retrieval

- Publish a merged, valid change as an immutable Git tag or commit-pinned release.
- Track one active published release per project.
- If publishing fails, continue serving the previous successful release.
- Implement MCP retrieval from the active published release only.
- Include version and source references in retrieval results.
- Implement MCP proposal submission separately from read access.

**Deliverable:** An independent AI assistant can retrieve the same approved project facts as another assistant.

**Complete when:** Two separate AI sessions return the same approved decision, while draft pull-request content remains hidden from normal retrieval.

### Phase 5 — Add project progress and recovery

- Use Project State records for completed work, current work, blockers, and next actions.
- Submit handoff updates through the same review and release process as other records.
- Show release history and let a reviewer restore an earlier approved release.
- Keep an audit record of rollback actions; preserve all Git history.

**Deliverable:** A reliable handoff and recovery workflow.

**Complete when:** A second AI session can retrieve an approved handoff, and the team can restore and serve an earlier approved context version.

### Phase 6 — Make the product easy to run and demonstrate

- Add Dockerfiles and Docker Compose for local development.
- Add a Jenkins pipeline for validation, application checks, image builds, and release publishing.
- Deploy the application to a local Kubernetes environment using Deployments, Services, and health probes.
- Demonstrate scaling the Kubernetes deployment and a rolling update; show how the Service routes traffic to healthy Pods.
- Add basic Prometheus/Grafana service health and document where to inspect logs and failed pipeline runs.

**Deliverable:** The finished product runs locally and can be demonstrated as a deployed service.

**Complete when:** Another person can follow the setup steps, use the product demo, and see whether its services are healthy.

### Phase 7 — Add the smallest useful IaC evidence

Do this after the core product workflow works.

- Use Terraform for a small, repeatable provisioning task and explicitly show its provider, resources, state, and plan/apply workflow. For a no-cloud demo, manage the ContextOps Kubernetes resources in an already-running local cluster.
- Use an Ansible inventory and playbook to configure the Linux demo environment or its deployment prerequisites. If the course requires multi-node practice, use two local demo targets; confirm this with the mentor.
- Document exactly what each automates and how to run it.
- Avoid paid cloud resources unless the mentor specifically requires them.

**Deliverable:** Simple, understandable Terraform and Ansible examples tied to running ContextOps.

**Complete when:** Both tools have a clear role in preparing the project demo, without expanding into a separate infrastructure project.

### Phase 8 — Add organization, teams, and access (final phase)

Do this after the single-project product and its DevOps demonstration work end to end.

- Add organizations/workspaces and invite team members.
- Let an organization manage multiple teams and projects, and let a project be shared with its relevant team members.
- Add roles and permissions for viewing, proposing, and administering project context.
- Treat GitHub contributors as suggestions for onboarding only; being a code-repo contributor must not automatically grant ContextOps access.

**Deliverable:** An organization can manage its people, teams, and multiple projects with clear access boundaries.

**Complete when:** Members can be onboarded, assigned to the right teams/projects, and only view or change context allowed by their role.

## 4. Development-first syllabus mapping

| Syllabus area | How it supports ContextOps development | Evidence in the finished project/demo |
|---|---|---|
| Linux, shell, permissions, networking | Develop/run services in Linux; use shell helpers; understand file access and service ports. | Document local setup and show the app services communicating correctly. |
| Git and GitHub workflows | Use branches, commits, merges, pull requests, and conflict resolution while developing. | Context changes use Git branches and human-reviewed pull requests. |
| Jenkins CI/CD | Use Jenkins to check and build the application as it changes. | Show validation, build, image creation, and approved-context publishing stages. |
| Docker and Compose | Package services and use Compose for local development. | Demonstrate the app running in containers on a developer machine. |
| Kubernetes | Learn deployment concepts after core product behavior is working. | Demonstrate pods, Deployments, Services, health probes, and a rolling update. |
| Ansible and Terraform | Use only small supporting automation tasks after core development. | Show a focused playbook and Terraform configuration that prepare the demo setup. |
| Integration and monitoring | Connect pipeline and deployment steps; keep security and operations visible. | Show basic service health, logs, pipeline status, and rollback. |

The original scope names GitHub Actions. For stronger alignment with this syllabus, plan Jenkins as the main course pipeline unless the mentor approves GitHub Actions instead. Configure an automated pull-request trigger and show a failed check blocking publication.

## 4.1. Syllabus coverage target and evidence

For a rough estimate, group the practical syllabus into 18 topic groups (four for Unit 1, three for Unit 2, four for Unit 3, three for Unit 4, and four for Unit 5). On this counting method, 75% means at least 14 of 18 groups. The plan should aim to show evidence for 15 of 18 groups (about 83%) to leave a small buffer. This is a planning estimate; the mentor may group or score individual topics differently.

- [ ] Linux evidence: navigate the project files, demonstrate permissions, run a small shell automation script, and inspect IP/ports/service connectivity.
- [ ] Git evidence: use a branch and pull request, merge changes, and demonstrate resolving a conflict.
- [ ] Jenkins evidence: automatically trigger a pipeline on a pull request; show validation/build stages and a failed check preventing publication.
- [ ] Docker evidence: explain the Dockerfile/image/container path and start the multi-service app with Compose.
- [ ] Kubernetes evidence: show Pods, Deployments, and Services; scale replicas and show traffic reaching healthy Pods; demonstrate a rolling update.
- [ ] Ansible evidence: show inventory and a playbook configuring the Linux demo target; use two local targets if multi-node is required by the mentor.
- [ ] Terraform evidence: show provider, resources, state, and plan/apply for ContextOps resources in the existing local Kubernetes cluster.
- [ ] Integration evidence: show Jenkins, Docker, Kubernetes, the IaC steps, rolling deployment, basic Prometheus/Grafana health, logs, and security/credential handling as one demo story.

These are small course demonstrations attached to ContextOps. Complete the product workflow first; do not build cloud infrastructure or a separate DevOps platform just to collect syllabus evidence.

## 5. Suggested schedule

Use this as a planning estimate and adjust to the time available.

| Stage | Focus | Target result |
|---|---|---|
| 1 | Knowledge model, repository layout, user flow | Stable design and sample context records. |
| 2 | Project setup, records, browsing, search | A usable context dashboard. |
| 3 | Pull-request proposals and validation | Reviewed, checked context changes. |
| 4 | Approved releases and MCP retrieval | Independent AI clients retrieve trusted context. |
| 5 | Project State, history, rollback | Handoffs and recovery work. |
| 6 | Docker, Jenkins, Kubernetes, basic monitoring | Product is packaged and demonstrable. |
| 7 | Small Ansible/Terraform additions and report | Course evidence is complete without distracting from the product. |
| 8 | Organization, teams, and access | Multiple projects and their members have clear access boundaries. |

If the available time is short, reduce dashboard polish and infrastructure depth before cutting the proposal, approval, published-context, MCP retrieval, or rollback flow. These are the defining parts of ContextOps.

## 6. End-to-end project demonstration

1. Person A explores PostgreSQL versus MySQL with ChatGPT through several rounds of discussion.
2. Person A submits a context proposal capturing the question, chosen database, reasons, constraints, alternatives, and relevant discussion notes or references.
3. Show the GitHub pull request and automated validation.
4. Person B reviews and approves it; ContextOps publishes the approved context.
5. Person B opens Claude Code and asks how the project should use a database. Claude retrieves the approved decision and rationale through MCP.
6. If someone proposes a conflicting choice, ContextOps flags it for team review.
7. Repeat the cross-person, cross-assistant flow for another project topic or a Project State handoff.
8. Show the app running through Docker Compose and on Kubernetes, with Jenkins status and basic health monitoring.
9. Restore the earlier approved release and confirm MCP now serves that version.

## 7. Product completion checklist

- [ ] A project can connect to a GitHub context repository.
- [ ] Seven record types can be created, viewed, searched, and filtered.
- [ ] Proposals use Git branches and pull requests with human review.
- [ ] Automated validation blocks invalid context from publication.
- [ ] MCP retrieval serves only the active approved release.
- [ ] Two independent AI sessions can retrieve the same approved decision.
- [ ] Context items preserve the question, decision, reasoning, constraints, alternatives, and useful conversation/source references.
- [ ] Conflicting proposals are flagged for human review.
- [ ] Project State handoffs can be approved and retrieved.
- [ ] Release history and rollback work without deleting Git history.
- [ ] Docker Compose runs the project locally.
- [ ] Jenkins shows validation/build/release steps.
- [ ] Kubernetes deployment, health probes, and a rolling update are demonstrated.
- [ ] A focused Terraform task and Ansible playbook support the demo setup.
- [ ] Basic health monitoring, logs, and pipeline failures can be inspected.
- [ ] Setup, architecture, security boundaries, and demo steps are documented.

## 8. Out of scope for the first version

Keep advanced semantic conflict resolution, automatic extraction from all conversations, autonomous agent orchestration, enterprise permission systems, vector search, multi-cloud infrastructure, and elaborate observability out of the first version. They do not prove the central idea and would take time away from the shared, approved context workflow.

## 9. Chosen technical direction

These are planning decisions for the first version. They can be adjusted if a course requirement or mentor feedback requires it.

| Area | Planned choice | Role in ContextOps |
|---|---|---|
| Web dashboard | Next.js | User interface for projects, knowledge records, proposals, and release history. |
| UI components | shadcn/ui | Reusable buttons, forms, tables, dialogs, and other dashboard components. |
| Backend | NestJS | API, GitHub integration, context validation/release operations, and MCP service. |
| Knowledge source of truth | GitHub repository with Markdown/YAML | Stores reviewable context records and Git history. |
| Development OS | Ubuntu through WSL on Windows | Linux environment for development and syllabus Linux practice. |
| Local app runtime | Docker Compose | Runs the dashboard and backend services locally during development. |
| Deployment demo | Local Kubernetes cluster | Demonstrates container orchestration after the core app works. |
| Terraform role | Manage the demo application's Kubernetes resources in the existing local cluster | Demonstrates providers, resources, and state without requiring paid cloud infrastructure. |
| Ansible role | Configure the Linux demo environment and deployment prerequisites | Demonstrates inventory and playbooks through a small repeatable setup task. |
| CI/CD | Jenkins as the main course-alignment pipeline | Validates changes, builds the app image, and supports approved context publishing. |
| Monitoring | Basic Prometheus/Grafana service health, with logs | Shows whether the demo services are running and helps inspect failures. |

### Build priority

1. Build the ContextOps product workflow: knowledge records, GitHub proposals and review, validation, approved releases, MCP retrieval, Project State handoffs, and rollback.
2. Use WSL/Linux, Git, Jenkins, and Docker Compose as the development environment and delivery workflow.
3. After the core workflow works, deploy it to Kubernetes.
4. Add the small Terraform and Ansible demonstrations, then basic monitoring and final documentation.

This document is a plan, not a record of completed implementation. Confirm with the mentor whether Jenkins is required instead of GitHub Actions and whether the proposed local Kubernetes, Terraform, and Ansible demonstrations satisfy the course expectations.



