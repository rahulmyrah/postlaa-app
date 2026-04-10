import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

const KLING_BASE = 'https://api.klingai.com/v1';

interface KlingTaskResult {
  task_id: string;
  task_status: 'submitted' | 'processing' | 'succeed' | 'failed';
  task_result?: { videos?: Array<{ url: string }> };
}

@ThirdParty({
  identifier: 'klingai',
  title: 'Kling AI',
  description:
    'Generate stunning AI videos from text or images with Kling's state-of-the-art video generation models.',
  position: 'media',
  fields: [],
})
export class KlingAiProvider extends ThirdPartyAbstract {
  private _buildJwt(accessKey: string, secretKey: string): string {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 })
    ).toString('base64url');

    const { createHmac } = require('crypto');
    const sig = createHmac('sha256', secretKey)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${sig}`;
  }

  private _parseKey(apiKey: string): { accessKey: string; secretKey: string } {
    const [accessKey, secretKey] = apiKey.split(':');
    if (!accessKey || !secretKey) {
      throw new Error('Kling API key format must be "accessKey:secretKey"');
    }
    return { accessKey, secretKey };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    try {
      const { accessKey, secretKey } = this._parseKey(apiKey);
      const jwt = this._buildJwt(accessKey, secretKey);

      const res = await fetch(`${KLING_BASE}/account/costs`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (res.status === 401 || res.status === 403) return false;

      const json = await res.json().catch(() => ({}));
      if (json?.code !== 0 && res.status !== 200) return false;

      return { name: 'Kling AI', username: accessKey, id: accessKey };
    } catch {
      return false;
    }
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { accessKey, secretKey } = this._parseKey(apiKey);
    const jwt = this._buildJwt(accessKey, secretKey);

    const body: Record<string, any> = {
      model_name: data?.model || 'kling-v1.5-pro',
      prompt: data?.prompt || '',
      negative_prompt: data?.negative_prompt || '',
      cfg_scale: data?.cfg_scale ?? 0.5,
      mode: data?.mode || 'pro',
      aspect_ratio: data?.aspect_ratio || '16:9',
      duration: data?.duration || '5',
    };

    if (data?.image_url) {
      body.image = data.image_url;
    }

    const endpoint = data?.image_url
      ? `${KLING_BASE}/videos/image2video`
      : `${KLING_BASE}/videos/text2video`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Kling AI error: ${err?.message || res.statusText}`);
    }

    const json = await res.json();
    const taskId = json?.data?.task_id;
    if (!taskId) throw new Error('Kling AI: no task_id returned');

    return this._poll(jwt, taskId);
  }

  private async _poll(jwt: string, taskId: string): Promise<string> {
    for (let attempt = 0; attempt < 120; attempt++) {
      await new Promise((r) => setTimeout(r, 5000));

      const res = await fetch(`${KLING_BASE}/videos/text2video/${taskId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (!res.ok) continue;

      const json = (await res.json()) as { data: KlingTaskResult };
      const task = json?.data;

      if (task?.task_status === 'succeed') {
        const url = task?.task_result?.videos?.[0]?.url;
        if (!url) throw new Error('Kling AI: task succeeded but no video URL');
        return url;
      }

      if (task?.task_status === 'failed') {
        throw new Error('Kling AI: video generation failed');
      }
    }

    throw new Error('Kling AI: generation timed out after 10 minutes');
  }

  async models(apiKey: string) {
    return [
      { id: 'kling-v1', name: 'Kling v1 (Standard)' },
      { id: 'kling-v1-5', name: 'Kling v1.5 (Enhanced)' },
      { id: 'kling-v1.5-pro', name: 'Kling v1.5 Pro (Best Quality)' },
      { id: 'kling-v2-master', name: 'Kling v2 Master (Latest)' },
    ];
  }

  async aspectRatios(apiKey: string) {
    return [
      { id: '16:9', name: '16:9 Landscape' },
      { id: '9:16', name: '9:16 Portrait (Reels/Stories)' },
      { id: '1:1', name: '1:1 Square' },
    ];
  }
}
