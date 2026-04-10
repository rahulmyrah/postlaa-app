import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';
import * as crypto from 'crypto';

@ThirdParty({
  identifier: 'cloudinary',
  title: 'Cloudinary',
  description:
    'Browse images and videos from your Cloudinary media library. Enter credentials as: cloudName:::apiKey:::apiSecret (e.g. mycloud:::123456:::abcxyz).',
  position: 'media-library',
  fields: [],
})
export class CloudinaryProvider extends ThirdPartyAbstract {
  private parse(apiKey: string): {
    cloudName: string;
    key: string;
    secret: string;
  } {
    const [cloudName, key, secret] = apiKey.split(':::');
    return {
      cloudName: cloudName?.trim(),
      key: key?.trim(),
      secret: secret?.trim(),
    };
  }

  private sign(params: Record<string, string>, secret: string): string {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');
    return crypto
      .createHash('sha256')
      .update(sorted + secret)
      .digest('hex');
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { cloudName, key, secret } = this.parse(apiKey);
    if (!cloudName || !key || !secret) return false;

    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = this.sign({ timestamp }, secret);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
        },
      }
    );
    if (!res.ok) return false;
    return {
      name: `Cloudinary (${cloudName})`,
      username: cloudName,
      id: cloudName,
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { resourceType?: string; nextCursor?: string }
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
    const { cloudName, key, secret } = this.parse(apiKey);
    if (!cloudName || !key || !secret) return { results: [], pages: 0 };

    const resourceType = data?.resourceType || 'image';
    const params = new URLSearchParams({ max_results: '20' });
    if (data?.nextCursor) params.set('next_cursor', data.nextCursor);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}?${params.toString()}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
        },
      }
    );
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.resources) return { results: [], pages: 0 };

    const results = json.resources.map((r: any) => ({
      id: r.public_id,
      url: r.secure_url,
      thumbnail:
        r.resource_type === 'image'
          ? r.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fit/')
          : undefined,
      name: r.public_id.split('/').pop() || r.public_id,
      type: r.resource_type === 'video' ? ('video' as const) : ('image' as const),
    }));

    return { results, pages: json.next_cursor ? 2 : 1 };
  }
}
