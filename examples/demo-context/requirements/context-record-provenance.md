---
id: context-record-provenance
title: Preserve the reasoning behind shared context
type: requirement
projectId: contextops-demo
status: approved
updatedAt: '2026-11-09'
owner: ContextOps team
tags:
  - context-model
  - rationale
question: What should a shared context record preserve?
summary: A record must carry enough of the discussion to explain the final outcome to another teammate and their AI assistant.
rationale: A bare answer can be misapplied if the next person cannot see the constraints, alternatives, and reasoning that led to it.
constraints:
  - Keep records concise enough for an AI assistant to retrieve and use.
alternatives:
  - Storing only a title and final answer was rejected because it loses the why.
discussionSummary: The team emphasized that important multi-turn conversations contain context that an architecture file alone may not convey.
sourceReferences:
  - ContextOps project scope
---

Each approved record carries its decision trail in a structured, searchable form.
