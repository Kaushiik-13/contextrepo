import { Injectable } from '@nestjs/common';
import matter from 'gray-matter';
import { GithubService } from '../github/github.service';
import {
  CONTEXT_TYPES,
  type ContextReadResult,
  type ContextRecord,
  type ContextRepository,
  type ContextType,
} from './context.types';

@Injectable()
export class GithubContextRepository implements ContextRepository {
  constructor(private readonly github: GithubService) {}

  async listApproved(userId: string, ref?: string): Promise<ContextReadResult> {
    const source = await this.github.readContextFiles(userId, ref);
    const warnings = [...source.warnings];
    const records: ContextRecord[] = [];

    const recordIds = new Set<string>();
    for (const file of source.files) {
      try {
        const parsed = matter(file.content);
        const data = parsed.data as Record<string, unknown>;
        if (data.status === 'draft') continue;
        if (data.status !== 'approved') {
          warnings.push(
            `${file.path}: status must be "approved" to appear in the library.`,
          );
          continue;
        }

        const record = this.toRecord(data, source.projectId);
        if (typeof record === 'string') {
          warnings.push(`${file.path}: ${record}`);
          continue;
        }
        if (recordIds.has(record.id)) {
          warnings.push(
            `${file.path}: record id "${record.id}" is already used by another file.`,
          );
          continue;
        }
        recordIds.add(record.id);
        records.push({ ...record, sourcePath: file.path });
      } catch {
        warnings.push(`${file.path}: could not parse the YAML front matter.`);
      }
    }

    records.sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
    return {
      items: records,
      repository: source.repository,
      branch: source.branch,
      commitSha: source.commitSha,
      contextFolderExists: source.contextFolderExists,
      warnings,
    };
  }

  private toRecord(
    data: Record<string, unknown>,
    projectId: string,
  ): ContextRecord | string {
    const title = this.requiredString(data.title);
    const id = this.requiredString(data.id);
    const type = this.requiredString(data.type);
    const question = this.requiredString(data.question ?? data.problem);
    const summary = this.requiredString(data.summary ?? data.outcome);
    const rationale = this.requiredString(data.rationale);
    const updatedAt = this.dateString(data.updatedAt ?? data.updated_at);

    if (!id) return 'missing required field "id".';
    if (!title) return 'missing required field "title".';
    if (!type || !CONTEXT_TYPES.includes(type as ContextType)) {
      return `"type" must be one of: ${CONTEXT_TYPES.join(', ')}.`;
    }
    if (!question) return 'missing required field "question".';
    if (!summary) return 'missing required field "summary" (or "outcome").';
    if (!rationale) return 'missing required field "rationale".';
    if (!updatedAt) return 'missing or invalid "updatedAt" date.';

    const tags = this.stringArray(data.tags);
    const constraints = this.stringArray(data.constraints);
    const alternatives = this.stringArray(data.alternatives);
    const sourceReferences = this.stringArray(
      data.sourceReferences ?? data.source_references,
    );
    const invalidArray = [
      tags,
      constraints,
      alternatives,
      sourceReferences,
    ].find((value) => value === null);
    if (invalidArray === null) {
      return 'list fields such as "tags" and "constraints" must be YAML lists of text.';
    }

    const discussionSummary = this.optionalString(
      data.discussionSummary ?? data.discussion_summary,
    );
    const recordProjectId = this.optionalString(
      data.projectId ?? data.project_id,
    );
    const owner = this.optionalString(data.owner);
    if (discussionSummary === null) {
      return '"discussionSummary" must be text.';
    }
    if (recordProjectId === null) return '"projectId" must be text.';
    if (owner === null) return '"owner" must be text.';

    return {
      id,
      title,
      type: type as ContextType,
      projectId: recordProjectId || projectId,
      status: 'approved',
      updatedAt,
      owner: owner || 'Project team',
      tags: tags ?? [],
      question,
      summary,
      rationale,
      constraints: constraints ?? [],
      alternatives: alternatives ?? [],
      discussionSummary: discussionSummary ?? '',
      sourceReferences: sourceReferences ?? [],
    };
  }

  private requiredString(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    return value.trim();
  }

  private optionalString(value: unknown): string | null {
    if (value === undefined || value === null) return '';
    return typeof value === 'string' ? value.trim() : null;
  }

  private dateString(value: unknown): string | null {
    const date = value instanceof Date ? value : new Date(String(value ?? ''));
    if (!Number.isFinite(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  }

  private stringArray(value: unknown): string[] | null {
    if (value === undefined || value === null) return [];
    if (
      !Array.isArray(value) ||
      value.some((item) => typeof item !== 'string')
    ) {
      return null;
    }
    return value.map((item) => item.trim()).filter(Boolean);
  }
}
