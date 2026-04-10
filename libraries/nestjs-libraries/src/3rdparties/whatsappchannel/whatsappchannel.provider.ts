import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

@ThirdParty({
  identifier: 'whatsappchannel',
  title: 'WhatsApp',
  description:
    'Send messages via the WhatsApp Business Cloud API. Enter credentials as: phoneNumberId:::accessToken (from Meta Developer Console).',
  position: 'webhook',
  fields: [],
})
export class WhatsAppChannelProvider extends ThirdPartyAbstract {
  private readonly graphBase = 'https://graph.facebook.com/v19.0';

  private parse(apiKey: string): { phoneId: string; token: string } {
    const [phoneId, token] = apiKey.split(':::');
    return { phoneId: phoneId?.trim(), token: token?.trim() };
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { phoneId, token } = this.parse(apiKey);
    if (!phoneId || !token) return false;

    const res = await fetch(
      `${this.graphBase}/${phoneId}?fields=display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.id) return false;
    return {
      name: json.verified_name || `WhatsApp (${json.display_phone_number})`,
      username: json.display_phone_number || phoneId,
      id: json.id,
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { phoneId, token } = this.parse(apiKey);
    if (!phoneId || !token) return '';

    const postText: string = data?.value || data?.text || '';
    const recipientPhone: string = data?.recipient || data?.to || '';

    if (!recipientPhone) return '';

    const body: any = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'text',
      text: { body: postText },
    };

    // Attach image if provided
    if (data?.images?.[0]) {
      body.type = 'image';
      body.image = { link: data.images[0], caption: postText };
      delete body.text;
    }

    const res = await fetch(
      `${this.graphBase}/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) return '';
    const json = await res.json().catch(() => null);
    return json?.messages?.[0]?.id || '';
  }
}
