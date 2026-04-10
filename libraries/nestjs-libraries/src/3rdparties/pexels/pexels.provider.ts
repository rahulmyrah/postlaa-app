import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'pexels',
  title: 'Pexels',
  description:
    'Search and import free high-quality stock photos and videos from Pexels.',
  position: 'media-library',
  fields: [],
})
export class PexelsProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.pexels.com';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${this.BASE}/v1/curated?per_page=1`, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) return false;

    return {
      name: 'Pexels',
      username: 'pexels',
      id: apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { query?: string; page?: number; type?: 'photos' | 'videos' }
  ): Promise<{
    results: {
      id: string;
      url: string;
      thumbnail?: string;
      name: string;
      type: 'video' | 'image';
    }[];
    pages: number;
  }> {
    const page = data?.page || 1;
    const query = data?.query || 'nature';
    const type = data?.type || 'photos';
    const perPage = 20;

    if (type === 'videos') {
      const res = await fetch(
        `${this.BASE}/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
        { headers: { Authorization: apiKey } }
      );
      if (!res.ok) return { results: [], pages: 0 };
      const json = await res.json();
      return {
        results: json.videos.map((v: any) => ({
          id: String(v.id),
          url: v.video_files.sort((a: any, b: any) => b.width - a.width)[0]?.link || '',
          thumbnail: v.image,
          name: v.url.split('/').pop() || `pexels-video-${v.id}`,
          type: 'video' as const,
        })),
        pages: Math.ceil(json.total_results / perPage),
      };
    }

    const endpoint = query
      ? `${this.BASE}/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`
      : `${this.BASE}/v1/curated?per_page=${perPage}&page=${page}`;

    const res = await fetch(endpoint, { headers: { Authorization: apiKey } });
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json();

    return {
      results: json.photos.map((p: any) => ({
        id: String(p.id),
        url: p.src.original,
        thumbnail: p.src.medium,
        name: p.alt || `pexels-photo-${p.id}`,
        type: 'image' as const,
      })),
      pages: Math.ceil(json.total_results / perPage),
    };
  }
}
