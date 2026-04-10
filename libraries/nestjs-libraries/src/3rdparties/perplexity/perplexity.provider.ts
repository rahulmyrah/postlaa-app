import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'perplexity',
  title: 'Perplexity',
  description:
    'Research trending topics and gather real-time web data to fuel AI content creation.',
  position: 'media',
  fields: [],
})
export class PerplexityProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.perplexity.ai';

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const res = await fetch(`${this.BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      }),
    });

    if (res.status === 401 || res.status === 403) return false;

    return {
      name: 'Perplexity AI',
      username: 'perplexity',
      id: apiKey.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const query = data?.query || data?.prompt || '';
    const model = data?.model || 'sonar';

    const res = await fetch(`${this.BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a research assistant that finds trending topics and summarizes information for social media content creation. Be concise and quote sources.',
          },
          { role: 'user', content: query },
        ],
        return_citations: true,
        search_recency_filter: data?.recency || 'week',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Perplexity error: ${err?.error?.message || res.statusText}`);
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content || '';
  }

  async research(apiKey: string, data: { query: string; recency?: string; model?: string }) {
    return this.sendData(apiKey, data);
  }

  async models(apiKey: string) {
    return [
      { id: 'sonar', name: 'Sonar (web search, fast)' },
      { id: 'sonar-pro', name: 'Sonar Pro (deep research)' },
      { id: 'sonar-reasoning', name: 'Sonar Reasoning (complex analysis)' },
    ];
  }
}
