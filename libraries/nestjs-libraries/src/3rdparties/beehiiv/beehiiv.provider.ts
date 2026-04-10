import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'beehiiv',
  title: 'Beehiiv',
  description:
    'Publish posts to your Beehiiv newsletter. Enter credentials as: apiKey:::publicationId (e.g. key_abc123:::pub_xyz456).',
  position: 'webhook',
  fields: [],
})
export class BeehiivProvider extends ThirdPartyAbstract {
  private readonly baseUrl = 'https://api.beehiiv.com/v2';

  private parse(apiKey: string): { key: string; pubId: string } {
    const [key, pubId] = apiKey.split(':::');
    return { key: key?.trim(), pubId: pubId?.trim() };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { key, pubId } = this.parse(apiKey);
    if (!key || !pubId) return false;
    const res = await fetch(`${this.baseUrl}/publications/${pubId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.data) return false;
    return {
      name: json.data.name || 'Beehiiv Publication',
      username: json.data.slug || pubId,
      id: pubId,
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { key, pubId } = this.parse(apiKey);
    if (!key || !pubId) return '';

    const postText: string = data?.value || data?.text || '';
    const title: string = postText.split('\n')[0]?.slice(0, 80) || 'New Post';
    const body = `<p>${postText.replace(/\n/g, '</p><p>')}</p>`;

    const res = await fetch(`${this.baseUrl}/publications/${pubId}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        subtitle: '',
        content_tags: [],
        status: 'draft',
        content: { type: 'free', web: body },
        authors: [],
      }),
    });

    if (!res.ok) return '';
    const json = await res.json().catch(() => null);
    return json?.data?.id || '';
  }
}
