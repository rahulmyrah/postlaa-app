import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'runwayml',
  title: 'RunwayML',
  description:
    'Create AI-generated videos with Gen-3 Alpha and Gen-3 Turbo from text or image prompts.',
  position: 'media',
  fields: [],
})
export class RunwayMlProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.dev.runwayml.com/v1';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${this.BASE}/organization`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    if (!res.ok) return false;

    const data = await res.json();
    return {
      name: data.name || 'RunwayML',
      username: data.id || 'runway',
      id: data.id || apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const model = data?.model || 'gen3a_turbo';
    const promptText = data?.prompt || '';
    const duration = data?.duration || 5;
    const ratio = data?.ratio || '1280:720';

    const body: Record<string, any> = {
      model,
      promptText,
      duration,
      ratio,
      watermark: false,
    };

    if (data?.promptImage) {
      body.promptImage = data.promptImage;
    }

    const res = await fetch(`${this.BASE}/image_to_video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`RunwayML error: ${err?.error || res.statusText}`);
    }

    const task = await res.json();
    return await this._pollTask(apiKey, task.id);
  }

  private async _pollTask(apiKey: string, taskId: string): Promise<string> {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await fetch(`${this.BASE}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      });
      const task = await res.json();
      if (task.status === 'SUCCEEDED') return task.output?.[0] || '';
      if (task.status === 'FAILED') throw new Error('RunwayML task failed');
    }
    throw new Error('RunwayML task timed out');
  }

  async models(apiKey: string) {
    return [
      { id: 'gen3a_turbo', name: 'Gen-3 Alpha Turbo (fast)' },
      { id: 'gen3a', name: 'Gen-3 Alpha (quality)' },
    ];
  }

  async ratios(apiKey: string) {
    return [
      { id: '1280:720', name: 'Landscape 16:9 (1280×720)' },
      { id: '720:1280', name: 'Portrait 9:16 (720×1280) — Reels' },
      { id: '1104:832', name: 'Landscape 4:3' },
      { id: '832:1104', name: 'Portrait 3:4' },
      { id: '960:960', name: 'Square 1:1' },
    ];
  }
}
