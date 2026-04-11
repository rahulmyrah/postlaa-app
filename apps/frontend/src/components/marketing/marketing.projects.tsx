'use client';

import React, { FC, useCallback, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import clsx from 'clsx';
import { Button } from '@gitroom/react/form/button';
import { Input } from '@gitroom/react/form/input';
import { Textarea } from '@gitroom/react/form/textarea';
import { useToaster } from '@gitroom/react/toaster/toaster';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketingProject {
  id: string;
  name: string;
  description: string;
  url: string;
  niche: string;
  targetAudience: string | null;
  brandVoice: string | null;
  brandColors: string | null;
  competitors: string | null;
  goals: string | null;
  active: boolean;
  campaigns: Campaign[];
}

interface ResearchRun {
  id: string;
  agentType: string;
  findings: any;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  goal: string;
  status: 'RESEARCHING' | 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  brief?: any;
  contentPlan?: any;
  researchRuns?: ResearchRun[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useProjects = () => {
  const fetch = useFetch();
  return useSWR<MarketingProject[]>('marketing-projects', async () => {
    const res = await fetch('/marketing/projects');
    return res.json();
  });
};

const useCampaigns = (projectId: string) => {
  const fetch = useFetch();
  return useSWR<Campaign[]>(`campaigns-${projectId}`, async () => {
    const res = await fetch(`/marketing/projects/${projectId}/campaigns`);
    return res.json();
  });
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusColors: Record<Campaign['status'], string> = {
  RESEARCHING: 'bg-blue-500/20 text-blue-400',
  PLANNING: 'bg-yellow-500/20 text-yellow-400',
  ACTIVE: 'bg-green-500/20 text-green-400',
  PAUSED: 'bg-gray-500/20 text-gray-400',
  COMPLETED: 'bg-purple-500/20 text-purple-400',
};

const StatusBadge: FC<{ status: Campaign['status'] }> = ({ status }) => (
  <span
    className={clsx(
      'px-2 py-0.5 rounded text-xs font-medium',
      statusColors[status]
    )}
  >
    {status.charAt(0) + status.slice(1).toLowerCase()}
  </span>
);

// ─── Project Setup Wizard ─────────────────────────────────────────────────────

const ProjectWizard: FC<{
  existing?: MarketingProject;
  onClose: () => void;
}> = ({ existing, onClose }) => {
  const fetch = useFetch();
  const { mutate } = useSWRConfig();
  const toaster = useToaster();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    url: existing?.url ?? '',
    niche: existing?.niche ?? '',
    targetAudience: existing?.targetAudience ?? '',
    brandVoice: existing?.brandVoice ?? '',
    brandColors: existing?.brandColors ?? '',
    competitors: existing?.competitors ?? '',
    goals: existing?.goals ?? '',
  });

  const setInput =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const setText =
    (key: string) =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const steps = [
    {
      title: 'Project Basics',
      subtitle: 'Tell Postlaa about your product or business',
      fields: (
        <div className="flex flex-col gap-4">
          <Input
            disableForm
            name="name"
            label="Project / Brand Name"
            placeholder="e.g. FitFlow App"
            value={form.name}
            onChange={setInput('name')}
          />
          <Input
            disableForm
            name="url"
            label="Website or App URL"
            placeholder="https://yourapp.com"
            value={form.url}
            onChange={setInput('url')}
          />
          <Textarea
            disableForm
            name="description"
            label="What does your product do? (3-5 sentences)"
            placeholder="FitFlow is a fitness app for busy professionals. It offers 15-minute HIIT workouts..."
            value={form.description}
            onChange={setText('description')}
          />
        </div>
      ),
      valid: form.name.trim() && form.url.trim() && form.description.trim(),
    },
    {
      title: 'Niche & Audience',
      subtitle: 'Help the AI understand who you are targeting',
      fields: (
        <div className="flex flex-col gap-4">
          <Input
            disableForm
            name="niche"
            label="Niche / Industry"
            placeholder="e.g. Health & Fitness, B2B SaaS, E-commerce Fashion"
            value={form.niche}
            onChange={setInput('niche')}
          />
          <Textarea
            disableForm
            name="targetAudience"
            label="Target Audience"
            placeholder="e.g. Busy professionals aged 28-40, mostly in the US, who want to stay fit without gym membership."
            value={form.targetAudience ?? ''}
            onChange={setText('targetAudience')}
          />
          <Textarea
            disableForm
            name="competitors"
            label="Competitors (optional)"
            placeholder="List 2-5 competitor brands so the AI can find content gaps"
            value={form.competitors ?? ''}
            onChange={setText('competitors')}
          />
        </div>
      ),
      valid: form.niche.trim(),
    },
    {
      title: 'Brand & Goals',
      subtitle: 'Define your voice and what success looks like',
      fields: (
        <div className="flex flex-col gap-4">
          <Textarea
            disableForm
            name="brandVoice"
            label="Brand Voice & Tone"
            placeholder="e.g. Professional but approachable. Motivational without being preachy. Plain English, no jargon."
            value={form.brandVoice ?? ''}
            onChange={setText('brandVoice')}
          />
          <Input
            disableForm
            name="brandColors"
            label="Brand Colors (optional)"
            placeholder="e.g. Primary: #6C2BD9 purple, Secondary: white"
            value={form.brandColors ?? ''}
            onChange={setInput('brandColors')}
          />
          <Textarea
            disableForm
            name="goals"
            label="Marketing Goals"
            placeholder="e.g. Drive 500 app downloads/month. Grow Instagram to 10k followers in 6 months."
            value={form.goals ?? ''}
            onChange={setText('goals')}
          />
        </div>
      ),
      valid: true,
    },
  ];

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        existing
          ? `/marketing/projects/${existing.id}`
          : '/marketing/projects',
        {
          method: existing ? 'PUT' : 'POST',
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error('Failed to save');
      await mutate('marketing-projects');
      toaster.show(
        existing
          ? 'Project updated!'
          : `Project "${form.name}" created! The AI is ready to plan your marketing.`,
        'success'
      );
      onClose();
    } catch {
      toaster.show('Failed to save project. Please try again.', 'warning');
    } finally {
      setLoading(false);
    }
  }, [form, existing, fetch, mutate, onClose, toaster]);

  const current = steps[step];

  return (
    <div className="flex flex-col gap-6">
      {/* Step Indicator */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1">
            <div
              className={clsx(
                'h-1 rounded-full transition-colors',
                i <= step
                  ? 'bg-[var(--new-btn-primary)]'
                  : 'bg-[var(--new-sep)]'
              )}
            />
            <span className="text-xs text-[var(--new-textItemBlur)]">
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--new-textColor))]">
          {current.title}
        </h3>
        <p className="text-sm text-[var(--new-textItemBlur)] mt-1">
          {current.subtitle}
        </p>
      </div>

      <div>{current.fields}</div>

      <div className="flex justify-between gap-3 pt-2">
        <Button
          className="flex-1"
          secondary
          onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < steps.length - 1 ? (
          <Button
            className="flex-1"
            disabled={!current.valid}
            onClick={() => setStep((s) => s + 1)}
          >
            Next
          </Button>
        ) : (
          <Button className="flex-1" loading={loading} onClick={handleSave}>
            {existing ? 'Save Changes' : 'Create Project'}
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Campaign Wizard ──────────────────────────────────────────────────────────

const CampaignWizard: FC<{
  projectId: string;
  onClose: () => void;
}> = ({ projectId, onClose }) => {
  const fetch = useFetch();
  const { mutate } = useSWRConfig();
  const toaster = useToaster();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '' });

  const handleCreate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/marketing/projects/${projectId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await mutate(`campaigns-${projectId}`);
      toaster.show(
        'Campaign created! Open the AI agent to start planning.',
        'success'
      );
      onClose();
    } catch {
      toaster.show('Failed to create campaign', 'warning');
    } finally {
      setLoading(false);
    }
  }, [form, projectId, fetch, mutate, onClose, toaster]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        disableForm
        name="campaignName"
        label="Campaign Name"
        placeholder="e.g. Q2 Growth Push, App Launch Campaign"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <Textarea
        disableForm
        name="campaignGoal"
        label="Campaign Goal"
        placeholder="e.g. Drive 1000 new app downloads in April by building awareness on Instagram and LinkedIn"
        value={form.goal}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setForm((f) => ({ ...f, goal: e.target.value }))
        }
      />
      <div className="flex gap-3 pt-2">
        <Button secondary onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          className="flex-1"
          loading={loading}
          disabled={!form.name.trim() || !form.goal.trim()}
          onClick={handleCreate}
        >
          Create Campaign
        </Button>
      </div>
    </div>
  );
};

// ─── Agent metadata ───────────────────────────────────────────────────────────

const agentLabels: Record<string, { label: string; icon: string }> = {
  keyword_strategist: { label: 'Keyword Strategist', icon: '🎯' },
  technical_auditor: { label: 'Technical SEO Auditor', icon: '🔍' },
  growth_agent: { label: 'Growth Agent', icon: '📈' },
  auto_optimizer: { label: 'Auto Optimizer', icon: '⚡' },
  seo_content_creator: { label: 'SEO Content Creator', icon: '✍️' },
  ai_visibility: { label: 'AI Visibility Agent', icon: '🤖' },
};

// ─── Campaign Run Card ────────────────────────────────────────────────────────

const CampaignRunCard: FC<{
  campaign: Campaign;
  projectId: string;
  onRefresh: () => void;
}> = ({ campaign, projectId, onRefresh }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      const res = await fetch(
        `/marketing/projects/${projectId}/campaigns/${campaign.id}/run`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error();
      await onRefresh();
      toaster.show('AI team completed! Your campaign plan is ready.', 'success');
    } catch {
      toaster.show(
        'Failed to run AI team. Check your connected integrations.',
        'warning'
      );
    } finally {
      setRunning(false);
    }
  }, [campaign.id, projectId, fetch, onRefresh, toaster]);

  const isRunning = running || campaign.status === 'RESEARCHING';
  const hasResults =
    campaign.researchRuns && campaign.researchRuns.length > 0;

  return (
    <div className="bg-[var(--new-bgColorInner)] border border-[var(--new-border)] rounded-xl overflow-hidden">
      <div className="p-4 flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="font-medium text-[rgb(var(--new-textColor))]">
            {campaign.name}
          </span>
          <span className="text-sm text-[var(--new-textItemBlur)] line-clamp-2">
            {campaign.goal}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={campaign.status} />
          <Button
            loading={isRunning}
            onClick={handleRun}
            className="text-xs !py-1 !px-3"
          >
            {isRunning
              ? 'Running…'
              : hasResults
              ? '↺ Re-run AI Team'
              : '▶ Run AI Team'}
          </Button>
        </div>
      </div>

      {isRunning && (
        <div className="px-4 pb-3">
          <div className="bg-[var(--new-btn-primary)]/10 rounded-lg p-3">
            <p className="text-xs text-[var(--new-btn-primary)] animate-pulse">
              6 agents working… Keyword research → Technical audit → Growth
              intel → Optimization → Content plan → AI visibility
            </p>
          </div>
        </div>
      )}

      {hasResults && !isRunning && (
        <div className="border-t border-[var(--new-sep)]">
          {campaign.researchRuns!.map((run) => {
            const meta = agentLabels[run.agentType] ?? {
              label: run.agentType,
              icon: '🤖',
            };
            const isOpen = expanded === run.id;
            return (
              <div
                key={run.id}
                className="border-b border-[var(--new-sep)] last:border-0"
              >
                <button
                  className="w-full flex justify-between items-center px-4 py-2.5 text-sm hover:bg-[var(--new-btn-simple)]/30 transition-colors text-left"
                  onClick={() => setExpanded(isOpen ? null : run.id)}
                >
                  <span className="flex items-center gap-2">
                    <span>{meta.icon}</span>
                    <span className="text-[rgb(var(--new-textColor))]">
                      {meta.label}
                    </span>
                  </span>
                  <span className="text-[var(--new-textItemBlur)] text-xs">
                    {isOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3">
                    <pre className="text-xs text-[var(--new-textItemBlur)] bg-black/20 rounded-lg p-3 overflow-auto max-h-72 whitespace-pre-wrap">
                      {typeof run.findings === 'string'
                        ? run.findings
                        : JSON.stringify(run.findings, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Project Card ─────────────────────────────────────────────────────────────

const ProjectCard: FC<{
  project: MarketingProject;
  onSelect: () => void;
  onEdit: () => void;
}> = ({ project, onSelect, onEdit }) => {
  const fetch = useFetch();
  const { mutate } = useSWRConfig();
  const toaster = useToaster();

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm(`Delete project "${project.name}"? This cannot be undone.`))
        return;
      await fetch(`/marketing/projects/${project.id}`, { method: 'DELETE' });
      await mutate('marketing-projects');
      toaster.show('Project deleted', 'success');
    },
    [project, fetch, mutate, toaster]
  );

  const activeCampaigns = project.campaigns.filter(
    (c) => c.status === 'ACTIVE'
  ).length;

  return (
    <div
      className="bg-[var(--new-bgColorInner)] border border-[var(--new-border)] rounded-xl p-5 flex flex-col gap-3 cursor-pointer hover:border-[var(--new-btn-primary)] transition-colors"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-[rgb(var(--new-textColor))]">
            {project.name}
          </h3>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--new-textItemBlur)] hover:text-[var(--new-btn-primary)] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {project.url}
          </a>
        </div>
        <div className="flex gap-2">
          <button
            className="text-xs px-2 py-1 rounded bg-[var(--new-btn-simple)] text-[var(--new-btn-text)] hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:opacity-80 transition-opacity"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--new-textItemBlur)] line-clamp-2">
        {project.description}
      </p>

      <div className="flex gap-2 flex-wrap">
        <span className="px-2 py-0.5 bg-[var(--new-btn-primary)]/10 text-[var(--new-btn-primary)] text-xs rounded">
          {project.niche}
        </span>
        {activeCampaigns > 0 && (
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded">
            {activeCampaigns} active campaign{activeCampaigns > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {project.campaigns.length > 0 && (
        <div className="border-t border-[var(--new-sep)] pt-3 flex flex-col gap-1">
          {project.campaigns.slice(0, 3).map((c) => (
            <div key={c.id} className="flex justify-between items-center">
              <span className="text-xs text-[var(--new-textItemBlur)] truncate">
                {c.name}
              </span>
              <StatusBadge status={c.status} />
            </div>
          ))}
          {project.campaigns.length > 3 && (
            <span className="text-xs text-[var(--new-textItemBlur)]">
              +{project.campaigns.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Project Detail ───────────────────────────────────────────────────────────

const ProjectDetail: FC<{
  project: MarketingProject;
  onBack: () => void;
  onEdit: () => void;
}> = ({ project, onBack, onEdit }) => {
  const { data: campaigns, mutate: mutateCampaigns } = useCampaigns(project.id);
  const modal = useModals();

  const openCampaignModal = useCallback(() => {
    modal.openModal({
      title: 'New Campaign',
      children: (
        <CampaignWizard
          projectId={project.id}
          onClose={() => modal.closeCurrent()}
        />
      ),
      size: 'md',
    });
  }, [modal, project.id]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-[var(--new-textItemBlur)] hover:text-[rgb(var(--new-textColor))] transition-colors"
        >
          ← Back
        </button>
        <span className="text-[var(--new-sep)]">/</span>
        <h1 className="text-xl font-bold text-[rgb(var(--new-textColor))]">
          {project.name}
        </h1>
        <button
          onClick={onEdit}
          className="ml-auto text-xs px-3 py-1.5 rounded bg-[var(--new-btn-simple)] text-[var(--new-btn-text)]"
        >
          Edit Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--new-bgColorInner)] border border-[var(--new-border)] rounded-xl p-4 flex flex-col gap-2">
          <span className="text-xs text-[var(--new-textItemBlur)] uppercase tracking-wider">
            Niche
          </span>
          <span className="text-sm text-[rgb(var(--new-textColor))]">
            {project.niche}
          </span>
        </div>
        {project.targetAudience && (
          <div className="bg-[var(--new-bgColorInner)] border border-[var(--new-border)] rounded-xl p-4 flex flex-col gap-2">
            <span className="text-xs text-[var(--new-textItemBlur)] uppercase tracking-wider">
              Target Audience
            </span>
            <span className="text-sm text-[rgb(var(--new-textColor))] line-clamp-3">
              {project.targetAudience}
            </span>
          </div>
        )}
        {project.goals && (
          <div className="bg-[var(--new-bgColorInner)] border border-[var(--new-border)] rounded-xl p-4 flex flex-col gap-2 md:col-span-2">
            <span className="text-xs text-[var(--new-textItemBlur)] uppercase tracking-wider">
              Goals
            </span>
            <span className="text-sm text-[rgb(var(--new-textColor))]">
              {project.goals}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[rgb(var(--new-textColor))]">
          Campaigns
        </h2>
        <Button onClick={openCampaignModal}>+ New Campaign</Button>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="border border-dashed border-[var(--new-sep)] rounded-xl p-8 text-center">
          <p className="text-[var(--new-textItemBlur)] mb-4">
            No campaigns yet. Create one then open the AI agent to build your
            content plan.
          </p>
          <Button onClick={openCampaignModal}>Create First Campaign</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => (
            <CampaignRunCard
              key={campaign.id}
              campaign={campaign}
              projectId={project.id}
              onRefresh={() => mutateCampaigns()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────

export const MarketingProjects: FC = () => {
  const { data: projects, isLoading } = useProjects();
  const modal = useModals();
  const [selectedProject, setSelectedProject] =
    useState<MarketingProject | null>(null);

  const openWizard = useCallback(
    (existing?: MarketingProject) => {
      modal.openModal({
        title: existing ? 'Edit Project' : 'New Marketing Project',
        children: (
          <ProjectWizard
            existing={existing}
            onClose={() => modal.closeCurrent()}
          />
        ),
        size: 'lg',
      });
    },
    [modal]
  );

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onEdit={() => openWizard(selectedProject)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--new-textColor))]">
            Marketing Projects
          </h1>
          <p className="text-sm text-[var(--new-textItemBlur)] mt-1">
            Each project gives the AI a complete brief so it can plan and create
            marketing that actually works.
          </p>
        </div>
        <Button onClick={() => openWizard()}>+ New Project</Button>
      </div>

      {!isLoading && (!projects || projects.length === 0) && (
        <div className="border border-dashed border-[var(--new-sep)] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="font-semibold text-[rgb(var(--new-textColor))] text-lg mb-2">
            Set up your first project
          </h3>
          <p className="text-[var(--new-textItemBlur)] text-sm mb-6 max-w-md mx-auto">
            Tell Postlaa about your product, audience, and goals. The AI will
            use this context to plan your entire marketing strategy — from
            content topics to posting schedules.
          </p>
          <Button onClick={() => openWizard()}>Create First Project</Button>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => setSelectedProject(project)}
              onEdit={() => openWizard(project)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
