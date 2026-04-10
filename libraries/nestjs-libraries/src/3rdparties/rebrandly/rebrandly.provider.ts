import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

const REBRANDLY_BASE = 'https://api.rebrandly.com/v1';

@ThirdParty({
  identifier: 'rebrandly',
  title: 'Rebrandly',
  description:
    'Create branded short links that reflect your domain. Enter your Rebrandly API key.',
  position: 'webhook',
  fields: [],
})
export class RebrandlyProvider extends ThirdPartyAbstract {
  private _headers(apiKey: string): Record<string, string> {
    return {
      apikey: apiKey,
      'Content-Type': 'application/json',
    };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${REBRANDLY_BASE}/account`, {
      headers: this._headers(apiKey),
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json) return false;
    return {
      name: json.fullName || json.username || 'Rebrandly User',
      username: json.username || 'rebrandly',
      id: json.id || apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const destination: string = data?.url || data?.link || '';
    if (!destination) return '';

    const res = await fetch(`${REBRANDLY_BASE}/links`, {
      method: 'POST',
      headers: this._headers(apiKey),
      body: JSON.stringify({ destination }),
    });
    if (!res.ok) return destination;
    const json = await res.json().catch(() => null);
    return json?.shortUrl ? `https://${json.shortUrl}` : destination;
  }
}
