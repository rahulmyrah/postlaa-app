import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'googledocs',
  title: 'Google Docs',
  description:
    'Browse Google Docs and Drive documents as content sources. Enter your Google OAuth2 access token (with Drive read scope).',
  position: 'media-library',
  fields: [],
})
export class GoogleDocsProvider extends ThirdPartyAbstract {
  private readonly driveBase = 'https://www.googleapis.com/drive/v3';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(
      `${this.driveBase}/about?fields=user`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.user?.emailAddress) return false;
    return {
      name: json.user.displayName || 'Google Drive User',
      username: json.user.emailAddress,
      id: json.user.permissionId || apiKey.slice(-8),
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { query?: string; pageToken?: string }
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
    const mimeTypes = [
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
    ];

    const q = data?.query
      ? `fullText contains '${data.query.replace(/'/g, "\\'")}' and trashed=false`
      : `(${mimeTypes.map((m) => `mimeType='${m}'`).join(' or ')}) and trashed=false`;

    const params = new URLSearchParams({
      q,
      pageSize: '20',
      fields: 'nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink)',
    });
    if (data?.pageToken) params.set('pageToken', data.pageToken);

    const res = await fetch(
      `${this.driveBase}/files?${params.toString()}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.files) return { results: [], pages: 0 };

    const videoMimes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const results = json.files.map((file: any) => {
      const type: 'image' | 'video' = videoMimes.includes(file.mimeType)
        ? 'video'
        : 'image';
      return {
        id: file.id,
        url: file.webViewLink || file.webContentLink || `https://drive.google.com/file/d/${file.id}/view`,
        thumbnail: file.thumbnailLink || undefined,
        name: file.name,
        type,
      };
    });

    return { results, pages: json.nextPageToken ? 2 : 1 };
  }
}
