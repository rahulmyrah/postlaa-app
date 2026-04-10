import { Global, Module } from '@nestjs/common';
import { HeygenProvider } from '@gitroom/nestjs-libraries/3rdparties/heygen/heygen.provider';
import { ReelFarmProvider } from '@gitroom/nestjs-libraries/3rdparties/reelfarm/reelfarm.provider';
import { FalAiProvider } from '@gitroom/nestjs-libraries/3rdparties/falai/falai.provider';
import { ReplicateProvider } from '@gitroom/nestjs-libraries/3rdparties/replicate/replicate.provider';
import { ElevenLabsProvider } from '@gitroom/nestjs-libraries/3rdparties/elevenlabs/elevenlabs.provider';
import { PexelsProvider } from '@gitroom/nestjs-libraries/3rdparties/pexels/pexels.provider';
import { OpenAiImagesProvider } from '@gitroom/nestjs-libraries/3rdparties/openaiimages/openaiimages.provider';
import { GoogleImagenProvider } from '@gitroom/nestjs-libraries/3rdparties/googleimagen/googleimagen.provider';
import { RunwayMlProvider } from '@gitroom/nestjs-libraries/3rdparties/runwayml/runwayml.provider';
import { StabilityAiProvider } from '@gitroom/nestjs-libraries/3rdparties/stabilityai/stabilityai.provider';
import { PerplexityProvider } from '@gitroom/nestjs-libraries/3rdparties/perplexity/perplexity.provider';
import { KlingAiProvider } from '@gitroom/nestjs-libraries/3rdparties/klingai/klingai.provider';
import { BlotatoProvider } from '@gitroom/nestjs-libraries/3rdparties/blotato/blotato.provider';
// Link Tracking
import { BitlyProvider } from '@gitroom/nestjs-libraries/3rdparties/bitly/bitly.provider';
import { DubProvider } from '@gitroom/nestjs-libraries/3rdparties/dub/dub.provider';
import { RebrandlyProvider } from '@gitroom/nestjs-libraries/3rdparties/rebrandly/rebrandly.provider';
// Analytics
import { GoogleAnalyticsProvider } from '@gitroom/nestjs-libraries/3rdparties/googleanalytics/googleanalytics.provider';
import { PostHogProvider } from '@gitroom/nestjs-libraries/3rdparties/posthog/posthog.provider';
import { MixpanelProvider } from '@gitroom/nestjs-libraries/3rdparties/mixpanel/mixpanel.provider';
import { PlausibleProvider } from '@gitroom/nestjs-libraries/3rdparties/plausible/plausible.provider';
// Research & Trends
import { NewsApiProvider } from '@gitroom/nestjs-libraries/3rdparties/newsapi/newsapi.provider';
import { RssFeedProvider } from '@gitroom/nestjs-libraries/3rdparties/rssfeed/rssfeed.provider';
import { YouTubeTrendingProvider } from '@gitroom/nestjs-libraries/3rdparties/youtubetrending/youtubetrending.provider';
import { GoogleTrendsProvider } from '@gitroom/nestjs-libraries/3rdparties/googletrends/googletrends.provider';
// Creative
import { CanvaProvider } from '@gitroom/nestjs-libraries/3rdparties/canva/canva.provider';
// Newsletter
import { BeehiivProvider } from '@gitroom/nestjs-libraries/3rdparties/beehiiv/beehiiv.provider';
import { ConvertKitProvider } from '@gitroom/nestjs-libraries/3rdparties/convertkit/convertkit.provider';
import { MailchimpProvider } from '@gitroom/nestjs-libraries/3rdparties/mailchimp/mailchimp.provider';
// Storage
import { DropboxProvider } from '@gitroom/nestjs-libraries/3rdparties/dropbox/dropbox.provider';
import { OneDriveProvider } from '@gitroom/nestjs-libraries/3rdparties/onedrive/onedrive.provider';
import { CloudinaryProvider } from '@gitroom/nestjs-libraries/3rdparties/cloudinary/cloudinary.provider';
// CMS
import { WebflowProvider } from '@gitroom/nestjs-libraries/3rdparties/webflow/webflow.provider';
import { GhostProvider } from '@gitroom/nestjs-libraries/3rdparties/ghost/ghost.provider';
import { ShopifyBlogProvider } from '@gitroom/nestjs-libraries/3rdparties/shopifyblog/shopifyblog.provider';
import { ContentfulProvider } from '@gitroom/nestjs-libraries/3rdparties/contentful/contentful.provider';
import { SanityProvider } from '@gitroom/nestjs-libraries/3rdparties/sanity/sanity.provider';
// Automation
import { MakeAutomationProvider } from '@gitroom/nestjs-libraries/3rdparties/makeautomation/makeautomation.provider';
import { PipedreamProvider } from '@gitroom/nestjs-libraries/3rdparties/pipedream/pipedream.provider';
// Social Distribution
import { WhatsAppChannelProvider } from '@gitroom/nestjs-libraries/3rdparties/whatsappchannel/whatsappchannel.provider';
import { SnapchatProvider } from '@gitroom/nestjs-libraries/3rdparties/snapchat/snapchat.provider';
import { SubstackProvider } from '@gitroom/nestjs-libraries/3rdparties/substack/substack.provider';
import { QuoraProvider } from '@gitroom/nestjs-libraries/3rdparties/quora/quora.provider';
import { LineProvider } from '@gitroom/nestjs-libraries/3rdparties/line/line.provider';
import { WeChatProvider } from '@gitroom/nestjs-libraries/3rdparties/wechat/wechat.provider';
// Knowledge
import { GoogleDocsProvider } from '@gitroom/nestjs-libraries/3rdparties/googledocs/googledocs.provider';
import { AirtableProvider } from '@gitroom/nestjs-libraries/3rdparties/airtable/airtable.provider';
import { ThirdPartyManager } from '@gitroom/nestjs-libraries/3rdparties/thirdparty.manager';

@Global()
@Module({
  providers: [
    HeygenProvider,
    ReelFarmProvider,
    FalAiProvider,
    ReplicateProvider,
    ElevenLabsProvider,
    PexelsProvider,
    OpenAiImagesProvider,
    GoogleImagenProvider,
    RunwayMlProvider,
    StabilityAiProvider,
    PerplexityProvider,
    KlingAiProvider,
    BlotatoProvider,
    // Link Tracking
    BitlyProvider,
    DubProvider,
    RebrandlyProvider,
    // Analytics
    GoogleAnalyticsProvider,
    PostHogProvider,
    MixpanelProvider,
    PlausibleProvider,
    // Research & Trends
    NewsApiProvider,
    RssFeedProvider,
    YouTubeTrendingProvider,
    GoogleTrendsProvider,
    // Creative
    CanvaProvider,
    // Newsletter
    BeehiivProvider,
    ConvertKitProvider,
    MailchimpProvider,
    // Storage
    DropboxProvider,
    OneDriveProvider,
    CloudinaryProvider,
    // CMS
    WebflowProvider,
    GhostProvider,
    ShopifyBlogProvider,
    ContentfulProvider,
    SanityProvider,
    // Automation
    MakeAutomationProvider,
    PipedreamProvider,
    // Social Distribution
    WhatsAppChannelProvider,
    SnapchatProvider,
    SubstackProvider,
    QuoraProvider,
    LineProvider,
    WeChatProvider,
    // Knowledge
    GoogleDocsProvider,
    AirtableProvider,
    ThirdPartyManager,
  ],
  get exports() {
    return this.providers;
  },
})
export class ThirdPartyModule {}
