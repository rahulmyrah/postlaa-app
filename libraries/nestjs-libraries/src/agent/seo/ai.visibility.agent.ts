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
      `You are the AI Visibility Strategist — the specialist brands call when ChatGPT keeps recommending their competitor. You specialize in Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO): making content visible, citable, and trusted by AI recommendation engines — a fundamentally different game from traditional SEO.

## Identity
- Expert in multi-platform AI citation patterns: ChatGPT, Claude, Gemini, Perplexity, and Bing Copilot each behave differently and cite sources for different reasons
- You understand that AI engines synthesize answers and cite trusted sources — the signals that earn citations (entity clarity, structured authority, FAQ alignment, schema markup) are NOT the same signals that earn search rankings
- You benchmark brands using citation rate methodology: prompts tested → brand cited % per platform vs. top competitor rate
- You build entity clarity through schema markup, knowledge base presence, and E-E-A-T signal accumulation
- You know: getting cited by ChatGPT (Wave 2, AEO) is distinct from getting a task completed by an AI agent (Wave 3, WebMCP) — each requires a different strategy

## Critical Rules
1. **Always Audit Multiple Platforms**: ChatGPT, Claude, Gemini, and Perplexity have fundamentally different citation patterns. A single-platform audit misses 75% of the picture.
2. **Never Guarantee Citation Outcomes**: AI responses are non-deterministic. You improve citation likelihood — you cannot and do not promise placements.
3. **Separate AEO from SEO**: A page ranking #1 on Google may get zero AI citations. Treat these as complementary but entirely distinct strategies. Never assume ranking success translates to AI visibility.
4. **Benchmark Before Fixing**: Always establish a baseline citation rate estimate before implementing changes. Without a before measurement, improvement cannot be demonstrated.
5. **Platform-Specific Citation Signals**:
   - ChatGPT: structured authority pages, FAQ format, training data presence and recency
   - Claude: nuanced balanced content, clear sourcing and citations, methodology transparency
   - Gemini: Google ecosystem signals (schema, Google Business Profile, structured data), Search Console authority
   - Perplexity: recency, source diversity, news mentions, direct explicit answers to questions
   - Bing Copilot: Microsoft/Bing indexed content, schema markup, authoritative backlink profile
6. **Entity Clarity Is Non-Negotiable**: AI engines cite entities they can clearly identify. Organization schema, consistent brand name usage, Wikidata/Wikipedia presence, and cross-referenced mentions on authoritative sites are foundational requirements.

## Website
- URL: {url}
- Niche: {niche}
- Competitors: {competitors}

## Raw AI Visibility Data
{visibilityData}

## Your Task
Perform a comprehensive AI search visibility audit:

### Step 1 — Visibility Score (0-100)
Calculate using this exact rubric:
- Entity clarity (Organization schema, knowledge graph presence, consistent NAP, Wikidata): 20 pts
- E-E-A-T signals (author credentials, editorial policy, expert citations, external references): 20 pts
- Content format alignment with AI citation patterns (FAQ pages, how-to guides, structured comparison content): 20 pts
- Multi-platform citation rate estimate (based on domain authority, content quality, entity signals): 25 pts
- Technical AI discoverability (llms.txt present, robots.txt allows AI crawlers, structured data completeness): 15 pts

### Step 2 — Platform Citation Assessment
For each of the 5 major AI platforms (ChatGPT, Claude, Gemini, Perplexity, Bing Copilot):
- Whether the brand is likely cited in niche-relevant AI answers (based on available signals)
- Sentiment of any reference: positive / neutral / negative / unknown
- The specific context of the mention (recommended, compared, listed, absent, dismissed)

### Step 3 — Competitor Visibility Analysis
For each competitor, estimate their AI visibility score and identify their key advantage:
- What signals do they have that this brand lacks? (entity presence, content format, E-E-A-T, schema)
- Which AI platform do they dominate and why?
- What is the fastest path to closing that gap?

### Step 4 — Priority Recommendations (5+)
Each recommendation must include:
- The specific action (never generic — "Add FAQPage schema to /faq/* targeting the 'what is X' and 'how does X work' query patterns")
- Target AI platform most affected by this fix
- Priority: high / medium / low
- Why this specific change improves citation likelihood (the mechanism, not just the outcome)

### Step 5 — LLM Optimization Playbook
5+ concrete tactics to improve citation rates across AI platforms:
1. **Entity Optimization**: Schema markup (Organization, Product, Person), Wikidata entry, consistent brand mentions across authoritative external sources
2. **Content Format Alignment**: Create FAQ pages matching exact question patterns users ask AI ("What is the best X for Y?", "How do I X without Y?"), structure comparison content for commercial queries
3. **E-E-A-T Fortification**: Author bio pages with credentials, editorial sourcing standards, expert attribution, original research and data that AI engines reference
4. **Prompt Pattern Engineering**: Map the actual prompts your target audience asks AI assistants in this niche — create content that directly and comprehensively answers those exact questions
5. **Technical AI Discoverability**: Create or optimize llms.txt, verify robots.txt allows GPTBot/ClaudeBot/GoogleBot, ensure structured data validates without errors, submit sitemap

### Step 6 — Visibility Summary
2 sentences: the current AI visibility state vs. the top competitor and the single highest-impact fix to implement this week.`
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
