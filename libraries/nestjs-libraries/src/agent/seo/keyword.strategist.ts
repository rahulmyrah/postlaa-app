import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { ThirdPartyManager } from '@gitroom/nestjs-libraries/3rdparties/thirdparty.manager';

export interface KeywordStrategistInput {
  url: string;
  niche: string;
  competitors?: string | null;
  targetAudience?: string | null;
  goals?: string | null;
  apiKeys: Record<string, string>; // identifier -> decrypted key
}

export const KeywordStrategistOutputSchema = z.object({
  topKeywords: z
    .array(
      z.object({
        keyword: z.string(),
        searchVolume: z.number().optional(),
        difficulty: z.number().optional(),
        intent: z.string(),
        rationale: z.string(),
      })
    )
    .describe('Top 10 keyword opportunities ranked by potential'),
  clusters: z
    .array(
      z.object({
        theme: z.string(),
        keywords: z.array(z.string()),
        contentType: z.string(),
      })
    )
    .describe('Keyword clusters grouped by topic'),
  quickWins: z
    .array(z.string())
    .describe('Keywords with low difficulty and decent volume to target first'),
  longtailGems: z
    .array(z.string())
    .describe('High-value long-tail keywords with clear intent'),
  summary: z.string().describe('Strategic keyword summary for this domain'),
});

export type KeywordStrategistOutput = z.infer<typeof KeywordStrategistOutputSchema>;

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4.1',
  temperature: 0.3,
});

@Injectable()
export class KeywordStrategistAgent {
  constructor(private _thirdPartyManager: ThirdPartyManager) {}
  async run(input: KeywordStrategistInput): Promise<KeywordStrategistOutput> {
    const rawData = await this.gatherKeywordData(input);

    const structured = model.withStructuredOutput(KeywordStrategistOutputSchema);

    const result = await ChatPromptTemplate.fromTemplate(
      `You are the Keyword Strategist agent — an expert SEO keyword researcher.

Your task is to analyze keyword opportunities for the following website and produce a strategic keyword plan.

## Website Context
- URL: {url}
- Niche: {niche}
- Target Audience: {targetAudience}
- Competitors: {competitors}
- Goals: {goals}

## Raw Keyword Data from SEO Tools
{rawData}

## Instructions
1. Identify the top 10 keyword opportunities (mix of informational, commercial, transactional)
2. Group keywords into 3-5 thematic clusters
3. Highlight quick wins (low difficulty, >100 vol)
4. Surface the 5 best long-tail gems (highly specific, buying intent)
5. Write a concise strategic summary (2-3 sentences)

Focus on keywords that match the niche and audience goals. Prioritize commercial intent for revenue-driving terms.`
    )
      .pipe(structured)
      .invoke({
        url: input.url,
        niche: input.niche,
        targetAudience: input.targetAudience || 'Not specified',
        competitors: input.competitors || 'Not specified',
        goals: input.goals || 'Not specified',
        rawData: JSON.stringify(rawData, null, 2),
      });

    return result;
  }

  private async gatherKeywordData(input: KeywordStrategistInput) {
    const data: any = { source: 'synthesized', keywords: [] };
    const domain = this.extractDomain(input.url);

    // DataForSEO — primary
    if (input.apiKeys['dataforseo']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('dataforseo')?.instance as any;
        if (provider) {
          const result = await provider.keywordsForSite(input.apiKeys['dataforseo'], { target: domain, limit: 50 });
          if (result?.length) {
            data.dataforseo = result;
            data.keywords.push(...result.slice(0, 20).map((k: any) => k.keyword));
          }
        }
      } catch { /* provider unavailable — continue */ }
    }

    // Semrush — supplementary
    if (input.apiKeys['semrush']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('semrush')?.instance as any;
        if (provider) {
          const result = await provider.domainOrganic(input.apiKeys['semrush'], { domain, database: 'us', limit: 30 });
          if (result?.length) {
            data.semrush = result;
            data.keywords.push(...result.slice(0, 15).map((k: any) => k.keyword || k.Ph));
          }
        }
      } catch { /* provider unavailable — continue */ }
    }

    // Ahrefs — supplementary
    if (input.apiKeys['ahrefs']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('ahrefs')?.instance as any;
        if (provider) {
          const result = await provider.keywordExplorer(input.apiKeys['ahrefs'], { keywords: [input.niche], country: 'us', limit: 20 });
          if (result?.length) data.ahrefs = result;
        }
      } catch { /* provider unavailable — continue */ }
    }

    // If no API keys available, use niche-based heuristic
    if (!data.dataforseo && !data.semrush && !data.ahrefs) {
      data.note = `No SEO API keys connected. Generating strategic keywords based on niche "${input.niche}" and domain "${domain}".`;
    }

    return data;
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }
}
