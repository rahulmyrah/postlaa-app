import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'replicate',
  title: 'Replicate',
  description:
    'Run thousands of AI models for image, video, audio and text generation via Replicate.',
  position: 'media',
  fields: [],
})
export class ReplicateProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    return {
      name: data.name || data.username,
      username: data.username,
      id: data.username,
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const model = data?.model || 'black-forest-labs/flux-schnell';
    const input = data?.input || { prompt: data?.prompt || '' };

    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({ input }),
    });

    if (!res.ok) {
      throw new Error(`Replicate error: ${res.statusText}`);
    }

    const prediction = await res.json();

    // Sync wait - poll until done
    if (prediction.status !== 'succeeded') {
      return await this._pollPrediction(apiKey, prediction.id);
    }

    const output = prediction.output;
    return Array.isArray(output) ? output[0] : output;
  }

  private async _pollPrediction(apiKey: string, id: string): Promise<string> {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const p = await res.json();
      if (p.status === 'succeeded') {
        const output = p.output;
        return Array.isArray(output) ? output[0] : output;
      }
      if (p.status === 'failed') throw new Error('Replicate prediction failed');
    }
    throw new Error('Replicate prediction timed out');
  }

  async models(apiKey: string) {
    return [
      { id: 'black-forest-labs/flux-schnell', name: 'FLUX Schnell' },
      { id: 'black-forest-labs/flux-dev', name: 'FLUX Dev' },
      { id: 'stability-ai/stable-diffusion-3.5-large', name: 'SD 3.5 Large' },
      { id: 'ideogram-ai/ideogram-v2', name: 'Ideogram v2' },
      { id: 'recraft-ai/recraft-v3', name: 'Recraft v3' },
      { id: 'minimax/video-01', name: 'MiniMax Video' },
      { id: 'luma-ai/dream-machine', name: 'Luma Dream Machine' },
    ];
  }
}
