import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { createTool } from '@mastra/core/tools';
import { Injectable } from '@nestjs/common';
import { CampaignService } from '@gitroom/nestjs-libraries/database/prisma/marketing/campaign.service';
import { MarketingProjectService } from '@gitroom/nestjs-libraries/database/prisma/marketing/marketing-project.service';
import z from 'zod';
import { checkAuth } from '@gitroom/nestjs-libraries/chat/auth.context';

@Injectable()
export class CampaignPlanTool implements AgentToolInterface {
  constructor(
    private _campaignService: CampaignService,
    private _projectService: MarketingProjectService
  ) {}
  name = 'campaignPlan';

  run() {
    return createTool({
      id: 'campaignPlan',
      description: `Saves a strategic content plan and research brief to a campaign. Call this after you have researched the niche, audience, trends, and generated a structured content plan. The brief should include: research findings (SEO keywords, audience insights, platform recommendations, competitor gaps). The contentPlan should be a day-by-day or topic-by-topic plan with justified reasons for each piece of content.`,
      inputSchema: z.object({
        campaignId: z.string().describe('The campaign ID to update'),
        projectId: z.string().describe('The project ID this campaign belongs to'),
        brief: z.object({
          summary: z.string(),
          keywords: z.array(z.string()).optional(),
          audienceInsights: z.string().optional(),
          platformRecommendations: z.array(z.string()).optional(),
          competitorGaps: z.string().optional(),
          toneAndVoice: z.string().optional(),
        }),
        contentPlan: z.array(
          z.object({
            week: z.number().optional(),
            topic: z.string(),
            format: z.string().describe('e.g. carousel, short video, thread, article'),
            platforms: z.array(z.string()),
            hook: z.string(),
            cta: z.string().optional(),
            rationale: z.string().describe('Why this content will work'),
          })
        ),
      }),
      mcp: {
        annotations: {
          title: 'Save Campaign Content Plan',
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
      },
      outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      execute: async (inputData, context) => {
        checkAuth(inputData, context);
        const organizationId = JSON.parse(
          (context?.requestContext as any)?.get('organization') as string
        ).id;

        const project = await this._projectService.getById(organizationId, inputData.projectId);
        if (!project) return { success: false, message: 'Project not found' };

        await this._campaignService.updateBrief(
          inputData.campaignId,
          inputData.brief as object
        );
        await this._campaignService.updateContentPlan(
          inputData.campaignId,
          inputData.contentPlan as unknown as object
        );

        return {
          success: true,
          message: `Content plan saved with ${inputData.contentPlan.length} content pieces. Campaign status updated to ACTIVE.`,
        };
      },
    });
  }
}
