import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

/**
 * Semrush — industry-leading keyword & competitive intelligence.
 * API: https://developer.semrush.com/api/
 * Auth: API key (query param &key=)
 */
@ThirdParty({
  identifier: 'semrush',
  title: 'Semrush',
  description:
    'Unlock Semrush keyword research, domain analytics, competitor gap analysis, and backlink auditing directly inside your SEO agents. Requires a Semrush account with API access (Guru plan or higher).',
  position: 'media',
  fields: [],
})
export class SemrushProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.semrush.com';

  private async call(
    apiKey: string,
    params: Record<string, string | number>
  ): Promise<string> {
    const qs = new URLSearchParams({
      key: apiKey,
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ),
    });

    const res = await fetch(`${this.BASE}/?${qs.toString()}`);
    if (!res.ok) {
      throw new Error(`Semrush error ${res.status}: ${res.statusText}`);
    }

    return res.text();
  }

  /** Parse Semrush CSV-like response into array of objects */
  private parseCsv(raw: string): Array<Record<string, string>> {
    const lines = raw.trim().split('\r\n').filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(';');
    return lines.slice(1).map((line) => {
      const values = line.split(';');
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    });
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    try {
      // Use a lightweight call to verify the key works
      const raw = await this.call(apiKey, {
        type: 'phrase_related',
        phrase: 'test',
        database: 'us',
        display_limit: 1,
      });

      // Semrush returns "ERROR..." on invalid key
      if (raw.startsWith('ERROR') || raw.includes('INVALID_KEY')) return false;

      return {
        name: 'Semrush',
        username: 'semrush_user',
        id: apiKey.slice(0, 8) + '...',
      };
    } catch {
      return false;
    }
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const action = data?.action || 'keyword_overview';
    switch (action) {
      case 'keyword_overview':
        return JSON.stringify(await this.keywordOverview(apiKey, data));
      case 'phrase_related':
        return JSON.stringify(await this.relatedKeywords(apiKey, data));
      case 'domain_organic':
        return JSON.stringify(await this.domainOrganic(apiKey, data));
      case 'domain_vs_domain':
        return JSON.stringify(await this.domainVsDomain(apiKey, data));
      case 'backlinks':
        return JSON.stringify(await this.backlinksOverview(apiKey, data));
      default:
        return JSON.stringify(await this.keywordOverview(apiKey, data));
    }
  }

  /** Keyword Overview — volume, difficulty, CPC for a phrase */
  async keywordOverview(
    apiKey: string,
    data: { keyword: string; database?: string }
  ) {
    const raw = await this.call(apiKey, {
      type: 'phrase_all',
      phrase: data.keyword,
      database: data.database ?? 'us',
      display_limit: 1,
    });

    const rows = this.parseCsv(raw);
    return rows.map((r) => ({
      keyword: r['Keyword'] ?? r['Ph'],
      search_volume: r['Search Volume'] ?? r['Nq'],
      keyword_difficulty: r['Keyword Difficulty Index'] ?? r['Kd'],
      cpc: r['CPC'] ?? r['Cp'],
      competition: r['Competition'] ?? r['Co'],
      number_of_results: r['Number of Results'] ?? r['Nr'],
    }));
  }

  /** Related Keywords — semantically related phrases */
  async relatedKeywords(
    apiKey: string,
    data: { keyword: string; database?: string; limit?: number }
  ) {
    const raw = await this.call(apiKey, {
      type: 'phrase_related',
      phrase: data.keyword,
      database: data.database ?? 'us',
      display_limit: data.limit ?? 20,
    });

    return this.parseCsv(raw).map((r) => ({
      keyword: r['Keyword'] ?? r['Ph'],
      search_volume: r['Search Volume'] ?? r['Nq'],
      keyword_difficulty: r['Keyword Difficulty Index'] ?? r['Kd'],
      relevance: r['Relevance'] ?? r['Rr'],
    }));
  }

  /** Domain Organic — top organic keywords for a domain */
  async domainOrganic(
    apiKey: string,
    data: { domain: string; database?: string; limit?: number }
  ) {
    const raw = await this.call(apiKey, {
      type: 'domain_organic',
      domain: data.domain,
      database: data.database ?? 'us',
      display_limit: data.limit ?? 30,
      display_sort: 'tr_desc',
    });

    return this.parseCsv(raw).map((r) => ({
      keyword: r['Keyword'] ?? r['Ph'],
      position: r['Position'] ?? r['Po'],
      search_volume: r['Search Volume'] ?? r['Nq'],
      traffic_percentage: r['Traffic (%)'] ?? r['Tr'],
      url: r['URL'] ?? r['Ur'],
    }));
  }

  /** Domain vs Domain — keyword overlap for competitive gap analysis */
  async domainVsDomain(
    apiKey: string,
    data: { domain: string; competitors: string[]; database?: string }
  ) {
    const competitors = data.competitors.slice(0, 4);
    const params: Record<string, string | number> = {
      type: 'domain_vs_domain',
      domain: data.domain,
      database: data.database ?? 'us',
      display_limit: 30,
    };
    competitors.forEach((c, i) => {
      params[`domain${i + 2}`] = c;
    });

    const raw = await this.call(apiKey, params);
    return this.parseCsv(raw).map((r) => ({
      keyword: r['Keyword'],
      your_position: r['Domain 1'],
      competitor_positions: competitors.map((c, i) => ({
        domain: c,
        position: r[`Domain ${i + 2}`] ?? null,
      })),
    }));
  }

  /** Top Pages — discover highest-traffic pages for a domain */
  async topPages(
    apiKey: string,
    data: { domain: string; database?: string; limit?: number }
  ) {
    const raw = await this.call(apiKey, {
      type: 'domain_adwords_unique',
      domain: data.domain,
      database: data.database ?? 'us',
      display_limit: data.limit ?? 20,
    });

    return this.parseCsv(raw);
  }

  /** Backlinks Overview — linking domains and authority for a domain */
  async backlinksOverview(
    apiKey: string,
    data: { target: string }
  ) {
    const raw = await this.call(apiKey, {
      type: 'backlinks_overview',
      target: data.target,
      target_type: 'root_domain',
    });

    return this.parseCsv(raw).map((r) => ({
      total_backlinks: r['Total Backlinks'],
      ips: r['IPs'],
      referring_domains: r['Referring Domains'],
      authority_score: r['Authority Score'],
    }));
  }
}
