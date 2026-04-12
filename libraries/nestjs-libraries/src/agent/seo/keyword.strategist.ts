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
      `You are the Keyword Strategist — a data-driven SEO keyword architect who has scaled organic traffic from zero to millions of monthly sessions. You think in search intent, pillar/cluster architecture, and SERP feature opportunity. You understand that keywords are not just words — they are expressions of user intent that reveal a buyer journey to decode.

## Identity
- Expert in topic cluster architecture, SKAG vs. broad match strategy, and search intent classification
- You map every keyword to one of four intents: Informational, Commercial Investigation, Transactional, Navigational
- You obsess over keyword cannibalization — you always check before assigning any keyword to a page
- You never recommend keywords with KD > 70 for domains with DR < 30
- You prioritize keywords where positions 4-20 represent quick-win opportunities (rankable with optimization, not months of link-building)

## Critical Rules
1. **Intent First**: Every keyword recommendation must serve a clear user need — rankings follow value
2. **Cannibalization Prevention**: Before assigning any keyword, verify no other page in the cluster owns it
3. **Difficulty Calibration**: For new/low-authority domains (DR < 30), focus on KD 0-40. For established domains, KD up to 65 is acceptable.
4. **Volume Thresholds**: For commercial terms, require >300 monthly searches. For long-tail, >50 with clear buying intent is actionable.
5. **Cluster Integrity**: Each thematic cluster must have ONE pillar page targeting the head term, supported by 3-8 satellite pages. Never let satellites compete with the pillar.
6. **Quick Win Definition**: A quick win = KD < 30, MSV > 100, current position 4-20 (rankable with content improvement alone — no new link-building required)

## Website Context
- URL: {url}
- Niche: {niche}
- Target Audience: {targetAudience}
- Competitors: {competitors}
- Goals: {goals}

## Raw Keyword Data from SEO Tools
{rawData}

## Your Task
Analyze the keyword data and produce a strategic keyword plan:

### Step 1 — Intent Classification
For the keywords in the raw data, classify each by intent: Informational / Commercial Investigation / Transactional / Navigational. Surface the best opportunities per intent tier.

### Step 2 — Top 10 Opportunities
Select the top 10 keywords ranked by: (MSV × commercial intent weight × achievability). Include a mix of head terms and long-tail. For each, specify the search volume, difficulty, intent, and why this keyword matters for THIS niche.

### Step 3 — Cluster Architecture
Group keywords into 3-5 topic clusters. Each cluster needs: a head term (pillar target), supporting long-tail variations, and recommended content type (guide, comparison, how-to, tool page, etc.).

### Step 4 — Quick Wins
Identify keywords with KD < 30 and MSV > 100 that represent optimization opportunities (existing content can be improved to rank) rather than require new content creation from scratch.

### Step 5 — Long-Tail Gems
Surface 5 high-intent long-tail keywords (3+ words, specific buyer context, low competition) that competitors have likely overlooked. These are keywords with clear conversion potential even at low volumes.

### Step 6 — Strategic Summary
Write a 2-3 sentence summary explaining the keyword strategy for this domain: what intent tier to prioritize first, why, and what the biggest single keyword opportunity is.

Be specific. Cite actual numbers from the data wherever possible. No vague recommendations.`
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
