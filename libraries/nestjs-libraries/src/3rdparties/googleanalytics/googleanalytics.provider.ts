import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';

function parseGAKey(apiKey: string): { secret: string; measurementId: string } {
  const [secret = '', measurementId = ''] = apiKey.split(':::');
  return { secret, measurementId };
}

@ThirdParty({
  identifier: 'googleanalytics',
  title: 'Google Analytics',
  description:
    'Track post performance events in GA4 via the Measurement Protocol. Enter as: api_secret:::measurement_id (e.g. AbCdEfGhIj:::G-XXXXXXXXXX).',
  position: 'webhook',
  fields: [],
})
export class GoogleAnalyticsProvider extends ThirdPartyAbstract {
  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    const { secret, measurementId } = parseGAKey(apiKey);
    if (!secret || !measurementId) return false;

    // GA4 Measurement Protocol has no connection-test endpoint; validate format only
    const isValid =
      secret.length > 4 &&
      (measurementId.startsWith('G-') || measurementId.startsWith('GT-'));
    if (!isValid) return false;

    return {
      name: 'Google Analytics',
      username: measurementId,
      id: measurementId,
    };
  }

  async sendData(apiKey: string, data: any): Promise<string> {
    const { secret, measurementId } = parseGAKey(apiKey);
    if (!secret || !measurementId) return '';

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(secret)}`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: data?.userId || 'postlaa-agent',
        events: [
          {
            name: 'post_published',
            params: {
              platform: data?.platform || 'social',
              post_id: data?.postId || '',
              engagement_time_msec: 1,
            },
          },
        ],
      }),
    });
    return '';
  }
}
