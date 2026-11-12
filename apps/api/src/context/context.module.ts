import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { GithubModule } from '../github/github.module';
import { GithubContextRepository } from './github-context.repository';
import { CONTEXT_REPOSITORY } from './context.types';

@Module({
  imports: [GithubModule],
  controllers: [ContextController],
  providers: [
    ContextService,
    { provide: CONTEXT_REPOSITORY, useClass: GithubContextRepository },
  ],
  exports: [ContextService],
})
export class ContextModule {}
