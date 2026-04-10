import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'makeautomation',
  title: 'Make (Integromat)',
  description:
    'Trigger a Make scenario webhook when a post is scheduled. Enter the webhook URL from your Make scenario (use the "Custom Webhook" module in Make).',
  position: 'webhook',
  fields: [],
})
export class MakeAutomationProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    if (!apiKey?.startsWith('http')) return false;
    try {
      const url = new URL(apiKey);
      if (!url.hostname.includes('make.com') && !url.hostname.includes('integromat.com')) {
        // Accept any URL but warn — user may use custom domain
      }
      return {
        name: 'Make Webhook',
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
      platform: data?.platform || '',
      metadata: data,
    };

    const res = await fetch(apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok ? 'triggered' : '';
  }
}
