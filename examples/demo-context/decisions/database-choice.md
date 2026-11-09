---
id: database-choice
title: Use PostgreSQL for the application data
type: decision
projectId: contextops-demo
status: approved
updatedAt: '2026-11-09'
owner: Maya (sample teammate)
tags:
  - database
  - architecture
question: Which database should the shopping application use?
summary: PostgreSQL is the selected database for the application's relational data.
rationale: The example application needs relational records, transactions, and clear relationships between customers, orders, and products. PostgreSQL provides those capabilities and supports flexible fields when needed.
constraints:
  - Keep order and payment records consistent during transactions.
  - The team needs a database that is straightforward to run in development.
alternatives:
  - MySQL was considered; PostgreSQL was preferred for this example's relational and flexible-data needs.
  - A document database was considered; it was not selected for the relational order model.
discussionSummary: Maya explored PostgreSQL and MySQL with ChatGPT over several rounds. The useful outcome was to compare transaction needs, relationships, and the team's development setup before choosing. This is an illustrative sample, not a decision about the ContextOps product itself.
sourceReferences:
  - Sample ChatGPT discussion summary: database selection
---

## Why this matters to the next developer

When another teammate asks an AI coding assistant to create database models or queries, it should know the approved choice and the reasons behind it. The next teammate should not have to copy Maya's original chat into a different AI tool.
