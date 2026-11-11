import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { GithubService } from '../github/github.service';
import { ProposalService } from './proposal.service';

@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly github: GithubService,
    private readonly proposals: ProposalService,
  ) {}

  @Get() async list(@Req() req: Request, @Headers('accept') _accept?: string) {
    const user = await this.user(req);
    const url = new URL(req.originalUrl, 'http://localhost');
    const status = url.searchParams.get('status') ?? 'draft';
    return this.proposals.list(
      user.id,
      status === 'all' ? ['draft', 'approved', 'rejected'] : [status],
    );
  }
  @Post() async create(
    @Req() req: Request,
    @Body() body: unknown,
    @Headers('origin') origin?: string,
  ) {
    this.origin(origin);
    const user = await this.user(req);
    return {
      proposal: await this.proposals.createDraft(user.id, user.login, body),
    };
  }
  @Patch(':id') async update(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Headers('origin') origin?: string,
  ) {
    this.origin(origin);
    const user = await this.user(req);
    return { proposal: await this.proposals.update(user.id, id, body) };
  }
  @Post(':id/approve') async approve(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Headers('origin') origin?: string,
  ) {
    this.origin(origin);
    const user = await this.user(req);
    const note = this.note(body);
    return {
      proposal: await this.proposals.review(user.id, id, 'approve', note),
    };
  }
  @Get(':id/conflicts') async conflicts(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const user = await this.user(req);
    return this.proposals.conflicts(user.id, id);
  }
  @Post(':id/reject') async reject(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Headers('origin') origin?: string,
  ) {
    this.origin(origin);
    const user = await this.user(req);
    const note = this.note(body);
    return {
      proposal: await this.proposals.review(user.id, id, 'reject', note),
    };
  }
  @Get('mcp-token') async token(@Req() req: Request) {
    const user = await this.user(req);
    return { token: await this.proposals.tokenInfo(user.id) };
  }
  @Post('mcp-token') async newToken(
    @Req() req: Request,
    @Headers('origin') origin?: string,
  ) {
    this.origin(origin);
    const user = await this.user(req);
    return this.proposals.createToken(user.id);
  }
  @Post('mcp-token/revoke') async revokeToken(
    @Req() req: Request,
    @Headers('origin') origin?: string,
  ) {
    this.origin(origin);
    const user = await this.user(req);
    await this.proposals.revokeToken(user.id);
    return { revoked: true };
  }

  private async user(req: Request) {
    return this.github.currentUser(this.cookie(req));
  }
  private cookie(req: Request) {
    const found = (req.headers.cookie ?? '')
      .split(';')
      .map((x) => x.trim())
      .find((x) => x.startsWith('contextops_session='));
    if (!found) throw new UnauthorizedException('Please sign in with GitHub.');
    try {
      return decodeURIComponent(found.slice('contextops_session='.length));
    } catch {
      throw new UnauthorizedException('Please sign in with GitHub.');
    }
  }
  private origin(value?: string) {
    if (value !== (process.env.WEB_ORIGIN ?? 'http://localhost:3000'))
      throw new ForbiddenException(
        'This request did not come from the ContextOps app.',
      );
  }
  private note(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
    const note = (value as Record<string, unknown>).note;
    if (note == null) return '';
    if (typeof note !== 'string')
      throw new ForbiddenException('Review note must be text.');
    return note.slice(0, 2000).trim();
  }
}
