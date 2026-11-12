import { Module } from '@nestjs/common';
import { GithubModule } from '../github/github.module';
import { ProposalsController } from './proposals.controller';
import { ProposalService } from './proposal.service';
import { McpController } from './mcp.controller';
import { ContextModule } from '../context/context.module';

@Module({
  imports: [GithubModule, ContextModule],
  controllers: [ProposalsController, McpController],
  providers: [ProposalService],
})
export class ProposalsModule {}
