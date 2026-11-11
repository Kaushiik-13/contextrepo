import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createPrivateKey,
  createSign,
  randomBytes,
} from 'node:crypto';
import { DatabaseService } from '../database/database.service';

type GithubUser = { id: number; login: string; avatar_url: string };
type GithubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  owner: { login: string };
};

@Injectable()
export class GithubService {
  constructor(private readonly db: DatabaseService) {}

  isConfigured() {
    if (
      !process.env.GITHUB_APP_SLUG ||
      !process.env.GITHUB_APP_ID ||
      !process.env.GITHUB_CLIENT_ID ||
      !process.env.GITHUB_CLIENT_SECRET ||
      !process.env.GITHUB_PRIVATE_KEY
    ) {
      return false;
    }
    try {
      createPrivateKey(this.privateKeyPem());
      return true;
    } catch {
      return false;
    }
  }

  newState() {
    return randomBytes(32).toString('base64url');
  }

  authorizationUrl(state: string) {
    this.requireConfiguration();
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
    url.searchParams.set('redirect_uri', this.callbackUrl());
    url.searchParams.set('state', state);
    return url.toString();
  }

  installationUrl(state: string) {
    this.requireConfiguration();
    return `https://github.com/apps/${process.env.GITHUB_APP_SLUG}/installations/new?state=${encodeURIComponent(state)}`;
  }

  verifyState(actual: string | undefined, expected: string | undefined) {
    if (!actual || !expected || actual !== expected) {
      throw new UnauthorizedException(
        'GitHub sign-in expired. Please try again.',
      );
    }
  }

  async finishAuthorization(code: string, intent: 'login' | 'signup') {
    this.requireConfiguration();
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: this.callbackUrl(),
        }),
      },
    );
    const tokenBody = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };
    if (!tokenResponse.ok || !tokenBody.access_token) {
      throw new UnauthorizedException(
        'GitHub could not complete sign-in. Please try again.',
      );
    }

    const response = await fetch('https://api.github.com/user', {
      headers: this.userHeaders(tokenBody.access_token),
    });
    if (!response.ok)
      throw new BadGatewayException('Could not read your GitHub profile.');
    const user = (await response.json()) as GithubUser;
    let userId: string;
    let isNewUser = false;
    if (intent === 'login') {
      const existing = await this.db.query<{ id: string }>(
        'SELECT id FROM app_users WHERE github_user_id = $1',
        [user.id],
      );
      if (!existing.rowCount) {
        return { accountStatus: 'not_found' as const };
      }
      userId = existing.rows[0].id;
      await this.db.query(
        `UPDATE app_users
         SET github_login = $1, avatar_url = $2, updated_at = NOW()
         WHERE id = $3`,
        [user.login, user.avatar_url, userId],
      );
    } else {
      const inserted = await this.db.query<{ id: string }>(
        `INSERT INTO app_users (github_user_id, github_login, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (github_user_id) DO NOTHING
       RETURNING id`,
        [user.id, user.login, user.avatar_url],
      );
      if (!inserted.rowCount) {
        return { accountStatus: 'already_exists' as const };
      }
      userId = inserted.rows[0].id;
      isNewUser = true;
    }

    const session = randomBytes(32).toString('base64url');
    const sessionHash = this.hash(session);
    await this.db.query(
      `INSERT INTO app_sessions (session_hash, user_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [sessionHash, userId],
    );
    const projectResult = await this.db.query(
      'SELECT 1 FROM connected_projects WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    const installationResult = await this.db.query(
      'SELECT 1 FROM github_installations WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    return {
      accountStatus: 'authenticated' as const,
      session,
      userId,
      isNewUser,
      accessToken: tokenBody.access_token,
      hasProject: Boolean(projectResult.rowCount),
      hasInstallation: Boolean(installationResult.rowCount),
      user: { login: user.login, avatarUrl: user.avatar_url },
    };
  }

  async savePendingAuthorization(
    userId: string,
    state: string,
    accessToken: string,
  ) {
    await this.db.query(
      'DELETE FROM github_pending_authorizations WHERE expires_at <= NOW()',
    );
    await this.db.query(
      `INSERT INTO github_pending_authorizations (state_hash, user_id, encrypted_access_token, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')
       ON CONFLICT (state_hash) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         encrypted_access_token = EXCLUDED.encrypted_access_token,
         expires_at = EXCLUDED.expires_at`,
      [this.hash(state), userId, this.encrypt(accessToken)],
    );
  }

  async verifyAndSaveInstallation(
    userId: string,
    installationId: number,
    state: string,
  ) {
    const pending = await this.db.query<{ encrypted_access_token: string }>(
      `SELECT encrypted_access_token FROM github_pending_authorizations
       WHERE state_hash = $1 AND user_id = $2 AND expires_at > NOW()`,
      [this.hash(state), userId],
    );
    if (!pending.rowCount) {
      throw new UnauthorizedException(
        'GitHub setup expired. Please reconnect and try again.',
      );
    }

    const userToken = this.decrypt(pending.rows[0].encrypted_access_token);
    let accessible = false;
    for (let page = 1; ; page += 1) {
      const response = await fetch(
        `https://api.github.com/user/installations?per_page=100&page=${page}`,
        { headers: this.userHeaders(userToken) },
      );
      if (!response.ok) {
        throw new BadGatewayException(
          'Could not verify that this GitHub installation belongs to your account.',
        );
      }
      const body = (await response.json()) as {
        installations: Array<{ id: number; app_id: number }>;
      };
      if (
        body.installations.some(
          (item) =>
            item.id === installationId &&
            item.app_id === Number(process.env.GITHUB_APP_ID),
        )
      ) {
        accessible = true;
        break;
      }
      if (body.installations.length < 100) break;
    }
    if (!accessible) {
      throw new UnauthorizedException(
        'GitHub did not confirm this installation for your account.',
      );
    }

    const accountLogin = await this.saveInstallation(userId, installationId);
    await this.db.query(
      'DELETE FROM github_pending_authorizations WHERE state_hash = $1',
      [this.hash(state)],
    );
    return accountLogin;
  }

  async progress(userId: string) {
    const [project, installation] = await Promise.all([
      this.db.query(
        'SELECT 1 FROM connected_projects WHERE user_id = $1 LIMIT 1',
        [userId],
      ),
      this.db.query(
        'SELECT 1 FROM github_installations WHERE user_id = $1 LIMIT 1',
        [userId],
      ),
    ]);
    return {
      hasProject: Boolean(project.rowCount),
      hasInstallation: Boolean(installation.rowCount),
    };
  }

  async currentUser(session: string | undefined) {
    if (!session)
      throw new UnauthorizedException('Please sign in with GitHub.');
    const result = await this.db.query<{
      id: string;
      github_login: string;
      avatar_url: string | null;
    }>(
      `SELECT u.id, u.github_login, u.avatar_url
       FROM app_sessions s JOIN app_users u ON u.id = s.user_id
       WHERE s.session_hash = $1 AND s.expires_at > NOW()`,
      [this.hash(session)],
    );
    if (!result.rowCount)
      throw new UnauthorizedException(
        'Your session expired. Please sign in again.',
      );
    return {
      id: result.rows[0].id,
      login: result.rows[0].github_login,
      avatarUrl: result.rows[0].avatar_url,
    };
  }

  async signOut(session: string | undefined) {
    if (session)
      await this.db.query('DELETE FROM app_sessions WHERE session_hash = $1', [
        this.hash(session),
      ]);
  }

  async saveInstallation(userId: string, installationId: number) {
    const installation = await this.appRequest<{
      id: number;
      app_id: number;
      account: { id: number; login: string };
    }>(`/app/installations/${installationId}`);
    if (installation.app_id !== Number(process.env.GITHUB_APP_ID)) {
      throw new UnauthorizedException(
        'This installation does not belong to the ContextOps GitHub App.',
      );
    }
    await this.db.query(
      `INSERT INTO github_installations (installation_id, user_id, github_account_id, account_login)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (installation_id) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         github_account_id = EXCLUDED.github_account_id,
         account_login = EXCLUDED.account_login`,
      [
        installation.id,
        userId,
        installation.account.id,
        installation.account.login,
      ],
    );
    return installation.account.login;
  }

  async relinkExistingProject(userId: string, installationId: number) {
    const projectResult = await this.db.query<{ repository_id: string }>(
      'SELECT repository_id FROM connected_projects WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    if (!projectResult.rowCount) return false;
    const repositoryId = Number(projectResult.rows[0].repository_id);
    const token = await this.installationToken(String(installationId));
    const repositories = await this.repositoriesForInstallation(
      token,
      repositoryId,
    );
    if (!repositories) return false;
    await this.db.query(
      `UPDATE connected_projects
       SET installation_id = $1, connection_status = 'connected', last_verified_at = NOW(), updated_at = NOW()
       WHERE user_id = $2`,
      [installationId, userId],
    );
    return true;
  }

  async verifyProjectConnection(installationId: string, repositoryId: string) {
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}`,
      {
        headers: this.githubHeaders(this.appJwt()),
      },
    );
    if (response.status === 404) return 'revoked' as const;
    if (!response.ok)
      throw new BadGatewayException(
        'Could not verify the GitHub repository connection.',
      );
    const installation = (await response.json()) as {
      suspended_at?: string | null;
      app_id?: number;
    };
    if (installation.app_id !== Number(process.env.GITHUB_APP_ID))
      return 'revoked' as const;
    if (installation.suspended_at) return 'suspended' as const;
    const token = await this.installationToken(installationId);
    const repository = await this.repositoriesForInstallation(
      token,
      Number(repositoryId),
    );
    return repository
      ? ('connected' as const)
      : ('repository_access_removed' as const);
  }

  async repositories(userId: string) {
    const installations = await this.db.query<{ installation_id: string }>(
      'SELECT installation_id FROM github_installations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    if (!installations.rowCount)
      throw new NotFoundException('Connect a GitHub account to continue.');
    const all: GithubRepository[] = [];
    for (const row of installations.rows) {
      const token = await this.installationToken(row.installation_id);
      for (let page = 1; ; page += 1) {
        const response = await fetch(
          `https://api.github.com/installation/repositories?per_page=100&page=${page}`,
          { headers: this.githubHeaders(token) },
        );
        if (!response.ok)
          throw new BadGatewayException(
            'Could not load the repositories approved for ContextOps.',
          );
        const body = (await response.json()) as {
          repositories: GithubRepository[];
        };
        all.push(...body.repositories);
        if (body.repositories.length < 100) break;
      }
    }
    return [...new Map(all.map((repo) => [repo.id, repo])).values()]
      .sort((a, b) => a.full_name.localeCompare(b.full_name))
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        isPrivate: repo.private,
        defaultBranch: repo.default_branch,
      }));
  }

  async selectedInstallation(userId: string, repositoryId: number) {
    const installations = await this.db.query<{ installation_id: string }>(
      'SELECT installation_id FROM github_installations WHERE user_id = $1',
      [userId],
    );
    for (const row of installations.rows) {
      const token = await this.installationToken(row.installation_id);
      for (let page = 1; ; page += 1) {
        const response = await fetch(
          `https://api.github.com/installation/repositories?per_page=100&page=${page}`,
          { headers: this.githubHeaders(token) },
        );
        if (!response.ok) break;
        const body = (await response.json()) as {
          repositories: GithubRepository[];
        };
        const repo = body.repositories.find((item) => item.id === repositoryId);
        if (repo) return { repo, installationId: row.installation_id, token };
        if (body.repositories.length < 100) break;
      }
    }
    throw new NotFoundException(
      'That repository is not available to this GitHub App installation.',
    );
  }

  private async repositoriesForInstallation(
    token: string,
    repositoryId: number,
  ) {
    for (let page = 1; ; page += 1) {
      const response = await fetch(
        `https://api.github.com/installation/repositories?per_page=100&page=${page}`,
        { headers: this.githubHeaders(token) },
      );
      if (!response.ok)
        throw new BadGatewayException(
          'Could not verify repository access in GitHub.',
        );
      const body = (await response.json()) as {
        repositories: GithubRepository[];
      };
      const repository = body.repositories.find(
        (item) => item.id === repositoryId,
      );
      if (repository) return repository;
      if (body.repositories.length < 100) return null;
    }
  }

  async contextFolderExists(token: string, owner: string, repo: string) {
    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/context`,
      { headers: this.githubHeaders(token) },
    );
    if (response.status === 404) return false;
    if (!response.ok)
      throw new BadGatewayException(
        'Could not check the context folder in GitHub.',
      );
    const result = (await response.json()) as
      { type?: string } | Array<{ type?: string }>;
    return Array.isArray(result) || result.type === 'dir';
  }

  async createContextReadme(
    token: string,
    owner: string,
    repo: string,
    branch: string,
  ) {
    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/context/README.md`,
      {
        method: 'PUT',
        headers: {
          ...this.githubHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'chore: initialize ContextOps context folder',
          branch,
          content: Buffer.from(
            '# Project context\n\nApproved project context records are stored in this folder.\n',
          ).toString('base64'),
        }),
      },
    );
    if (response.status === 422) {
      const exists = await this.contextFolderExists(token, owner, repo);
      if (exists) return;
    }
    if (!response.ok)
      throw new BadGatewayException(
        'GitHub could not create the context folder. Check the app permissions and try again.',
      );
  }

  private async installationToken(installationId: string) {
    const jwt = this.appJwt();
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      { method: 'POST', headers: this.githubHeaders(jwt) },
    );
    if (!response.ok)
      throw new BadGatewayException(
        'GitHub authorization needs to be refreshed. Reconnect the GitHub App.',
      );
    const body = (await response.json()) as { token: string };
    return body.token;
  }

  private appJwt() {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        iat: now - 60,
        exp: now + 8 * 60,
        iss: process.env.GITHUB_APP_ID,
      }),
    ).toString('base64url');
    const unsigned = `${header}.${payload}`;
    const key = createPrivateKey(this.privateKeyPem());
    const signer = createSign('RSA-SHA256');
    signer.update(unsigned);
    signer.end();
    return `${unsigned}.${signer.sign(key, 'base64url')}`;
  }

  private async appRequest<T>(path: string): Promise<T> {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: this.githubHeaders(this.appJwt()),
    });
    if (!response.ok)
      throw new BadGatewayException(
        'Could not verify the GitHub App installation.',
      );
    return (await response.json()) as T;
  }

  private userHeaders(token: string) {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ContextOps',
    };
  }

  private githubHeaders(token: string) {
    return this.userHeaders(token);
  }

  private callbackUrl() {
    const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4000';
    return `${apiOrigin}/api/auth/github/callback`;
  }

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private encryptionKey() {
    return createHash('sha256')
      .update(
        `${process.env.GITHUB_APP_ID}:${process.env.GITHUB_CLIENT_SECRET}:contextops-pending-oauth-v1`,
      )
      .digest();
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    return [iv, cipher.getAuthTag(), encrypted]
      .map((part) => part.toString('base64url'))
      .join('.');
  }

  private decrypt(value: string) {
    const [ivPart, tagPart, encryptedPart] = value.split('.');
    if (!ivPart || !tagPart || !encryptedPart) {
      throw new UnauthorizedException(
        'GitHub authorization has expired. Please reconnect.',
      );
    }
    try {
      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.encryptionKey(),
        Buffer.from(ivPart, 'base64url'),
      );
      decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
      return Buffer.concat([
        decipher.update(Buffer.from(encryptedPart, 'base64url')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new UnauthorizedException(
        'GitHub authorization has expired. Please reconnect.',
      );
    }
  }

  private privateKeyPem() {
    const value = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n').trim();
    return value
      .replace(/^(-----BEGIN (?:RSA )?PRIVATE KEY-----)\s*/, '$1\n')
      .replace(/\s*(-----END (?:RSA )?PRIVATE KEY-----)$/, '\n$1');
  }

  private requireConfiguration() {
    if (!this.isConfigured()) {
      throw new NotFoundException(
        'GitHub App setup is incomplete. Add the GitHub App settings to apps/api/.env.',
      );
    }
  }
}
