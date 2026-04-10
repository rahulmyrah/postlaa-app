import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'quora',
  title: 'Quora',
  description:
    'Forward post content to a Quora-connected webhook. Enter a webhook URL to receive post data for Quora publishing automation.',
  position: 'webhook',
  fields: [],
})
export class QuoraProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    if (!apiKey?.startsWith('http')) return false;
    try {
      const url = new URL(apiKey);
      return {
        name: 'Quora Webhook',
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
      title: postText.split('\n')[0]?.slice(0, 100) || '',
      mediaUrls: data?.images || data?.media || [],
      scheduledAt: data?.scheduledAt || new Date().toISOString(),
      platform: 'quora',
    };

    const res = await fetch(apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok ? 'triggered' : '';
  }
}
