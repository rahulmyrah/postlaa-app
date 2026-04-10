import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

function parsePostHogKey(apiKey: string): { key: string; host: string } {
  const parts = apiKey.split(':::');
  return {
    key: parts[0],
    host: parts[1] || 'https://app.posthog.com',
  };
}

@ThirdParty({
  identifier: 'posthog',
  title: 'PostHog',
  description:
    'Send post-published events to PostHog for product analytics. Enter your PostHog project write key. For self-hosted: apiKey:::https://your.host',
  position: 'webhook',
  fields: [],
})
export class PostHogProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { key, host } = parsePostHogKey(apiKey);
    if (!key || key.length < 8) return false;

    const res = await fetch(`${host}/api/projects`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    const project = json?.results?.[0] || {};
    return {
      name: project.name || 'PostHog Project',
      username: 'posthog',
      id: String(project.id || key.slice(-8)),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { key, host } = parsePostHogKey(apiKey);
    if (!key) return '';

    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event: 'post_published',
        distinct_id: data?.userId || 'postlaa-system',
        properties: {
          platform: data?.platform || 'social',
          post_id: data?.postId || '',
          text_preview: (data?.text || '').slice(0, 100),
        },
      }),
    });
    return '';
  }
}
