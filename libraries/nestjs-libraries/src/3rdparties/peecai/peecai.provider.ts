import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

/**
 * Peec AI — AI Visibility & GEO tracking.
 * Tracks your brand's presence in LLM-generated answers (ChatGPT, Gemini, Perplexity, Claude, Copilot).
 * Auth: Bearer API key from app.peec.ai
 */
@ThirdParty({
  identifier: 'peecai',
  title: 'Peec AI',
  description:
    "Track how often your brand is cited by AI assistants (ChatGPT, Gemini, Perplexity, Claude, Copilot). Peec AI's Visibility, Position, and Sentiment metrics power the AI Visibility Agent to detect LLM share-of-voice and outpace competitors in AI-generated answers.",
  position: 'media',
  fields: [],
})
export class PeecAiProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.peec.ai/v1';

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
        `Peec AI error ${res.status}: ${err?.message || res.statusText}`
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
        name: `Peec AI (${json.plan ?? 'Connected'})`,
        username: json.email ?? 'peec_user',
        id: json.account_id ?? apiKey.slice(0, 8),
      };
    } catch {
      return false;
    }
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const action = data?.action || 'visibility';
    switch (action) {
      case 'visibility':
        return JSON.stringify(await this.brandVisibility(apiKey, data));
      case 'prompts':
        return JSON.stringify(await this.trackPrompts(apiKey, data));
      case 'competitors':
        return JSON.stringify(await this.competitorComparison(apiKey, data));
      case 'sentiment':
        return JSON.stringify(await this.sentiment(apiKey, data));
      case 'platforms':
        return JSON.stringify(await this.platformBreakdown(apiKey, data));
      case 'recommendations':
        return JSON.stringify(await this.recommendations(apiKey, data));
      default:
        return JSON.stringify(await this.brandVisibility(apiKey, data));
    }
  }

  /** Brand Visibility — overall AI visibility score and trend */
  async brandVisibility(
    apiKey: string,
    data: { brand?: string; date_from?: string; date_to?: string; project_id?: string }
  ) {
    const json = await this.request(apiKey, 'POST', '/visibility', {
      brand: data.brand,
      date_from: data.date_from,
      date_to: data.date_to,
      project_id: data.project_id,
    });

    return {
      brand: data.brand,
      visibility_score: json?.visibility_score,
      visibility_rate: json?.visibility_rate,
      position_score: json?.position_score,
      sentiment_score: json?.sentiment_score,
      mentions: json?.mentions,
      impressions: json?.impressions,
      trend: json?.trend,
      period: json?.period,
    };
  }

  /** Track Prompts — see which AI prompts trigger your brand to be cited */
  async trackPrompts(
    apiKey: string,
    data: { project_id?: string; limit?: number; category?: string }
  ) {
    const json = await this.request(apiKey, 'GET', '/prompts', {
      project_id: data.project_id,
      limit: data.limit ?? 50,
      category: data.category,
    } as any);

    const prompts = json?.prompts ?? [];
    return prompts.map((p: any) => ({
      prompt: p.prompt,
      visibility_rate: p.visibility_rate,
      avg_position: p.avg_position,
      models_included: p.models,
      category: p.category,
    }));
  }

  /** Competitor Comparison — your visibility vs. competitor brands */
  async competitorComparison(
    apiKey: string,
    data: { brand: string; competitors: string[]; project_id?: string }
  ) {
    const json = await this.request(apiKey, 'POST', '/competitors', {
      brand: data.brand,
      competitors: data.competitors.slice(0, 5),
      project_id: data.project_id,
    });

    const brands = json?.brands ?? [];
    return brands.map((b: any) => ({
      brand: b.brand,
      visibility_score: b.visibility_score,
      visibility_rate: b.visibility_rate,
      position_score: b.position_score,
      sentiment: b.sentiment,
    }));
  }

  /** Sentiment — positive / neutral / negative breakdown of AI mentions */
  async sentiment(
    apiKey: string,
    data: { brand?: string; project_id?: string; date_from?: string; date_to?: string }
  ) {
    const json = await this.request(apiKey, 'POST', '/sentiment', {
      brand: data.brand,
      project_id: data.project_id,
      date_from: data.date_from,
      date_to: data.date_to,
    });

    return {
      brand: data.brand,
      positive: json?.positive,
      neutral: json?.neutral,
      negative: json?.negative,
      overall_score: json?.overall_score,
      sample_mentions: json?.sample_mentions?.slice(0, 5),
    };
  }

  /** Platform Breakdown — visibility per AI model (ChatGPT, Gemini, Perplexity…) */
  async platformBreakdown(
    apiKey: string,
    data: { brand?: string; project_id?: string }
  ) {
    const json = await this.request(apiKey, 'POST', '/platforms', {
      brand: data.brand,
      project_id: data.project_id,
    });

    const platforms = json?.platforms ?? [];
    return platforms.map((p: any) => ({
      platform: p.name,
      visibility_rate: p.visibility_rate,
      position_score: p.position_score,
      mentions: p.mentions,
    }));
  }

  /** Recommendations — AI-generated suggestions to improve LLM visibility */
  async recommendations(
    apiKey: string,
    data: { brand?: string; project_id?: string }
  ) {
    const json = await this.request(apiKey, 'GET', '/recommendations', {
      brand: data.brand,
      project_id: data.project_id,
    } as any);

    const items = json?.recommendations ?? [];
    return items.map((r: any) => ({
      category: r.category,
      priority: r.priority,
      title: r.title,
      description: r.description,
      expected_impact: r.expected_impact,
    }));
  }

  /** Projects — list all tracked brands/projects */
  async listProjects(apiKey: string) {
    const json = await this.request(apiKey, 'GET', '/projects');
    const projects = json?.projects ?? [];
    return projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      created_at: p.created_at,
    }));
  }
}
