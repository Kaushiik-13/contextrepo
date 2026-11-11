# Context record format

ContextOps reads approved Markdown records from the `context/` folder in the connected GitHub repository. It reads the repository's default branch. You can organize records in subfolders; the folder structure does not determine the record type.

## Add a record

Create a `.md` file under `context/`, for example `context/decisions/database.md`:

```markdown
---
id: database-choice
title: Use PostgreSQL for application data
type: decision
status: approved
updatedAt: 2026-11-11
owner: Project team
tags:
  - database
  - architecture
question: Which database should the application use?
summary: Use PostgreSQL as the application's primary relational database.
rationale: The project needs relational data, transactions, and a mature ecosystem.
constraints:
  - The database must support reliable transactions.
alternatives:
  - MySQL
discussionSummary: The team compared PostgreSQL and MySQL for the application's needs.
sourceReferences:
  - docs/architecture.md
---

Additional explanation can go here as normal Markdown.
```

Commit or merge the file to the repository's default branch, then refresh ContextOps.

## Required fields

| Field       | Meaning                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------- |
| `id`        | Stable unique identifier for this record.                                                                             |
| `title`     | Short human-readable name.                                                                                            |
| `type`      | One of `decision`, `requirement`, `constraint`, `research`, `rejected-approach`, `open-question`, or `project-state`. |
| `status`    | Must be `approved` to appear in the library. Records marked `draft` are ignored.                                      |
| `updatedAt` | Date or timestamp, for example `2026-11-11`.                                                                          |
| `question`  | Question or problem the team discussed. `problem` is also accepted.                                                   |
| `summary`   | The answer, decision, or current conclusion. `outcome` is also accepted.                                              |
| `rationale` | Why the team reached this conclusion.                                                                                 |

Optional fields: `owner`, `projectId`, `tags`, `constraints`, `alternatives`, `discussionSummary`, and `sourceReferences`. The four list fields must be YAML lists of text. Snake-case aliases are accepted for `updated_at`, `project_id`, `discussion_summary`, and `source_references`.

`README.md` is treated as folder guidance and is not shown as a record. Invalid records do not block other valid records; ContextOps displays a warning with the file path and issue. Duplicate IDs are reported and only the first valid file is shown.

## Current limits

- Only Markdown (`.md`) records are read.
- Files must be smaller than 1 MB.
- The reader currently reads the connected repository's default branch. Pull-request review and published immutable releases come in later phases.
- Draft proposals created inside ContextOps are a separate Phase 2B.3 feature; until then, keep unapproved files marked `draft` so they stay out of the approved library.
