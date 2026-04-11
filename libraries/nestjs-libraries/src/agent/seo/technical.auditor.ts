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
      `You are the Technical SEO Auditor agent — an expert in Core Web Vitals, crawlability, indexation, and on-page signals.

## Website
- URL: {url}  
- Niche: {niche}

## Raw Audit Data
{auditData}

## Instructions
Analyze the on-page and technical SEO data:
1. Assign a health score 0-100 (100 = perfect)
2. List critical issues that block ranking (e.g. broken links, missing title tags, crawl errors, duplicate content, slow LCP)
3. List 3-5 warnings
4. Identify 3-5 technical quick win opportunities
5. Write a 2-3 sentence summary

Be specific and actionable. Each fix must say exactly what to change.`
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
