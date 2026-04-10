import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'dropbox',
  title: 'Dropbox',
  description:
    'Browse media files stored in your Dropbox. Enter your Dropbox OAuth2 access token (generated at dropbox.com/developers).',
  position: 'media-library',
  fields: [],
})
export class DropboxProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(
      'https://api.dropboxapi.com/2/users/get_current_account',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: 'null',
      }
    );
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.account_id) return false;
    return {
      name: json.name?.display_name || 'Dropbox User',
      username: json.email || 'dropbox',
      id: json.account_id,
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { path?: string; cursor?: string }
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
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

    let body: any;
    let endpoint: string;

    if (data?.cursor) {
      endpoint =
        'https://api.dropboxapi.com/2/files/list_folder/continue';
      body = { cursor: data.cursor };
    } else {
      endpoint = 'https://api.dropboxapi.com/2/files/list_folder';
      body = { path: data?.path || '', limit: 20, recursive: false };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.entries) return { results: [], pages: 0 };

    const mediaFiles = json.entries.filter((e: any) => {
      if (e['.tag'] !== 'file') return false;
      const lower = e.name.toLowerCase();
      return [...imageExts, ...videoExts].some((ext) => lower.endsWith(ext));
    });

    // Get temporary links for each file
    const results = await Promise.all(
      mediaFiles.slice(0, 20).map(async (file: any) => {
        const lower = file.name.toLowerCase();
        const type: 'image' | 'video' = videoExts.some((e) => lower.endsWith(e))
          ? 'video'
          : 'image';

        const linkRes = await fetch(
          'https://api.dropboxapi.com/2/files/get_temporary_link',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: file.path_lower }),
          }
        );
        const linkJson = await linkRes.json().catch(() => null);
        const url = linkJson?.link || '';

        return {
          id: file.id,
          url,
          thumbnail: type === 'image' ? url : undefined,
          name: file.name,
          type,
        };
      })
    );

    return { results, pages: json.has_more ? 2 : 1 };
  }
}
