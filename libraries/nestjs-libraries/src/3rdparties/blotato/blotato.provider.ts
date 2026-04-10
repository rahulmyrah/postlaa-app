import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

const BLOTATO_BASE = 'https://backend.blotato.com/v2';

@ThirdParty({
  identifier: 'blotato',
  title: 'Blotato',
  description:
    'Cross-post and distribute your content to multiple social platforms simultaneously via Blotato.',
  position: 'webhook',
  fields: [],
})
export class BlotatoProvider extends ThirdPartyAbstract {
  private _headers(apiKey: string): Record<string, string> {
    return {
      'blotato-api-key': apiKey,
      'Content-Type': 'application/json',
    };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${BLOTATO_BASE}/users/me/accounts`, {
      headers: this._headers(apiKey),
    });

    if (res.status === 401 || res.status === 403) return false;
    if (!res.ok) return false;

    const json = await res.json().catch(() => null);
    if (!json) return false;

    const accounts: Array<{ id: string; platform: string; name?: string }> =
      Array.isArray(json) ? json : json?.accounts ?? [];
    const firstName = accounts[0]?.name || accounts[0]?.platform || 'Blotato';

    return {
      name: firstName,
      username: 'blotato',
      id: apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const body: Record<string, any> = {
      post: {
        accountId: data?.accountId,
        content: {
          text: data?.text || '',
          mediaUrls: data?.mediaUrls || [],
          platform: data?.platform || 'twitter',
        },
        target: {
          targetType: data?.platform || 'twitter',
          ...(data?.pageId ? { pageId: data.pageId } : {}),
        },
      },
    };

    if (data?.scheduledTime) {
      body.scheduledTime = data.scheduledTime;
    } else if (data?.useNextFreeSlot) {
      body.useNextFreeSlot = true;
    }

    const res = await fetch(`${BLOTATO_BASE}/posts`, {
      method: 'POST',
      headers: this._headers(apiKey),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Blotato error: ${err?.message || res.statusText}`);
    }

    const json = await res.json();
    return json?.id ?? json?.postId ?? 'published';
  }

  async accounts(apiKey: string) {
    const res = await fetch(`${BLOTATO_BASE}/users/me/accounts`, {
      headers: this._headers(apiKey),
    });

    if (!res.ok) return [];
    const json = await res.json().catch(() => []);
    return Array.isArray(json) ? json : json?.accounts ?? [];
  }
}
