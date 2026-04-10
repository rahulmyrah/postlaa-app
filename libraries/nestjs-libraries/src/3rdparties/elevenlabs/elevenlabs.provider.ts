import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'elevenlabs',
  title: 'ElevenLabs',
  description:
    'Generate ultra-realistic AI voices and audio for videos, podcasts, and content.',
  position: 'media',
  fields: [],
})
export class ElevenLabsProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.elevenlabs.io/v1';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${this.BASE}/user`, {
      headers: { 'xi-api-key': apiKey },
    });

    if (!res.ok) return false;

    const data = await res.json();
    return {
      name: data.first_name || 'ElevenLabs User',
      username: data.xi_api_key?.slice(-8) || 'elevenlabs',
      id: data.xi_api_key?.slice(-8) || apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const voiceId = data?.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
    const text = data?.text || '';

    const res = await fetch(`${this.BASE}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: data?.model || 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!res.ok) throw new Error(`ElevenLabs error: ${res.statusText}`);

    // Return the audio as base64 data URL
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:audio/mpeg;base64,${base64}`;
  }

  async voices(apiKey: string) {
    const res = await fetch(`${this.BASE}/voices`, {
      headers: { 'xi-api-key': apiKey },
    });
    if (!res.ok) return [];
    const { voices } = await res.json();
    return voices.slice(0, 30).map((v: any) => ({
      id: v.voice_id,
      name: v.name,
      category: v.category,
      preview_url: v.preview_url,
    }));
  }

  async models(apiKey: string) {
    return [
      { id: 'eleven_multilingual_v2', name: 'Multilingual v2 (best quality)' },
      { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5 (fastest)' },
      { id: 'eleven_flash_v2_5', name: 'Flash v2.5 (ultra-fast)' },
      { id: 'eleven_monolingual_v1', name: 'English v1' },
    ];
  }
}
