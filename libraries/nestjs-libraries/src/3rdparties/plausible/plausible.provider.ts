import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'plausible',
  title: 'Plausible Analytics',
  description:
    'Privacy-friendly analytics for your posts. Enter as: apiKey:::yourdomain.com',
  position: 'webhook',
  fields: [],
})
export class PlausibleProvider extends ThirdPartyAbstract {
  private _parse(apiKey: string): { key: string; domain: string } {
    const [key = '', domain = ''] = apiKey.split(':::');
    return { key, domain };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { key, domain } = this._parse(apiKey);
    if (!key || !domain) return false;

    const res = await fetch(
      `https://plausible.io/api/v1/stats/realtime/visitors?site_id=${encodeURIComponent(domain)}`,
      {
        headers: { Authorization: `Bearer ${key}` },
      }
    );
    if (!res.ok) return false;
    return {
      name: domain,
      username: domain,
      id: domain,
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { domain } = this._parse(apiKey);
    if (!domain) return '';

    await fetch('https://plausible.io/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Postlaa/1.0',
        'X-Forwarded-For': '127.0.0.1',
      },
      body: JSON.stringify({
        name: 'Post Published',
        url: `https://${domain}/posts/${data?.postId || ''}`,
        domain,
        props: {
          platform: data?.platform || 'social',
        },
      }),
    });
    return '';
  }
}
