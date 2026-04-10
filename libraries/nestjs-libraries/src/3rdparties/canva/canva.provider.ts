import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'canva',
  title: 'Canva',
  description:
    'Browse and use your Canva designs. Enter your Canva Connect OAuth User Access Token to list designs from your account.',
  position: 'media-library',
  fields: [],
})
export class CanvaProvider extends ThirdPartyAbstract {
  private readonly baseUrl = 'https://api.canva.com/rest/v1';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${this.baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.profile) return false;
    return {
      name: json.profile.display_name || 'Canva User',
      username: json.profile.email || 'canva',
      id: json.profile.user_id || apiKey.slice(-8),
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { query?: string; continuation?: string }
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
    const params = new URLSearchParams({ limit: '20' });
    if (data?.query) params.set('query', data.query);
    if (data?.continuation) params.set('continuation', data.continuation);

    const res = await fetch(`${this.baseUrl}/designs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.items) return { results: [], pages: 0 };

    const results = json.items.map((design: any) => ({
      id: design.id,
      url: design.urls?.edit_url || design.urls?.view_url || '',
      thumbnail: design.thumbnail?.url,
      name: design.title || 'Untitled Design',
      type: 'image' as const,
    }));

    return { results, pages: json.continuation ? 2 : 1 };
  }
}
