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

// ─── Channel icons ────────────────────────────────────────────────────────────
const channels = [
  { name: 'X / Twitter',  bg: '#000',    fg: '#fff',   l: 'X'  },
  { name: 'LinkedIn',     bg: '#0A66C2', fg: '#fff',   l: 'in' },
  { name: 'Instagram',    bg: '#E1306C', fg: '#fff',   l: 'IG' },
  { name: 'TikTok',       bg: '#010101', fg: '#fff',   l: 'TT' },
  { name: 'YouTube',      bg: '#FF0000', fg: '#fff',   l: 'YT' },
  { name: 'Facebook',     bg: '#1877F2', fg: '#fff',   l: 'fb' },
  { name: 'Threads',      bg: '#101010', fg: '#fff',   l: 'Th' },
  { name: 'Pinterest',    bg: '#E60023', fg: '#fff',   l: 'Pi' },
  { name: 'Reddit',       bg: '#FF4500', fg: '#fff',   l: 'r/' },
  { name: 'Bluesky',      bg: '#0085FF', fg: '#fff',   l: 'BS' },
  { name: 'Mastodon',     bg: '#6364FF', fg: '#fff',   l: 'Ma' },
  { name: 'Telegram',     bg: '#2CA5E0', fg: '#fff',   l: 'TG' },
  { name: 'Discord',      bg: '#5865F2', fg: '#fff',   l: 'DC' },
  { name: 'Slack',        bg: '#4A154B', fg: '#fff',   l: 'SL' },
  { name: 'WordPress',    bg: '#21759B', fg: '#fff',   l: 'WP' },
  { name: 'Medium',       bg: '#000000', fg: '#fff',   l: 'Me' },
  { name: 'Dribbble',     bg: '#EA4C89', fg: '#fff',   l: 'Dr' },
  { name: 'Tumblr',       bg: '#35465C', fg: '#fff',   l: 'Tu' },
  { name: 'Snapchat',     bg: '#FFFC00', fg: '#000',   l: 'SC' },
  { name: 'Twitch',       bg: '#9146FF', fg: '#fff',   l: 'Tv' },
  { name: 'Dev.to',       bg: '#0A0A0A', fg: '#fff',   l: 'DV' },
  { name: 'Hashnode',     bg: '#2962FF', fg: '#fff',   l: 'HN' },
  { name: 'Warpcast',     bg: '#7C3AED', fg: '#fff',   l: 'WC' },
  { name: 'Nostr',        bg: '#7c5cbf', fg: '#fff',   l: 'NS' },
];

// ─── Pricing plans ────────────────────────────────────────────────────────────
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
      'Post comments & threads',
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
      'Unlimited team members',
      'AI Marketing Agents (2)',
      '150 AI images/month',
      '10 AI videos/month',
      'Smart plugs & automation',
      'Webhooks & custom integrations',
      'Analytics (90-day window)',
      'MCP server access',
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
      'Unlimited team members',
      'AI Marketing Agents (10)',
      '500 AI images/month',
      '60 AI videos/month',
      'Client workspaces',
      'White-label reports',
      'Priority support',
      'Advanced analytics & ROI tracking',
      'Full API + webhook access',
      'MCP server (enterprise quota)',
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
      'Unlimited posts',
      'Full REST API',
      'MCP server (Claude Code, Cursor, Windsurf)',
      'n8n + Make.com + Zapier nodes',
      'Webhooks (unlimited endpoints)',
      'SDK (JS / Python)',
      'Agent-to-agent scheduling',
      'Analytics via API',
      'Priority technical support',
    ],
  },
];

// ─── Features list ────────────────────────────────────────────────────────────
const features = [
  {
    tag: 'SCHEDULING',
    icon: '🗓️',
    title: 'Seamless multi-channel scheduling',
    body: 'Schedule, preview, and publish across 24+ social platforms with one unified calendar. Cross-post natively — each platform gets content formatted to its own standards.',
    color: '#612BD3',
  },
  {
    tag: 'AI AGENTS',
    icon: '🤖',
    title: 'Your autonomous AI marketing team',
    body: 'Every project gets its own set of AI agents — Strategy, Copywriter, Scheduler, and Analytics — that collaborate continuously to handle your entire marketing workflow.',
    color: '#8B5CF6',
  },
  {
    tag: 'AI IMAGES',
    icon: '🎨',
    title: 'Design with AI in one click',
    body: 'Generate professional visuals, social banners, and post images using the built-in AI image editor. No design skills required — your AI team handles it all.',
    color: '#d82d7e',
  },
  {
    tag: 'ANALYTICS',
    icon: '📊',
    title: 'Comprehensive performance tracking',
    body: 'Track reach, impressions, engagement, and follower growth across every channel. The Analytics Agent surfaces actionable insights and generates one-click reports.',
    color: '#0085FF',
  },
  {
    tag: 'AUTOMATION',
    icon: '⚙️',
    title: 'Automate everything with plugs & API',
    body: 'Set auto-like, auto-comment, and milestone-triggered actions. Connect to n8n, Make.com, Zapier, or call the REST API directly from Claude Code, Cursor, or any AI tool.',
    color: '#FC69FF',
  },
  {
    tag: 'DEVELOPER',
    icon: '🔌',
    title: 'Postlaa as a marketing layer for AI',
    body: 'The MCP server turns Postlaa into a marketing brain for your AI coding tools. Claude Code can schedule releases, Cursor can post changelog updates — all programmatically.',
    color: '#4ade80',
  },
];

// ─── Agent code snippets ──────────────────────────────────────────────────────
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
  { quote: "Postlaa's AI agents completely changed how we launch products. We went from 4 hours of social prep to under 20 minutes.", name: 'Sarah K.', role: 'Founder, TechStart', platform: 'LinkedIn', metric: '×3 engagement' },
  { quote: 'The MCP integration with Claude Code is mind-blowing. My AI assistant now handles all social posting as part of our CI/CD pipeline.', name: 'Marcus L.', role: 'Senior Engineer', platform: 'X / Twitter', metric: '100% automated' },
  { quote: 'We manage 35 client accounts with 2 people. Postlaa\'s agency tools and AI content creation make it possible.', name: 'Diana P.', role: 'Agency Director', platform: 'Instagram', metric: '35 clients, 2 people' },
  { quote: 'Set up the n8n integration in 10 minutes. Now every blog post automatically creates a week of social content.', name: 'Rajan M.', role: 'Content Strategist', platform: 'Reddit', metric: '8h saved/week' },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'What social platforms does Postlaa support?', a: 'Postlaa supports 24+ platforms: X/Twitter, LinkedIn, Instagram, TikTok, YouTube, Facebook, Threads, Pinterest, Reddit, Bluesky, Mastodon, Telegram, Discord, Slack, WordPress, Medium, Dribbble, Tumblr, Snapchat, Twitch, Dev.to, Hashnode, Warpcast, and Nostr.' },
  { q: 'How does the AI Marketing Agent work?', a: 'Each project gets a set of AI agents (Strategy, Copywriter, Scheduler, Analytics) that collaborate to build your content calendar, draft platform-native posts, schedule them at peak times, and continuously report on performance.' },
  { q: 'How can AI coding tools use Postlaa?', a: "Install the Postlaa MCP server and connect it to Claude Code, Cursor, or Windsurf. Your AI assistant can then schedule posts, check analytics, and manage campaigns through natural language — turning Postlaa into a real-time marketing layer for your development workflow." },
  { q: 'Can I use the REST API or n8n/Make.com?', a: 'Yes. All plans from Creator and above include REST API access. The Developer plan includes higher rate limits, SDK support (JavaScript/Python), and dedicated integration support for n8n, Make.com, and Zapier.' },
  { q: 'Is there a free plan?', a: 'Yes! The Free plan gives you 3 channels, 30 posts/month, and basic AI features with no credit card required. Paid plans start at $19/month and offer a 7-day free trial.' },
  { q: 'Can I manage multiple client accounts?', a: 'Absolutely. The Agency plan supports 100 channels, unlimited team members, dedicated client workspaces, and white-label reporting for managing multiple brands or clients at scale.' },
];

// ─── Who it's for ─────────────────────────────────────────────────────────────
const personas = [
  { icon: '✍️', title: 'Creators', body: 'Post consistently across every platform. AI writes in your voice, handles scheduling, and optimises for maximum reach.' },
  { icon: '🏢', title: 'Businesses', body: 'Deploy autonomous AI marketing teams for each brand. Go from brief to published in minutes, not days.' },
  { icon: '🏬', title: 'Agencies', body: 'Manage 100+ client channels with a lean team. White-label reports, client workspaces, and bulk scheduling built in.' },
  { icon: '👨‍💻', title: 'Developers', body: "Add Postlaa as a marketing layer to any AI workflow. MCP server, REST API, and SDKs make programmatic social publishing trivial." },
];

// ─── Main page component ──────────────────────────────────────────────────────
export default function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#platforms" className="hover:text-white transition-colors">Platforms</a>
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
        <div className="max-w-[920px] mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#612BD3]/40 rounded-full px-4 py-1.5 text-[13px] text-[#8B5CF6] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FC69FF] inline-block animate-pulse" />
            Now with Autonomous AI Marketing Agents
          </div>
          <h1 className="text-[54px] md:text-[76px] font-bold leading-[1.04] mb-6" style={{ letterSpacing: '-2.5px' }}>
            Your agentic{' '}
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              social media
            </span>
            <br />marketing platform
          </h1>
          <p className="text-[18px] md:text-[20px] text-white/55 max-w-[620px] mx-auto mb-10 leading-relaxed" style={{ letterSpacing: '-0.2px' }}>
            Schedule across 24+ channels. Deploy autonomous AI marketing agents for every project. Build, create, publish, and track — all from one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/auth" className="flex items-center gap-2 bg-[#612BD3] hover:bg-[#7c3fe8] transition-colors text-white text-[15px] font-semibold px-8 py-3.5 rounded-[10px] w-full sm:w-auto justify-center">
              Start for $0
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <a href="#features" className="flex items-center gap-2 bg-[#1A1919] border border-[#252525] hover:border-[#612BD3]/60 transition-colors text-white/70 text-[15px] font-medium px-8 py-3.5 rounded-[10px] w-full sm:w-auto justify-center">
              See features
            </a>
          </div>
          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-white/40">
            <span>✓ No credit card required</span>
            <span>✓ Free plan forever</span>
            <span>✓ 20,000+ active users</span>
            <span>✓ Open-source</span>
          </div>
        </div>
      </section>

      {/* ── Scrolling channel logos ── */}
      <div id="platforms" className="border-y border-[#252525] bg-[#0A0A0A] py-6 overflow-hidden">
        <div className="flex gap-4 animate-[scroll_40s_linear_infinite] whitespace-nowrap w-max">
          {[...channels, ...channels].map((c, i) => (
            <div key={i} title={c.name} className="inline-flex items-center gap-2 bg-[#141414] border border-[#252525] rounded-[8px] px-3 py-2 text-[13px] font-semibold flex-shrink-0" style={{ color: c.fg, background: c.bg + '22', borderColor: c.bg + '44' }}>
              <span className="w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold" style={{ background: c.bg, color: c.fg }}>{c.l}</span>
              {c.name}
            </div>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* ── Who it's for ── */}
      <section className="py-[80px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[36px] md:text-[44px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>Who is Postlaa for?</h2>
            <p className="text-[16px] text-white/50">Built for everyone who wants to grow their social presence with less effort.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {personas.map((p) => (
              <div key={p.title} className="bg-[#111111] border border-[#252525] rounded-[16px] p-6 hover:border-[#612BD3]/50 transition-colors text-center">
                <div className="text-[40px] mb-4">{p.icon}</div>
                <h3 className="text-[18px] font-semibold mb-2">{p.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
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

      {/* ── Developer / Agent API section ── */}
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
                Add Postlaa to Claude Code, Cursor, Windsurf, or any AI coding tool via the MCP server. Your AI assistant can now schedule release announcements, create changelog posts, run campaigns, and check performance — all through natural language.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '🤖', label: 'MCP Server', sub: 'Claude Code, Cursor, Windsurf' },
                  { icon: '📡', label: 'REST API', sub: '100+ endpoints, full coverage' },
                  { icon: '🔗', label: 'n8n / Make.com', sub: 'No-code automation nodes' },
                  { icon: '📦', label: 'SDK', sub: 'JavaScript & Python libraries' },
                  { icon: '🪝', label: 'Webhooks', sub: 'Real-time event streams' },
                  { icon: '🤝', label: 'Agent-to-Agent', sub: 'Post on behalf of AI agents' },
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
            {/* Code snippet */}
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

      {/* ── Platform channels full grid ── */}
      <section className="py-[80px] px-6 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[36px] md:text-[46px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>
              Wide list of{' '}
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                trending channels
              </span>
            </h2>
            <p className="text-[16px] text-white/50">Harness 24+ platforms from a single workspace.</p>
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

      {/* ── Social proof / testimonials ── */}
      <section className="py-[80px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[36px] md:text-[46px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>Wall of love ❤️</h2>
            <p className="text-[16px] text-white/50">What our users are saying</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#111111] border border-[#252525] rounded-[16px] p-5 flex flex-col gap-4 hover:border-[#612BD3]/40 transition-colors">
                <div className="text-[32px] font-bold" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
      <section id="pricing" className="py-[100px] px-6 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[38px] md:text-[52px] font-bold mb-3" style={{ letterSpacing: '-1.5px' }}>
              Find the right{' '}
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                plan for your needs
              </span>
            </h2>
            <p className="text-[16px] text-white/50 mb-8">Start free. Upgrade when you're ready.</p>
            {/* Billing toggle */}
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
              <div key={plan.name} className={`relative bg-[#111111] rounded-[18px] p-5 flex flex-col border transition-colors ${plan.popular ? 'border-[#612BD3]' : 'border-[#252525] hover:border-[#612BD3]/40'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#612BD3] text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">Most Popular</span>
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-[15px] font-bold mb-0.5" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="text-[11px] text-white/40 mb-3">{plan.desc}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-[36px] font-bold leading-none">
                      ${plan.price[billing]}
                    </span>
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
      <section id="faq" className="py-[80px] px-6">
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
                Grow your social presence<br />with Postlaa
              </h2>
              <p className="text-[16px] text-white/75 mb-8 max-w-[440px] mx-auto">
                Schedule, analyse, and engage with your audience. Join 20,000+ entrepreneurs already growing on autopilot.
              </p>
              <Link href="/auth" className="inline-flex items-center gap-2 bg-white text-[#612BD3] hover:bg-white/90 transition-colors font-bold text-[16px] px-8 py-3.5 rounded-[10px]">
                Start for $0
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <p className="text-[12px] text-white/50 mt-4">No credit card required · Free plan forever</p>
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
              <p className="text-[12px] text-white/35 leading-relaxed">Open-source AI-powered social media scheduling & marketing automation.</p>
            </div>
            <div>
              <div className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3">Product</div>
              <div className="space-y-2 text-[13px] text-white/50">
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#platforms" className="block hover:text-white transition-colors">Channels</a>
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
                <span className="block text-white/30">Claude Code</span>
                <span className="block text-white/30">Cursor AI</span>
                <span className="block text-white/30">n8n</span>
                <span className="block text-white/30">Make.com</span>
                <span className="block text-white/30">Zapier</span>
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
            <p className="text-[12px] text-white/25">© {new Date().getFullYear()} Postlaa. All rights reserved. Proudly open-source ❤️</p>
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