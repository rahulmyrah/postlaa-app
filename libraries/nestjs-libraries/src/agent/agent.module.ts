import { Global, Module } from '@nestjs/common';
import { AgentGraphService } from '@gitroom/nestjs-libraries/agent/agent.graph.service';
import { AgentGraphInsertService } from '@gitroom/nestjs-libraries/agent/agent.graph.insert.service';
import { KeywordStrategistAgent } from '@gitroom/nestjs-libraries/agent/seo/keyword.strategist';
import { TechnicalAuditorAgent } from '@gitroom/nestjs-libraries/agent/seo/technical.auditor';
import { GrowthAgent } from '@gitroom/nestjs-libraries/agent/seo/growth.agent';
import { AutoOptimizerAgent } from '@gitroom/nestjs-libraries/agent/seo/auto.optimizer';
import { SeoContentCreatorAgent } from '@gitroom/nestjs-libraries/agent/seo/seo.content.creator';
import { AiVisibilityAgent } from '@gitroom/nestjs-libraries/agent/seo/ai.visibility.agent';
import { MarketingTeamOrchestrator } from '@gitroom/nestjs-libraries/agent/marketing.team.orchestrator';

@Global()
@Module({
  providers: [
    AgentGraphService,
    AgentGraphInsertService,
    KeywordStrategistAgent,
    TechnicalAuditorAgent,
    GrowthAgent,
    AutoOptimizerAgent,
    SeoContentCreatorAgent,
    AiVisibilityAgent,
    MarketingTeamOrchestrator,
  ],
  get exports() {
    return this.providers;
  },
})
export class AgentModule {}
