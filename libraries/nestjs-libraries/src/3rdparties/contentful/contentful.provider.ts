import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'contentful',
  title: 'Contentful',
  description:
    'Browse content entries from your Contentful space. Enter credentials as: deliveryToken:::spaceId (e.g. token_abc:::space_xyz).',
  position: 'media-library',
  fields: [],
})
export class ContentfulProvider extends ThirdPartyAbstract {
  private readonly baseUrl = 'https://cdn.contentful.com';

  private parse(apiKey: string): { token: string; spaceId: string } {
    const [token, spaceId] = apiKey.split(':::');
    return { token: token?.trim(), spaceId: spaceId?.trim() };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { token, spaceId } = this.parse(apiKey);
    if (!token || !spaceId) return false;

    const res = await fetch(`${this.baseUrl}/spaces/${spaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.sys?.id) return false;
    return {
      name: json.name || `Contentful Space (${spaceId})`,
      username: json.sys.id,
      id: json.sys.id,
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { contentType?: string; skip?: number }
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
    const { token, spaceId } = this.parse(apiKey);
    if (!token || !spaceId) return { results: [], pages: 0 };

    const params = new URLSearchParams({
      limit: '20',
      skip: String(data?.skip || 0),
    });
    if (data?.contentType) params.set('content_type', data.contentType);

    // Fetch assets (images/videos) from Contentful
    const res = await fetch(
      `${this.baseUrl}/spaces/${spaceId}/assets?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.items) return { results: [], pages: 0 };

    const results = json.items
      .filter((item: any) => item.fields?.file?.url)
      .map((item: any) => {
        const file = item.fields.file;
        const url = `https:${file.url}`;
        const contentType: string = file.contentType || '';
        const type: 'image' | 'video' = contentType.startsWith('video')
          ? 'video'
          : 'image';
        return {
          id: item.sys.id,
          url,
          thumbnail: type === 'image' ? `${url}?w=200&h=200&fit=thumb` : undefined,
          name: item.fields.title || file.fileName || item.sys.id,
          type,
        };
      });

    const total = json.total || 0;
    const pages = Math.ceil(total / 20) || 1;
    return { results, pages };
  }
}
