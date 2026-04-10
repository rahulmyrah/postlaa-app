import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'shopifyblog',
  title: 'Shopify Blog',
  description:
    'Browse and publish blog articles on your Shopify store. Enter credentials as: accessToken:::storeDomain (e.g. shpat_abc:::mystore.myshopify.com).',
  position: 'media-library',
  fields: [],
})
export class ShopifyBlogProvider extends ThirdPartyAbstract {
  private readonly apiVersion = '2024-04';

  private parse(apiKey: string): { token: string; domain: string } {
    const [token, domain] = apiKey.split(':::');
    return {
      token: token?.trim(),
      domain: domain?.trim().replace(/\/$/, ''),
    };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { token, domain } = this.parse(apiKey);
    if (!token || !domain) return false;

    const res = await fetch(
      `https://${domain}/admin/api/${this.apiVersion}/shop.json`,
      { headers: { 'X-Shopify-Access-Token': token } }
    );
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.shop) return false;
    return {
      name: json.shop.name || domain,
      username: json.shop.myshopify_domain || domain,
      id: String(json.shop.id),
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { blogId?: string; page?: number }
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
    const { token, domain } = this.parse(apiKey);
    if (!token || !domain) return { results: [], pages: 0 };

    // Get blogs first if no blogId
    let blogId = data?.blogId;
    if (!blogId) {
      const blogsRes = await fetch(
        `https://${domain}/admin/api/${this.apiVersion}/blogs.json`,
        { headers: { 'X-Shopify-Access-Token': token } }
      );
      const blogsJson = await blogsRes.json().catch(() => null);
      blogId = String(blogsJson?.blogs?.[0]?.id || '');
    }

    if (!blogId) return { results: [], pages: 0 };

    const page = data?.page || 1;
    const limit = 20;
    const since = (page - 1) * limit;

    const res = await fetch(
      `https://${domain}/admin/api/${this.apiVersion}/blogs/${blogId}/articles.json?limit=${limit}`,
      { headers: { 'X-Shopify-Access-Token': token } }
    );
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.articles) return { results: [], pages: 0 };

    const results = json.articles.map((article: any) => ({
      id: String(article.id),
      url: `https://${domain}/blogs/${article.handle || article.id}`,
      thumbnail: article.image?.src || undefined,
      name: article.title || 'Untitled Article',
      type: 'image' as const,
    }));

    return { results, pages: 1 };
  }
}
