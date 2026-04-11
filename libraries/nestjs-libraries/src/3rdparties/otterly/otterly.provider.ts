import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

/**
 * Otterly.ai — AI search monitoring and brand citation tracking.
 * Gartner Cool Vendor 2025. Tracks brand mentions across ChatGPT, Gemini, Perplexity, Copilot.
 * Auth: Bearer API key from app.otterly.ai
 */
@ThirdParty({
  identifier: 'otterly',
  title: 'Otterly.ai',
  description:
    'Monitor how AI-powered search engines (ChatGPT, Gemini, Perplexity, Copilot) mention and portray your brand. Otterly.ai powers the AI Visibility Agent with citation tracking, share-of-voice analysis, and AI answer monitoring — a Gartner 2025 Cool Vendor.',
  position: 'media',
  fields: [],
})
export class OtterlyProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.otterly.ai/v1';

  private async request<T = any>(
    apiKey: string,
    method: 'GET' | 'POST',
    path: string,
    body?: object
  ): Promise<T> {
    const res = await fetch(`${this.BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Otterly.ai error ${res.status}: ${err?.error || res.statusText}`
      );
    }

    return res.json() as Promise<T>;
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    try {
      const json = await this.request(apiKey, 'GET', '/account');
      if (!json) return false;

      return {
        name: `Otterly.ai (${json.plan ?? 'Connected'})`,
        username: json.email ?? 'otterly_user',
        id: json.account_id ?? apiKey.slice(0, 8),
      };
    } catch {
      return false;
    }
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const action = data?.action || 'brand_monitoring';
    switch (action) {
      case 'brand_monitoring':
        return JSON.stringify(await this.brandMonitoring(apiKey, data));
      case 'citations':
        return JSON.stringify(await this.citationTracking(apiKey, data));
      case 'share_of_voice':
        return JSON.stringify(await this.shareOfVoice(apiKey, data));
      case 'ai_answers':
        return JSON.stringify(await this.aiAnswers(apiKey, data));
      case 'competitors':
        return JSON.stringify(await this.competitorTracking(apiKey, data));
      case 'topics':
        return JSON.stringify(await this.topicAnalysis(apiKey, data));
      default:
        return JSON.stringify(await this.brandMonitoring(apiKey, data));
    }
  }

  /** Brand Monitoring — real-time brand presence across AI platforms */
  async brandMonitoring(
    apiKey: string,
    data: {
      brand: string;
      date_from?: string;
      date_to?: string;
      project_id?: string;
    }
  ) {
    const json = await this.request(apiKey, 'POST', '/monitoring/brand', {
      brand: data.brand,
      date_from: data.date_from,
      date_to: data.date_to,
      project_id: data.project_id,
    });

    return {
      brand: data.brand,
      total_mentions: json?.total_mentions,
      mention_rate: json?.mention_rate,
      avg_position: json?.avg_position,
      positive_rate: json?.positive_rate,
      platforms: json?.platforms ?? [],
      trend_7d: json?.trend_7d,
      trend_30d: json?.trend_30d,
    };
  }

  /** Citation Tracking — which URLs / pages are cited in AI responses mentioning your brand */
  async citationTracking(
    apiKey: string,
    data: { brand?: string; project_id?: string; limit?: number }
  ) {
    const json = await this.request(apiKey, 'POST', '/citations', {
      brand: data.brand,
      project_id: data.project_id,
      limit: data.limit ?? 50,
    });

    const citations = json?.citations ?? [];
    return citations.map((c: any) => ({
      url: c.url,
      domain: c.domain,
      citation_count: c.count,
      platforms: c.platforms,
      first_cited: c.first_cited,
      context: c.context_snippet,
    }));
  }

  /** Share of Voice — your brand's AI mentions vs. competitors */
  async shareOfVoice(
    apiKey: string,
    data: {
      brand: string;
      competitors?: string[];
      date_from?: string;
      date_to?: string;
    }
  ) {
    const json = await this.request(apiKey, 'POST', '/share-of-voice', {
      brand: data.brand,
      competitors: data.competitors?.slice(0, 5) ?? [],
      date_from: data.date_from,
      date_to: data.date_to,
    });

    const brands = json?.brands ?? [];
    return {
      period: json?.period,
      total_queries_tracked: json?.total_queries,
      brands: brands.map((b: any) => ({
        brand: b.brand,
        sov: b.share_of_voice,
        mentions: b.mentions,
        mention_rate: b.mention_rate,
      })),
    };
  }

  /** AI Answers — sample AI-generated answers that include your brand */
  async aiAnswers(
    apiKey: string,
    data: { brand?: string; platform?: string; project_id?: string; limit?: number }
  ) {
    const json = await this.request(apiKey, 'POST', '/ai-answers', {
      brand: data.brand,
      platform: data.platform,
      project_id: data.project_id,
      limit: data.limit ?? 20,
    });

    const answers = json?.answers ?? [];
    return answers.map((a: any) => ({
      prompt: a.query,
      platform: a.platform,
      brand_mentioned: a.brand_mentioned,
      position: a.position,
      sentiment: a.sentiment,
      excerpt: a.answer_excerpt,
      retrieved_at: a.retrieved_at,
    }));
  }

  /** Competitor Tracking — how competitors perform in AI search vs. you */
  async competitorTracking(
    apiKey: string,
    data: {
      brand: string;
      competitors: string[];
      project_id?: string;
    }
  ) {
    const json = await this.request(apiKey, 'POST', '/competitors', {
      brand: data.brand,
      competitors: data.competitors.slice(0, 5),
      project_id: data.project_id,
    });

    const brands = json?.competitors ?? [];
    return brands.map((b: any) => ({
      brand: b.brand,
      mention_rate: b.mention_rate,
      avg_position: b.avg_position,
      positive_rate: b.positive_rate,
      top_platform: b.top_platform,
    }));
  }

  /** Topic Analysis — what topics/prompts are driving your brand's AI mentions */
  async topicAnalysis(
    apiKey: string,
    data: { brand?: string; project_id?: string; limit?: number }
  ) {
    const json = await this.request(apiKey, 'POST', '/topics', {
      brand: data.brand,
      project_id: data.project_id,
      limit: data.limit ?? 30,
    });

    const topics = json?.topics ?? [];
    return topics.map((t: any) => ({
      topic: t.topic,
      query_count: t.query_count,
      mention_rate: t.mention_rate,
      avg_position: t.avg_position,
      top_platforms: t.top_platforms,
    }));
  }

  /** Projects — list all monitoring projects */
  async listProjects(apiKey: string) {
    const json = await this.request(apiKey, 'GET', '/projects');
    const projects = json?.projects ?? [];
    return projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      created_at: p.created_at,
      queries_tracked: p.queries_tracked,
    }));
  }
}
