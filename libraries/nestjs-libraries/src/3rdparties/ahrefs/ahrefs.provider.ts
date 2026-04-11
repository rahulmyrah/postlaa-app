import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

/**
 * Ahrefs — backlinks, DR, keyword explorer, site audit.
 * API v3: https://docs.ahrefs.com/docs/api/v3
 * Auth: Bearer token (OAuth2 / API key)
 */
@ThirdParty({
  identifier: 'ahrefs',
  title: 'Ahrefs',
  description:
    "Connect Ahrefs to supercharge your Growth Agent with world-class backlink intelligence, Domain Rating, keyword explorer, and competitor site analysis. Requires an Ahrefs account with API access.",
  position: 'media',
  fields: [],
})
export class AhrefsProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.ahrefs.com/v3';

  private async get(
    apiKey: string,
    path: string,
    params: Record<string, string | number> = {}
  ): Promise<any> {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    );

    const url = `${this.BASE}${path}${qs.toString() ? `?${qs.toString()}` : ''}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Ahrefs error ${res.status}: ${err?.error?.message || res.statusText}`
      );
    }

    return res.json();
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    try {
      const json = await this.get(apiKey, '/subscription');
      if (!json) return false;

      return {
        name: `Ahrefs (${json.plan_name ?? 'Connected'})`,
        username: json.email ?? 'ahrefs_user',
        id: json.account_id ?? apiKey.slice(0, 8),
      };
    } catch {
      return false;
    }
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const action = data?.action || 'site_explorer';
    switch (action) {
      case 'site_explorer':
        return JSON.stringify(await this.siteExplorer(apiKey, data));
      case 'backlinks':
        return JSON.stringify(await this.backlinks(apiKey, data));
      case 'organic_keywords':
        return JSON.stringify(await this.organicKeywords(apiKey, data));
      case 'keyword_explorer':
        return JSON.stringify(await this.keywordExplorer(apiKey, data));
      case 'competitors':
        return JSON.stringify(await this.competitors(apiKey, data));
      case 'content_gap':
        return JSON.stringify(await this.contentGap(apiKey, data));
      default:
        return JSON.stringify(await this.siteExplorer(apiKey, data));
    }
  }

  /** Site Explorer — domain overview (DR, UR, backlinks, organic traffic) */
  async siteExplorer(
    apiKey: string,
    data: { target: string; mode?: 'domain' | 'subdomains' | 'exact' | 'prefix' }
  ) {
    const json = await this.get(apiKey, '/site-explorer/overview', {
      target: data.target,
      mode: data.mode ?? 'domain',
    });

    const m = json?.domain_rating ?? json;
    return {
      domain: data.target,
      domain_rating: m?.domain_rating?.domain_rating,
      ahrefs_rank: m?.ahrefs_rank?.ahrefs_rank,
      backlinks: m?.backlinks_stats?.live ?? m?.backlinks,
      referring_domains: m?.backlinks_stats?.live_refdomains ?? m?.refdomains,
      organic_keywords: m?.organic?.keywords,
      organic_traffic: m?.organic?.traffic,
    };
  }

  /** Backlinks — inbound links with anchor texts and DR */
  async backlinks(
    apiKey: string,
    data: {
      target: string;
      mode?: string;
      limit?: number;
      where?: object;
    }
  ) {
    const json = await this.get(apiKey, '/site-explorer/backlinks', {
      target: data.target,
      mode: data.mode ?? 'domain',
      limit: data.limit ?? 50,
      order_by: 'domain_rating_source:desc',
    });

    const links = json?.backlinks ?? [];
    return links.map((l: any) => ({
      referring_url: l.url_from,
      anchor: l.anchor,
      domain_rating: l.domain_rating_source,
      target_url: l.url_to,
      dofollow: !l.nofollow,
      first_seen: l.first_seen,
    }));
  }

  /** Referring Domains — unique domains linking to target */
  async referringDomains(
    apiKey: string,
    data: { target: string; mode?: string; limit?: number }
  ) {
    const json = await this.get(apiKey, '/site-explorer/refdomains', {
      target: data.target,
      mode: data.mode ?? 'domain',
      limit: data.limit ?? 50,
      order_by: 'domain_rating:desc',
    });

    const domains = json?.refdomains ?? [];
    return domains.map((d: any) => ({
      domain: d.domain,
      domain_rating: d.domain_rating,
      organic_traffic: d.organic?.traffic,
      referring_pages: d.backlinks,
    }));
  }

  /** Organic Keywords — top keywords where domain ranks organically */
  async organicKeywords(
    apiKey: string,
    data: {
      target: string;
      mode?: string;
      country?: string;
      limit?: number;
    }
  ) {
    const json = await this.get(apiKey, '/site-explorer/top-pages', {
      target: data.target,
      mode: data.mode ?? 'domain',
      country: data.country ?? 'us',
      limit: data.limit ?? 50,
      order_by: 'traffic:desc',
    });

    const pages = json?.pages ?? [];
    return pages.map((p: any) => ({
      url: p.url,
      traffic: p.traffic,
      keywords: p.keywords,
      top_keyword: p.top_keyword,
      position: p.position,
    }));
  }

  /** Keyword Explorer — keyword metrics including KD and traffic potential */
  async keywordExplorer(
    apiKey: string,
    data: { keywords: string[]; country?: string }
  ) {
    const json = await this.get(apiKey, '/keywords-explorer/overview', {
      keywords: data.keywords.join(','),
      country: data.country ?? 'us',
    });

    const items = json?.keywords ?? [];
    return items.map((k: any) => ({
      keyword: k.keyword,
      search_volume: k.search_volume,
      keyword_difficulty: k.difficulty,
      traffic_potential: k.traffic_potential,
      cpc: k.cpc,
      parent_topic: k.parent_topic,
    }));
  }

  /** Competitors — find organic competitors for a domain */
  async competitors(
    apiKey: string,
    data: { target: string; country?: string; limit?: number }
  ) {
    const json = await this.get(apiKey, '/site-explorer/competing-domains', {
      target: data.target,
      mode: 'domain',
      country: data.country ?? 'us',
      limit: data.limit ?? 20,
    });

    const domains = json?.competitors ?? [];
    return domains.map((d: any) => ({
      domain: d.domain,
      common_keywords: d.common_keywords,
      competitor_keywords: d.keywords,
      overlap_score: d.overlap_score,
      domain_rating: d.domain_rating,
    }));
  }

  /** Content Gap — keywords competitors rank for but target does not */
  async contentGap(
    apiKey: string,
    data: {
      target: string;
      competitors: string[];
      country?: string;
      limit?: number;
    }
  ) {
    const json = await this.get(apiKey, '/site-explorer/content-gap', {
      target: data.target,
      competitors: data.competitors.slice(0, 3).join(','),
      country: data.country ?? 'us',
      limit: data.limit ?? 30,
    });

    const keywords = json?.gaps ?? [];
    return keywords.map((k: any) => ({
      keyword: k.keyword,
      search_volume: k.search_volume,
      best_position: k.best_position,
      keyword_difficulty: k.difficulty,
      competitor: k.best_ranking_page_domain,
    }));
  }
}
