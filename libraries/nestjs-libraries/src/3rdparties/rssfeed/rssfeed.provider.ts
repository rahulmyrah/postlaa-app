import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'rssfeed',
  title: 'RSS Feed',
  description:
    'Pull articles and content from any RSS/Atom feed to inspire posts. Enter the RSS feed URL as the API key.',
  position: 'media-library',
  fields: [],
})
export class RssFeedProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    try {
      new URL(apiKey);
    } catch {
      return false;
    }
    const res = await fetch(apiKey, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok) return false;
    const text = await res.text().catch(() => '');
    if (!text.includes('<rss') && !text.includes('<feed') && !text.includes('<channel')) return false;
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const feedTitle = titleMatch?.[1]?.trim() || 'RSS Feed';
    return {
      name: feedTitle,
      username: new URL(apiKey).hostname,
      id: apiKey.slice(-12),
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    _data?: { query?: string; page?: number }
  ): Promise<{
    results: {
      id: string;
      url: string;
      thumbnail?: string;
      name: string;
      type: 'image' | 'video';
    }[];
    pages: number;
  }> {
    const res = await fetch(apiKey, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok) return { results: [], pages: 0 };
    const text = await res.text().catch(() => '');

    const items: { id: string; url: string; thumbnail?: string; name: string; type: 'image' }[] = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(text)) !== null && items.length < 20) {
      const block = match[1];
      const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/title>/i);
      const linkMatch = block.match(/<link[^>]*>([^<]+)<\/link>/i) || block.match(/<link[^>]*href="([^"]+)"/i);
      const imgMatch = block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i) || block.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
      const guidMatch = block.match(/<guid[^>]*>([^<]+)<\/guid>/i);

      const url = linkMatch?.[1]?.trim() || '';
      const title = titleMatch?.[1]?.trim() || url;
      if (!url || !title) continue;

      items.push({
        id: guidMatch?.[1]?.trim() || url,
        url,
        thumbnail: imgMatch?.[1]?.trim(),
        name: title,
        type: 'image' as const,
      });
    }

    return { results: items, pages: 1 };
  }
}
