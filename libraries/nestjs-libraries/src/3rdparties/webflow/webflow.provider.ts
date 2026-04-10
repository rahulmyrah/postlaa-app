import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'webflow',
  title: 'Webflow',
  description:
    'Browse CMS collection items from Webflow. Enter credentials as: apiToken:::collectionId (e.g. token_abc:::col_xyz).',
  position: 'media-library',
  fields: [],
})
export class WebflowProvider extends ThirdPartyAbstract {
  private readonly baseUrl = 'https://api.webflow.com/v2';

  private parse(apiKey: string): { token: string; collectionId: string } {
    const [token, collectionId] = apiKey.split(':::');
    return { token: token?.trim(), collectionId: collectionId?.trim() };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { token } = this.parse(apiKey);
    if (!token) return false;
    const res = await fetch(`${this.baseUrl}/token/introspect`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'accept-version': '1.0.0',
      },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json) return false;
    return {
      name: json.application?.displayName || 'Webflow',
      username: json.user?.email || 'webflow',
      id: token.slice(-8),
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { offset?: number }
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
    const { token, collectionId } = this.parse(apiKey);
    if (!token || !collectionId) return { results: [], pages: 0 };

    const offset = data?.offset || 0;
    const res = await fetch(
      `${this.baseUrl}/collections/${collectionId}/items?limit=20&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept-version': '1.0.0',
        },
      }
    );
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.items) return { results: [], pages: 0 };

    const results = json.items.map((item: any) => {
      const fields = item.fieldData || {};
      const img = fields.thumbnail || fields.image || fields.cover || fields['main-image'];
      const thumbnail = typeof img === 'object' ? img?.url : img;
      return {
        id: item.id,
        url: fields.slug
          ? `https://webflow.com/design/${fields.slug}`
          : `https://webflow.com`,
        thumbnail,
        name: fields.name || fields.title || item.id,
        type: 'image' as const,
      };
    });

    const total = json.pagination?.total || 0;
    const pages = Math.ceil(total / 20) || 1;
    return { results, pages };
  }
}
