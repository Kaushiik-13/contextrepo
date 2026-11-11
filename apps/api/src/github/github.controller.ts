import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly github: GithubService) {}

  @Get('repositories')
  async repositories(@Req() request: Request) {
    const user = await this.github.currentUser(
      this.cookie(request, 'contextops_session'),
    );
    return { items: await this.github.repositories(user.id) };
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
