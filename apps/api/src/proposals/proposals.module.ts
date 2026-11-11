import { Module } from '@nestjs/common';
import { GithubModule } from '../github/github.module';
import { ProposalsController } from './proposals.controller';

@Module({
  imports: [GithubModule],
  controllers: [ProposalsController],
})
export class ProposalsModule {}
