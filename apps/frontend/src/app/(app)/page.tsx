import { redirect } from 'next/navigation';

// Root route — redirect to the public landing page
export default function RootPage() {
  redirect('/landing');
}
