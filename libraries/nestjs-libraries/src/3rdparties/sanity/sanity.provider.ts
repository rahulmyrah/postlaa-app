import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'sanity',
  title: 'Sanity',
  description:
    'Browse documents and assets from your Sanity dataset. Enter credentials as: token:::projectId:::dataset (e.g. skAbC:::myproject:::production).',
  position: 'media-library',
  fields: [],
})
export class SanityProvider extends ThirdPartyAbstract {
  private parse(apiKey: string): {
    token: string;
    projectId: string;
    dataset: string;
  } {
    const [token, projectId, dataset] = apiKey.split(':::');
    return {
      token: token?.trim(),
      projectId: projectId?.trim(),
      dataset: dataset?.trim() || 'production',
    };
  }

  private apiBase(projectId: string, dataset: string): string {
    return `https://${projectId}.api.sanity.io/v2022-03-07/data`;
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { token, projectId, dataset } = this.parse(apiKey);
    if (!token || !projectId) return false;

    const groq = encodeURIComponent('*[_type == "sanity.imageAsset"][0]');
    const res = await fetch(
      `${this.apiBase(projectId, dataset)}/query/${dataset}?query=${groq}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return false;
    return {
      name: `Sanity (${projectId}/${dataset})`,
      username: projectId,
      id: projectId,
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { query?: string; offset?: number }
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
    const { token, projectId, dataset } = this.parse(apiKey);
    if (!token || !projectId) return { results: [], pages: 0 };

    const offset = data?.offset || 0;
    const groqQuery = `*[_type in ["sanity.imageAsset","sanity.fileAsset"]][${offset}...${offset + 20}]{_id,_type,url,originalFilename,mimeType}`;
    const encoded = encodeURIComponent(groqQuery);

    const res = await fetch(
      `${this.apiBase(projectId, dataset)}/query/${dataset}?query=${encoded}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.result) return { results: [], pages: 0 };

    const results = json.result.map((asset: any) => {
      const mime: string = asset.mimeType || '';
      const type: 'image' | 'video' = mime.startsWith('video')
        ? 'video'
        : 'image';
      const url: string = asset.url || '';
      return {
        id: asset._id,
        url,
        thumbnail: type === 'image' ? `${url}?w=200&h=200&fit=crop` : undefined,
        name: asset.originalFilename || asset._id,
        type,
      };
    });

    return { results, pages: results.length === 20 ? 2 : 1 };
  }
}
