import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'falai',
  title: 'Fal.ai',
  description:
    'Generate images and videos using FLUX.1, fast-sdxl, and 100+ AI models via Fal.ai.',
  position: 'media',
  fields: [],
})
export class FalAiProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch('https://fal.run/fal-ai/fast-sdxl', {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'test',
        num_inference_steps: 1,
        image_size: 'square_hd',
        num_images: 1,
      }),
    });

    if (res.status === 401 || res.status === 403) {
      return false;
    }

    return {
      name: 'Fal.ai',
      username: 'falai',
      id: apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const model = data?.model || 'fal-ai/flux/schnell';
    const res = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: data?.prompt || '',
        image_size: data?.image_size || 'landscape_4_3',
        num_inference_steps: data?.steps || 4,
        num_images: 1,
      }),
    });

    if (!res.ok) {
      throw new Error(`Fal.ai error: ${res.statusText}`);
    }

    const json = await res.json();
    return json?.images?.[0]?.url || json?.image?.url || '';
  }

  async models(apiKey: string) {
    return [
      { id: 'fal-ai/flux/schnell', name: 'FLUX Schnell (fastest)' },
      { id: 'fal-ai/flux/dev', name: 'FLUX Dev (quality)' },
      { id: 'fal-ai/flux-pro', name: 'FLUX Pro (best quality)' },
      { id: 'fal-ai/flux-realism', name: 'FLUX Realism' },
      { id: 'fal-ai/fast-sdxl', name: 'Fast SDXL' },
      { id: 'fal-ai/stable-diffusion-v3-medium', name: 'Stable Diffusion 3 Medium' },
      { id: 'fal-ai/kling-video/v1.5/pro/text-to-video', name: 'Kling v1.5 Pro Video' },
    ];
  }

  async generateImage(apiKey: string, data: { prompt: string; model?: string; image_size?: string }) {
    return this.sendData(apiKey, data);
  }
}
