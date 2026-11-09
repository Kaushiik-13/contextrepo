# ContextOps — Project-Focused Implementation Plan

## 1. Project idea

ContextOps gives a software team and its AI assistants one shared, trusted place for project knowledge. Decisions, requirements, constraints, research, open questions, rejected approaches, and project progress are kept in a GitHub repository.

Changes are proposed and reviewed through pull requests. Only approved, published context is available to AI assistants through MCP. This helps separate AI sessions use the same project facts without copying chat history between them.

## 2. Product priorities

Build the ContextOps product first. Use DevOps tools to deliver and run that product; don’t let infrastructure work become the main project.

**Core product (must work):**
- Connect a ContextOps project to a GitHub context repository.
- Store and browse seven record types: Decision, Requirement, Constraint, Research, Rejected Approach, Open Question, and Project State.
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
- Decide how records are organized in Markdown with YAML front matter.
- Define the user flow: create project → connect repository → browse context → propose change → review → publish → retrieve through MCP.
- Draw the basic architecture and agree on what belongs in the app versus the context repository.

**Deliverable:** A small design document, sample records, and a clear folder/schema proposal.

**Complete when:** A reviewer can understand how a piece of knowledge moves from draft to approved release.

### Phase 2 — Create and browse project context

- Build project setup and GitHub repository linking.
- Build the dashboard to list and view records.
- Add keyword search and metadata filters.
- Add create/edit proposal entry points for all seven record types.

**Deliverable:** Users can connect a repository and explore structured project knowledge.

**Complete when:** The seven record types can be represented and browsed in the app.

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
- Demonstrate a rolling update.
- Add basic Prometheus/Grafana service health and document where to inspect logs and failed pipeline runs.

**Deliverable:** The finished product runs locally and can be demonstrated as a deployed service.

**Complete when:** Another person can follow the setup steps, use the product demo, and see whether its services are healthy.

### Phase 7 — Add the smallest useful IaC evidence

Do this after the core product workflow works.

- Choose one small, repeatable Terraform task for preparing the demo environment.
- Choose one small Ansible playbook for configuring a Linux host or preparing deployment prerequisites.
- Document exactly what each automates and how to run it.
- Avoid paid cloud resources unless the mentor specifically requires them.

**Deliverable:** Simple, understandable Terraform and Ansible examples tied to running ContextOps.

**Complete when:** Both tools have a clear role in preparing the project demo, without expanding into a separate infrastructure project.

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

The original scope names GitHub Actions. For stronger alignment with this syllabus, plan Jenkins as the main course pipeline unless the mentor approves GitHub Actions instead.

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

If the available time is short, reduce dashboard polish and infrastructure depth before cutting the proposal, approval, published-context, MCP retrieval, or rollback flow. These are the defining parts of ContextOps.

## 6. End-to-end project demonstration

1. Open a project and show its approved context and current Project State.
2. Propose a PostgreSQL decision through the dashboard or an MCP client.
3. Show the GitHub pull request and automated validation.
4. Have a human approve and merge it; show the published release.
5. Ask a separate AI client to retrieve the decision and its rationale through MCP.
6. Submit a conflicting database proposal and show the warning for human review.
7. Publish a Project State handoff and retrieve it from another AI session.
8. Show the app running through Docker Compose and on Kubernetes, with Jenkins status and basic health monitoring.
9. Restore the earlier approved release and confirm MCP now serves that version.

## 7. Product completion checklist

- [ ] A project can connect to a GitHub context repository.
- [ ] Seven record types can be created, viewed, searched, and filtered.
- [ ] Proposals use Git branches and pull requests with human review.
- [ ] Automated validation blocks invalid context from publication.
- [ ] MCP retrieval serves only the active approved release.
- [ ] Two independent AI sessions can retrieve the same approved decision.
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

