import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'mailchimp',
  title: 'Mailchimp',
  description:
    'Create campaigns in Mailchimp. Enter credentials as: apiKey:::listId (e.g. abc123-us1:::abc123listid). Your API key includes the datacenter suffix like -us1.',
  position: 'webhook',
  fields: [],
})
export class MailchimpProvider extends ThirdPartyAbstract {
  private parse(apiKey: string): { key: string; dc: string; listId: string } {
    const [key, listId] = apiKey.split(':::');
    const dc = key?.split('-').pop() || 'us1';
    return { key: key?.trim(), dc, listId: listId?.trim() };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { key, dc } = this.parse(apiKey);
    if (!key) return false;
    const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/ping`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString('base64')}`,
      },
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.health_status) return false;

    const me = await fetch(`https://${dc}.api.mailchimp.com/3.0/`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString('base64')}`,
      },
    }).then((r) => r.json()).catch(() => ({}));

    return {
      name: me?.account_name || 'Mailchimp Account',
      username: me?.email || 'mailchimp',
      id: me?.account_id || key.slice(-8),
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { key, dc, listId } = this.parse(apiKey);
    if (!key || !listId) return '';

    const postText: string = data?.value || data?.text || '';
    const subject: string =
      postText.split('\n')[0]?.slice(0, 150) || 'New Campaign';
    const body = `<html><body><p>${postText.replace(/\n/g, '</p><p>')}</p></body></html>`;

    const auth = `Basic ${Buffer.from(`anystring:${key}`).toString('base64')}`;

    // Create campaign
    const createRes = await fetch(
      `https://${dc}.api.mailchimp.com/3.0/campaigns`,
      {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'regular',
          recipients: { list_id: listId },
          settings: {
            subject_line: subject,
            from_name: 'Newsletter',
            reply_to: 'noreply@example.com',
          },
        }),
      }
    );
    if (!createRes.ok) return '';
    const campaign = await createRes.json().catch(() => null);
    if (!campaign?.id) return '';

    // Set content
    await fetch(
      `https://${dc}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`,
      {
        method: 'PUT',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: body }),
      }
    );

    return campaign.id;
  }
}
