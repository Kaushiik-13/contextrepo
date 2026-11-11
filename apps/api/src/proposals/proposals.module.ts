import { Module } from '@nestjs/common';
import { GithubModule } from '../github/github.module';
import { ProposalsController } from './proposals.controller';
import { ProposalService } from './proposal.service';
import { McpController } from './mcp.controller';

@Module({
  imports: [GithubModule],
  controllers: [ProposalsController, McpController],
  providers: [ProposalService],
})
export class ProposalsModule {}
