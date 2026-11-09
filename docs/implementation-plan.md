# ContextOps — Implementation Plan

## 1. Project goal

Build a small working platform that lets a software team store project knowledge in GitHub, review proposed changes, publish approved versions, and let separate AI assistants retrieve the same approved information.

The project should also demonstrate the five DevOps syllabus units. The finished demonstration should show the full path from a proposed knowledge change to an approved release running in a containerized deployment.

## 2. What the completed project should do

A user should be able to:

1. Connect a ContextOps project to a GitHub context repository.
2. Create and browse seven record types: Decision, Requirement, Constraint, Research, Rejected Approach, Open Question, and Project State.
3. Search records by keyword and metadata.
4. Propose a record change. ContextOps creates a Git branch and pull request; a human reviews and merges it in GitHub.
5. Automatically validate the proposed files. Invalid content must not be published.
6. Retrieve only the currently published, approved context through MCP.
7. See release history and restore an earlier approved release.
8. Show project progress, blockers, next actions, and handoff notes to another AI session.

## 3. Build order

Follow this order so each stage has something usable before the next stage depends on it.

### Stage 1 — Confirm the design and prepare the repositories

**Work to plan and complete**
- Decide the app structure: dashboard, backend/API and MCP service.
- Decide how the app stores its project configuration and GitHub connection.
- Keep the application repository separate from the linked context repository.
- Define the seven record formats, required metadata, folder structure, and validation rules.
- Draw a simple architecture and user workflow before implementation.

**Deliverables**
- Architecture diagram and repository layout.
- Example records for all seven types.
- Agreed API/MCP responsibilities and a list of required secrets/configuration.

**Done when** the team can explain where source files, context records, pull requests, published releases, and project state live.

### Stage 2 — Build the smallest useful application

**Work to plan and complete**
- Create the project setup and connect it to a GitHub context repository.
- Build basic dashboard pages to list, view, filter, and search context records.
- Add a form or API path to propose a new or updated record.
- Create a branch and pull request for each proposal; do not let the app approve or merge it.
- Add validation for required fields, metadata, file structure, and references.

**Deliverables**
- Working project setup and context browser.
- Proposal-to-pull-request workflow.
- Automated validation result visible to the reviewer.

**Done when** a user can submit a valid proposal, see its pull request and validation result, and invalid content is blocked from publication.

### Stage 3 — Publish approved context and serve it through MCP

**Work to plan and complete**
- After a reviewed pull request is merged, publish an immutable release tied to a Git commit or tag.
- Keep one active release reference per project.
- If publication fails, keep serving the last successful release.
- Implement MCP read tools that fetch the active published release only.
- Implement an MCP proposal tool that creates a proposal/pull request but cannot approve, merge, or switch the active release.
- Return source references and release/version details with retrieved records.

**Deliverables**
- Release workflow and release history.
- MCP retrieval and proposal operations.
- Permission boundary between proposing and approving.

**Done when** two independent AI clients retrieve the same approved decision, and draft pull request content is not returned by normal MCP retrieval.

### Stage 4 — Add Project State and rollback

**Work to plan and complete**
- Add Project State records for completed work, in-progress work, blockers, and next actions.
- Require Project State updates to use the same proposal, review, and publication flow.
- Add a reviewer action to select a previous approved release and point the project back to it.
- Record who/what initiated the rollback and which release became active.

**Deliverables**
- Project State view and handoff workflow.
- Release history and rollback action with an audit record.

**Done when** a second AI session can retrieve an approved handoff, and a prior release can be restored without deleting Git history.

### Stage 5 — Package and automate delivery

**Work to plan and complete**
- Add Dockerfiles for the required services and Docker Compose for local development.
- Create a Jenkins pipeline aligned with the syllabus. It should validate context, run application checks, build container images, and publish approved releases.
- Use Jenkins credentials or the chosen secret store for tokens; never commit credentials.
- Configure pull request checks so failed validation prevents publication.

**Deliverables**
- Repeatable local Docker Compose setup.
- Jenkins pipeline and documented stages.
- Container image build and release process.

**Done when** a pull request triggers checks, a failure blocks release, and a valid merged change can be built and published reproducibly.

### Stage 6 — Demonstrate Kubernetes, Ansible, and Terraform

**Work to plan and complete**
- Choose a local Kubernetes environment suitable for a student demo.
- Write Kubernetes configuration for the dashboard/API/MCP services, including Deployments, Services, and health probes.
- Use Terraform for a small, repeatable demo infrastructure setup. Choose the exact provider/resources during design; keep it local and avoid paid cloud resources unless explicitly required.
- Use Ansible to configure a Linux demo host or automate the deployment prerequisites.
- Demonstrate a rolling update and confirm the services become healthy.

**Deliverables**
- Kubernetes deployment instructions and manifests.
- A focused Terraform configuration and Ansible playbook.
- Deployment evidence such as screenshots or recorded command output for the report.

**Done when** another person can follow the documented steps to prepare the demo environment and deploy the application without manually repeating undocumented setup.

### Stage 7 — Add basic monitoring, documentation, and final demonstration

**Work to plan and complete**
- Add basic Prometheus metrics and a Grafana dashboard for service health and request activity.
- Document where to inspect service logs, Jenkins failures, and failed context validation.
- Write setup, architecture, security, pipeline, deployment, rollback, and troubleshooting documentation.
- Prepare a short end-to-end demonstration and report mapping each stage to a syllabus unit.

**Deliverables**
- Basic monitoring dashboard and log/health-check instructions.
- Project report and demo script.
- Final acceptance checklist with evidence.

**Done when** the complete scenario below can be demonstrated from proposal through review, release, AI retrieval, deployment, monitoring, and rollback.

## 4. Syllabus mapping to project work

| Syllabus unit | Planned project evidence |
|---|---|
| 1. DevOps Foundations & Linux Fundamentals | Linux demo setup, shell helper for setup/health checks, permissions, ports, and service connectivity documented. |
| 2. Version Control & CI/CD Automation | Git branches and pull requests plus Jenkins validation/build/release pipeline. GitHub Actions in the earlier scope should not be the only pipeline evidence if Jenkins is expected by the course. |
| 3. Containerization & Kubernetes Orchestration | Dockerfiles, Docker Compose, Kubernetes Deployments and Services, health checks, and rolling update. |
| 4. Infrastructure-as-Code & Automation | A small Terraform setup and Ansible playbook supporting the demo environment/deployment. Keep these focused and repeatable. |
| 5. DevOps Integration & Monitoring | Jenkins-to-container-to-Kubernetes delivery flow, Prometheus/Grafana health view, logs, deployment status, and rollback demonstration. |

## 5. Suggested four-week schedule

This is a draft schedule; adjust it to the time available and mentor feedback.

| Week | Main focus | Target outcome |
|---|---|---|
| 1 | Design, record model, GitHub connection, basic dashboard and search | Browse context and submit a proposal as a pull request. |
| 2 | Validation, approval workflow, release publishing, MCP retrieval, Project State | Approved context is published and retrievable by an independent AI client. |
| 3 | Docker/Compose, Jenkins pipeline, Kubernetes deployment | Local and Kubernetes demos work; CI checks and image build are visible. |
| 4 | Terraform, Ansible, monitoring, rollback, documentation and demo | All five syllabus units have demonstrable evidence; rehearse the complete scenario. |

If the schedule is too tight, prioritize the approved-context workflow, MCP retrieval, Jenkins, Docker, and Kubernetes first. Keep Terraform, Ansible, and monitoring minimal but real so every syllabus unit still has evidence.

## 6. End-to-end demo script

1. Show a project with existing context records and a Project State handoff.
2. Propose a PostgreSQL decision through the dashboard or an MCP client.
3. Show the created GitHub pull request and Jenkins validation.
4. Approve and merge the pull request; show the new published release.
5. Ask a separate AI client to retrieve the database decision and its reasoning.
6. Propose a conflicting database choice and show that it is flagged for human review.
7. Show the application running in Docker Compose and Kubernetes.
8. Show service health in Grafana and locate a pipeline/validation result.
9. Roll back to the previous approved context release and verify MCP returns that version.

## 7. Project completion checklist

- [ ] Seven record types can be created and viewed.
- [ ] Search and metadata filtering work.
- [ ] Proposals create GitHub pull requests and require human approval.
- [ ] Automated validation blocks invalid context from being published.
- [ ] MCP reads only the active published release and can submit proposals separately.
- [ ] Two independent AI sessions can retrieve the same approved decision.
- [ ] Project State handoff can be approved and retrieved.
- [ ] Release history and rollback work without deleting Git history.
- [ ] Docker Compose runs the project locally.
- [ ] Jenkins pipeline demonstrates validation, build, and release steps.
- [ ] Kubernetes deployment, service access, health probes, and rolling update are demonstrated.
- [ ] Terraform and Ansible each have a small, documented, repeatable role.
- [ ] Prometheus/Grafana provide basic health evidence; logs and pipeline failures can be inspected.
- [ ] Setup, architecture, security boundaries, deployment, rollback, and demo steps are documented.


## 9. Development-first syllabus checklist

The project is the main focus. Syllabus topics can be demonstrated either through the way ContextOps is developed, through the finished project's deployment, or both. The items below are planned evidence, not completed work.

| Syllabus topics | Practised while developing ContextOps | Demonstrated by the ContextOps project |
|---|---|---|
| Linux file navigation, users/permissions, shell scripting, IP/ports/protocols | Use a Linux environment for development; navigate files, manage access, run a setup/health-check script, and inspect service ports/connectivity. | Document the Linux setup and show the app services communicating over the expected ports. These are development practices, not product features. |
| Git fundamentals, branching, merging, conflict resolution | Use feature branches, commits, merges, and resolve a deliberate or naturally occurring merge conflict during development. | Show the project and context repositories' history and pull-request review flow. |
| GitHub workflows and Jenkins setup/jobs/pipeline scripting | Use pull requests for project changes and configure Jenkins as the development CI pipeline. | Show Jenkins validating context, checking/building the app, and publishing approved context. Prefer Jenkins for course evidence even though the original scope named GitHub Actions. |
| Docker architecture, Dockerfile, images, containers, Docker Compose | Build and run the application in containers during development; understand the image and container workflow. | Show Dockerfiles and Compose running the dashboard/API/MCP services locally. |
| Kubernetes architecture, pods, deployments, services, scaling/load balancing | Learn the cluster and deployment concepts while preparing the demo. | Deploy ContextOps to local Kubernetes; show pods, Deployments, Services, health probes, and a basic scaling or traffic-distribution demonstration if feasible. |
| Ansible playbooks, roles, inventory; Terraform providers, resources, state; automated provisioning/configuration | Learn and write these as small project-support scripts rather than building a separate infrastructure product. | Use one focused Ansible playbook and one Terraform configuration to prepare or deploy the demo environment. Document their inventory/resources/state and what each automates. |
| CI/CD integration with Docker, Kubernetes, Ansible, Terraform | Build the pipeline incrementally as development progresses. | Demonstrate the delivery path from Jenkins checks to image build and Kubernetes deployment, with the IaC steps documented or invoked for environment setup. |
| Blue-green/rolling deployment, Prometheus/Grafana, logging, security | Add operational checks and secure handling of development credentials as part of the build process. | Demonstrate a rolling update (the MVP deployment strategy), basic Prometheus/Grafana service health, logs, and credential/permission boundaries. Blue-green can remain a stretch item if time is limited. |

### Development priority

1. Build the ContextOps knowledge and approval workflow first: records, pull requests, validation, approved release, and MCP retrieval.
2. Use Git, Linux, Jenkins, and Docker throughout that development so these syllabus topics are naturally evidenced.
3. Add Kubernetes deployment and basic monitoring after the core workflow works.
4. Add the smallest useful Ansible and Terraform tasks to support the demo. Keep them small enough that infrastructure work does not take priority over the ContextOps product.

At the planning stage, the checklist identifies where each syllabus topic will be learned or shown. The mentor can confirm whether this evidence is sufficient for the requested syllabus coverage before implementation starts.

## 8. Keep the scope manageable

Do not add multi-cloud provisioning, advanced semantic conflict resolution, autonomous agent orchestration, enterprise permissions, vector search, or automatic extraction from every conversation. These features are not needed to demonstrate ContextOps or the five syllabus units.

The backend framework, Kubernetes environment, Terraform provider/resources, Linux host choice, and exact monitoring metrics are design choices to settle before implementation begins.

