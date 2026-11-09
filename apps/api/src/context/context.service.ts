import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONTEXT_REPOSITORY } from './context.types';
import type { ContextRecord, ContextRepository } from './context.types';

@Injectable()
export class ContextService {
  constructor(
    @Inject(CONTEXT_REPOSITORY)
    private readonly repository: ContextRepository,
  ) {}

  async list(query?: string, type?: string) {
    const records = await this.repository.listApproved();
    const normalizedQuery = query?.trim().toLocaleLowerCase();

    const items = records.filter((record) => {
      const matchesType = !type || record.type === type;
      if (!matchesType) return false;
      if (!normalizedQuery) return true;

      return this.searchableText(record).includes(normalizedQuery);
    });

    return { items, total: items.length };
  }

  async getById(id: string): Promise<ContextRecord> {
    const record = (await this.repository.listApproved()).find(
      (item) => item.id === id,
    );
    if (!record) throw new NotFoundException(`Context record "${id}" was not found.`);
    return record;
  }

  private searchableText(record: ContextRecord): string {
    return [
      record.title,
      record.type,
      record.question,
      record.summary,
      record.rationale,
      record.discussionSummary,
      ...record.tags,
      ...record.constraints,
      ...record.alternatives,
      ...record.sourceReferences,
    ]
      .join(' ')
      .toLocaleLowerCase();
  }
}
