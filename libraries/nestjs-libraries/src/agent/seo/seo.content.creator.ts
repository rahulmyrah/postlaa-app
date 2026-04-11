import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import type { KeywordStrategistOutput } from './keyword.strategist';
import type { AutoOptimizerOutput } from './auto.optimizer';

export interface SeoContentCreatorInput {
  url: string;
  niche: string;
  targetAudience?: string | null;
  brandVoice?: string | null;
  goals?: string | null;
  campaignName: string;
  campaignGoal: string;
  keywordFindings: KeywordStrategistOutput;
  optimizerFindings: AutoOptimizerOutput;
}

const articleOutlineSchema = z.object({
  title: z.string(),
  targetKeyword: z.string(),
  wordCount: z.number(),
  outline: z.array(z.string()),
  metaDescription: z.string(),
  estimatedTrafficPotential: z.string(),
});

const socialPostSchema = z.object({
  platform: z.enum(['LinkedIn', 'Twitter/X', 'Instagram', 'Facebook']),
  hook: z.string(),
  content: z.string(),
  cta: z.string(),
  targetKeyword: z.string().optional(),
});

export const SeoContentCreatorOutputSchema = z.object({
  contentBriefs: z
    .array(articleOutlineSchema)
    .describe('5 SEO article briefs ready for writing'),
  socialPosts: z
    .array(socialPostSchema)
    .describe('8 social media posts (2 per platform)'),
  contentCalendar: z
    .array(
      z.object({
        week: z.number(),
        contentType: z.string(),
        title: z.string(),
        channel: z.string(),
        primaryKeyword: z.string(),
      })
    )
    .describe('4-week content calendar'),
  titleFormulas: z
    .array(z.string())
    .describe('5 proven title formulas for this niche'),
  summary: z.string(),
});

export type SeoContentCreatorOutput = z.infer<typeof SeoContentCreatorOutputSchema>;

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4.1',
  temperature: 0.6,
});

@Injectable()
export class SeoContentCreatorAgent {
  async run(input: SeoContentCreatorInput): Promise<SeoContentCreatorOutput> {
    const structured = model.withStructuredOutput(SeoContentCreatorOutputSchema);

    return ChatPromptTemplate.fromTemplate(
      `You are the SEO Content Creator agent — a senior content strategist who creates data-driven, SEO-optimized content plans.

## Campaign Context
- Campaign: {campaignName}
- Goal: {campaignGoal}
- Website: {url}
- Niche: {niche}
- Target Audience: {targetAudience}
- Brand Voice: {brandVoice}
- Goals: {goals}

## Keyword Research (from Keyword Strategist)
{keywordFindings}

## Strategic Priorities (from Auto Optimizer)
{optimizerFindings}

## Your Task
Create a complete content production plan:

1. **5 SEO Article Briefs** — Each with a title, target keyword, word count (800-3000), H2/H3 outline (5-8 sections), meta description (155 chars), and traffic potential estimate

2. **8 Social Media Posts** — 2 for each platform (LinkedIn, Twitter/X, Instagram, Facebook). Each post should: start with a scroll-stopping hook, deliver value, include a CTA, and optionally tag a keyword

3. **4-Week Content Calendar** — Week 1 = quick wins, Week 4 = longer SEO content

4. **5 Title Formula Templates** — Reusable patterns that work for this niche (e.g., "How to [X] Without [Y]")

5. **1-paragraph content strategy summary**

Match the brand voice: {brandVoice}. Make every piece of content purposeful and tied to the campaign goal.`
    )
      .pipe(structured)
      .invoke({
        campaignName: input.campaignName,
        campaignGoal: input.campaignGoal,
        url: input.url,
        niche: input.niche,
        targetAudience: input.targetAudience || 'Broad audience in the niche',
        brandVoice: input.brandVoice || 'Professional and helpful',
        goals: input.goals || 'Grow organic traffic and brand awareness',
        keywordFindings: JSON.stringify(input.keywordFindings, null, 2),
        optimizerFindings: JSON.stringify(input.optimizerFindings, null, 2),
      });
  }
}
