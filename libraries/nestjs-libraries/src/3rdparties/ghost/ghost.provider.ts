import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';
import * as crypto from 'crypto';

@ThirdParty({
  identifier: 'ghost',
  title: 'Ghost',
  description:
    'Browse posts from your Ghost publication. Enter credentials as: adminApiKey:::adminUrl (e.g. id:secret:::https://yourblog.ghost.io).',
  position: 'media-library',
  fields: [],
})
export class GhostProvider extends ThirdPartyAbstract {
  private parse(apiKey: string): { id: string; secret: string; url: string } {
    const [keyPart, adminUrl] = apiKey.split(':::');
    const [id, secret] = (keyPart || '').split(':');
    return {
      id: id?.trim(),
      secret: secret?.trim(),
      url: adminUrl?.trim().replace(/\/$/, ''),
    };
  }

  private makeJwt(id: string, secret: string): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT', kid: id })
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300,
        aud: '/admin/',
      })
    ).toString('base64url');
    const sig = crypto
      .createHmac('sha256', Buffer.from(secret, 'hex'))
      .update(`${header}.${payload}`)
      .digest('base64url');
    return `${header}.${payload}.${sig}`;
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { id, secret, url } = this.parse(apiKey);
    if (!id || !secret || !url) return false;

    const token = this.makeJwt(id, secret);
    const res = await fetch(`${url}/ghost/api/admin/site/`, {
      headers: { Authorization: `Ghost ${token}` },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.site) return false;
    return {
      name: json.site.title || 'Ghost Site',
      username: json.site.url || url,
      id,
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { page?: number }
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
    const { id, secret, url } = this.parse(apiKey);
    if (!id || !secret || !url) return { results: [], pages: 0 };

    const token = this.makeJwt(id, secret);
    const page = data?.page || 1;

    const res = await fetch(
      `${url}/ghost/api/admin/posts/?limit=20&page=${page}&fields=id,title,url,feature_image,status`,
      { headers: { Authorization: `Ghost ${token}` } }
    );
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.posts) return { results: [], pages: 0 };

    const results = json.posts.map((post: any) => ({
      id: post.id,
      url: post.url || '',
      thumbnail: post.feature_image || undefined,
      name: post.title || 'Untitled',
      type: 'image' as const,
    }));

    const pages = json.meta?.pagination?.pages || 1;
    return { results, pages };
  }
}
