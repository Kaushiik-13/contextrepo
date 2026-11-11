import { Module } from '@nestjs/common';
import { GithubAuthController } from './github-auth.controller';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { ProjectsController } from '../projects/projects.controller';

@Module({
  controllers: [GithubAuthController, GithubController, ProjectsController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
