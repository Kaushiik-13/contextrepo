import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { GithubService } from '../github/github.service';
import { CONTEXT_TYPES, type ContextType } from '../context/context.types';

type ProposalRow = {
  id: string;
  project_id: string;
  title: string;
  type: ContextType;
  status: 'draft';
  question: string;
  summary: string;
  rationale: string;
  tags: string[];
  constraints: string[];
  alternatives: string[];
  discussion_summary: string;
  source_references: string[];
  created_at: Date;
  updated_at: Date;
  owner: string;
};

type ProposalInput = {
  title: string;
  type: ContextType;
  question: string;
  summary: string;
  rationale: string;
  tags: string[];
  constraints: string[];
  alternatives: string[];
  discussionSummary: string;
  sourceReferences: string[];
};

@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly db: DatabaseService,
    private readonly github: GithubService,
  ) {}

  @Get()
  async list(@Req() request: Request) {
    const user = await this.currentUser(request);
    const project = await this.projectForUser(user.id);
    const result = await this.db.query<ProposalRow>(
      `SELECT p.*, u.github_login AS owner
       FROM context_proposals p
       JOIN app_users u ON u.id = p.user_id
       WHERE p.user_id = $1 AND p.project_id = $2 AND p.status = 'draft'
       ORDER BY p.updated_at DESC`,
      [user.id, project.id],
    );
    return { items: result.rows.map((row) => this.toClient(row)) };
  }

  @Post()
  async create(
    @Req() request: Request,
    @Body() body: unknown,
    @Headers('origin') origin?: string,
  ) {
    this.requireSameOrigin(origin);
    const user = await this.currentUser(request);
    const project = await this.projectForUser(user.id);
    const input = this.parseInput(body);
    const result = await this.db.query<ProposalRow>(
      `INSERT INTO context_proposals (
         user_id, project_id, title, type, question, summary, rationale,
         tags, constraints, alternatives, discussion_summary, source_references
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *, $13::TEXT AS owner`,
      [
        user.id,
        project.id,
        input.title,
        input.type,
        input.question,
        input.summary,
        input.rationale,
        input.tags,
        input.constraints,
        input.alternatives,
        input.discussionSummary,
        input.sourceReferences,
        user.login,
      ],
    );
    return { proposal: this.toClient(result.rows[0]) };
  }

  @Patch(':id')
  async update(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Headers('origin') origin?: string,
  ) {
    this.requireSameOrigin(origin);
    const user = await this.currentUser(request);
    const project = await this.projectForUser(user.id);
    const input = this.parseInput(body);
    const result = await this.db.query<ProposalRow>(
      `UPDATE context_proposals
       SET title = $1, type = $2, question = $3, summary = $4, rationale = $5,
           tags = $6, constraints = $7, alternatives = $8,
           discussion_summary = $9, source_references = $10, updated_at = NOW()
       WHERE id = $11 AND user_id = $12 AND project_id = $13 AND status = 'draft'
       RETURNING *, $14::TEXT AS owner`,
      [
        input.title,
        input.type,
        input.question,
        input.summary,
        input.rationale,
        input.tags,
        input.constraints,
        input.alternatives,
        input.discussionSummary,
        input.sourceReferences,
        id,
        user.id,
        project.id,
        user.login,
      ],
    );
    if (!result.rowCount)
      throw new NotFoundException('That draft was not found.');
    return { proposal: this.toClient(result.rows[0]) };
  }

  private async currentUser(request: Request) {
    return this.github.currentUser(this.cookie(request, 'contextops_session'));
  }

  private async projectForUser(userId: string) {
    const result = await this.db.query<{ id: string }>(
      'SELECT id FROM connected_projects WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    if (!result.rowCount)
      throw new NotFoundException('Connect a project before saving a draft.');
    return result.rows[0];
  }

  private parseInput(value: unknown): ProposalInput {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('Enter proposal details before saving.');
    }
    const body = value as Record<string, unknown>;
    const title = this.text(body.title, 'title', 180).trim();
    if (!title) throw new BadRequestException('Add a title to this draft.');
    const type = this.text(body.type, 'type', 40);
    if (!CONTEXT_TYPES.includes(type as ContextType)) {
      throw new BadRequestException(
        'Choose one of the available context types.',
      );
    }
    return {
      title,
      type: type as ContextType,
      question: this.text(body.question, 'question', 5000),
      summary: this.text(body.summary, 'summary', 5000),
      rationale: this.text(body.rationale, 'rationale', 10000),
      tags: this.textList(body.tags, 'tags', 30, 80),
      constraints: this.textList(body.constraints, 'constraints', 50, 500),
      alternatives: this.textList(body.alternatives, 'alternatives', 50, 500),
      discussionSummary: this.text(
        body.discussionSummary,
        'discussionSummary',
        10000,
      ),
      sourceReferences: this.textList(
        body.sourceReferences,
        'sourceReferences',
        50,
        1000,
      ),
    };
  }

  private text(value: unknown, field: string, maxLength: number) {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string' || value.length > maxLength) {
      throw new BadRequestException(`Check the ${field} field and try again.`);
    }
    return value.trim();
  }

  private textList(
    value: unknown,
    field: string,
    maxItems: number,
    maxLength: number,
  ) {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value) || value.length > maxItems) {
      throw new BadRequestException(`Check the ${field} list and try again.`);
    }
    return value
      .map((item) => {
        if (typeof item !== 'string' || item.length > maxLength) {
          throw new BadRequestException(
            `Check the ${field} list and try again.`,
          );
        }
        return item.trim();
      })
      .filter(Boolean);
  }

  private toClient(row: ProposalRow) {
    return {
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      type: row.type,
      status: row.status,
      question: row.question,
      summary: row.summary,
      rationale: row.rationale,
      tags: row.tags ?? [],
      constraints: row.constraints ?? [],
      alternatives: row.alternatives ?? [],
      discussionSummary: row.discussion_summary,
      sourceReferences: row.source_references ?? [],
      owner: row.owner,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private cookie(request: Request, name: string) {
    const raw = request.headers.cookie ?? '';
    const found = raw
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`));
    if (!found) throw new UnauthorizedException('Please sign in with GitHub.');
    try {
      return decodeURIComponent(found.slice(name.length + 1));
    } catch {
      throw new UnauthorizedException('Please sign in with GitHub.');
    }
  }

  private requireSameOrigin(origin?: string) {
    if (origin !== (process.env.WEB_ORIGIN ?? 'http://localhost:3000')) {
      throw new ForbiddenException(
        'This request did not come from the ContextOps app.',
      );
    }
  }
}
