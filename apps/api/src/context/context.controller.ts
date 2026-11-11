import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ContextService } from './context.service';
import { GithubService } from '../github/github.service';

@Controller('context')
export class ContextController {
  constructor(
    private readonly contextService: ContextService,
    private readonly github: GithubService,
  ) {}

  @Get()
  async list(
    @Req() request: Request,
    @Query('q') query?: string,
    @Query('type') type?: string,
  ) {
    const user = await this.github.currentUser(
      this.cookie(request, 'contextops_session'),
    );
    return this.contextService.list(user.id, query, type);
  }

  @Get(':id')
  async getById(@Req() request: Request, @Param('id') id: string) {
    const user = await this.github.currentUser(
      this.cookie(request, 'contextops_session'),
    );
    return this.contextService.getById(user.id, id);
  }

  private cookie(request: Request, name: string) {
    const raw = request.headers.cookie ?? '';
    const found = raw
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`));
    if (!found) throw new UnauthorizedException('Please sign in with GitHub.');
    return decodeURIComponent(found.slice(name.length + 1));
  }
}
