import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

/**
 * DataForSEO — pay-as-you-go SEO backbone.
 * API credentials: "email:password" (the login you use on dataforseo.com).
 * Covers: SERP · keyword research · backlinks · on-page · rank tracking · domain analytics.
 */
@ThirdParty({
  identifier: 'dataforseo',
  title: 'DataForSEO',
  description:
    'Pay-as-you-go SEO backbone powering all agents. One API key covers SERP data, keyword research, 2.1T backlinks, OnPage audits, rank tracking and domain analytics. Enter your DataForSEO login as "email:password".',
  position: 'media',
  fields: [],
})
export class DataForSeoProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.dataforseo.com/v3';

  private auth(apiKey: string): string {
    // apiKey is stored as "email:password"
    return 'Basic ' + Buffer.from(apiKey).toString('base64');
  }

  private async post(apiKey: string, path: string, body: object): Promise<any> {
    const res = await fetch(`${this.BASE}${path}`, {
      method: 'POST',
      headers: {
        Authorization: this.auth(apiKey),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `DataForSEO error ${res.status}: ${err?.status_message || res.statusText}`
      );
    }

    return res.json();
  }

  private async get(apiKey: string, path: string): Promise<any> {
    const res = await fetch(`${this.BASE}${path}`, {
      headers: { Authorization: this.auth(apiKey) },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `DataForSEO error ${res.status}: ${err?.status_message || res.statusText}`
      );
    }

    return res.json();
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    try {
      // Validate by calling the account info endpoint
      const json = await this.get(apiKey, '/appendix/user_data');
      if (!json || json.status_code !== 20000) return false;

      const email = apiKey.split(':')[0];
      const balance = json.tasks?.[0]?.result?.[0]?.money?.balance ?? '?';

      return {
        name: `DataForSEO (Balance: $${balance})`,
        username: email,
        id: email,
      };
    } catch {
      return false;
    }
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    // Generic dispatch — route by data.action
    const action = data?.action || 'serp';
    switch (action) {
      case 'serp':
        return JSON.stringify(await this.serp(apiKey, data));
      case 'keywords':
        return JSON.stringify(await this.keywordsForSite(apiKey, data));
      case 'backlinks':
        return JSON.stringify(await this.backlinks(apiKey, data));
      case 'onpage':
        return JSON.stringify(await this.onPage(apiKey, data));
      case 'rank_tracking':
        return JSON.stringify(await this.rankTracking(apiKey, data));
      default:
        return JSON.stringify(await this.serp(apiKey, data));
    }
  }

  /** SERP API — live organic results for a keyword */
  async serp(
    apiKey: string,
    data: { keyword: string; location_code?: number; language_code?: string; depth?: number }
  ) {
    const json = await this.post(apiKey, '/serp/google/organic/live/advanced', [
      {
        keyword: data.keyword,
        location_code: data.location_code ?? 2840, // United States
        language_code: data.language_code ?? 'en',
        depth: data.depth ?? 10,
      },
    ]);

    const items = json?.tasks?.[0]?.result?.[0]?.items ?? [];
    return items
      .filter((i: any) => i.type === 'organic')
      .map((i: any) => ({
        rank: i.rank_absolute,
        title: i.title,
        url: i.url,
        description: i.description,
        domain: i.domain,
      }));
  }

  /** Keywords For Site — find keyword opportunities for a domain */
  async keywordsForSite(
    apiKey: string,
    data: { target: string; location_code?: number; language_code?: string; limit?: number }
  ) {
    const json = await this.post(
      apiKey,
      '/dataforseo_labs/google/keywords_for_site/live',
      [
        {
          target: data.target,
          location_code: data.location_code ?? 2840,
          language_code: data.language_code ?? 'en',
          limit: data.limit ?? 50,
          filters: [
            ['keyword_info.search_volume', '>', 100],
            'and',
            ['keyword_info.competition', '<', 0.8],
          ],
        },
      ]
    );

    const items = json?.tasks?.[0]?.result?.[0]?.items ?? [];
    return items.map((i: any) => ({
      keyword: i.keyword,
      search_volume: i.keyword_info?.search_volume,
      competition: i.keyword_info?.competition,
      cpc: i.keyword_info?.cpc,
      keyword_difficulty: i.keyword_properties?.keyword_difficulty,
      search_intent: i.search_intent_info?.main_intent,
    }));
  }

  /** Keyword Research — find keywords by seed keyword */
  async keywordResearch(
    apiKey: string,
    data: { keyword: string; location_code?: number; language_code?: string; limit?: number }
  ) {
    const json = await this.post(
      apiKey,
      '/dataforseo_labs/google/related_keywords/live',
      [
        {
          keyword: data.keyword,
          location_code: data.location_code ?? 2840,
          language_code: data.language_code ?? 'en',
          limit: data.limit ?? 30,
          depth: 2,
        },
      ]
    );

    const items = json?.tasks?.[0]?.result?.[0]?.items ?? [];
    return items.map((i: any) => ({
      keyword: i.keyword_data?.keyword,
      search_volume: i.keyword_data?.keyword_info?.search_volume,
      keyword_difficulty: i.keyword_data?.keyword_properties?.keyword_difficulty,
      cpc: i.keyword_data?.keyword_info?.cpc,
      search_intent: i.keyword_data?.search_intent_info?.main_intent,
      related_keywords: i.related_keywords?.slice(0, 5),
    }));
  }

  /** Backlinks Summary — domain authority & link profile for a target */
  async backlinks(
    apiKey: string,
    data: { target: string; limit?: number }
  ) {
    const json = await this.post(apiKey, '/backlinks/summary/live', [
      {
        target: data.target,
        include_subdomains: true,
      },
    ]);

    const result = json?.tasks?.[0]?.result?.[0] ?? {};
    return {
      domain: result.target,
      external_links_count: result.external_links_count,
      referring_domains: result.referring_domains,
      referring_ips: result.referring_ips,
      broken_backlinks: result.broken_backlinks,
      rank: result.rank,
      domain_from_rank: result.domain_from_rank,
    };
  }

  /** Backlinks Competitors — find domains linking to competitors but not you */
  async backlinkCompetitors(
    apiKey: string,
    data: { target: string; competitors: string[]; limit?: number }
  ) {
    const json = await this.post(apiKey, '/backlinks/competitors/live', [
      {
        target: data.target,
        filters: ['referring_domains', '>', 5],
        limit: data.limit ?? 50,
      },
    ]);

    const items = json?.tasks?.[0]?.result?.[0]?.items ?? [];
    return items.map((i: any) => ({
      domain: i.url,
      referring_domains: i.referring_domains,
      rank: i.avg_backlink_rank,
    }));
  }

  /** OnPage Audit — full technical SEO audit for a URL */
  async onPage(
    apiKey: string,
    data: { target: string; max_crawl_pages?: number }
  ) {
    // Step 1: Create task
    const taskJson = await this.post(apiKey, '/on_page/task_post', [
      {
        target: data.target,
        max_crawl_pages: data.max_crawl_pages ?? 100,
        load_resources: true,
        enable_javascript: false,
        custom_js: '',
      },
    ]);

    const taskId = taskJson?.tasks?.[0]?.id;
    if (!taskId) throw new Error('OnPage task creation failed');

    // Step 2: Poll for results (up to 3 attempts, 5s apart)
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const summary = await this.get(apiKey, `/on_page/summary/${taskId}`);
      const result = summary?.tasks?.[0]?.result?.[0];
      if (result) {
        return {
          pages_crawled: result.pages_count,
          broken_links: result.broken_links,
          broken_resources: result.broken_resources,
          duplicate_title: result.duplicate_title,
          duplicate_description: result.duplicate_description,
          no_description: result.checks?.no_description,
          no_h1: result.checks?.no_h1_tag,
          low_content_rate: result.checks?.low_content_rate,
          speed_issues: result.page_metrics?.checks?.is_4xx_code,
          internal_links_count: result.internal_links_count,
          external_links_count: result.external_links_count,
        };
      }
    }

    return { task_id: taskId, status: 'processing' };
  }

  /** Rank Tracking — check rankings for keywords */
  async rankTracking(
    apiKey: string,
    data: { domain: string; keywords: string[]; location_code?: number }
  ) {
    const tasks = data.keywords.slice(0, 10).map((kw) => ({
      keyword: kw,
      location_code: data.location_code ?? 2840,
      language_code: 'en',
      depth: 100,
    }));

    const json = await this.post(
      apiKey,
      '/serp/google/organic/live/advanced',
      tasks
    );

    const results: any[] = [];
    for (const task of json?.tasks ?? []) {
      const keyword = task.data?.keyword;
      const items = task.result?.[0]?.items ?? [];
      const match = items.find(
        (i: any) => i.type === 'organic' && i.domain?.includes(data.domain)
      );
      results.push({
        keyword,
        rank: match?.rank_absolute ?? null,
        url: match?.url ?? null,
        in_top_10: match ? match.rank_absolute <= 10 : false,
      });
    }

    return results;
  }

  /** Domain Analytics — competitive overview for a domain */
  async domainAnalytics(
    apiKey: string,
    data: { domain: string; location_code?: number; limit?: number }
  ) {
    const json = await this.post(
      apiKey,
      '/dataforseo_labs/google/domain_rank_overview/live',
      [
        {
          target: data.domain,
          location_code: data.location_code ?? 2840,
          language_code: 'en',
        },
      ]
    );

    const result = json?.tasks?.[0]?.result?.[0]?.items?.[0] ?? {};
    return {
      domain: data.domain,
      organic_traffic: result.metrics?.organic?.etv,
      organic_keywords: result.metrics?.organic?.count,
      paid_traffic: result.metrics?.paid?.etv,
      paid_keywords: result.metrics?.paid?.count,
    };
  }
}
