import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'line',
  title: 'LINE',
  description:
    'Broadcast messages to your LINE Official Account followers. Enter your LINE Channel Access Token (from the LINE Developers Console).',
  position: 'webhook',
  fields: [],
})
export class LineProvider extends ThirdPartyAbstract {
  private readonly baseUrl = 'https://api.line.me/v2/bot';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${this.baseUrl}/info`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.basicId) return false;
    return {
      name: json.displayName || 'LINE Official Account',
      username: json.basicId || 'line',
      id: json.userId || json.basicId,
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const postText: string = data?.value || data?.text || '';
    const messages: any[] = [];

    // Add image first if provided
    if (data?.images?.[0]) {
      messages.push({
        type: 'image',
        originalContentUrl: data.images[0],
        previewImageUrl: data.images[0],
      });
    }

    // Add text message
    if (postText) {
      messages.push({ type: 'text', text: postText.slice(0, 5000) });
    }

    if (messages.length === 0) return '';

    const res = await fetch(`${this.baseUrl}/message/broadcast`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: messages.slice(0, 5) }),
    });

    if (!res.ok) return '';
    const json = await res.json().catch(() => null);
    return String(json?.sentMessages?.[0]?.id || 'sent');
  }
}
