import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'convertkit',
  title: 'ConvertKit',
  description:
    'Create broadcasts in your ConvertKit (Kit) account. Enter your ConvertKit API key (found in Account Settings → Developer).',
  position: 'webhook',
  fields: [],
})
export class ConvertKitProvider extends ThirdPartyAbstract {
  private readonly baseUrl = 'https://api.convertkit.com/v3';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(
      `${this.baseUrl}/account?api_secret=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.primary_email_address) return false;
    return {
      name: json.name || 'ConvertKit Account',
      username: json.primary_email_address || 'convertkit',
      id: apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const postText: string = data?.value || data?.text || '';
    const subject: string =
      postText.split('\n')[0]?.slice(0, 80) || 'New Broadcast';
    const body = `<p>${postText.replace(/\n/g, '</p><p>')}</p>`;

    const res = await fetch(`${this.baseUrl}/broadcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: apiKey,
        subject,
        content: body,
        description: subject,
        public: false,
      }),
    });

    if (!res.ok) return '';
    const json = await res.json().catch(() => null);
    return String(json?.broadcast?.id || '');
  }
}
