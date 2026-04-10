import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { createTool } from '@mastra/core/tools';
import { Injectable } from '@nestjs/common';
import { MarketingProjectService } from '@gitroom/nestjs-libraries/database/prisma/marketing/marketing-project.service';
import z from 'zod';
import { checkAuth } from '@gitroom/nestjs-libraries/chat/auth.context';

@Injectable()
export class ProjectContextTool implements AgentToolInterface {
  constructor(private _projectService: MarketingProjectService) {}
  name = 'projectContext';

  run() {
    return createTool({
      id: 'projectContext',
      description: `Returns all marketing projects configured by the user. Each project contains product details, brand voice, target audience, niche, website URL, goals, competitors, and active campaigns. Use this BEFORE creating any content or campaign — it provides the strategic context the user has defined.`,
      inputSchema: z.object({}),
      mcp: {
        annotations: {
          title: 'Get Project Context',
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      outputSchema: z.object({
        projects: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            url: z.string(),
            niche: z.string(),
            targetAudience: z.string().nullable(),
            brandVoice: z.string().nullable(),
            brandColors: z.string().nullable(),
            competitors: z.string().nullable(),
            goals: z.string().nullable(),
            activeCampaigns: z.number(),
          })
        ),
      }),
      execute: async (inputData, context) => {
        checkAuth(inputData, context);
        const organizationId = JSON.parse(
          (context?.requestContext as any)?.get('organization') as string
        ).id;

        const projects = await this._projectService.getAll(organizationId);
        return {
          projects: projects.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            url: p.url,
            niche: p.niche,
            targetAudience: p.targetAudience ?? null,
            brandVoice: p.brandVoice ?? null,
            brandColors: p.brandColors ?? null,
            competitors: p.competitors ?? null,
            goals: p.goals ?? null,
            activeCampaigns: p.campaigns.filter((c) => c.status === 'ACTIVE').length,
          })),
        };
      },
    });
  }
}
