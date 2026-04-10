import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

const BITLY_BASE = 'https://api-ssl.bitly.com/v4';

function bitlyHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

@ThirdParty({
  identifier: 'bitly',
  title: 'Bitly',
  description:
    'Automatically shorten and track links in your posts. Enter your Bitly access token.',
  position: 'webhook',
  fields: [],
})
export class BitlyProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${BITLY_BASE}/user`, {
      headers: bitlyHeaders(apiKey),
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json) return false;
    return {
      name: json.name || json.login || 'Bitly User',
      username: json.login || 'bitly',
      id: json.login || apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const longUrl: string = data?.url || data?.link || '';
    if (!longUrl) return '';

    const res = await fetch(`${BITLY_BASE}/shorten`, {
      method: 'POST',
      headers: bitlyHeaders(apiKey),
      body: JSON.stringify({ long_url: longUrl }),
    });
    if (!res.ok) return longUrl;
    const json = await res.json().catch(() => null);
    return json?.link || longUrl;
  }

  models(): string[] {
    return ['bitly'];
  }
}
