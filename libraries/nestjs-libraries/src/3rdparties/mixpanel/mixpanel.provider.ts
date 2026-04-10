import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

function parseMixpanelKey(apiKey: string): {
  token: string;
  user: string;
  secret: string;
} {
  const [token = '', user = '', secret = ''] = apiKey.split(':::');
  return { token, user, secret };
}

@ThirdParty({
  identifier: 'mixpanel',
  title: 'Mixpanel',
  description:
    'Track social post events in Mixpanel. Enter as: projectToken:::serviceAccountUser:::serviceAccountSecret',
  position: 'webhook',
  fields: [],
})
export class MixpanelProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { token, user, secret } = parseMixpanelKey(apiKey);
    if (!token) return false;

    // Validate via service account if provided
    if (user && secret) {
      const creds = Buffer.from(`${user}:${secret}`).toString('base64');
      const res = await fetch(
        `https://mixpanel.com/api/app/me`,
        {
          headers: { Authorization: `Basic ${creds}` },
        }
      );
      if (!res.ok) return false;
      const json = await res.json().catch(() => null);
      return {
        name: json?.results?.name || 'Mixpanel',
        username: user,
        id: token.slice(-8),
      };
    }

    // Basic format check for project token
    if (token.length < 10) return false;
    return { name: 'Mixpanel Project', username: 'mixpanel', id: token.slice(-8) };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { token } = parseMixpanelKey(apiKey);
    if (!token) return '';

    const event = [
      {
        event: 'Post Published',
        properties: {
          token,
          distinct_id: data?.userId || 'postlaa-system',
          platform: data?.platform || 'social',
          post_id: data?.postId || '',
          time: Math.floor(Date.now() / 1000),
        },
      },
    ];

    await fetch('https://api.mixpanel.com/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return '';
  }
}
