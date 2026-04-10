import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'googletrends',
  title: 'Google Trends',
  description:
    'Discover trending search topics via SerpAPI. Enter your SerpAPI key (serpapi.com) to search Google Trends for content ideas.',
  position: 'media-library',
  fields: [],
})
export class GoogleTrendsProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(
      `https://serpapi.com/account?api_key=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json) return false;
    return {
      name: json.email || 'SerpAPI Account',
      username: json.email || 'serpapi',
      id: apiKey.slice(-8),
    };
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
    const q = data?.query || 'social media';
    const url = `https://serpapi.com/search?engine=google_trends&q=${encodeURIComponent(q)}&data_type=TIMESERIES&api_key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json) return { results: [], pages: 0 };

    // Also fetch related queries if available
    const related = json?.related_queries?.rising || json?.related_queries?.top || [];
    const results = related.slice(0, 20).map((item: any, i: number) => ({
      id: `trend-${i}`,
      url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(item.query || q)}`,
      thumbnail: undefined,
      name: item.query || q,
      type: 'image' as const,
    }));

    if (results.length === 0) {
      results.push({
        id: `trend-main`,
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(q)}`,
        thumbnail: undefined,
        name: `Trend: ${q}`,
        type: 'image' as const,
      });
    }

    return { results, pages: 1 };
  }
}
