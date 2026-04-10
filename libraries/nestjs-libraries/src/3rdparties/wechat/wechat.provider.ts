import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'wechat',
  title: 'WeChat',
  description:
    'Publish to a WeChat Official Account. Enter credentials as: appId:::appSecret (from the WeChat Open Platform console).',
  position: 'webhook',
  fields: [],
})
export class WeChatProvider extends ThirdPartyAbstract {
  private readonly baseUrl = 'https://api.weixin.qq.com/cgi-bin';

  private parse(apiKey: string): { appId: string; appSecret: string } {
    const [appId, appSecret] = apiKey.split(':::');
    return { appId: appId?.trim(), appSecret: appSecret?.trim() };
  }

  private async getAccessToken(
    appId: string,
    appSecret: string
  ): Promise<string | null> {
    const res = await fetch(
      `${this.baseUrl}/token?grant_type=client_credential&appid=${encodeURIComponent(appId)}&secret=${encodeURIComponent(appSecret)}`
    );
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return json?.access_token || null;
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { appId, appSecret } = this.parse(apiKey);
    if (!appId || !appSecret) return false;

    const token = await this.getAccessToken(appId, appSecret);
    if (!token) return false;

    return {
      name: `WeChat Official Account (${appId})`,
      username: appId,
      id: appId,
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { appId, appSecret } = this.parse(apiKey);
    if (!appId || !appSecret) return '';

    const token = await this.getAccessToken(appId, appSecret);
    if (!token) return '';

    const postText: string = data?.value || data?.text || '';

    // Send a text message broadcast (for subscription accounts)
    const res = await fetch(
      `${this.baseUrl}/message/mass/sendall?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: { is_to_all: true },
          text: { content: postText },
          msgtype: 'text',
        }),
      }
    );

    if (!res.ok) return '';
    const json = await res.json().catch(() => null);
    return String(json?.msg_id || json?.errcode || '');
  }
}
