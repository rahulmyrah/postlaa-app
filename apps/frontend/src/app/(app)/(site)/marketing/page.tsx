import { Metadata } from 'next';
import { MarketingProjects } from '@gitroom/frontend/components/marketing/marketing.projects';

export const metadata: Metadata = {
  title: 'Postlaa - Marketing Projects',
  description: 'Autonomous marketing intelligence — plan, create, and schedule content that drives results',
};

export default function Page() {
  return <MarketingProjects />;
}
