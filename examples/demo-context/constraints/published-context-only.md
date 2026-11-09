---
id: published-context-only
title: AI retrieval returns approved context only
type: constraint
projectId: contextops-demo
status: approved
updatedAt: '2026-11-09'
owner: ContextOps team
tags:
  - trust
  - mcp
question: Which context can an AI assistant read?
summary: Normal MCP retrieval must return published, approved records only.
rationale: An unreviewed proposal must not appear as an authoritative team decision.
constraints:
  - Draft pull request content stays out of normal retrieval.
  - Proposal tools can submit changes but cannot approve or publish them.
alternatives:
  - Returning all repository branches was rejected because it can mix drafts with approved context.
discussionSummary: This is a governance rule for all project context, not just database decisions.
sourceReferences:
  - ContextOps security and governance rules
---

The next phase will connect this rule to GitHub pull requests and published releases.
