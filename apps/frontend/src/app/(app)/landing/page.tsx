'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';

// ─── Brand logo ───────────────────────────────────────────────────────────────
const PostlaaLogo: FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg-lp" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#612BD3" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="52" height="52" rx="14" fill="url(#pg-lp)" />
    <path d="M18 16h12c5.523 0 10 4.477 10 10s-4.477 10-10 10H24v8h-6V16zm6 14h6a4 4 0 000-8h-6v8z" fill="white" />
    <circle cx="44" cy="44" r="4" fill="#FC69FF" />
  </svg>
);

// ─── Channel icons ─────────────────────────────────────────────────────────────
const channels = [
  { name: 'X / Twitter',  bg: '#000',    fg: '#fff', l: 'X'  },
  { name: 'LinkedIn',     bg: '#0A66C2', fg: '#fff', l: 'in' },
  { name: 'Instagram',    bg: '#E1306C', fg: '#fff', l: 'IG' },
  { name: 'TikTok',       bg: '#010101', fg: '#fff', l: 'TT' },
  { name: 'YouTube',      bg: '#FF0000', fg: '#fff', l: 'YT' },
  { name: 'Facebook',     bg: '#1877F2', fg: '#fff', l: 'fb' },
  { name: 'Threads',      bg: '#101010', fg: '#fff', l: 'Th' },
  { name: 'Pinterest',    bg: '#E60023', fg: '#fff', l: 'Pi' },
  { name: 'Reddit',       bg: '#FF4500', fg: '#fff', l: 'r/' },
  { name: 'Bluesky',      bg: '#0085FF', fg: '#fff', l: 'BS' },
  { name: 'Mastodon',     bg: '#6364FF', fg: '#fff', l: 'Ma' },
  { name: 'Telegram',     bg: '#2CA5E0', fg: '#fff', l: 'TG' },
  { name: 'Discord',      bg: '#5865F2', fg: '#fff', l: 'DC' },
  { name: 'Slack',        bg: '#4A154B', fg: '#fff', l: 'SL' },
  { name: 'WordPress',    bg: '#21759B', fg: '#fff', l: 'WP' },
  { name: 'Medium',       bg: '#000000', fg: '#fff', l: 'Me' },
  { name: 'Dribbble',     bg: '#EA4C89', fg: '#fff', l: 'Dr' },
  { name: 'Substack',     bg: '#FF6719', fg: '#fff', l: 'SS' },
  { name: 'Ghost',        bg: '#15171A', fg: '#fff', l: 'Gh' },
  { name: 'Beehiiv',      bg: '#000000', fg: '#fff', l: 'BH' },
  { name: 'Snapchat',     bg: '#FFFC00', fg: '#000', l: 'SC' },
  { name: 'Twitch',       bg: '#9146FF', fg: '#fff', l: 'Tv' },
  { name: 'Dev.to',       bg: '#0A0A0A', fg: '#fff', l: 'DV' },
  { name: 'Hashnode',     bg: '#2962FF', fg: '#fff', l: 'HN' },
  { name: 'Warpcast',     bg: '#7C3AED', fg: '#fff', l: 'WC' },
  { name: 'Nostr',        bg: '#7c5cbf', fg: '#fff', l: 'NS' },
  { name: 'WeChat',       bg: '#07C160', fg: '#fff', l: 'WX' },
  { name: 'WhatsApp',     bg: '#25D366', fg: '#fff', l: 'WA' },
  { name: 'Webflow',      bg: '#4353FF', fg: '#fff', l: 'WF' },
  { name: 'Quora',        bg: '#B92B27', fg: '#fff', l: 'Qu' },
];

// ─── AI agent roles ─────────────────────────────────────────────────────────────
const agentRoles = [
  {
    icon: '🧠',
    color: '#612BD3',
    title: 'Keyword Strategist',
    humanRole: 'CMO + SEO Strategist',
    humanCost: '$80,000–$140,000 / year',
    poweredBy: ['DataForSEO', 'Semrush', 'Ahrefs', 'Google Trends'],
    whatItDoes: [
      'Finds high-ROI keyword clusters across search & social with Semrush',
      'Analyses competitor content gaps with Ahrefs Site Explorer',
      'Maps keyword difficulty vs. traffic opportunity to pick winners',
      'Builds 30-day editorial calendars around winning search intent',
      'Identifies trending topics via Google Trends before competitors do',
    ],
    example: 'You launch a fintech app for freelancers. The Keyword Strategist queries Semrush + Ahrefs, surfaces "freelance invoice automation" (low KD, 8,100/mo search volume), and delivers 15 content cluster topics with target keywords — in 3 minutes.',
  },
  {
    icon: '✍️',
    color: '#8B5CF6',
    title: 'SEO Content Creator',
    humanRole: 'Content Writer + SEO Copywriter',
    humanCost: '$50,000–$80,000 / year',
    poweredBy: ['DataForSEO', 'Surfer SEO', 'Frase', 'GPT-4o'],
    whatItDoes: [
      'Writes Surfer SEO-optimised long-form articles that rank page 1',
      'Uses Frase to generate NLP-based content briefs with full topic coverage',
      'Creates platform-native social cuts from every blog post automatically',
      'Generates 3 A/B variants per post to test messaging and CTR',
      'Writes YouTube scripts, LinkedIn articles, X threads, and TikTok hooks',
    ],
    example: 'Brief: "Best project management tools for remote teams". Frase outlines 22 required subtopics. Surfer sets the target content score. The agent writes a 2,400-word article scoring 87/100 — plus 6 social posts across platforms — in under 5 minutes.',
  },
  {
    icon: '🛠️',
    color: '#FF6719',
    title: 'Technical Auditor',
    humanRole: 'Technical SEO Specialist',
    humanCost: '$55,000–$90,000 / year',
    poweredBy: ['DataForSEO OnPage', 'Screaming Frog', 'Google Search Console', 'PageSpeed API'],
    whatItDoes: [
      'Crawls your entire site like Screaming Frog to find broken links & errors',
      'Audits meta titles, H1 tags, canonical URLs, and schema markup',
      'Checks Core Web Vitals (LCP, INP, CLS) and mobile page speed',
      'Reads Google Search Console data for crawl errors and index coverage',
      'Delivers a prioritised fix list ranked by SEO impact every week',
    ],
    example: 'Monday morning: audit finds 14 broken internal links, 3 pages with missing meta descriptions, 2 canonical conflicts, and 1 page failing Core Web Vitals. Fix list emailed to your team — zero consultant hours spent.',
  },
  {
    icon: '📈',
    color: '#4ade80',
    title: 'Growth Agent',
    humanRole: 'Link Builder + PR Outreach Specialist',
    humanCost: '$55,000–$85,000 / year',
    poweredBy: ['DataForSEO Backlinks', 'Ahrefs', 'Outreach APIs', 'RSS Feeds'],
    whatItDoes: [
      'Scans Ahrefs for competitor backlinks your brand is missing from',
      'Identifies broken link opportunities on high-DA domains at scale',
      'Drafts personalised outreach sequences for link acquisition campaigns',
      'Monitors brand mentions without backlinks for easy link reclamation',
      'Tracks domain authority changes and new link velocity week-over-week',
    ],
    example: 'Competitor analysis via Ahrefs: they have 40 backlinks from SaaS review sites you\'re absent from. Growth Agent drafts submission content, queues outreach to all 40, and reports back which accepted — fully automated.',
  },
  {
    icon: '🤖',
    color: '#FC69FF',
    badge: '🔥 USP',
    title: 'AI Visibility Agent',
    humanRole: 'GEO Specialist + AI Brand Monitor',
    humanCost: '$65,000–$100,000 / year',
    poweredBy: ['Peec AI', 'Otterly.ai', 'Perplexity'],
    whatItDoes: [
      'Tracks how often ChatGPT, Gemini, Perplexity & Copilot mention your brand',
      'Measures your Share of AI Voice vs. competitors across 6 AI platforms',
      'Identifies exactly which content gets cited by LLMs — and why',
      'Optimises pages to earn more AI citations (Generative Engine Optimization)',
      'Alerts you instantly when competitors gain or lose AI search visibility',
    ],
    example: '"What is the best social media scheduling tool?" on ChatGPT. The AI Visibility Agent tracks where Postlaa ranks in that answer via Otterly.ai + Peec AI, identifies which competitor is cited above us, and rewrites our landing page to win the citation — every week.',
  },
  {
    icon: '🔁',
    color: '#FEBC2E',
    title: 'Auto Optimizer',
    humanRole: 'Conversion Rate Optimiser + Content Refresher',
    humanCost: '$60,000–$95,000 / year',
    poweredBy: ['DataForSEO SERP', 'Google Analytics', 'Google Search Console', 'GPT-4o'],
    whatItDoes: [
      'Revisits every published post every 7–30 days to check for freshness decay',
      'Rewrites titles and meta descriptions based on real CTR data from GSC',
      'Updates stale statistics, outdated examples, and broken external links',
      'Re-publishes refreshed content to signal freshness to search engines',
      'A/B tests heading variants and kills losers based on click-through data',
    ],
    example: 'An article dropped from rank #4 to #11 over 6 months. Auto Optimizer rewrites the H1 (based on GSC CTR data), refreshes 3 outdated statistics, adds 2 new FAQ sections matching recent search queries, and re-submits for indexing — pushing it back to #3.',
  },
];

// ─── Unique integrations ─────────────────────────────────────────────────────
const uniqueIntegrations = [
  {
    category: 'AI Video & Voice',
    color: '#d82d7e',
    icon: '🎬',
    items: [
      { name: 'HeyGen', note: 'AI avatar videos' },
      { name: 'Runway ML', note: 'AI video generation' },
      { name: 'Kling AI', note: 'AI video creation' },
      { name: 'ElevenLabs', note: 'AI voiceover' },
      { name: 'ReelFarm', note: 'Auto-reels & shorts' },
    ],
  },
  {
    category: 'AI Image Generation',
    color: '#8B5CF6',
    icon: '🎨',
    items: [
      { name: 'Fal.ai', note: 'Ultra-fast AI images' },
      { name: 'Stability AI', note: 'Stable Diffusion' },
      { name: 'Google Imagen', note: "Google's image AI" },
      { name: 'OpenAI DALL-E', note: 'GPT-4 image gen' },
      { name: 'Replicate', note: 'Open-source models' },
    ],
  },
  {
    category: 'Analytics & Conversion',
    color: '#0085FF',
    icon: '📊',
    items: [
      { name: 'Google Analytics', note: 'Traffic & goals' },
      { name: 'Mixpanel', note: 'Product analytics' },
      { name: 'PostHog', note: 'Open-source analytics' },
      { name: 'Plausible', note: 'Privacy-first analytics' },
      { name: 'Google Trends', note: 'Trend monitoring' },
    ],
  },
  {
    category: 'Newsletter & Blog',
    color: '#FF6719',
    icon: '📰',
    items: [
      { name: 'Substack', note: 'Newsletter distribution' },
      { name: 'Beehiiv', note: 'Creator newsletters' },
      { name: 'Ghost', note: 'Blog publishing' },
      { name: 'Webflow', note: 'Website CMS' },
      { name: 'Shopify Blog', note: 'E-commerce content' },
    ],
  },
  {
    category: 'Design & Assets',
    color: '#FC69FF',
    icon: '🖼️',
    items: [
      { name: 'Canva', note: 'Visual design' },
      { name: 'Cloudinary', note: 'Media management' },
      { name: 'Google Docs', note: 'Content drafts' },
      { name: 'Dropbox', note: 'Asset storage' },
      { name: 'OneDrive', note: 'Microsoft assets' },
    ],
  },
  {
    category: 'Automation & Distribution',
    color: '#4ade80',
    icon: '⚙️',
    items: [
      { name: 'Blotato', note: 'Multi-platform distribution' },
      { name: 'Pipedream', note: 'Workflow automation' },
      { name: 'n8n', note: 'Self-hosted automation' },
      { name: 'Make.com', note: 'No-code workflows' },
      { name: 'Zapier', note: 'App connectivity' },
    ],
  },
  {
    category: 'SEO Tools',
    color: '#612BD3',
    icon: '🔎',
    byoa: true,
    items: [
      { name: 'DataForSEO',          note: 'Default · pay-as-you-go' },
      { name: 'Semrush',             note: 'Keyword research & audits' },
      { name: 'Ahrefs',              note: 'Backlinks & competitor gaps' },
      { name: 'Moz Pro',             note: 'DA · rankings · link explorer' },
      { name: 'Surfer SEO',          note: 'Content score & NLP' },
      { name: 'Frase',               note: 'AI content briefs' },
      { name: 'Screaming Frog',      note: 'Technical site crawler' },
      { name: 'SE Ranking',          note: 'Rank tracking & on-page' },
      { name: 'Mangools',            note: 'KWFinder · SERPChecker' },
      { name: 'SpyFu',               note: 'Competitor keyword spy' },
      { name: 'Majestic',            note: 'Trust Flow · backlink data' },
      { name: 'Serpstat',            note: 'All-in-one SEO platform' },
      { name: 'Clearscope',          note: 'Content optimisation' },
      { name: 'MarketMuse',          note: 'Content intelligence' },
      { name: 'Google Search Console', note: 'Free · official rank data' },
    ],
  },
  {
    category: 'AI Visibility (GEO)',
    color: '#FC69FF',
    icon: '🤖',
    items: [
      { name: 'Peec AI',       note: 'LLM brand visibility tracking' },
      { name: 'Otterly.ai',    note: 'AI search cite monitoring' },
      { name: 'Perplexity',    note: 'Real-time AI research' },
      { name: 'NewsAPI',       note: 'Trending news feed' },
      { name: 'Google Trends', note: 'Search trend signals' },
    ],
  },
];

// ─── Pricing plans ─────────────────────────────────────────────────────────────
const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    desc: 'Perfect for getting started',
    color: '#454444',
    cta: 'Start free',
    features: [
      '3 social channels',
      '30 posts per month',
      'Basic scheduling & calendar',
      'Post preview',
      'AI copilot (5 uses/day)',
      'Analytics (7-day window)',
    ],
  },
  {
    name: 'Creator',
    price: { monthly: 19, yearly: 15 },
    desc: 'For solo creators & freelancers',
    color: '#612BD3',
    cta: 'Start free trial',
    features: [
      '8 social channels',
      '500 posts per month',
      'AI copilot (unlimited)',
      '50 AI images/month',
      'RSS auto-post',
      'Analytics (30-day window)',
      'API access',
    ],
  },
  {
    name: 'Growth',
    price: { monthly: 39, yearly: 29 },
    desc: 'For brands & small teams',
    color: '#8B5CF6',
    popular: true,
    cta: 'Start free trial',
    features: [
      '20 social channels',
      'Unlimited posts',
      'AI Marketing Agents (2)',
      '150 AI images/month',
      '10 AI videos/month',
      'A/B testing engine',
      'Analytics (90-day window) + ROI tracking',
      'MCP server access',
      'Webhooks & custom integrations',
    ],
  },
  {
    name: 'Agency',
    price: { monthly: 79, yearly: 59 },
    desc: 'For agencies & enterprises',
    color: '#d82d7e',
    cta: 'Start free trial',
    features: [
      '100 social channels',
      'Unlimited posts',
      'AI Marketing Agents (10)',
      '500 AI images + 60 AI videos/month',
      'Full A/B testing + campaign sequences',
      'Client workspaces & white-label reports',
      'Google Analytics / Mixpanel integration',
      'SEO & ASO agent active',
      'Priority support',
    ],
  },
  {
    name: 'Developer',
    price: { monthly: 49, yearly: 37 },
    desc: 'For builders & AI toolsmiths',
    color: '#0085FF',
    cta: 'Start free trial',
    features: [
      '20 social channels',
      'Full REST API (100+ endpoints)',
      'MCP server (Claude Code, Cursor, Windsurf)',
      'n8n + Make.com + Zapier nodes',
      'Webhooks (unlimited endpoints)',
      'SDK (JS / Python)',
      'Agent-to-agent scheduling',
      'Analytics via API',
    ],
  },
];

// ─── Features list ─────────────────────────────────────────────────────────────
const features = [
  {
    tag: 'SCHEDULING',
    icon: '🗓️',
    title: 'Unified multi-channel calendar',
    body: 'Schedule, preview, and publish across 30+ social platforms with one calendar. Each platform gets content formatted to its native spec — automatically.',
    color: '#612BD3',
  },
  {
    tag: 'AI CONTENT',
    icon: '✍️',
    title: 'Platform-native AI copywriting',
    body: 'AI writes LinkedIn posts, X threads, TikTok scripts, YouTube descriptions, and newsletter copy in your brand voice. Not generic output — native to every platform.',
    color: '#8B5CF6',
  },
  {
    tag: 'A/B TESTING',
    icon: '🧪',
    title: 'Automatic content A/B testing',
    body: 'Every post can run 3 variants simultaneously. The system tracks engagement per variant and kills the underperformers, keeping only what works — no manual analysis needed.',
    color: '#d82d7e',
  },
  {
    tag: 'ROI ANALYTICS',
    icon: '📊',
    title: 'Full-funnel ROI tracking',
    body: 'Connect Google Analytics, Mixpanel, or PostHog. See which post drove which signup, purchase, or download. Know your cost per lead per channel — down to the individual post.',
    color: '#0085FF',
  },
  {
    tag: 'AI VISUALS',
    icon: '🎨',
    title: 'AI video + image creation',
    body: 'Generate social videos with HeyGen AI avatars, Runway ML, or Kling AI. Create images with Fal.ai, Stability AI, or Google Imagen. Design with Canva. All inside Postlaa.',
    color: '#FC69FF',
  },
  {
    tag: 'DEVELOPER API',
    icon: '🔌',
    title: 'Postlaa as your marketing layer',
    body: 'MCP server for Claude Code, Cursor, and Windsurf. REST API, n8n/Make.com nodes, Zapier, webhooks, and JS/Python SDKs let AI agents handle publishing programmatically.',
    color: '#4ade80',
  },
];

// ─── Code example ─────────────────────────────────────────────────────────────
const codeExample = `// Add Postlaa MCP to your Claude Code config
{
  "mcpServers": {
    "postlaa": {
      "command": "npx",
      "args": ["-y", "@postlaa/mcp-server"],
      "env": {
        "POSTLAA_API_KEY": "your_api_key"
      }
    }
  }
}

// Now Claude can schedule posts for you:
// "Hey Claude, post a launch announcement to LinkedIn
//  and X when I merge this PR"`;

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  { quote: "The A/B testing alone is worth it. We tested 3 variants of our launch post. The winning version got 8× the clicks. We would never have known without it.", name: 'Priya S.', role: 'Founder, BuildWithAI', metric: '8× more clicks' },
  { quote: 'I used to spend $6k/month on a social media agency. Postlaa with the Agency plan costs $79 and produces better content. I genuinely cannot explain the value gap.', name: 'Carlos R.', role: 'E-commerce Director', metric: '$6k/mo → $79/mo' },
  { quote: 'The MCP integration with Claude Code is remarkable. My CI/CD now posts release notes to 8 channels automatically every single deploy.', name: 'Marcus L.', role: 'Senior Engineer', metric: '100% automated' },
  { quote: 'We manage 35 client accounts with 2 people. The Analytics Agent ties every post back to client revenue. Our clients see real ROI reports, not vanity metrics.', name: 'Diana P.', role: 'Agency Director', metric: '35 clients, 2 people' },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'What exactly do the 6 AI Marketing Agents do?',
    a: 'Each agent is purpose-built with professional-grade tools: (1) Keyword Strategist uses Semrush + Ahrefs to find winning keyword clusters; (2) SEO Content Creator uses Surfer SEO + Frase + GPT-4o to write articles that rank; (3) Technical Auditor uses Screaming Frog + Google Search Console to find and fix site issues; (4) Growth Agent uses Ahrefs + outreach APIs to build backlinks; (5) AI Visibility Agent uses Peec AI + Otterly.ai to track your brand mentions across ChatGPT, Gemini, and Perplexity; (6) Auto Optimizer revisits every piece of content every 7–30 days to refresh and improve CTR.',
  },
  {
    q: 'What tools power each agent? What does it run on?',
    a: 'The backbone is DataForSEO — a single pay-as-you-go API key covering SERP data, keyword research, 2.1 trillion backlinks, OnPage crawling (same data as Screaming Frog), rank tracking, and domain analytics. On top of that: Semrush and Ahrefs for competitive analysis; Surfer SEO and Frase for content scoring and NLP briefs; Peec AI and Otterly.ai for AI search visibility tracking across ChatGPT, Perplexity, Gemini, and Copilot; Google Analytics and GSC for CTR-based optimization; HeyGen, Runway ML, ElevenLabs for creative content. Without this stack, it\'s just a scheduler. With it, it\'s an autonomous marketing company.',
  },
  {
    q: 'What is the AI Visibility Agent and why is it a USP?',
    a: '50% of organic search traffic is projected to shift to AI search by 2028 (Gartner). The AI Visibility Agent tracks how often ChatGPT, Perplexity, Gemini, and Copilot mention your brand using Peec AI and Otterly.ai. It measures your Share of AI Voice vs. competitors, identifies which content earns citations from LLMs, and optimises your pages for Generative Engine Optimization (GEO). No other social media or scheduling tool does this. It\'s the difference between being invisible in the AI era and being the brand AI recommends.',
  },
  {
    q: 'How does A/B testing work?',
    a: 'When you create a post, the AI automatically generates 2-3 variants with different angles (e.g., pain-focused vs. outcome-focused vs. social proof). Postlaa schedules them at different time windows, tracks which gets better engagement, and archives the underperformers. You get a weekly report showing which messaging style resonates with your audience — no spreadsheets, no manual analysis.',
  },
  {
    q: 'How do I track actual conversions — not just likes?',
    a: 'Connect your Google Analytics, Mixpanel, PostHog, or Plausible account to Postlaa. The Analytics Agent then traces the full funnel: which post → which landing page visit → which signup or purchase. You see real revenue attribution per channel, per post, and per AI agent — not vanity metrics like impressions.',
  },
  {
    q: 'What social platforms does Postlaa support?',
    a: 'Postlaa supports 30+ platforms: X/Twitter, LinkedIn, Instagram, TikTok, YouTube, Facebook, Threads, Pinterest, Reddit, Bluesky, Mastodon, Telegram, Discord, Slack, WordPress, Medium, Substack, Beehiiv, Ghost, Webflow, Dribbble, Tumblr, Snapchat, Twitch, Dev.to, Hashnode, Warpcast, Nostr, WeChat, and WhatsApp Channel.',
  },
  {
    q: 'What integrations does Postlaa have that others don\'t?',
    a: 'Two layers: (1) Built-in AI creation — HeyGen, Runway ML, Kling AI, ElevenLabs, Fal.ai, Stability AI, Google Imagen, ReelFarm, Canva, Cloudinary, Blotato, Substack, Beehiiv, Ghost, Webflow, Mixpanel, PostHog, Plausible, Pipedream, Peec AI, Otterly.ai — none available in Postiz, Buffer, Hootsuite, or Later. (2) SEO Tools (BYOA — Bring Your Own Account) — connect your existing Semrush, Ahrefs, Moz Pro, Surfer SEO, Frase, Screaming Frog, SE Ranking, Mangools, SpyFu, Majestic, Serpstat, Clearscope, or MarketMuse subscription. No SEO tool subscriptions? DataForSEO is the built-in pay-as-you-go backbone covering all the same data.',
  },
  {
    q: 'How does the MCP server work for AI coding tools?',
    a: 'Install the Postlaa MCP server and connect it to Claude Code, Cursor, or Windsurf. Your AI coding assistant can then schedule posts, run campaigns, check analytics, and manage your social presence through natural language. Example: "Post a launch announcement to LinkedIn and X when I merge this PR" — your AI handles the rest.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. The Free plan gives you 3 channels, 30 posts/month, and basic AI features — no credit card required. Paid plans start at $19/month with a 7-day free trial. At $39/month, you get all 6 AI Marketing Agents: Keyword Strategist, SEO Content Creator, Technical Auditor, Growth Agent, AI Visibility Agent, and Auto Optimizer.',
  },
];

// ─── Who it's for ─────────────────────────────────────────────────────────────
const personas = [
  { icon: '✍️', title: 'Creators', body: 'Post consistently across every platform without burnout. AI writes in your voice, handles scheduling, and A/B tests content to find what grows your audience fastest.' },
  { icon: '🏢', title: 'Businesses', body: 'Get a full marketing team without the payroll. AI agents handle strategy, content, campaigns, and ROI tracking — at a fraction of the cost.' },
  { icon: '🏬', title: 'Agencies', body: 'Manage 100+ client channels with a lean team. White-label reports, real conversion data, and AI content generation make impossible client loads possible.' },
  { icon: '👨‍💻', title: 'Developers', body: 'Add Postlaa as a marketing layer to any AI workflow. MCP server, REST API, and SDKs let your AI agents handle social publishing programmatically.' },
];

// ─── Main component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeAgent, setActiveAgent] = useState(0);

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Sticky Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0E0E0E]/90 backdrop-blur-md border-b border-[#252525]">
        <div className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-[10px]">
            <PostlaaLogo size={34} />
            <span style={{ fontWeight: 700, fontSize: '19px', letterSpacing: '-0.3px' }}>Postlaa</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[14px] text-white/60">
            <a href="#agents" className="hover:text-white transition-colors">AI Agents</a>
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
            <a href="#developers" className="hover:text-white transition-colors">Developers</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-[14px] text-white/60 hover:text-white transition-colors hidden sm:block">Sign in</Link>
            <Link href="/auth" className="bg-[#612BD3] hover:bg-[#7c3fe8] transition-colors text-white text-[14px] font-semibold px-5 py-2 rounded-[8px]">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-[140px] pb-[80px] px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(97,43,211,0.28) 0%, transparent 60%)' }} />
        <div className="max-w-[960px] mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#612BD3]/40 rounded-full px-4 py-1.5 text-[13px] text-[#8B5CF6] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FC69FF] inline-block animate-pulse" />
            Strategy · Content · Campaigns · Analytics — all on autopilot
          </div>
          <h1 className="text-[52px] md:text-[76px] font-bold leading-[1.04] mb-6" style={{ letterSpacing: '-2.5px' }}>
            Your full AI{' '}
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              marketing team
            </span>
            <br />for the price of lunch
          </h1>
          <p className="text-[18px] md:text-[20px] text-white/55 max-w-[640px] mx-auto mb-4 leading-relaxed" style={{ letterSpacing: '-0.2px' }}>
            A real marketing team — strategy, content, design, campaigns, A/B testing, and ROI tracking — costs $250k–$400k per year in salaries. Postlaa replaces all of it for $39/month.
          </p>
          <p className="text-[15px] text-white/35 max-w-[520px] mx-auto mb-10">
            6 AI agents. 30+ social channels. 50+ integrations. Semrush, Ahrefs, Surfer SEO, Peec AI, and more — all working 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/auth" className="flex items-center gap-2 bg-[#612BD3] hover:bg-[#7c3fe8] transition-colors text-white text-[15px] font-semibold px-8 py-3.5 rounded-[10px] w-full sm:w-auto justify-center">
              Start for $0
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <a href="#agents" className="flex items-center gap-2 bg-[#1A1919] border border-[#252525] hover:border-[#612BD3]/60 transition-colors text-white/70 text-[15px] font-medium px-8 py-3.5 rounded-[10px] w-full sm:w-auto justify-center">
              See what the agents do
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-white/40">
            <span>✓ No credit card required</span>
            <span>✓ Free plan forever</span>
            <span>✓ 20,000+ active users</span>
            <span>✓ Open-source</span>
          </div>
        </div>
      </section>

      {/* ── Scrolling channel logos ── */}
      <div className="border-y border-[#252525] bg-[#0A0A0A] py-6 overflow-hidden">
        <div className="flex gap-4 animate-[scroll_45s_linear_infinite] whitespace-nowrap w-max">
          {[...channels, ...channels].map((c, i) => (
            <div key={i} title={c.name} className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-semibold flex-shrink-0" style={{ color: c.fg, background: c.bg + '22', border: `1px solid ${c.bg}44` }}>
              <span className="w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold" style={{ background: c.bg, color: c.fg }}>{c.l}</span>
              {c.name}
            </div>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* ── The Problem: Cost of a Human Marketing Team ── */}
      <section className="py-[100px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#d82d7e]/40 rounded-full px-4 py-1.5 text-[13px] text-[#d82d7e] mb-5">
              The reality every founder faces
            </div>
            <h2 className="text-[38px] md:text-[54px] font-bold mb-5" style={{ letterSpacing: '-2px' }}>
              Marketing well requires{' '}
              <span style={{ background: 'linear-gradient(135deg, #d82d7e 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                a whole team
              </span>
            </h2>
            <p className="text-[17px] text-white/50 max-w-[640px] mx-auto leading-relaxed">
              Every growing company needs people doing strategy, content, design, campaign management, A/B testing, analytics, and SEO. That means hiring. And hiring is expensive.
            </p>
          </div>

          {/* Human team cost table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
            {/* Left: Human team */}
            <div className="bg-[#111111] border border-[#333] rounded-[20px] overflow-hidden">
              <div className="px-6 py-4 bg-[#1A1919] border-b border-[#333]">
                <div className="text-[13px] font-bold text-white/40 uppercase tracking-widest">Human Marketing Team</div>
                <div className="text-[28px] font-bold text-[#d82d7e] mt-1">$250,000–$480,000 <span className="text-[16px] font-normal text-white/40">/ year</span></div>
              </div>
              <div className="divide-y divide-[#252525]">
                {[
                  { role: 'CMO + SEO Strategist',              cost: '$80k–$140k', time: '40h/wk' },
                  { role: 'Content Writer + SEO Copywriter',   cost: '$50k–$80k',  time: '40h/wk' },
                  { role: 'Technical SEO Specialist',          cost: '$55k–$90k',  time: '40h/wk' },
                  { role: 'Link Builder + PR Outreach',        cost: '$55k–$85k',  time: '35h/wk' },
                  { role: 'GEO Specialist + Brand Monitor',    cost: '$65k–$100k', time: '40h/wk' },
                  { role: 'Conversion Rate Optimiser',         cost: '$60k–$95k',  time: '30h/wk' },
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <div className="text-[13px] font-medium">{item.role}</div>
                      <div className="text-[11px] text-white/35">{item.time} of focused work</div>
                    </div>
                    <div className="text-[13px] font-semibold text-[#d82d7e] whitespace-nowrap">{item.cost}</div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-[#1A0A0A]">
                <div className="text-[12px] text-white/30">Plus benefits, tools, office costs, recruitment, onboarding. Real total: often 2–3× base salary.</div>
              </div>
            </div>

            {/* Right: Postlaa */}
            <div className="bg-[#111111] border border-[#612BD3] rounded-[20px] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#612BD3]/30" style={{ background: 'linear-gradient(135deg, #612BD3/10 0%, #8B5CF6/10 100%)', backgroundColor: '#18121e' }}>
                <div className="text-[13px] font-bold text-white/40 uppercase tracking-widest">Postlaa AI Marketing Team</div>
                <div className="text-[28px] font-bold text-[#8B5CF6] mt-1">$39–$79 <span className="text-[16px] font-normal text-white/40">/ month</span></div>
              </div>
              <div className="divide-y divide-[#252525]">
                {[
                  { role: 'Keyword Strategist',   replaces: 'CMO + SEO Strategist',           cost: 'Included', avail: '24/7' },
                  { role: 'SEO Content Creator',  replaces: 'Content Writer + Copywriter',    cost: 'Included', avail: '24/7' },
                  { role: 'Technical Auditor',    replaces: 'Technical SEO Specialist',       cost: 'Included', avail: '24/7' },
                  { role: 'Growth Agent',         replaces: 'Link Builder + PR Outreach',     cost: 'Included', avail: '24/7' },
                  { role: '🔥 AI Visibility Agent', replaces: 'GEO Specialist + Brand Monitor', cost: 'Included', avail: '24/7' },
                  { role: 'Auto Optimizer',       replaces: 'CRO Specialist',                 cost: 'Included', avail: '24/7' },
                ].map((item) => (
                  <div key={item.role} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <div className="text-[13px] font-medium text-[#8B5CF6]">{item.role}</div>
                      <div className="text-[11px] text-white/35">Replaces: {item.replaces}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-semibold text-[#4ade80]">{item.cost}</div>
                      <div className="text-[11px] text-white/35">{item.avail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-[#0E0A18]">
                <div className="text-[12px] text-white/30">No hiring. No training. No sick days. No notice periods. Starts working in under 5 minutes.</div>
              </div>
            </div>
          </div>

          {/* Savings callout */}
          <div className="rounded-[16px] px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: 'linear-gradient(135deg, rgba(97,43,211,0.15) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div className="text-center md:text-left">
              <div className="text-[13px] text-white/40 uppercase tracking-widest mb-1">Annual savings vs. a single marketing hire</div>
              <div className="text-[40px] font-bold" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>$249,532 saved per year</div>
              <div className="text-[14px] text-white/40 mt-1">On the Growth plan ($39/mo × 12 = $468) vs. hiring a single mid-level marketing manager ($250,000 total cost)</div>
            </div>
            <Link href="/auth" className="flex-shrink-0 bg-[#612BD3] hover:bg-[#7c3fe8] transition-colors text-white text-[14px] font-semibold px-6 py-3 rounded-[10px]">
              Start saving today →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-[60px] px-6 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[34px] md:text-[42px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>Who is Postlaa for?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {personas.map((p) => (
              <div key={p.title} className="bg-[#111111] border border-[#252525] rounded-[16px] p-6 hover:border-[#612BD3]/50 transition-colors text-center">
                <div className="text-[40px] mb-4">{p.icon}</div>
                <h3 className="text-[17px] font-semibold mb-2">{p.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Marketing Agents Deep Dive ── */}
      <section id="agents" className="py-[100px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#8B5CF6]/40 rounded-full px-4 py-1.5 text-[13px] text-[#8B5CF6] mb-5">
              🤖 Your 6 AI Marketing Agents
            </div>
            <h2 className="text-[38px] md:text-[54px] font-bold mb-4" style={{ letterSpacing: '-2px' }}>
              Each agent replaces a{' '}
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                full-time hire
              </span>
            </h2>
            <p className="text-[16px] text-white/50 max-w-[600px] mx-auto">
              Keyword research with Semrush + Ahrefs. SEO content with Surfer + Frase. Technical audits like Screaming Frog. AI brand tracking with Peec AI + Otterly.ai. Click any agent to see its tool stack, what it replaces, and a real example.
            </p>
          </div>

          {/* Agent selector tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {agentRoles.map((agent, i) => (
              <button
                key={agent.title}
                onClick={() => setActiveAgent(i)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all border"
                style={activeAgent === i
                  ? { background: agent.color, borderColor: agent.color, color: '#fff' }
                  : { background: 'transparent', borderColor: '#333', color: 'rgba(255,255,255,0.5)' }
                }
              >
                <span>{agent.icon}</span>
                {agent.title}
                {'badge' in agent && agent.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20">{agent.badge as string}</span>
                )}
              </button>
            ))}
          </div>

          {/* Active agent panel */}
          {agentRoles.map((agent, i) => i === activeAgent && (
            <div key={agent.title} className="grid md:grid-cols-2 gap-8">
              {/* Left: what it does */}
              <div className="bg-[#111111] border border-[#252525] rounded-[20px] p-7">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[30px]" style={{ background: agent.color + '20' }}>
                    {agent.icon}
                  </div>
                  <div>
                    <div className="text-[20px] font-bold flex items-center gap-2" style={{ color: agent.color }}>
                      {agent.title}
                      {'badge' in agent && agent.badge && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: agent.color + '25', color: agent.color, border: `1px solid ${agent.color}50` }}>{agent.badge as string}</span>
                      )}
                    </div>
                    <div className="text-[13px] text-white/40">Replaces: {agent.humanRole}</div>
                  </div>
                </div>
                {'poweredBy' in agent && agent.poweredBy && (
                  <div className="mb-5">
                    <div className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">Powered by</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(agent.poweredBy as string[]).map((tool) => (
                        <span key={tool} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border" style={{ color: agent.color, borderColor: agent.color + '40', background: agent.color + '12' }}>
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-[12px] font-bold text-white/30 uppercase tracking-widest mb-3">What it does</div>
                  <ul className="space-y-2.5">
                    {agent.whatItDoes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[14px] text-white/70">
                        <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={agent.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-5 border-t border-[#252525]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-white/30 uppercase tracking-widest">Hiring this person costs</div>
                      <div className="text-[20px] font-bold text-[#d82d7e]">{agent.humanCost}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-white/30 uppercase tracking-widest">Postlaa charges</div>
                      <div className="text-[20px] font-bold text-[#4ade80]">$0 extra</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: real example */}
              <div className="flex flex-col gap-5">
                <div className="bg-[#111111] border rounded-[20px] p-7 flex-1" style={{ borderColor: agent.color + '40' }}>
                  <div className="text-[12px] font-bold uppercase tracking-widest mb-4" style={{ color: agent.color }}>
                    Real example in action
                  </div>
                  <p className="text-[15px] text-white/75 leading-relaxed">{agent.example}</p>
                </div>
                <div className="bg-[#0A0A0A] border border-[#252525] rounded-[16px] p-5">
                  <div className="text-[12px] font-bold text-white/30 uppercase tracking-widest mb-3">Time saved per week</div>
                  <div className="flex items-end gap-3">
                    <div className="text-[48px] font-bold leading-none" style={{ color: agent.color }}>20+</div>
                    <div className="text-[14px] text-white/40 mb-2">hours of skilled human work<br />handled automatically</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-[80px] px-6 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#252525] rounded-full px-4 py-1.5 text-[13px] text-[#8B5CF6] mb-5">
              All the tools for social media growth in one place
            </div>
            <h2 className="text-[38px] md:text-[50px] font-bold mb-4" style={{ letterSpacing: '-1.5px' }}>
              Everything you need.{' '}
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Nothing you don't.
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.tag} className="bg-[#111111] border border-[#252525] rounded-[16px] p-6 hover:border-[#612BD3]/40 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px]" style={{ background: f.color + '18' }}>
                    {f.icon}
                  </div>
                  <span className="text-[11px] font-bold tracking-widest" style={{ color: f.color }}>{f.tag}</span>
                </div>
                <h3 className="text-[17px] font-semibold mb-2 leading-snug">{f.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unique Integrations ── */}
      <section id="integrations" className="py-[100px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#FC69FF]/40 rounded-full px-4 py-1.5 text-[13px] text-[#FC69FF] mb-5">
              50+ integrations — most not available in any competitor
            </div>
            <h2 className="text-[38px] md:text-[52px] font-bold mb-4" style={{ letterSpacing: '-2px' }}>
              Connected to every tool{' '}
              <span style={{ background: 'linear-gradient(135deg, #FC69FF 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                your team uses
              </span>
            </h2>
            <p className="text-[16px] text-white/50 max-w-[600px] mx-auto">
              Already have Semrush, Ahrefs, or Surfer SEO? Connect your existing account. No subscription? Use DataForSEO as the default SEO backbone — pay only per query. Postlaa is the platform; you choose the tools.
            </p>
          </div>

          {/* DataForSEO backbone callout */}
          <div className="mb-8 rounded-[16px] px-7 py-5 flex flex-col md:flex-row items-start md:items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(97,43,211,0.12) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(97,43,211,0.35)' }}>
            <div className="flex-shrink-0 w-12 h-12 rounded-[10px] flex items-center justify-center text-xl font-bold text-white" style={{ background: '#612BD3' }}>⚡</div>
            <div>
              <div className="text-[14px] font-bold text-white mb-1">
                Bring your own tools — or let Postlaa use DataForSEO as the default
              </div>
              <div className="text-[13px] text-white/50 leading-relaxed">
                Already paying for Semrush, Ahrefs, Surfer SEO, or Moz? Connect your API key and Postlaa agents will use your existing subscription data. No SEO tool subscriptions at all? DataForSEO is the built-in pay-as-you-go backbone — SERP data · 2.1T backlinks · OnPage crawling · rank tracking — you pay fractions of a cent per query, not $100+/month flat.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {uniqueIntegrations.map((cat) => (
              <div key={cat.category} className="bg-[#111111] border border-[#252525] rounded-[16px] p-5 hover:border-[#612BD3]/40 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[22px]">{cat.icon}</span>
                    <span className="text-[12px] font-bold tracking-wider" style={{ color: cat.color }}>{cat.category}</span>
                  </div>
                  {'byoa' in cat && cat.byoa && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: cat.color, background: (cat.color as string) + '18', border: `1px solid ${cat.color as string}35` }}>🔑 BYOA</span>
                  )}
                </div>
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li key={item.name} className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-white/80 leading-snug">{item.name}</span>
                      <span className="text-[10px] text-white/30 text-right leading-snug flex-shrink-0 max-w-[90px]">{item.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[16px] px-8 py-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(252,105,255,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(252,105,255,0.2)' }}>
            <p className="text-[15px] text-white/60">
              <span className="text-white font-semibold">Postlaa is the platform. You choose the tools.</span>{' '}
              Already have Semrush, Ahrefs, Moz, Surfer SEO, or Screaming Frog? Connect your account and Postlaa agents use your data. No subscriptions? DataForSEO covers everything pay-as-you-go. Either way, you get the same autonomous marketing power — at a fraction of the cost of running these tools separately.
            </p>
          </div>
        </div>
      </section>

      {/* ── Platform channels full grid ── */}
      <section className="py-[80px] px-6 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[36px] md:text-[46px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>
              30+ social channels,{' '}
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                one dashboard
              </span>
            </h2>
            <p className="text-[16px] text-white/50">Every major platform. Every emerging network. All in one place.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {channels.map((c) => (
              <div key={c.name} title={c.name} className="flex items-center gap-2 bg-[#111111] border border-[#252525] hover:border-[#612BD3]/50 transition-all rounded-[10px] px-4 py-2.5 text-[13px] font-medium cursor-default group">
                <span className="w-5 h-5 rounded-[4px] text-[9px] flex items-center justify-center font-bold flex-shrink-0" style={{ background: c.bg, color: c.fg }}>{c.l}</span>
                <span className="text-white/70 group-hover:text-white transition-colors">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Developer / MCP section ── */}
      <section id="developers" className="py-[100px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#0085FF]/40 rounded-full px-4 py-1.5 text-[13px] text-[#0085FF] mb-6">
                🔌 Developer Platform
              </div>
              <h2 className="text-[38px] md:text-[50px] font-bold leading-tight mb-5" style={{ letterSpacing: '-1.5px' }}>
                Postlaa as your{' '}
                <span style={{ background: 'linear-gradient(135deg, #0085FF 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  marketing layer
                </span>
              </h2>
              <p className="text-[16px] text-white/55 leading-relaxed mb-8">
                Add Postlaa to Claude Code, Cursor, or Windsurf via the MCP server. Your AI coding assistant can schedule release announcements, create changelog posts, run campaigns, and check performance — all through natural language.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '🤖', label: 'MCP Server',       sub: 'Claude Code, Cursor, Windsurf' },
                  { icon: '📡', label: 'REST API',          sub: '100+ endpoints, full coverage' },
                  { icon: '🔗', label: 'n8n / Make.com',   sub: 'No-code automation nodes' },
                  { icon: '📦', label: 'SDK',               sub: 'JavaScript & Python libraries' },
                  { icon: '🪝', label: 'Webhooks',          sub: 'Real-time event streams' },
                  { icon: '🤝', label: 'Agent-to-Agent',    sub: 'Post on behalf of AI agents' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0A0A0A] border border-[#252525] rounded-[12px] p-3 hover:border-[#0085FF]/30 transition-colors">
                    <div className="text-[18px] mb-1">{item.icon}</div>
                    <div className="text-[13px] font-semibold">{item.label}</div>
                    <div className="text-[11px] text-white/40">{item.sub}</div>
                  </div>
                ))}
              </div>
              <a href="https://docs.postlaa.com/public-api" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#0085FF] hover:text-[#40a9ff] transition-colors text-[14px] font-semibold">
                View API documentation →
              </a>
            </div>
            <div className="bg-[#0A0A0A] border border-[#252525] rounded-[20px] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-[#111111] border-b border-[#252525]">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-[12px] text-white/30">claude_desktop_config.json</span>
              </div>
              <pre className="p-5 text-[12.5px] leading-relaxed text-white/70 overflow-x-auto" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
                {codeExample}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-[80px] px-6 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[36px] md:text-[46px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>Wall of love ❤️</h2>
            <p className="text-[16px] text-white/50">Real results from real users</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#111111] border border-[#252525] rounded-[16px] p-5 flex flex-col gap-4 hover:border-[#612BD3]/40 transition-colors">
                <div className="text-[28px] font-bold leading-tight" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {t.metric}
                </div>
                <p className="text-[13px] text-white/60 leading-relaxed flex-1">"{t.quote}"</p>
                <div>
                  <div className="text-[13px] font-semibold">{t.name}</div>
                  <div className="text-[12px] text-white/40">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-[100px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[38px] md:text-[52px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>
              Find the right{' '}
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                plan for your needs
              </span>
            </h2>
            <p className="text-[16px] text-white/50 mb-8">Start free. Upgrade when you're ready. Cancel any time.</p>
            <div className="inline-flex items-center bg-[#111111] border border-[#252525] rounded-full p-1 gap-1">
              <button onClick={() => setBilling('monthly')} className={`px-5 py-2 rounded-full text-[14px] font-semibold transition-colors ${billing === 'monthly' ? 'bg-[#612BD3] text-white' : 'text-white/50 hover:text-white'}`}>Monthly</button>
              <button onClick={() => setBilling('yearly')} className={`px-5 py-2 rounded-full text-[14px] font-semibold transition-colors flex items-center gap-2 ${billing === 'yearly' ? 'bg-[#612BD3] text-white' : 'text-white/50 hover:text-white'}`}>
                Yearly
                <span className="text-[11px] bg-[#4ade80] text-[#0E0E0E] font-bold px-1.5 py-0.5 rounded-full">-25%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative bg-[#111111] rounded-[18px] p-5 flex flex-col border transition-colors ${(plan as any).popular ? 'border-[#612BD3]' : 'border-[#252525] hover:border-[#612BD3]/40'}`}>
                {(plan as any).popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#612BD3] text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">Most Popular</span>
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-[15px] font-bold mb-0.5" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="text-[11px] text-white/40 mb-3">{plan.desc}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-[36px] font-bold leading-none">${plan.price[billing]}</span>
                    {plan.price[billing] > 0 && <span className="text-[13px] text-white/40 mb-1.5">/mo</span>}
                  </div>
                  {billing === 'yearly' && plan.price.yearly > 0 && (
                    <div className="text-[11px] text-[#4ade80] mt-0.5">Billed annually · Save ${(plan.price.monthly - plan.price.yearly) * 12}/yr</div>
                  )}
                </div>
                <Link href="/auth" className="block text-center py-2.5 rounded-[8px] text-[14px] font-semibold mb-4 transition-colors" style={{ background: plan.color, color: '#fff' }}>
                  {plan.cta}
                </Link>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12.5px] text-white/60">
                      <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-white/30 mt-6">All paid plans include a 7-day free trial. No credit card required for free plan.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-[80px] px-6 bg-[#080808]">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[36px] md:text-[46px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#111111] border border-[#252525] rounded-[12px] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-[15px] font-semibold hover:text-[#8B5CF6] transition-colors"
                >
                  {faq.q}
                  <svg className={`flex-shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-[14px] text-white/55 leading-relaxed border-t border-[#252525] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-[100px] px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="rounded-[24px] p-[60px] text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #612BD3 0%, #8B5CF6 50%, #d82d7e 100%)' }}>
            <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(circle at 25% 75%, rgba(255,255,255,0.4) 0%, transparent 50%)' }} />
            <div className="relative">
              <PostlaaLogo size={52} />
              <h2 className="text-[36px] md:text-[48px] font-bold leading-tight mt-4 mb-3 text-white" style={{ letterSpacing: '-1.5px' }}>
                Your AI marketing team<br />is waiting
              </h2>
              <p className="text-[16px] text-white/75 mb-8 max-w-[460px] mx-auto">
                Strategy, content, campaigns, A/B testing, ROI tracking — all on autopilot. Join 20,000+ businesses growing without the payroll.
              </p>
              <Link href="/auth" className="inline-flex items-center gap-2 bg-white text-[#612BD3] hover:bg-white/90 transition-colors font-bold text-[16px] px-8 py-3.5 rounded-[10px]">
                Start for $0 — no credit card needed
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#252525] py-10 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <PostlaaLogo size={28} />
                <span className="text-[16px] font-bold">Postlaa</span>
              </div>
              <p className="text-[12px] text-white/35 leading-relaxed">Open-source AI-powered social media scheduling with a full AI marketing team built in.</p>
            </div>
            <div>
              <div className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3">Product</div>
              <div className="space-y-2 text-[13px] text-white/50">
                <a href="#agents" className="block hover:text-white transition-colors">AI Agents</a>
                <a href="#integrations" className="block hover:text-white transition-colors">Integrations</a>
                <a href="#pricing" className="block hover:text-white transition-colors">Pricing</a>
                <Link href="/auth" className="block hover:text-white transition-colors">Sign up</Link>
              </div>
            </div>
            <div>
              <div className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3">Developers</div>
              <div className="space-y-2 text-[13px] text-white/50">
                <a href="https://docs.postlaa.com/public-api" className="block hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">API Docs</a>
                <a href="https://docs.postlaa.com" className="block hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Documentation</a>
                <a href="#developers" className="block hover:text-white transition-colors">MCP Server</a>
                <a href="https://github.com/rahulmyrah/postlaa-app" className="block hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
            </div>
            <div>
              <div className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3">Integrations</div>
              <div className="space-y-2 text-[13px] text-white/50">
                <span className="block text-white/30">Claude Code (MCP)</span>
                <span className="block text-white/30">Cursor AI</span>
                <span className="block text-white/30">HeyGen + ElevenLabs</span>
                <span className="block text-white/30">Mixpanel + PostHog</span>
                <span className="block text-white/30">n8n + Make.com</span>
              </div>
            </div>
            <div>
              <div className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3">Resources</div>
              <div className="space-y-2 text-[13px] text-white/50">
                <a href="https://docs.postlaa.com" className="block hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Documentation</a>
                <a href="#faq" className="block hover:text-white transition-colors">FAQ</a>
                <Link href="/auth" className="block hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-[#252525] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-white/25">&copy; {new Date().getFullYear()} Postlaa. All rights reserved. Proudly open-source.</p>
            <div className="flex items-center gap-4 text-[12px] text-white/30">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}