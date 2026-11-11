import {
  Controller,
  Get,
  ForbiddenException,
  Headers,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GithubService } from './github.service';

const SESSION_COOKIE = 'contextops_session';
const OAUTH_COOKIE = 'contextops_oauth_state';
const INSTALL_COOKIE = 'contextops_install_state';
const RECONNECT_COOKIE = 'contextops_reconnect';

@Controller('auth/github')
export class GithubAuthController {
  constructor(private readonly github: GithubService) {}

  @Get('config')
  config() {
    return { configured: this.github.isConfigured() };
  }

  @Get('start')
  start(
    @Query('intent') intent: string | undefined,
    @Res() response: Response,
  ) {
    const authIntent = intent === 'signup' ? 'signup' : 'login';
    return this.beginAuthorization(response, authIntent);
  }

  @Get('reconnect')
  reconnect(@Res() response: Response) {
    response.cookie(RECONNECT_COOKIE, '1', this.cookieOptions(10 * 60 * 1000));
    return this.beginAuthorization(response, 'login');
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    let intent: 'login' | 'signup' = 'login';
    try {
      const storedState = this.cookie(request, OAUTH_COOKIE)?.split('.');
      const expectedState = storedState?.[0];
      intent = storedState?.[1] === 'signup' ? 'signup' : 'login';
      this.github.verifyState(state, expectedState);
      if (!code)
        throw new UnauthorizedException(
          'GitHub did not return a sign-in code.',
        );
      const result = await this.github.finishAuthorization(code, intent);
      response.clearCookie(OAUTH_COOKIE, { path: '/' });
      const reconnect = this.cookie(request, RECONNECT_COOKIE) === '1';
      response.clearCookie(RECONNECT_COOKIE, { path: '/' });
      if (result.accountStatus === 'not_found') {
        return response.redirect(this.webUrl('/login?error=account_not_found'));
      }
      if (result.accountStatus === 'already_exists') {
        return response.redirect(this.webUrl('/login?error=account_exists'));
      }
      response.cookie(
        SESSION_COOKIE,
        result.session,
        this.cookieOptions(7 * 24 * 60 * 60 * 1000),
      );
      if (result.isNewUser) {
        const installState = this.github.newState();
        await this.github.savePendingAuthorization(
          result.userId,
          installState,
          result.accessToken,
        );
        response.cookie(
          INSTALL_COOKIE,
          installState,
          this.cookieOptions(10 * 60 * 1000),
        );
        return response.redirect(this.github.installationUrl(installState));
      }
      if (result.hasProject && !reconnect) {
        return response.redirect(this.webUrl('/'));
      }
      if (result.hasInstallation && !result.hasProject && !reconnect) {
        return response.redirect(this.webUrl('/setup/repositories'));
      }
      const installState = this.github.newState();
      await this.github.savePendingAuthorization(
        result.userId,
        installState,
        result.accessToken,
      );
      response.cookie(
        INSTALL_COOKIE,
        installState,
        this.cookieOptions(10 * 60 * 1000),
      );
      return response.redirect(this.github.installationUrl(installState));
    } catch (error) {
      response.clearCookie(OAUTH_COOKIE, { path: '/' });
      response.clearCookie(RECONNECT_COOKIE, { path: '/' });
      return response.redirect(
        this.webUrl(`/${intent}?error=github_signin_failed`),
      );
    }
  }

  @Get('install/callback')
  async installationCallback(
    @Query('installation_id') installationId: string | undefined,
    @Query('state') state: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      this.github.verifyState(state, this.cookie(request, INSTALL_COOKIE));
      if (!installationId || !/^\d+$/.test(installationId)) {
        throw new UnauthorizedException(
          'GitHub App installation was not completed.',
        );
      }
      const user = await this.github.currentUser(
        this.cookie(request, SESSION_COOKIE),
      );
      await this.github.verifyAndSaveInstallation(
        user.id,
        Number(installationId),
        state!,
      );
      response.clearCookie(INSTALL_COOKIE, { path: '/' });
      if (
        await this.github.relinkExistingProject(user.id, Number(installationId))
      ) {
        return response.redirect(this.webUrl('/'));
      }
      return response.redirect(this.webUrl('/setup/repositories'));
    } catch (error) {
      response.clearCookie(INSTALL_COOKIE, { path: '/' });
      return response.redirect(
        this.webUrl(`/setup?error=github_install_failed`),
      );
    }
  }

  @Get('me')
  async me(@Req() request: Request) {
    const user = await this.github.currentUser(
      this.cookie(request, SESSION_COOKIE),
    );
    return { user };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res() response: Response,
    @Headers('origin') origin?: string,
  ) {
    this.requireSameOrigin(origin);
    await this.github.signOut(this.cookie(request, SESSION_COOKIE));
    response.clearCookie(SESSION_COOKIE, { path: '/' });
    return response.status(200).json({ ok: true });
  }

  private beginAuthorization(response: Response, intent: 'login' | 'signup') {
    const state = this.github.newState();
    response.cookie(
      OAUTH_COOKIE,
      `${state}.${intent}`,
      this.cookieOptions(10 * 60 * 1000),
    );
    return response.redirect(this.github.authorizationUrl(state));
  }

  private cookie(request: Request, name: string) {
    const raw = request.headers.cookie ?? '';
    for (const part of raw.split(';')) {
      const [key, ...value] = part.trim().split('=');
      if (key === name) return decodeURIComponent(value.join('='));
    }
    return undefined;
  }

  private cookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: (process.env.API_ORIGIN ?? '').startsWith('https://'),
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
    };
  }

  private webUrl(path: string) {
    return `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}${path}`;
  }

  private requireSameOrigin(origin?: string) {
    if (origin !== (process.env.WEB_ORIGIN ?? 'http://localhost:3000')) {
      throw new ForbiddenException(
        'This request did not come from the ContextOps app.',
      );
    }
  }
}
