import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { ThirdPartyManager } from '@gitroom/nestjs-libraries/3rdparties/thirdparty.manager';

export interface AiVisibilityAgentInput {
  url: string;
  niche: string;
  competitors?: string | null;
  apiKeys: Record<string, string>;
}

export const AiVisibilityOutputSchema = z.object({
  visibilityScore: z
    .number()
    .min(0)
    .max(100)
    .describe('AI search visibility score 0-100'),
  citations: z
    .array(
      z.object({
        platform: z.string(),
        mentioned: z.boolean(),
        sentiment: z.enum(['positive', 'neutral', 'negative', 'unknown']),
        context: z.string().optional(),
      })
    )
    .describe('Brand mentions across AI platforms'),
  competitorVisibility: z
    .array(
      z.object({
        domain: z.string(),
        estimatedScore: z.number(),
        advantage: z.string(),
      })
    )
    .describe('How competitors appear in AI searches'),
  recommendations: z
    .array(
      z.object({
        action: z.string(),
        platform: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
        rationale: z.string(),
      })
    )
    .describe('Actions to improve AI search visibility'),
  llmOptimizationTips: z
    .array(z.string())
    .describe('Specific tips to appear in ChatGPT, Perplexity, Gemini, Claude answers'),
  summary: z.string(),
});

export type AiVisibilityOutput = z.infer<typeof AiVisibilityOutputSchema>;

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4.1',
  temperature: 0.3,
});

@Injectable()
export class AiVisibilityAgent {
  constructor(private _thirdPartyManager: ThirdPartyManager) {}
  async run(input: AiVisibilityAgentInput): Promise<AiVisibilityOutput> {
    const visibilityData = await this.gatherVisibilityData(input);

    const structured = model.withStructuredOutput(AiVisibilityOutputSchema);

    return ChatPromptTemplate.fromTemplate(
      `You are the AI Visibility Agent — an expert in Generative Engine Optimization (GEO) and brand presence across AI-powered search platforms (ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude).

## Website
- URL: {url}
- Niche: {niche}
- Competitors: {competitors}

## Raw AI Visibility Data
{visibilityData}

## Instructions
1. Score AI visibility 0-100 (100 = brand is cited across all major AI platforms for niche queries)
2. Check citations across platforms (ChatGPT, Perplexity, Google AI Overviews, Gemini, Bing Copilot)
3. Estimate competitor AI visibility scores
4. Provide 5+ high-priority GEO recommendations
5. List 5 specific tips to optimize for LLM citations (structured data, E-E-A-T signals, FAQ content, etc.)
6. Write a 2-sentence visibility summary

GEO best practices to consider:
- Structured data (FAQ, HowTo, Organization schema)
- E-E-A-T signals (author bios, expert quotes, citations)
- Conversational content matching how AI answers questions
- Brand mentions on Wikipedia, LinkedIn, press releases
- llms.txt file on the domain`
    )
      .pipe(structured)
      .invoke({
        url: input.url,
        niche: input.niche,
        competitors: input.competitors || 'Not specified',
        visibilityData: JSON.stringify(visibilityData, null, 2),
      });
  }

  private async gatherVisibilityData(input: AiVisibilityAgentInput) {
    const data: any = {};
    const brand = this.extractDomain(input.url);

    // Peec AI — brand visibility in AI answers
    if (input.apiKeys['peecai']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('peecai')?.instance as any;
        if (provider) {
          const result = await provider.brandVisibility(input.apiKeys['peecai'], { brand });
          if (result) data.peecai = result;
        }
      } catch { /* continue */ }
    }

    // Otterly.ai — brand monitoring
    if (input.apiKeys['otterly']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('otterly')?.instance as any;
        if (provider) {
          const result = await provider.brandMonitoring(input.apiKeys['otterly'], { brand });
          if (result) data.otterly = result;
        }
      } catch { /* continue */ }
    }

    // Perplexity — research brand mentions
    if (input.apiKeys['perplexity']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('perplexity')?.instance as any;
        if (provider) {
          const result = await provider.research(input.apiKeys['perplexity'], {
            query: `What is "${brand}" and is it mentioned in ${input.niche} related answers?`,
            recency: 'month',
          });
          if (result) data.perplexity = result;
        }
      } catch { /* continue */ }
    }

    // NewsAPI — recent brand mentions in news
    if (input.apiKeys['newsapi']) {
      try {
        const provider = this._thirdPartyManager.getThirdPartyByName('newsapi')?.instance as any;
        if (provider) {
          const result = await provider.listMedia(input.apiKeys['newsapi'], {
            query: brand,
            page: 1,
          });
          if (result?.results?.length) data.newsapi = result.results.slice(0, 5);
        }
      } catch { /* continue */ }
    }

    if (!data.peecai && !data.otterly && !data.perplexity) {
      data.note = `No AI visibility API keys connected. Providing strategic GEO recommendations for domain "${input.url}" in niche "${input.niche}".`;
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
