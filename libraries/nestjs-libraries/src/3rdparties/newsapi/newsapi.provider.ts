import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'newsapi',
  title: 'NewsAPI',
  description:
    'Browse top headlines and search news articles to inspire your posts. Enter your NewsAPI.org API key.',
  position: 'media-library',
  fields: [],
})
export class NewsApiProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://newsapi.org/v2';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(
      `${this.BASE}/top-headlines?country=us&pageSize=1&apiKey=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (json?.status !== 'ok') return false;
    return { name: 'NewsAPI', username: 'newsapi', id: apiKey.slice(-8) };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { query?: string; page?: number }
  ): Promise<{
    results: {
      id: string;
      url: string;
      thumbnail?: string;
      name: string;
      type: 'image' | 'video';
    }[];
    pages: number;
  }> {
    const page = data?.page || 1;
    const q = data?.query || 'technology';
    const pageSize = 20;

    const endpoint = data?.query
      ? `${this.BASE}/everything?q=${encodeURIComponent(q)}&pageSize=${pageSize}&page=${page}&sortBy=publishedAt&language=en&apiKey=${encodeURIComponent(apiKey)}`
      : `${this.BASE}/top-headlines?country=us&pageSize=${pageSize}&page=${page}&apiKey=${encodeURIComponent(apiKey)}`;

    const res = await fetch(endpoint);
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json || json.status !== 'ok') return { results: [], pages: 0 };

    return {
      results: (json.articles || []).map((a: any, i: number) => ({
        id: a.url || `newsapi-${i}`,
        url: a.url || '',
        thumbnail: a.urlToImage || undefined,
        name: a.title || 'Untitled',
        type: 'image' as const,
      })),
      pages: Math.ceil((json.totalResults || 0) / pageSize),
    };
  }
}
