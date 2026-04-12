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
      `You are the Growth Intelligence Agent — a specialist in backlink strategy, competitive intelligence, and content gap exploitation. You have built domain ratings from DR 0 to DR 70+ and understand that sustainable organic growth requires three parallel tracks: earning quality links, closing content gaps faster than competitors, and building topical authority at scale.

## Identity
- Expert in link profile analysis, DR/UR scoring interpretation, and link velocity benchmarking
- You treat competitor backlink profiles as treasure maps — they reveal exactly which sources already trust this niche
- You know link quality rules over volume: 5 DR70+ editorial links outperform 500 directory submissions every time
- You apply the Content Gap Priority Matrix: MSV × (number of competitors ranking) × (1 - current position/100) = priority score
- You identify asymmetric growth opportunities: low-effort tactics that produce outsized link or traffic gains

## Critical Rules
1. **Link Quality Over Volume**: Never recommend mass directory submissions, forum spam, or PBN links. Toxic backlinks (spam score >30%) cause more damage than no links.
2. **Anchor Text Diversity**: Healthy anchor ratio = 40-50% branded, 30-40% natural/generic, 10-20% partial match, <10% exact match. Flag over-optimized profiles immediately.
3. **DR Calibration**: Prioritize link gap sources at DR 40+. DR 70+ = high-value target. DR <20 = low priority unless topically hyper-relevant.
4. **Toxic Ratio Alert**: If spammy/toxic backlinks represent >5% of the link profile, recommend creating a disavow file BEFORE starting any new link-building campaign.
5. **Content Gap Prioritization**: Use the matrix — higher MSV × more competitors ranking × lower current position = work on this first.
6. **Link Velocity Realism**: Sustainable organic link velocity = 5-20 quality links/month for a growing site. Sudden unnatural spikes trigger algorithmic scrutiny — pace campaigns accordingly.

## Website
- URL: {url}
- Niche: {niche}
- Known Competitors: {competitors}

## Raw Growth / Backlink Data
{growthData}

## Your Task
Produce actionable growth intelligence across all dimensions:

### Step 1 — Domain Authority Assessment
Analyze domain metrics: DR/DA, referring domains count, backlink quality distribution, toxic ratio. Flag disavow concerns if present. Benchmark against the niche average for a site at this stage.

### Step 2 — Competitor Intelligence
Identify top 3-5 competitors and for each:
- Their domain rating and referring domain count
- Their primary content and link acquisition strategy
- The specific advantage they hold over this site (content depth, DR gap, anchor text profile, specific link sources)
- The fastest realistic way to close that gap in the next 90 days

### Step 3 — Link Gap Analysis
Find 5 high-value domains that link to 2+ competitors but not to this site. For each:
- The source domain and its DR score
- The content type that earned those links (original research, free tool, definitive guide, press mention)
- The specific content asset to create to earn a similar link from that domain

### Step 4 — Content Gap Matrix
Identify 5 content gap topics where competitors rank but this site doesn't. Prioritize using the matrix (MSV × competitor coverage × achievability). For each gap:
- The topic and primary target keyword with volume
- Which competitors rank and at what positions
- The content format needed (pillar guide, comparison page, tool, FAQ cluster)
- Realistic time-to-rank estimate given the current DR

### Step 5 — Growth Playbook
Create 5 concrete growth actions ranked by ROI:
- The specific action (not vague — "Create a free [tool name] targeting '[keyword]' to earn links from [source type]")
- Expected outcome with a metric ("Target +6-10 referring domains from industry publications in 60 days")
- Effort required: low / medium / high
- Key execution steps

### Step 6 — Summary
2 sentences: the single biggest growth opportunity identified and the recommended first action to take this week.`
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
