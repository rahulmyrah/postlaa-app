import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

const DUB_BASE = 'https://api.dub.co';

@ThirdParty({
  identifier: 'dub',
  title: 'Dub',
  description:
    'Create short, branded links with analytics via Dub.co. Enter your Dub API key.',
  position: 'webhook',
  fields: [],
})
export class DubProvider extends ThirdPartyAbstract {
  private _headers(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${DUB_BASE}/workspaces`, {
      headers: this._headers(apiKey),
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json) return false;
    const workspace = Array.isArray(json) ? json[0] : json;
    return {
      name: workspace?.name || 'Dub Workspace',
      username: workspace?.slug || 'dub',
      id: workspace?.id || apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const url: string = data?.url || data?.link || '';
    if (!url) return '';

    const res = await fetch(`${DUB_BASE}/links`, {
      method: 'POST',
      headers: this._headers(apiKey),
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return url;
    const json = await res.json().catch(() => null);
    return json?.shortLink || url;
  }
}
