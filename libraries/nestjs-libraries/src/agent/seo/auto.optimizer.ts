import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import type { KeywordStrategistOutput } from './keyword.strategist';
import type { TechnicalAuditorOutput } from './technical.auditor';
import type { GrowthAgentOutput } from './growth.agent';

export interface AutoOptimizerInput {
  url: string;
  niche: string;
  goals?: string | null;
  brandVoice?: string | null;
  keywordFindings: KeywordStrategistOutput;
  technicalFindings: TechnicalAuditorOutput;
  growthFindings: GrowthAgentOutput;
}

export const AutoOptimizerOutputSchema = z.object({
  priorityActions: z
    .array(
      z.object({
        priority: z.enum(['critical', 'high', 'medium']),
        category: z.enum(['technical', 'content', 'links', 'visibility']),
        action: z.string(),
        expectedImpact: z.string(),
        effort: z.enum(['low', 'medium', 'high']),
        timeframe: z.string(),
      })
    )
    .describe('Top 10 prioritized actions across all areas'),
  weeklyPlan: z
    .array(
      z.object({
        week: z.number(),
        focus: z.string(),
        tasks: z.array(z.string()),
      })
    )
    .describe('4-week execution plan'),
  kpis: z
    .array(
      z.object({
        metric: z.string(),
        currentEstimate: z.string(),
        target: z.string(),
        timeframe: z.string(),
      })
    )
    .describe('KPIs to track progress'),
  summary: z.string().describe('Executive summary of the optimization strategy'),
});

export type AutoOptimizerOutput = z.infer<typeof AutoOptimizerOutputSchema>;

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4.1',
  temperature: 0.4,
});

@Injectable()
export class AutoOptimizerAgent {
  async run(input: AutoOptimizerInput): Promise<AutoOptimizerOutput> {
    const structured = model.withStructuredOutput(AutoOptimizerOutputSchema);

    return ChatPromptTemplate.fromTemplate(
      `You are the Auto Optimizer agent — a senior SEO strategist who synthesizes intelligence from multiple agents into a concrete, prioritized execution plan.

## Website
- URL: {url}
- Niche: {niche}
- Goals: {goals}
- Brand Voice: {brandVoice}

## Keyword Intelligence (from Keyword Strategist)
{keywordFindings}

## Technical Audit (from Technical Auditor)
{technicalFindings}

## Growth & Competitor Intelligence (from Growth Agent)
{growthFindings}

## Instructions
Synthesize ALL of the above into:
1. Top 10 prioritized actions (critical first) across technical, content, links, and visibility categories
2. A 4-week execution sprint plan (week 1 = highest leverage)
3. 5-7 KPIs with current baseline estimates and 90-day targets
4. A 3-sentence executive summary

Think like a CMO allocating a limited team's time. Only include actions that will meaningfully move the KPIs.`
    )
      .pipe(structured)
      .invoke({
        url: input.url,
        niche: input.niche,
        goals: input.goals || 'Increase organic traffic and conversions',
        brandVoice: input.brandVoice || 'Professional and approachable',
        keywordFindings: JSON.stringify(input.keywordFindings, null, 2),
        technicalFindings: JSON.stringify(input.technicalFindings, null, 2),
        growthFindings: JSON.stringify(input.growthFindings, null, 2),
      });
  }
}
