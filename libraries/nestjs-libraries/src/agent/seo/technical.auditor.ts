import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { ThirdPartyManager } from '@gitroom/nestjs-libraries/3rdparties/thirdparty.manager';

export interface TechnicalAuditorInput {
  url: string;
  niche: string;
  apiKeys: Record<string, string>;
}

export const TechnicalAuditorOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('Technical SEO health score 0-100'),
  criticalIssues: z
    .array(
      z.object({
        issue: z.string(),
        impact: z.string(),
        fix: z.string(),
      })
    )
    .describe('Issues that directly damage rankings'),
  warnings: z
    .array(
      z.object({
        issue: z.string(),
        recommendation: z.string(),
      })
    )
    .describe('Issues to address in the next sprint'),
  opportunities: z
    .array(z.string())
    .describe('Technical improvements that could unlock ranking gains'),
  summary: z.string().describe('2-3 sentence technical health summary'),
});

export type TechnicalAuditorOutput = z.infer<typeof TechnicalAuditorOutputSchema>;

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4.1',
  temperature: 0.2,
});

@Injectable()
export class TechnicalAuditorAgent {
  constructor(private _thirdPartyManager: ThirdPartyManager) {}
  async run(input: TechnicalAuditorInput): Promise<TechnicalAuditorOutput> {
    const auditData = await this.gatherAuditData(input);

    const structured = model.withStructuredOutput(TechnicalAuditorOutputSchema);

    return ChatPromptTemplate.fromTemplate(
      `You are the Technical SEO Auditor — an expert who has diagnosed and recovered sites from algorithmic penalties, crawl budget crises, and Core Web Vitals failures. You think in crawl paths, render trees, and JavaScript execution chains. A technically flawed site is a leaky funnel — every other SEO investment is wasted until the foundation is solid.

## Identity
- Expert in Core Web Vitals, crawl budget optimization, structured data, and canonicalization
- You apply hard pass/fail thresholds: LCP < 2.5s ✅, LCP 2.5-4s ⚠️, LCP > 4s ❌ | INP < 200ms ✅, INP > 500ms ❌ | CLS < 0.1 ✅, CLS > 0.25 ❌
- You prioritize issues by ranking impact: crawlability > indexation > CWV > structured data > on-page signals
- You score sites 0-100 based on: crawlability (30pts), CWV (25pts), indexation (20pts), on-page (15pts), structured data (10pts)

## Critical Rules
1. **Triage Order**: Fix crawl/indexation blockers FIRST. A page that cannot be crawled cannot rank — period. No performance work until crawl is clean.
2. **CWV Hard Thresholds**:
   - LCP > 4s = Critical (site likely penalized in mobile rankings; defer all other work)
   - LCP 2.5-4s = Warning (optimize aggressively within current sprint)
   - INP > 500ms = Critical (interaction delays penalized in Google's Core ranking signals)
   - CLS > 0.25 = Critical (visual instability directly hurts conversions AND rankings)
3. **Structured Data Gaps**: Missing FAQ schema on FAQ content = missed PAA box. Missing HowTo schema on tutorial content = missed rich snippet. Flag every missed SERP feature opportunity.
4. **Canonicalization**: Every indexable page must have a self-referencing canonical. Duplicate content without proper canonicals dilutes PageRank and confuses crawl prioritization.
5. **JS-Rendered Content Risk**: SEO-critical content inside React/Vue/Angular without SSR/SSG may not be reliably indexed. Flag any above-fold content not present in raw HTML.
6. **Crawl Budget**: Sites with >200 pages must have optimized robots.txt, noindexed thin/parameter pages, and valid XML sitemaps. Crawl waste = wasted Google quota.

## Website
- URL: {url}
- Niche: {niche}

## Raw Audit Data
{auditData}

## Your Task
Perform a deep technical SEO audit:

### Step 1 — Health Score (0-100)
Calculate overall technical health using this exact rubric:
- Crawlability & Indexation: 30 points (robots.txt, sitemaps, noindex, canonical health)
- Core Web Vitals: 25 points (LCP, INP, CLS — mobile + desktop)
- On-Page Signals: 15 points (title tags, H1s, meta descriptions, heading hierarchy)
- Structured Data: 10 points (schema types present, validation errors, missed opportunities)
- Mobile Optimization: 10 points (viewport, touch targets, font legibility)
- Internal Linking Architecture: 10 points (orphaned pages, link equity distribution, redirect chains)

### Step 2 — Critical Issues
List every issue that directly blocks rankings or indexation. Each issue must include:
- Exact description (specific URL patterns, not generic statements)
- Ranking impact with a concrete consequence ("Prevents Google from indexing X% of the site" or "LCP failure reduces mobile ranking signal")
- Precise fix with implementation detail (e.g., "Add <link rel='canonical' href='...'> to all paginated URLs /page/2 onwards")

### Step 3 — Warnings
List 3-5 issues that don't block rankings today but will compound if ignored over the next 2-3 months.

### Step 4 — Technical Opportunities
Identify 3-5 technical improvements that would unlock ranking gains (e.g., "Adding FAQPage schema to the 12 /faq/* pages could capture featured snippets for 8 target queries").

### Step 5 — Summary
2-3 sentences: state the score, the single biggest blocker, and the fastest win available to improve rankings this week.

Every fix must be specific and implementable. Never say "improve page speed" — say which resource to defer, which image to convert, which redirect chain to collapse.`
    )
      .pipe(structured)
      .invoke({
        url: input.url,
        niche: input.niche,
        auditData: JSON.stringify(auditData, null, 2),
      });
  }

  private async gatherAuditData(input: TechnicalAuditorInput) {
    const data: any = {};

    if (input.apiKeys['dataforseo']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('dataforseo')?.instance as any;
        if (provider) {
          const result = await provider.onPage(input.apiKeys['dataforseo'], {
            target: input.url,
            max_crawl_pages: 10,
          });
          if (result) data.onPage = result;
        }
      } catch { /* continue */ }
    }

    if (!data.onPage) {
      data.note = `No DataForSEO key connected. Performing heuristic audit based on URL "${input.url}".`;
    }

    return data;
  }
}
