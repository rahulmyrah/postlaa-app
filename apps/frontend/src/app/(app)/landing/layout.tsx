import { ReactNode } from 'react';

export const metadata = {
  title: 'Postlaa — AI-Powered Social Media Marketing Platform',
  description:
    'Postlaa gives every project its own autonomous AI marketing team. Schedule posts across 20+ platforms, run campaigns, and track results — all from one place.',
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
