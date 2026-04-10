import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'stabilityai',
  title: 'Stability AI',
  description:
    'Generate images with Stable Diffusion 3.5 and Stable Image Ultra via Stability AI.',
  position: 'media',
  fields: [],
})
export class StabilityAiProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.stability.ai/v2beta';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch('https://api.stability.ai/v1/user/account', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) return false;

    const data = await res.json();
    return {
      name: data.email || 'Stability AI User',
      username: data.id || 'stability',
      id: data.id || apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const model = data?.model || 'stable-image/generate/ultra';
    const prompt = data?.prompt || '';
    const aspectRatio = data?.aspectRatio || '1:1';
    const outputFormat = 'webp';

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('aspect_ratio', aspectRatio);
    form.append('output_format', outputFormat);

    if (data?.negativePrompt) {
      form.append('negative_prompt', data.negativePrompt);
    }

    const res = await fetch(`${this.BASE}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/*',
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Stability AI error: ${JSON.stringify(err)}`);
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/webp;base64,${base64}`;
  }

  async models(apiKey: string) {
    return [
      { id: 'stable-image/generate/ultra', name: 'Stable Image Ultra (best)' },
      { id: 'stable-image/generate/core', name: 'Stable Image Core (fast)' },
      { id: 'stable-image/generate/sd3', name: 'Stable Diffusion 3.5' },
    ];
  }

  async aspectRatios(apiKey: string) {
    return [
      { id: '1:1', name: 'Square (1:1)' },
      { id: '16:9', name: 'Landscape (16:9)' },
      { id: '9:16', name: 'Portrait 9:16 (Reels)' },
      { id: '4:3', name: 'Standard (4:3)' },
      { id: '3:2', name: 'Photo (3:2)' },
      { id: '2:3', name: 'Portrait (2:3)' },
    ];
  }
}
