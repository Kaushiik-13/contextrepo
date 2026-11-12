import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { ProposalService } from './proposal.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly proposals: ProposalService) {}

  @Post()
  async handle(@Req() req: Request, @Res() res: Response) {
    const authorization = req.header('authorization') ?? '';
    const token = authorization.match(
      /^Bearer\s+(ctxops_[A-Za-z0-9_-]+)$/i,
    )?.[1];
    if (!token)
      throw new UnauthorizedException('Use a ContextOps MCP access token.');
    const userId = await this.proposals.userForToken(token);
    if (!userId)
      throw new UnauthorizedException(
        'This MCP access token is invalid or revoked.',
      );

    const server = new McpServer({ name: 'contextops', version: '1.0.0' });
    server.tool(
      'search_approved_context',
      'Search the active, approved project context snapshot. Drafts and rejected proposals are never returned. Results include the GitHub source path and pinned commit version.',
      {
        query: z.string().max(500).optional(),
        type: z
          .enum([
            'decision',
            'requirement',
            'constraint',
            'research',
            'rejected-approach',
            'open-question',
            'project-state',
          ])
          .optional(),
      },
      async ({ query, type }) => {
        const result = await this.proposals.searchApprovedContext(
          userId,
          query,
          type,
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      },
    );
    server.tool(
      'submit_context_proposal',
      'Save a proposed project context record as a draft in ContextOps. A person must review and approve it in ContextOps; this tool cannot approve or publish.',
      {
        title: z.string().min(1).max(180),
        type: z.enum([
          'decision',
          'requirement',
          'constraint',
          'research',
          'rejected-approach',
          'open-question',
          'project-state',
        ]),
        question: z.string().max(5000),
        summary: z.string().max(5000),
        rationale: z.string().max(10000),
        tags: z.array(z.string().max(80)).max(30).optional(),
        constraints: z.array(z.string().max(500)).max(50).optional(),
        alternatives: z.array(z.string().max(500)).max(50).optional(),
        discussionSummary: z.string().max(10000).optional(),
        sourceReferences: z.array(z.string().max(1000)).max(50).optional(),
      },
      async (input) => {
        const proposal = await this.proposals.createDraft(
          userId,
          'AI assistant',
          input,
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  message:
                    'Draft saved in ContextOps for human review. It has not been approved or published.',
                  proposal,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
  }
}
