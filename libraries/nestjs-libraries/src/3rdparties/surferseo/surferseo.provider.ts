import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

/**
 * Surfer SEO — content optimization & on-page scoring.
 * API: https://api.surferseo.com/
 * Auth: Bearer API key
 */
@ThirdParty({
  identifier: 'surferseo',
  title: 'Surfer SEO',
  description:
    'Score, optimize, and streamline content creation with Surfer SEO. The SEO Content Creator agent uses Surfer to provide real-time content scores, NLP recommendations, and keyword density targets while writing.',
  position: 'media',
  fields: [],
})
export class SurferSeoProvider extends ThirdPartyAbstract {
  private readonly BASE = 'https://api.surferseo.com/v1';

  private async request<T = any>(
    apiKey: string,
    method: 'GET' | 'POST' | 'PUT',
    path: string,
    body?: object
  ): Promise<T> {
    const res = await fetch(`${this.BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Surfer SEO error ${res.status}: ${err?.message || res.statusText}`
      );
    }

    return res.json() as Promise<T>;
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    try {
      const json = await this.request(apiKey, 'GET', '/user');
      if (!json) return false;

      return {
        name: `Surfer SEO (${json.plan ?? 'Connected'})`,
        username: json.email ?? 'surfer_user',
        id: json.id ?? apiKey.slice(0, 8),
      };
    } catch {
      return false;
    }
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const action = data?.action || 'content_score';
    switch (action) {
      case 'content_score':
        return JSON.stringify(await this.contentScore(apiKey, data));
      case 'create_editor':
        return JSON.stringify(await this.createContentEditor(apiKey, data));
      case 'get_editor':
        return JSON.stringify(await this.getContentEditor(apiKey, data));
      case 'guidelines':
        return JSON.stringify(await this.contentGuidelines(apiKey, data));
      case 'niche_finder':
        return JSON.stringify(await this.nicheFinder(apiKey, data));
      default:
        return JSON.stringify(await this.contentScore(apiKey, data));
    }
  }

  /** Content Score — analyze content against SERP competitors */
  async contentScore(
    apiKey: string,
    data: { keyword: string; url?: string; content?: string; country?: string }
  ) {
    // Create an audit task
    const task = await this.request(apiKey, 'POST', '/content_editor', {
      keyword: data.keyword,
      location: data.country ?? 'en-US',
      url: data.url,
    });

    return {
      editor_id: task?.id,
      keyword: data.keyword,
      status: task?.status ?? 'created',
      score: task?.score ?? null,
    };
  }

  /** Create Content Editor — spin up a Surfer content editor for a keyword */
  async createContentEditor(
    apiKey: string,
    data: { keyword: string; country?: string; url?: string }
  ) {
    const editor = await this.request(apiKey, 'POST', '/content_editor', {
      keyword: data.keyword,
      location: data.country ?? 'en-US',
      url: data.url ?? undefined,
    });

    return {
      id: editor?.id,
      keyword: data.keyword,
      url: editor?.url,
      status: editor?.status,
    };
  }

  /** Get Content Editor — retrieve an existing editor with guidelines and score */
  async getContentEditor(
    apiKey: string,
    data: { editor_id: string }
  ) {
    const editor = await this.request(
      apiKey,
      'GET',
      `/content_editor/${data.editor_id}`
    );

    return {
      id: editor?.id,
      keyword: editor?.keyword,
      score: editor?.score,
      word_count: editor?.word_count_guidelines,
      headings: editor?.heading_guidelines,
      paragraphs: editor?.paragraph_guidelines,
      images: editor?.image_guidelines,
      nlp_terms: editor?.nlp_terms ?? [],
      keywords: editor?.keywords ?? [],
    };
  }

  /** Content Guidelines — structural & NLP guidelines for a keyword */
  async contentGuidelines(
    apiKey: string,
    data: { keyword: string; country?: string }
  ) {
    // Create editor and poll once for guidelines
    const editor = await this.createContentEditor(apiKey, data);

    if (!editor.id) {
      return { error: 'Could not create content editor' };
    }

    // Give Surfer a moment to process competitors
    await new Promise((r) => setTimeout(r, 4000));
    return this.getContentEditor(apiKey, { editor_id: editor.id });
  }

  /** Niche Finder — discover topic clusters for a seed keyword */
  async nicheFinder(
    apiKey: string,
    data: { keyword: string; country?: string }
  ) {
    const json = await this.request(apiKey, 'POST', '/keyword_research', {
      keyword: data.keyword,
      location: data.country ?? 'en-US',
    });

    const questions = json?.questions ?? [];
    const clusters = json?.topic_clusters ?? [];
    return {
      seed_keyword: data.keyword,
      questions: questions.slice(0, 20),
      topic_clusters: clusters.slice(0, 10),
    };
  }

  /** List Content Editors — all your existing Surfer editors */
  async listEditors(apiKey: string, data: { page?: number }) {
    const json = await this.request(
      apiKey,
      'GET',
      `/content_editor?page=${data?.page ?? 1}`
    );

    return (json?.data ?? []).map((e: any) => ({
      id: e.id,
      keyword: e.keyword,
      score: e.score,
      created_at: e.created_at,
      url: e.url,
    }));
  }
}
