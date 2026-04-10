import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'airtable',
  title: 'Airtable',
  description:
    'Browse records from an Airtable base as content. Enter credentials as: apiKey:::baseId:::tableName (e.g. patXXX:::appYYY:::Content).',
  position: 'media-library',
  fields: [],
})
export class AirtableProvider extends ThirdPartyAbstract {
  private readonly baseUrl = 'https://api.airtable.com/v0';

  private parse(apiKey: string): {
    key: string;
    baseId: string;
    tableName: string;
  } {
    const [key, baseId, tableName] = apiKey.split(':::');
    return {
      key: key?.trim(),
      baseId: baseId?.trim(),
      tableName: tableName?.trim() || 'Table 1',
    };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { key, baseId } = this.parse(apiKey);
    if (!key || !baseId) return false;

    const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.id) return false;
    return {
      name: json.name || `Airtable Base (${baseId})`,
      username: baseId,
      id: json.id,
    };
  }

  async sendData(_apiKey: string, _data: any): Promise<string> {
    return '';
  }

  async listMedia(
    apiKey: string,
    data?: { offset?: string; view?: string }
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
    const { key, baseId, tableName } = this.parse(apiKey);
    if (!key || !baseId) return { results: [], pages: 0 };

    const params = new URLSearchParams({ pageSize: '20' });
    if (data?.offset) params.set('offset', data.offset);
    if (data?.view) params.set('view', data.view);

    const encodedTable = encodeURIComponent(tableName);
    const res = await fetch(
      `${this.baseUrl}/${baseId}/${encodedTable}?${params.toString()}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return { results: [], pages: 0 };
    const json = await res.json().catch(() => null);
    if (!json?.records) return { results: [], pages: 0 };

    const results = json.records.map((record: any) => {
      const fields = record.fields || {};
      // Look for attachment fields with images/videos
      const attachmentField = Object.values(fields).find(
        (v: any) => Array.isArray(v) && v[0]?.url && v[0]?.type
      ) as any[] | undefined;

      const attachment = attachmentField?.[0];
      const type: 'image' | 'video' =
        attachment?.type?.startsWith('video') ? 'video' : 'image';
      const url = attachment?.url || `https://airtable.com/${baseId}/${record.id}`;
      const thumbnail = attachment?.thumbnails?.large?.url || attachment?.url;

      const nameField = fields.Name || fields.Title || fields.name || fields.title;
      const name = typeof nameField === 'string' ? nameField : record.id;

      return {
        id: record.id,
        url,
        thumbnail: typeof thumbnail === 'string' ? thumbnail : undefined,
        name,
        type,
      };
    });

    return { results, pages: json.offset ? 2 : 1 };
  }
}
