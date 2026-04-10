'use client';

import React, { FC } from 'react';
import Link from 'next/link';

// ─── Brand icons grid ─────────────────────────────────────────────────────────
const platforms = [
  { name: 'X / Twitter', color: '#000000', letter: 'X' },
  { name: 'LinkedIn', color: '#0A66C2', letter: 'in' },
  { name: 'Instagram', color: '#E1306C', letter: 'IG' },
  { name: 'TikTok', color: '#010101', letter: 'TT' },
  { name: 'YouTube', color: '#FF0000', letter: 'YT' },
  { name: 'Facebook', color: '#1877F2', letter: 'fb' },
  { name: 'Threads', color: '#101010', letter: 'TH' },
  { name: 'Pinterest', color: '#E60023', letter: 'P' },
  { name: 'Reddit', color: '#FF4500', letter: 'r/' },
  { name: 'Bluesky', color: '#0085FF', letter: 'BS' },
  { name: 'Mastodon', color: '#6364FF', letter: 'M' },
  { name: 'Telegram', color: '#2CA5E0', letter: 'TG' },
  { name: 'Discord', color: '#5865F2', letter: 'DC' },
  { name: 'Slack', color: '#4A154B', letter: 'SL' },
  { name: 'WordPress', color: '#21759B', letter: 'WP' },
  { name: 'Medium', color: '#000000', letter: 'M' },
  { name: 'Dribbble', color: '#EA4C89', letter: 'Dr' },
  { name: 'Tumblr', color: '#35465C', letter: 'Tu' },
  { name: 'Snapchat', color: '#FFFC00', letter: 'SC' },
  { name: 'Twitch', color: '#9146FF', letter: 'Tv' },
];

// ─── Team agents ─────────────────────────────────────────────────────────────
const agents = [
  {
    icon: '🧠',
    title: 'Strategy Agent',
    description:
      'Analyzes your niche, audience, and competitors to build a winning content strategy tailored to your brand.',
    tags: ['Market Research', 'Trend Analysis', 'Brand Positioning'],
    color: '#612BD3',
  },
  {
    icon: '✍️',
    title: 'Copywriter Agent',
    description:
      'Crafts platform-native captions, threads, and long-form posts that resonate with your audience and drive engagement.',
    tags: ['Captions', 'Threads', 'Long-form', 'CTAs'],
    color: '#8B5CF6',
  },
  {
    icon: '🗓️',
    title: 'Scheduler Agent',
    description:
      'Automatically queues and publishes content at the optimal times across all your connected channels.',
    tags: ['Smart Timing', 'Multi-channel', 'Auto-publish'],
    color: '#d82d7e',
  },
  {
    icon: '📊',
    title: 'Analytics Agent',
    description:
      'Tracks every post, measures what works, and generates actionable reports to continuously improve performance.',
    tags: ['Reach', 'Engagement', 'ROI Reports'],
    color: '#0085FF',
  },
];

// ─── Workflow steps ───────────────────────────────────────────────────────────
const workflowSteps = [
  {
    step: '01',
    title: 'Create a Project',
    desc: 'Tell Postlaa about your brand, niche, goals, and target audience. The AI immediately starts building context.',
    color: '#612BD3',
  },
  {
    step: '02',
    title: 'AI Builds Your Strategy',
    desc: 'Your Strategy Agent researches competitors, identifies trending topics, and drafts a month-long content calendar.',
    color: '#8B5CF6',
  },
  {
    step: '03',
    title: 'Content Gets Created',
    desc: 'The Copywriter generates ready-to-publish posts tailored to each platform\'s format and tone requirements.',
    color: '#d82d7e',
  },
  {
    step: '04',
    title: 'Schedule & Publish',
    desc: 'One click sends content to your queue. Postlaa auto-posts to all 20+ platforms at peak engagement times.',
    color: '#FC69FF',
  },
  {
    step: '05',
    title: 'Track & Optimize',
    desc: 'The Analytics Agent monitors performance, surfaces insights, and recommends adjustments to maximize growth.',
    color: '#0085FF',
  },
];

// ─── Metrics ─────────────────────────────────────────────────────────────────
const metrics = [
  { value: '20+', label: 'Social Platforms' },
  { value: '20K+', label: 'Active Users' },
  { value: '10x', label: 'Faster Content Creation' },
  { value: '3h', label: 'Saved Per Day' },
];

// ─── Analytics features ───────────────────────────────────────────────────────
const analyticsFeatures = [
  {
    icon: '📈',
    title: 'Unified Dashboard',
    desc: 'All your platform metrics in one place — reach, impressions, clicks, follower growth.',
  },
  {
    icon: '🎯',
    title: 'Post Performance',
    desc: 'See exactly which posts drive the most engagement and why, with AI-powered explanations.',
  },
  {
    icon: '🔔',
    title: 'AI Alerts',
    desc: 'Get notified when a post is over or under-performing so you can act fast.',
  },
  {
    icon: '📦',
    title: 'Campaign Reports',
    desc: 'Export professional PDF reports for clients or stakeholders with one click.',
  },
];

// ─── Postlaa Logo Mark ────────────────────────────────────────────────────────
const PostlaaLogo: FC<{ size?: number }> = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="pg-landing"
        x1="0"
        y1="0"
        x2="60"
        y2="60"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#612BD3" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="52" height="52" rx="14" fill="url(#pg-landing)" />
    <path
      d="M18 16h12c5.523 0 10 4.477 10 10s-4.477 10-10 10H24v8h-6V16zm6 14h6a4 4 0 000-8h-6v8z"
      fill="white"
    />
    <circle cx="44" cy="44" r="4" fill="#FC69FF" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-[#0E0E0E] text-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0E0E0E]/80 backdrop-blur-md border-b border-[#252525]">
        <div className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[10px]">
            <PostlaaLogo size={36} />
            <span
              style={{
                fontWeight: 700,
                fontSize: '20px',
                letterSpacing: '-0.3px',
              }}
            >
              Postlaa
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[14px] text-white/70">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a
              href="#integrations"
              className="hover:text-white transition-colors"
            >
              Integrations
            </a>
            <a href="#analytics" className="hover:text-white transition-colors">
              Analytics
            </a>
          </div>
          <Link
            href="/auth"
            className="bg-[#612BD3] hover:bg-[#7c3fe8] transition-colors text-white text-[14px] font-semibold px-5 py-2 rounded-[8px]"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-[140px] pb-[100px] px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(97,43,211,0.25) 0%, transparent 60%)',
          }}
        />
        <div className="max-w-[900px] mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#252525] rounded-full px-4 py-1.5 text-[13px] text-white/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#FC69FF] inline-block" />
            Now with Autonomous AI Marketing Teams
          </div>

          <h1
            className="text-[56px] md:text-[72px] font-bold leading-[1.05] mb-6"
            style={{ letterSpacing: '-2px' }}
          >
            Your AI Marketing Team{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              works 24/7
            </span>
          </h1>

          <p
            className="text-[18px] md:text-[20px] text-white/60 max-w-[640px] mx-auto mb-10 leading-relaxed"
            style={{ letterSpacing: '-0.2px' }}
          >
            Postlaa gives every project its own autonomous AI marketing team.
            Plan campaigns, create platform-native content, schedule posts
            across 20+ channels, and track results — all on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth"
              className="flex items-center gap-2 bg-[#612BD3] hover:bg-[#7c3fe8] transition-colors text-white text-[16px] font-semibold px-8 py-3.5 rounded-[10px] w-full sm:w-auto justify-center"
            >
              Start for free
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 bg-[#1A1919] border border-[#252525] hover:border-[#612BD3] transition-colors text-white/80 text-[16px] font-medium px-8 py-3.5 rounded-[10px] w-full sm:w-auto justify-center"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Metrics bar ──────────────────────────────────────────── */}
      <section className="border-y border-[#252525] bg-[#111111] py-8">
        <div className="max-w-[1000px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div
                className="text-[38px] font-bold"
                style={{
                  background:
                    'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {m.value}
              </div>
              <div className="text-[13px] text-white/50 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Autonomous AI Team ───────────────────────────────────── */}
      <section id="features" className="py-[100px] px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(97,43,211,0.1) 0%, transparent 60%)',
          }}
        />
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#252525] rounded-full px-4 py-1.5 text-[13px] text-[#8B5CF6] mb-5">
              🤖 Agentic Marketing
            </div>
            <h2
              className="text-[42px] md:text-[52px] font-bold leading-tight mb-4"
              style={{ letterSpacing: '-1.5px' }}
            >
              Your project gets its own{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI marketing team
              </span>
            </h2>
            <p className="text-[17px] text-white/50 max-w-[500px] mx-auto">
              Four specialized AI agents collaborate autonomously to handle
              every aspect of your marketing — from strategy to publishing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.title}
                className="bg-[#111111] border border-[#252525] rounded-[16px] p-7 hover:border-[#612BD3]/50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center text-[22px] flex-shrink-0"
                    style={{ background: agent.color + '22' }}
                  >
                    {agent.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold mb-2">
                      {agent.title}
                    </h3>
                    <p className="text-[14px] text-white/55 leading-relaxed mb-4">
                      {agent.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {agent.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                          style={{
                            color: agent.color,
                            borderColor: agent.color + '40',
                            background: agent.color + '12',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marketing Workflow ───────────────────────────────────── */}
      <section className="py-[100px] px-6 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#252525] rounded-full px-4 py-1.5 text-[13px] text-[#FC69FF] mb-5">
              🚀 How It Works
            </div>
            <h2
              className="text-[42px] md:text-[52px] font-bold leading-tight mb-4"
              style={{ letterSpacing: '-1.5px' }}
            >
              From idea to published{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #FC69FF 0%, #612BD3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                in minutes
              </span>
            </h2>
            <p className="text-[17px] text-white/50 max-w-[520px] mx-auto">
              Postlaa removes every bottleneck between your idea and your
              audience across all platforms.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#612BD3] via-[#FC69FF] to-transparent opacity-30 hidden md:block" />

            <div className="flex flex-col gap-10 md:gap-0">
              {workflowSteps.map((step, i) => (
                <div
                  key={step.step}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Step number bubble */}
                  <div
                    className={`relative z-10 md:w-1/2 flex ${
                      i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                    }`}
                  >
                    <div className="bg-[#111111] border border-[#252525] rounded-[16px] p-6 max-w-[420px] hover:border-[#612BD3]/50 transition-colors">
                      <div
                        className="text-[12px] font-bold tracking-widest mb-2"
                        style={{ color: step.color }}
                      >
                        STEP {step.step}
                      </div>
                      <h3 className="text-[18px] font-semibold mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[14px] text-white/55 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div
                    className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full items-center justify-center z-20 text-white text-[14px] font-bold flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}99 100%)`,
                    }}
                  >
                    {step.step}
                  </div>

                  {/* Empty spacer */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrations ─────────────────────────────────────────── */}
      <section id="integrations" className="py-[100px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#252525] rounded-full px-4 py-1.5 text-[13px] text-[#8B5CF6] mb-5">
              🔗 Integrations
            </div>
            <h2
              className="text-[42px] md:text-[52px] font-bold leading-tight mb-4"
              style={{ letterSpacing: '-1.5px' }}
            >
              Publish everywhere{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #8B5CF6 0%, #FC69FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                at once
              </span>
            </h2>
            <p className="text-[17px] text-white/50 max-w-[480px] mx-auto">
              Connect your accounts once. Postlaa optimises and publishes to
              each platform natively.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {platforms.map((p) => (
              <div
                key={p.name}
                title={p.name}
                className="group relative flex flex-col items-center gap-2"
              >
                <div
                  className="w-[52px] h-[52px] rounded-[12px] flex items-center justify-center text-[13px] font-bold text-white border border-[#252525] group-hover:border-[#612BD3]/60 transition-all group-hover:scale-105"
                  style={{ background: p.color + '22', color: p.color }}
                >
                  {p.letter}
                </div>
                <span className="text-[10px] text-white/40 text-center truncate w-full text-center">
                  {p.name.split('/')[0].trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics ────────────────────────────────────────────── */}
      <section id="analytics" className="py-[100px] px-6 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#252525] rounded-full px-4 py-1.5 text-[13px] text-[#0085FF] mb-6">
                📊 Analytics & Reporting
              </div>
              <h2
                className="text-[38px] md:text-[48px] font-bold leading-tight mb-5"
                style={{ letterSpacing: '-1.5px' }}
              >
                Full visibility into what
                <br />
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #0085FF 0%, #8B5CF6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  drives your growth
                </span>
              </h2>
              <p className="text-[16px] text-white/55 leading-relaxed mb-8">
                Stop guessing what works. Postlaa's Analytics Agent tracks
                every metric across all platforms and translates data into
                clear actions that grow your audience.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analyticsFeatures.map((f) => (
                  <div
                    key={f.title}
                    className="bg-[#111111] border border-[#252525] rounded-[12px] p-4 hover:border-[#0085FF]/30 transition-colors"
                  >
                    <div className="text-[20px] mb-2">{f.icon}</div>
                    <div className="text-[14px] font-semibold mb-1">
                      {f.title}
                    </div>
                    <div className="text-[12px] text-white/50 leading-relaxed">
                      {f.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fake analytics dashboard card */}
            <div className="bg-[#111111] border border-[#252525] rounded-[20px] p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[13px] text-white/40 mb-1">
                    Campaign Performance
                  </div>
                  <div className="text-[28px] font-bold">+284%</div>
                  <div className="text-[12px] text-[#4ade80]">
                    ↑ vs last month
                  </div>
                </div>
                <div className="text-[32px]">📈</div>
              </div>

              {/* Fake bar chart */}
              <div className="flex items-end gap-2 h-[100px] mb-5">
                {[40, 60, 45, 80, 55, 90, 70, 95, 75, 100, 85, 110].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[4px] min-w-0"
                      style={{
                        height: `${h}%`,
                        background:
                          i >= 9
                            ? 'linear-gradient(180deg, #8B5CF6 0%, #612BD3 100%)'
                            : '#252525',
                      }}
                    />
                  )
                )}
              </div>

              {/* Platform rows */}
              <div className="space-y-3">
                {[
                  { platform: 'LinkedIn', reach: '42.3K', up: true },
                  { platform: 'X / Twitter', reach: '38.1K', up: true },
                  { platform: 'Instagram', reach: '29.7K', up: false },
                ].map((row) => (
                  <div
                    key={row.platform}
                    className="flex items-center justify-between text-[13px]"
                  >
                    <span className="text-white/60">{row.platform}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{row.reach}</span>
                      <span
                        className={row.up ? 'text-[#4ade80]' : 'text-[#f87171]'}
                      >
                        {row.up ? '↑' : '↓'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Strategy Section ─────────────────────────────── */}
      <section className="py-[100px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-2 bg-[#1A1919] border border-[#252525] rounded-full px-4 py-1.5 text-[13px] text-[#d82d7e] mb-5">
              🎯 Content Strategy
            </div>
            <h2
              className="text-[42px] md:text-[52px] font-bold leading-tight mb-4"
              style={{ letterSpacing: '-1.5px' }}
            >
              Strategy that actually{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #d82d7e 0%, #FC69FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                converts
              </span>
            </h2>
            <p className="text-[17px] text-white/50 max-w-[520px] mx-auto">
              Postlaa doesn't just schedule posts — it builds intelligent
              content programs aligned with your business goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🗺️',
                title: 'Content Calendar',
                body: 'AI-generated monthly content calendars adapted to your brand voice, seasonal trends, and audience behaviour.',
                color: '#d82d7e',
              },
              {
                emoji: '🔍',
                title: 'Competitor Intelligence',
                body: 'Your agents continuously monitor top competitors, surface winning content patterns, and suggest outperforming ideas.',
                color: '#8B5CF6',
              },
              {
                emoji: '🧬',
                title: 'Brand Voice Training',
                body: "Feed Postlaa your existing content and it learns your unique tone — every post sounds authentically you, not generic AI.",
                color: '#0085FF',
              },
              {
                emoji: '♻️',
                title: 'Content Recycling',
                body: 'Automatically repurposes high-performing posts into new formats — turn a thread into a carousel, a blog into captions.',
                color: '#FC69FF',
              },
              {
                emoji: '🌊',
                title: 'Trend Surfing',
                body: 'Real-time trend detection surfaces viral moments in your niche so you can publish while topics are still hot.',
                color: '#612BD3',
              },
              {
                emoji: '🤝',
                title: 'Team Collaboration',
                body: "Invite teammates to review, approve, or edit AI-generated content before it goes live — with full role permissions.",
                color: '#4ade80',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-[#111111] border border-[#252525] rounded-[16px] p-6 hover:border-[#612BD3]/50 transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[20px] mb-4"
                  style={{ background: card.color + '18' }}
                >
                  {card.emoji}
                </div>
                <h3 className="text-[16px] font-semibold mb-2">{card.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-[100px] px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <div
            className="rounded-[24px] p-[60px] relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #612BD3 0%, #8B5CF6 50%, #d82d7e 100%)',
            }}
          >
            {/* Overlay texture */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              }}
            />
            <div className="relative">
              <h2
                className="text-[36px] md:text-[48px] font-bold leading-tight mb-4 text-white"
                style={{ letterSpacing: '-1.5px' }}
              >
                Start growing on autopilot
              </h2>
              <p className="text-[16px] text-white/75 mb-8 max-w-[480px] mx-auto">
                Join 20,000+ entrepreneurs who use Postlaa to automate their
                marketing and grow their social presence.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 bg-white text-[#612BD3] hover:bg-white/90 transition-colors font-bold text-[16px] px-8 py-3.5 rounded-[10px]"
              >
                Get started for free
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="text-[13px] text-white/50 mt-4">
                No credit card required · Free plan available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#252525] py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-[10px]">
            <PostlaaLogo size={28} />
            <span className="text-[16px] font-bold">Postlaa</span>
          </div>
          <p className="text-[13px] text-white/30">
            © {new Date().getFullYear()} Postlaa. AI-powered social media
            marketing.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-white/40">
            <a href="https://docs.postlaa.com" className="hover:text-white/60 transition-colors">
              Docs
            </a>
            <Link href="/auth" className="hover:text-white/60 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
