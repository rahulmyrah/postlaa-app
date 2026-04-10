import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'googleimagen',
  title: 'Google Imagen',
  description:
    'Generate photorealistic images using Google Imagen 3 — the world\'s most popular AI image model.',
  position: 'media',
  fields: [],
})
export class GoogleImagenProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://generativelanguage.googleapis.com/v1beta';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(
      `${this.BASE}/models?key=${apiKey}`
    );

    if (!res.ok) return false;

    return {
      name: 'Google Imagen',
      username: 'google',
      id: apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const prompt = data?.prompt || '';
    const model = data?.model || 'imagen-3.0-generate-001';
    const aspectRatio = data?.aspectRatio || '1:1';

    const res = await fetch(
      `${this.BASE}/models/${model}:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio,
            safetyFilterLevel: 'BLOCK_LOW_AND_ABOVE',
            personGeneration: 'ALLOW_ADULT',
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Google Imagen error: ${err?.error?.message || res.statusText}`);
    }

    const json = await res.json();
    const b64 = json?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error('Google Imagen: no image in response');
    return `data:image/png;base64,${b64}`;
  }

  async models(apiKey: string) {
    return [
      { id: 'imagen-3.0-generate-001', name: 'Imagen 3 (best quality)' },
      { id: 'imagen-3.0-fast-generate-001', name: 'Imagen 3 Fast (speed)' },
    ];
  }

  async aspectRatios(apiKey: string) {
    return [
      { id: '1:1', name: 'Square (1:1)' },
      { id: '16:9', name: 'Landscape (16:9)' },
      { id: '9:16', name: 'Portrait 9:16 (Reels/Stories)' },
      { id: '4:3', name: 'Standard (4:3)' },
      { id: '3:4', name: 'Portrait (3:4)' },
    ];
  }

  async generateImage(apiKey: string, data: { prompt: string; model?: string; aspectRatio?: string }) {
    return this.sendData(apiKey, data);
  }
}
