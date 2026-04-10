import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

@ThirdParty({
  identifier: 'youtubetrending',
  title: 'YouTube Trending',
  description:
    'Browse trending and popular YouTube videos for content inspiration. Enter your Google Cloud API key with YouTube Data API v3 enabled.',
  position: 'media-library',
  fields: [],
})
export class YouTubeTrendingProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(
      `${YT_BASE}/videos?chart=mostPopular&part=snippet&maxResults=1&key=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.items) return false;
    return { name: 'YouTube Trending', username: 'youtube', id: apiKey.slice(-8) };
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
    const pageToken = data?.page && data.page > 1 ? `&pageToken=page${data.page}` : '';
    let url: string;

    if (data?.query) {
      url = `${YT_BASE}/search?part=snippet&q=${encodeURIComponent(data.query)}&type=video&maxResults=20&order=viewCount${pageToken}&key=${encodeURIComponent(apiKey)}`;
    } else {
      url = `${YT_BASE}/videos?chart=mostPopular&part=snippet&maxResults=20${pageToken}&regionCode=US&key=${encodeURIComponent(apiKey)}`;
    }

    const res = await fetch(url);
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.items) return { results: [], pages: 0 };

    return {
      results: json.items.map((item: any) => {
        const videoId = item.id?.videoId || item.id;
        const snippet = item.snippet || {};
        return {
          id: String(videoId),
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail:
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url,
          name: snippet.title || 'Untitled Video',
          type: 'video' as const,
        };
      }),
      pages: json.nextPageInfo ? (data?.page || 1) + 1 : data?.page || 1,
    };
  }
}
