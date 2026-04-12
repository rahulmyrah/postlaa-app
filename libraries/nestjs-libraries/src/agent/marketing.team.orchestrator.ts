import { Injectable } from '@nestjs/common';
import { ThirdPartyManager } from '@gitroom/nestjs-libraries/3rdparties/thirdparty.manager';
import { ThirdPartyService } from '@gitroom/nestjs-libraries/database/prisma/third-party/third-party.service';
import { CampaignService } from '@gitroom/nestjs-libraries/database/prisma/marketing/campaign.service';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { KeywordStrategistAgent } from './seo/keyword.strategist';
import { TechnicalAuditorAgent } from './seo/technical.auditor';
import { GrowthAgent } from './seo/growth.agent';
import { AutoOptimizerAgent } from './seo/auto.optimizer';
import { SeoContentCreatorAgent } from './seo/seo.content.creator';
import { AiVisibilityAgent } from './seo/ai.visibility.agent';

export interface MarketingTeamRunInput {
  orgId: string;
  projectId: string;
  campaignId: string;
  project: {
    url: string;
    niche: string;
    competitors?: string | null;
    targetAudience?: string | null;
    brandVoice?: string | null;
    goals?: string | null;
  };
  campaign: {
    name: string;
    goal: string;
  };
}

export interface MarketingTeamRunResult {
  campaignId: string;
  keywordStrategy: any;
  technicalAudit: any;
  growthIntelligence: any;
  optimizationPlan: any;
  contentPlan: any;
  aiVisibility: any;
  agentsRun: string[];
  completedAt: string;
}

@Injectable()
export class MarketingTeamOrchestrator {
  constructor(
    private _thirdPartyManager: ThirdPartyManager,
    private _thirdPartyService: ThirdPartyService,
    private _campaignService: CampaignService,
    private _keywordStrategist: KeywordStrategistAgent,
    private _technicalAuditor: TechnicalAuditorAgent,
    private _growthAgent: GrowthAgent,
    private _autoOptimizer: AutoOptimizerAgent,
    private _contentCreator: SeoContentCreatorAgent,
    private _aiVisibility: AiVisibilityAgent
  ) {}

  async run(input: MarketingTeamRunInput): Promise<MarketingTeamRunResult> {
    try {
    // 1. Load and decrypt all connected API keys for this org
    const apiKeys = await this.loadApiKeys(input.orgId);

    const agentsRun: string[] = [];

    // 2. Keyword Strategist
    await this._campaignService.update(input.projectId, input.campaignId, {
      status: 'RESEARCHING',
    });

    const keywordStrategy = await this._keywordStrategist.run({
      url: input.project.url,
      niche: input.project.niche,
      competitors: input.project.competitors,
      targetAudience: input.project.targetAudience,
      goals: input.project.goals,
      apiKeys,
    });
    agentsRun.push('keyword_strategist');
    await this._campaignService.addResearchRun(
      input.campaignId,
      'keyword_strategist',
      keywordStrategy as any
    );

    // 3. Technical Auditor
    const technicalAudit = await this._technicalAuditor.run({
      url: input.project.url,
      niche: input.project.niche,
      apiKeys,
    });
    agentsRun.push('technical_auditor');
    await this._campaignService.addResearchRun(
      input.campaignId,
      'technical_auditor',
      technicalAudit as any
    );

    // 4. Growth Agent
    const growthIntelligence = await this._growthAgent.run({
      url: input.project.url,
      niche: input.project.niche,
      competitors: input.project.competitors,
      apiKeys,
    });
    agentsRun.push('growth_agent');
    await this._campaignService.addResearchRun(
      input.campaignId,
      'growth_agent',
      growthIntelligence as any
    );

    // 5. Auto Optimizer — synthesizes agents 1-3
    const optimizationPlan = await this._autoOptimizer.run({
      url: input.project.url,
      niche: input.project.niche,
      goals: input.project.goals,
      brandVoice: input.project.brandVoice,
      keywordFindings: keywordStrategy,
      technicalFindings: technicalAudit,
      growthFindings: growthIntelligence,
    });
    agentsRun.push('auto_optimizer');
    await this._campaignService.addResearchRun(
      input.campaignId,
      'auto_optimizer',
      optimizationPlan as any
    );

    // Save brief (strategic summary) mid-run
    await this._campaignService.updateBrief(input.campaignId, {
      keywordStrategy,
      technicalAudit,
      growthIntelligence,
      optimizationPlan,
      generatedAt: new Date().toISOString(),
    });

    // 6. SEO Content Creator
    const contentPlan = await this._contentCreator.run({
      url: input.project.url,
      niche: input.project.niche,
      targetAudience: input.project.targetAudience,
      brandVoice: input.project.brandVoice,
      goals: input.project.goals,
      campaignName: input.campaign.name,
      campaignGoal: input.campaign.goal,
      keywordFindings: keywordStrategy,
      optimizerFindings: optimizationPlan,
    });
    agentsRun.push('seo_content_creator');
    await this._campaignService.addResearchRun(
      input.campaignId,
      'seo_content_creator',
      contentPlan as any
    );

    // 7. AI Visibility Agent
    const aiVisibility = await this._aiVisibility.run({
      url: input.project.url,
      niche: input.project.niche,
      competitors: input.project.competitors,
      apiKeys,
    });
    agentsRun.push('ai_visibility');
    await this._campaignService.addResearchRun(
      input.campaignId,
      'ai_visibility',
      aiVisibility as any
    );

    // 8. Save full content plan + mark campaign ACTIVE
    await this._campaignService.updateContentPlan(input.campaignId, {
      contentPlan,
      aiVisibility,
      generatedAt: new Date().toISOString(),
    });

    const result: MarketingTeamRunResult = {
      campaignId: input.campaignId,
      keywordStrategy,
      technicalAudit,
      growthIntelligence,
      optimizationPlan,
      contentPlan,
      aiVisibility,
      agentsRun,
      completedAt: new Date().toISOString(),
    };

    return result;
    } catch (err) {
      // Mark campaign as PAUSED so the UI knows it failed and allows re-run
      await this._campaignService
        .update(input.projectId, input.campaignId, { status: 'PAUSED' })
        .catch(() => void 0);
      throw err;
    }
  }

  /** Load all connected third-party API keys for an org, decrypted. */
  private async loadApiKeys(orgId: string): Promise<Record<string, string>> {
    const integrations =
      await this._thirdPartyService.getAllThirdPartiesByOrganization(orgId);

    const apiKeys: Record<string, string> = {};

    for (const integration of integrations) {
      // Fetch full record to get encrypted API key
      const full = await this._thirdPartyService.getIntegrationById(
        orgId,
        integration.id
      );
      if (full?.apiKey) {
        try {
          apiKeys[integration.identifier] = AuthService.fixedDecryption(
            full.apiKey
          );
        } catch {
          /* key could not be decrypted — skip */
        }
      }
    }

    return apiKeys;
  }
}
