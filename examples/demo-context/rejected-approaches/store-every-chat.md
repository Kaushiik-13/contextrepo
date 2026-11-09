---
id: store-every-chat
title: Do not automatically publish every conversation
type: rejected-approach
projectId: contextops-demo
status: approved
updatedAt: '2026-11-09'
owner: ContextOps team
tags:
  - privacy
  - curation
question: Should ContextOps automatically collect every AI conversation?
summary: The MVP uses selected, user-submitted discussion notes instead of ingesting every private conversation.
rationale: Teams need control over what becomes shared project knowledge; conversations may include irrelevant or sensitive material.
constraints:
  - A person must decide what to share with the team.
  - Shared knowledge still follows the normal review and publication workflow.
alternatives:
  - Automatic full-session ingestion was deferred from the MVP.
discussionSummary: The useful reasoning from a conversation should be captured, while the entire private chat need not be copied by default.
sourceReferences:
  - ContextOps MVP scope
---

Selected conversation summaries or excerpts may be included in a context proposal.
