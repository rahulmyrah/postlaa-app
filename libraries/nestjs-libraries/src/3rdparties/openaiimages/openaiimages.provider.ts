import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'openaiimages',
  title: 'OpenAI Images',
  description:
    'Generate stunning images using gpt-image-1, the latest OpenAI image generation model.',
  position: 'media',
  fields: [],
})
export class OpenAiImagesProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) return false;

    return {
      name: 'OpenAI Images',
      username: 'openai',
      id: apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const prompt = data?.prompt || '';
    const size = data?.size || '1024x1024';
    const quality = data?.quality || 'standard';

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size,
        quality,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`OpenAI Images error: ${err?.error?.message || res.statusText}`);
    }

    const json = await res.json();
    const imageData = json.data?.[0];

    // gpt-image-1 returns b64_json by default
    if (imageData?.b64_json) {
      return `data:image/png;base64,${imageData.b64_json}`;
    }
    return imageData?.url || '';
  }

  async sizes(apiKey: string) {
    return [
      { id: '1024x1024', name: 'Square (1024×1024)' },
      { id: '1536x1024', name: 'Landscape (1536×1024)' },
      { id: '1024x1536', name: 'Portrait (1024×1536)' },
    ];
  }

  async qualities(apiKey: string) {
    return [
      { id: 'standard', name: 'Standard' },
      { id: 'hd', name: 'HD (higher detail)' },
    ];
  }

  async generateImage(apiKey: string, data: { prompt: string; size?: string; quality?: string }) {
    return this.sendData(apiKey, data);
  }
}
