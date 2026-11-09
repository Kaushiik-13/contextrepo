---
id: authentication
title: Which authentication method should the MVP use?
type: open-question
projectId: contextops-demo
status: approved
updatedAt: '2026-11-09'
owner: Project team
tags:
  - authentication
  - design
question: Should the first demo use GitHub App authentication or a simpler local setup?
summary: The authentication approach has not been finalized.
rationale: A production GitHub integration needs scoped access, but the first implementation slice is still read-only.
constraints:
  - Do not commit access tokens.
  - Keep the first development slice small.
alternatives:
  - GitHub App with repository-scoped permissions.
  - Local demo fixtures before remote repository linking.
discussionSummary: Decide the authentication design when the GitHub integration phase begins.
sourceReferences:
  - ContextOps architecture plan
---

This question is intentionally left unresolved for the first read-only slice.
