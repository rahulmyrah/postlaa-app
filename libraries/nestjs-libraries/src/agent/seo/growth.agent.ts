import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { ThirdPartyManager } from '@gitroom/nestjs-libraries/3rdparties/thirdparty.manager';

export interface GrowthAgentInput {
  url: string;
  niche: string;
  competitors?: string | null;
  apiKeys: Record<string, string>;
}

export const GrowthAgentOutputSchema = z.object({
  domainMetrics: z.object({
    domainRating: z.number().optional(),
    backlinks: z.number().optional(),
    referringDomains: z.number().optional(),
    organicTraffic: z.number().optional(),
  }),
  topCompetitors: z
    .array(
      z.object({
        domain: z.string(),
        domainRating: z.number().optional(),
        commonKeywords: z.number().optional(),
        advantage: z.string(),
      })
    )
    .describe('Top competitor analysis'),
  linkGaps: z
    .array(
      z.object({
        sourceDomain: z.string(),
        type: z.string(),
        rationale: z.string(),
      })
    )
    .describe('Domains linking to competitors but not to you'),
  contentGaps: z
    .array(
      z.object({
        topic: z.string(),
        competitorsCovering: z.array(z.string()),
        opportunity: z.string(),
      })
    )
    .describe('Topics competitors rank for that you don\'t'),
  growthPlaybook: z
    .array(z.string())
    .describe('5 concrete growth actions with highest ROI'),
  summary: z.string(),
});

export type GrowthAgentOutput = z.infer<typeof GrowthAgentOutputSchema>;

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4.1',
  temperature: 0.3,
});

@Injectable()
export class GrowthAgent {
  constructor(private _thirdPartyManager: ThirdPartyManager) {}
  async run(input: GrowthAgentInput): Promise<GrowthAgentOutput> {
    const growthData = await this.gatherGrowthData(input);

    const structured = model.withStructuredOutput(GrowthAgentOutputSchema);

    return ChatPromptTemplate.fromTemplate(
      `You are the Growth Agent — an expert in backlink strategy, competitor intelligence, and content gap analysis.

## Website
- URL: {url}
- Niche: {niche}
- Known Competitors: {competitors}

## Raw Growth / Backlink Data
{growthData}

## Instructions
1. Summarize domain authority metrics
2. Identify top 3-5 competitors and their SEO advantages
3. Find 5 high-value link building opportunities (domains linking to competitors but not this site)
4. Identify 5 content gap topics (competitors rank for, this site doesn't)
5. Create a 5-step growth playbook with highest-ROI actions
6. Write a 2-sentence growth summary

Be specific and data-driven. Prioritize by potential impact.`
    )
      .pipe(structured)
      .invoke({
        url: input.url,
        niche: input.niche,
        competitors: input.competitors || 'Not specified',
        growthData: JSON.stringify(growthData, null, 2),
      });
  }

  private async gatherGrowthData(input: GrowthAgentInput) {
    const data: any = {};
    const domain = this.extractDomain(input.url);
    const competitorList = input.competitors
      ? input.competitors.split(/[,\n]/).map((c) => c.trim()).filter(Boolean).slice(0, 3)
      : [];

    // Ahrefs — primary for backlinks
    if (input.apiKeys['ahrefs']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('ahrefs')?.instance as any;
        if (provider) {
          const [siteData, compData, gapData] = await Promise.allSettled([
            provider.siteExplorer(input.apiKeys['ahrefs'], { target: domain }),
            provider.competitors(input.apiKeys['ahrefs'], { target: domain, country: 'us', limit: 5 }),
            competitorList.length > 0
              ? provider.contentGap(input.apiKeys['ahrefs'], {
                  target: domain,
                  competitors: competitorList,
                  country: 'us',
                  limit: 20,
                })
              : Promise.resolve(null),
          ]);
          if (siteData.status === 'fulfilled') data.ahrefs_site = siteData.value;
          if (compData.status === 'fulfilled') data.ahrefs_competitors = compData.value;
          if (gapData.status === 'fulfilled' && gapData.value) data.ahrefs_gap = gapData.value;
        }
      } catch { /* continue */ }
    }

    // Semrush — domain vs domain
    if (input.apiKeys['semrush'] && competitorList.length > 0) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('semrush')?.instance as any;
        if (provider) {
          const overlap = await provider.domainVsDomain(input.apiKeys['semrush'], {
            domain,
            competitors: competitorList.slice(0, 2),
            database: 'us',
          });
          if (overlap) data.semrush_overlap = overlap;
        }
      } catch { /* continue */ }
    }

    // DataForSEO backlinks fallback
    if (!data.ahrefs_site && input.apiKeys['dataforseo']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('dataforseo')?.instance as any;
        if (provider) {
          const bl = await provider.backlinks(input.apiKeys['dataforseo'], { target: domain, limit: 50 });
          if (bl) data.dataforseo_backlinks = bl;
        }
      } catch { /* continue */ }
    }

    if (!data.ahrefs_site && !data.dataforseo_backlinks) {
      data.note = `No backlink API keys found. Analysis based on domain "${domain}" and provided competitors.`;
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
