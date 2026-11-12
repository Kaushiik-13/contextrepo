import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, createHash } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { GithubService } from '../github/github.service';
import { CONTEXT_TYPES, type ContextType } from '../context/context.types';
import matter from 'gray-matter';
import { ContextService } from '../context/context.service';

export type ProposalInput = {
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

@Injectable()
export class ProposalService {
  constructor(
    private readonly db: DatabaseService,
    private readonly github: GithubService,
    private readonly context: ContextService,
  ) {}

  async list(userId: string, statuses = ['draft']) {
    const result = await this.db.query<any>(
      `SELECT p.*, u.github_login AS owner FROM context_proposals p
       JOIN app_users u ON u.id = p.user_id WHERE p.user_id = $1
       AND p.project_id = (SELECT id FROM connected_projects WHERE user_id=$1 LIMIT 1)
       AND p.status = ANY($2::text[]) ORDER BY p.updated_at DESC`,
      [userId, statuses],
    );
    return { items: result.rows.map((row) => this.client(row)) };
  }

  async createDraft(userId: string, owner: string, body: unknown) {
    const project = await this.project(userId);
    const input = this.parse(body);
    const row = await this.db.query<any>(
      `INSERT INTO context_proposals (user_id,project_id,title,type,question,summary,rationale,tags,constraints,alternatives,discussion_summary,source_references)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *, $13::text AS owner`,
      [
        userId,
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
        owner,
      ],
    );
    return this.client(row.rows[0]);
  }

  async update(userId: string, id: string, body: unknown) {
    const input = this.parse(body);
    const result = await this.db.query<any>(
      `UPDATE context_proposals SET title=$1,type=$2,question=$3,summary=$4,rationale=$5,tags=$6,constraints=$7,alternatives=$8,discussion_summary=$9,source_references=$10,updated_at=NOW()
       WHERE id=$11 AND user_id=$12 AND status='draft' RETURNING *, (SELECT github_login FROM app_users WHERE id=user_id) AS owner`,
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
        userId,
      ],
    );
    if (!result.rowCount)
      throw new NotFoundException('That draft was not found.');
    return this.client(result.rows[0]);
  }

  async review(
    userId: string,
    id: string,
    decision: 'approve' | 'reject',
    note = '',
  ) {
    const found = await this.db.query<any>(
      `SELECT p.*,u.github_login AS owner FROM context_proposals p JOIN app_users u ON u.id=p.user_id WHERE p.id=$1 AND p.user_id=$2 AND p.status='draft'`,
      [id, userId],
    );
    if (!found.rowCount)
      throw new NotFoundException('That draft was not found.');
    const p = found.rows[0];
    if (decision === 'reject') {
      const out = await this.db.query<any>(
        `UPDATE context_proposals SET status='rejected',reviewed_at=NOW(),review_note=$3,updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING *, (SELECT github_login FROM app_users WHERE id=$2) AS owner`,
        [id, userId, note.slice(0, 2000)],
      );
      return this.client(out.rows[0]);
    }
    const missing = ['question', 'summary', 'rationale'].filter(
      (key) => !String(p[key] ?? '').trim(),
    );
    if (missing.length)
      throw new BadRequestException(
        `Complete these fields before approval: ${missing.join(', ')}.`,
      );
    const project = await this.project(userId);
    const published = await this.github.publishContextRecord(userId, {
      id: p.id,
      projectId: project.id,
      title: p.title,
      type: p.type,
      status: 'approved',
      updatedAt: new Date().toISOString().slice(0, 10),
      owner: p.owner,
      question: p.question,
      summary: p.summary,
      rationale: p.rationale,
      tags: p.tags ?? [],
      constraints: p.constraints ?? [],
      alternatives: p.alternatives ?? [],
      discussionSummary: p.discussion_summary,
      sourceReferences: p.source_references ?? [],
    });
    await this.db.query(
      `INSERT INTO active_context_releases(project_id,github_commit_sha,branch,updated_at)
       VALUES($1,$2,$3,NOW()) ON CONFLICT(project_id) DO UPDATE SET
       github_commit_sha=EXCLUDED.github_commit_sha,branch=EXCLUDED.branch,updated_at=NOW()`,
      [project.id, published.commitSha, published.branch],
    );
    const out = await this.db.query<any>(
      `UPDATE context_proposals SET status='approved',reviewed_at=NOW(),review_note=$3,published_path=$4,published_commit_sha=$5,updated_at=NOW() WHERE id=$1 AND user_id=$2 AND status='draft' RETURNING *, (SELECT github_login FROM app_users WHERE id=$2) AS owner`,
      [id, userId, note.slice(0, 2000), published.path, published.commitSha],
    );
    if (!out.rowCount)
      throw new NotFoundException('That draft was already reviewed.');
    return this.client(out.rows[0]);
  }

  async conflicts(userId: string, id: string) {
    const result = await this.db.query<any>(
      `SELECT id,title,question,summary FROM context_proposals WHERE id=$1 AND user_id=$2 AND status='draft'`,
      [id, userId],
    );
    if (!result.rowCount)
      throw new NotFoundException('That draft was not found.');
    const candidate = result.rows[0];
    const key = (value: string) =>
      value
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    const source = await this.github.readContextFiles(userId);
    const matches = [] as Array<{
      path: string;
      title: string;
      summary: string;
    }>;
    for (const file of source.files) {
      try {
        const parsed = matter(file.content);
        const data = parsed.data as Record<string, unknown>;
        if (data.status !== 'approved') continue;
        const title = String(data.title ?? '');
        const question = String(data.question ?? data.problem ?? '');
        const summary = String(data.summary ?? data.outcome ?? '');
        const sameTopic =
          (key(title) !== '' && key(title) === key(candidate.title)) ||
          (key(question) !== '' && key(question) === key(candidate.question));
        if (sameTopic && key(summary) !== key(candidate.summary))
          matches.push({ path: file.path, title, summary });
      } catch {
        /* malformed repository records are already reported by the library reader */
      }
    }
    return { matches };
  }

  async createToken(userId: string) {
    const raw = `ctxops_${randomBytes(32).toString('base64url')}`;
    const hash = createHash('sha256').update(raw).digest('hex');
    await this.db.query(
      `UPDATE mcp_access_tokens SET revoked_at=NOW() WHERE user_id=$1 AND revoked_at IS NULL`,
      [userId],
    );
    const result = await this.db.query<any>(
      `INSERT INTO mcp_access_tokens(user_id,token_hash,token_prefix) VALUES($1,$2,$3) RETURNING id,token_prefix,created_at`,
      [userId, hash, raw.slice(0, 14)],
    );
    return { ...result.rows[0], token: raw };
  }
  async tokenInfo(userId: string) {
    const result = await this.db.query<any>(
      `SELECT token_prefix,created_at,last_used_at FROM mcp_access_tokens WHERE user_id=$1 AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );
    return result.rows[0] ?? null;
  }
  async revokeToken(userId: string) {
    await this.db.query(
      `UPDATE mcp_access_tokens SET revoked_at=NOW() WHERE user_id=$1 AND revoked_at IS NULL`,
      [userId],
    );
  }
  async userForToken(token: string) {
    const hash = createHash('sha256').update(token).digest('hex');
    const row = await this.db.query<{ user_id: string }>(
      `UPDATE mcp_access_tokens SET last_used_at=NOW() WHERE token_hash=$1 AND revoked_at IS NULL RETURNING user_id`,
      [hash],
    );
    return row.rows[0]?.user_id ?? null;
  }

  async searchApprovedContext(userId: string, query?: string, type?: string) {
    const project = await this.db.query<{ id: string }>(
      `SELECT id FROM connected_projects WHERE user_id=$1 LIMIT 1`,
      [userId],
    );
    if (!project.rowCount)
      throw new NotFoundException(
        'Connect a project before requesting context.',
      );
    let release = await this.db.query<{
      github_commit_sha: string;
      branch: string;
    }>(
      `SELECT github_commit_sha,branch FROM active_context_releases WHERE project_id=$1`,
      [project.rows[0].id],
    );
    if (!release.rowCount) {
      const head = await this.github.currentContextHead(userId);
      await this.db.query(
        `INSERT INTO active_context_releases(project_id,github_commit_sha,branch) VALUES($1,$2,$3) ON CONFLICT(project_id) DO NOTHING`,
        [project.rows[0].id, head.commitSha, head.branch],
      );
      release = await this.db.query<{
        github_commit_sha: string;
        branch: string;
      }>(
        `SELECT github_commit_sha,branch FROM active_context_releases WHERE project_id=$1`,
        [project.rows[0].id],
      );
    }
    const version = release.rows[0];
    const result = await this.context.list(
      userId,
      query,
      type,
      version.github_commit_sha,
    );
    return {
      repository: result.repository,
      branch: version.branch,
      version: version.github_commit_sha,
      total: result.total,
      items: result.items.map((item) => ({ ...item, source: item.sourcePath })),
    };
  }

  private async project(userId: string) {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM connected_projects WHERE user_id=$1 LIMIT 1`,
      [userId],
    );
    if (!result.rowCount)
      throw new NotFoundException('Connect a project before using proposals.');
    return result.rows[0];
  }
  private parse(body: unknown): ProposalInput {
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new BadRequestException('Enter proposal details.');
    const b = body as Record<string, unknown>;
    const txt = (k: string, max: number) => {
      const v = b[k];
      if (v == null) return '';
      if (typeof v !== 'string' || v.length > max)
        throw new BadRequestException(`Check the ${k} field.`);
      return v.trim();
    };
    const list = (k: string, max: number, itemMax: number) => {
      const v = b[k];
      if (v == null) return [];
      if (
        !Array.isArray(v) ||
        v.length > max ||
        v.some((x) => typeof x !== 'string' || x.length > itemMax)
      )
        throw new BadRequestException(`Check the ${k} list.`);
      return (v as string[]).map((x) => x.trim()).filter(Boolean);
    };
    const type = txt('type', 40);
    if (!CONTEXT_TYPES.includes(type as ContextType))
      throw new BadRequestException('Choose a valid context type.');
    const title = txt('title', 180);
    if (!title) throw new BadRequestException('Add a title.');
    return {
      title,
      type: type as ContextType,
      question: txt('question', 5000),
      summary: txt('summary', 5000),
      rationale: txt('rationale', 10000),
      tags: list('tags', 30, 80),
      constraints: list('constraints', 50, 500),
      alternatives: list('alternatives', 50, 500),
      discussionSummary: txt('discussionSummary', 10000),
      sourceReferences: list('sourceReferences', 50, 1000),
    };
  }
  private client(r: any) {
    return {
      id: r.id,
      projectId: r.project_id,
      title: r.title,
      type: r.type,
      status: r.status,
      question: r.question,
      summary: r.summary,
      rationale: r.rationale,
      tags: r.tags ?? [],
      constraints: r.constraints ?? [],
      alternatives: r.alternatives ?? [],
      discussionSummary: r.discussion_summary,
      sourceReferences: r.source_references ?? [],
      owner: r.owner,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      publishedPath: r.published_path,
      publishedCommitSha: r.published_commit_sha,
      reviewNote: r.review_note,
    };
  }
}
