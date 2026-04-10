import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'snapchat',
  title: 'Snapchat',
  description:
    'Forward post content to a Snapchat-connected webhook endpoint. Enter the webhook URL that will receive post data for Snapchat publishing flows.',
  position: 'webhook',
  fields: [],
})
export class SnapchatProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    if (!apiKey?.startsWith('http')) return false;
    try {
      const url = new URL(apiKey);
      return {
        name: 'Snapchat Webhook',
        username: url.hostname,
        id: url.pathname.split('/').pop() || 'webhook',
      };
    } catch {
      return false;
    }
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    if (!apiKey?.startsWith('http')) return '';

    const postText: string = data?.value || data?.text || '';
    const payload = {
      postText,
      mediaUrls: data?.images || data?.media || [],
      scheduledAt: data?.scheduledAt || new Date().toISOString(),
      platform: 'snapchat',
    };

    const res = await fetch(apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok ? 'triggered' : '';
  }
}
