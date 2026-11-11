import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { GithubService } from '../github/github.service';

type ProjectRow = {
  id: string;
  user_id: string;
  installation_id: string;
  repository_id: string;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  is_private: boolean;
  default_branch: string;
  context_status: 'unchecked' | 'missing' | 'ready';
  connection_status:
    'connected' | 'revoked' | 'suspended' | 'repository_access_removed';
  last_verified_at: Date | null;
  connected_at?: Date;
  account_login?: string;
};

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly db: DatabaseService,
    private readonly github: GithubService,
  ) {}

  @Post('connect')
  async connect(
    @Req() request: Request,
    @Body() body: { repositoryId?: number },
    @Headers('origin') origin?: string,
  ) {
    this.requireSameOrigin(origin);
    const user = await this.currentUser(request);
    if (
      !Number.isSafeInteger(body.repositoryId) ||
      Number(body.repositoryId) <= 0
    ) {
      throw new BadRequestException('Choose a GitHub repository to continue.');
    }
    const { repo, installationId, token } =
      await this.github.selectedInstallation(
        user.id,
        Number(body.repositoryId),
      );
    const contextExists = await this.github.contextFolderExists(
      token,
      repo.owner.login,
      repo.name,
    );
    const result = await this.db.query<ProjectRow>(
      `INSERT INTO connected_projects
         (user_id, installation_id, repository_id, owner, name, full_name, description, is_private, default_branch, context_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id) DO UPDATE SET
         installation_id = EXCLUDED.installation_id,
         owner = EXCLUDED.owner,
         name = EXCLUDED.name,
         full_name = EXCLUDED.full_name,
         description = EXCLUDED.description,
         is_private = EXCLUDED.is_private,
         default_branch = EXCLUDED.default_branch,
         context_status = EXCLUDED.context_status,
         connection_status = 'connected',
         last_verified_at = NOW(),
         updated_at = NOW()
       RETURNING *`,
      [
        user.id,
        installationId,
        repo.id,
        repo.owner.login,
        repo.name,
        repo.full_name,
        repo.description,
        repo.private,
        repo.default_branch,
        contextExists ? 'ready' : 'missing',
      ],
    );
    return this.toClient(result.rows[0]);
  }

  @Get('current')
  async current(@Req() request: Request) {
    const user = await this.currentUser(request);
    const result = await this.db.query<ProjectRow>(
      `SELECT cp.*, cp.created_at AS connected_at, gi.account_login
       FROM connected_projects cp
       LEFT JOIN github_installations gi ON gi.installation_id = cp.installation_id
       WHERE cp.user_id = $1 LIMIT 1`,
      [user.id],
    );
    if (!result.rowCount) return { project: null };
    const row = result.rows[0];
    let connectionStatus: string = row.connection_status ?? 'connected';
    let lastVerifiedAt = row.last_verified_at;
    const recentlyVerified = row.last_verified_at
      ? Date.now() - new Date(row.last_verified_at).getTime() < 60_000
      : false;
    if (!recentlyVerified) {
      try {
        connectionStatus = await this.github.verifyProjectConnection(
          row.installation_id,
          row.repository_id,
        );
        await this.db.query(
          `UPDATE connected_projects
           SET connection_status = $1, last_verified_at = NOW()
           WHERE id = $2 AND user_id = $3`,
          [connectionStatus, row.id, user.id],
        );
        lastVerifiedAt = new Date();
      } catch {
        connectionStatus =
          row.connection_status === 'connected'
            ? 'verification_unavailable'
            : row.connection_status;
      }
    }
    return {
      project: {
        ...this.toClient(row),
        connectionStatus,
        accountLogin: row.account_login ?? null,
        connectedAt: row.connected_at,
        lastVerifiedAt,
        repositoryUrl: `https://github.com/${encodeURIComponent(row.owner)}/${encodeURIComponent(row.name)}`,
      },
    };
  }

  @Post(':id/initialize-context')
  async initializeContext(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) projectId: string,
    @Headers('origin') origin?: string,
  ) {
    this.requireSameOrigin(origin);
    const user = await this.currentUser(request);
    const result = await this.db.query<ProjectRow>(
      'SELECT * FROM connected_projects WHERE id = $1 AND user_id = $2',
      [projectId, user.id],
    );
    if (!result.rowCount)
      throw new BadRequestException('Choose a connected project first.');
    const project = result.rows[0];
    const access = await this.github.selectedInstallation(
      user.id,
      Number(project.repository_id),
    );
    await this.github.createContextReadme(
      access.token,
      project.owner,
      project.name,
      project.default_branch,
    );
    await this.db.query(
      "UPDATE connected_projects SET context_status = 'ready', updated_at = NOW() WHERE id = $1",
      [project.id],
    );
    return { project: { ...this.toClient(project), contextStatus: 'ready' } };
  }

  private async currentUser(request: Request) {
    const session = this.cookie(request, 'contextops_session');
    return this.github.currentUser(session);
  }

  private cookie(request: Request, name: string) {
    const raw = request.headers.cookie ?? '';
    for (const part of raw.split(';')) {
      const [key, ...value] = part.trim().split('=');
      if (key === name) return decodeURIComponent(value.join('='));
    }
    throw new UnauthorizedException('Please sign in with GitHub.');
  }

  private requireSameOrigin(origin?: string) {
    if (origin !== (process.env.WEB_ORIGIN ?? 'http://localhost:3000')) {
      throw new ForbiddenException(
        'This request did not come from the ContextOps app.',
      );
    }
  }

  private toClient(project: ProjectRow) {
    return {
      id: project.id,
      repositoryId: Number(project.repository_id),
      fullName: project.full_name,
      owner: project.owner,
      name: project.name,
      description: project.description,
      isPrivate: project.is_private,
      defaultBranch: project.default_branch,
      contextStatus: project.context_status,
      connectionStatus: project.connection_status ?? 'connected',
    };
  }
}
