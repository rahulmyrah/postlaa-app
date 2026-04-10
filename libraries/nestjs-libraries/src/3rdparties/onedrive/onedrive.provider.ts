import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'onedrive',
  title: 'OneDrive',
  description:
    'Browse media files from your OneDrive. Enter a Microsoft Graph OAuth2 access token. You can generate one via the Azure portal or MS Identity platform.',
  position: 'media-library',
  fields: [],
})
export class OneDriveProvider extends ThirdPartyAbstract {
  private readonly graphBase = 'https://graph.microsoft.com/v1.0';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${this.graphBase}/me`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.id) return false;
    return {
      name: json.displayName || 'OneDrive User',
      username: json.userPrincipalName || json.mail || 'onedrive',
      id: json.id,
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { folderId?: string; nextLink?: string }
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
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

    const url = data?.nextLink
      ? data.nextLink
      : data?.folderId
      ? `${this.graphBase}/me/drive/items/${data.folderId}/children?$top=20&$select=id,name,file,@microsoft.graph.downloadUrl,thumbnails`
      : `${this.graphBase}/me/drive/root/children?$top=20&$select=id,name,file,@microsoft.graph.downloadUrl,thumbnails`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.value) return { results: [], pages: 0 };

    const results = json.value
      .filter((item: any) => item.file)
      .filter((item: any) => {
        const lower = item.name.toLowerCase();
        return [...imageExts, ...videoExts].some((ext) => lower.endsWith(ext));
      })
      .map((item: any) => {
        const lower = item.name.toLowerCase();
        const type: 'image' | 'video' = videoExts.some((e) =>
          lower.endsWith(e)
        )
          ? 'video'
          : 'image';
        const downloadUrl: string =
          item['@microsoft.graph.downloadUrl'] || '';
        const thumbnail: string | undefined =
          item.thumbnails?.[0]?.medium?.url;
        return {
          id: item.id,
          url: downloadUrl,
          thumbnail,
          name: item.name,
          type,
        };
      });

    return { results, pages: json['@odata.nextLink'] ? 2 : 1 };
  }
}
