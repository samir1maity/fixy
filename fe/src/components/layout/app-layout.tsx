import { ReactNode } from 'react';
import { useMatch } from 'react-router-dom';
import { LayoutDashboard, CircleUser, BarChart2, Settings2 } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import SidebarNav, { SidebarItem } from './sidebar-nav';
import WebsiteSelector from './website-selector';

// ── Static nav items ───────────────────────────────────────────────────────
// These never change regardless of which project is active.
// websiteId is injected at render time so links always point to the
// currently-active project.

const buildNavItems = (websiteId: string | null): SidebarItem[] => [
  {
    to: '/dashboard',
    label: 'Projects',
    icon: <LayoutDashboard className="h-4 w-4" />,
    end: true,
  },
  ...(websiteId
    ? [
        {
          to: `/analytics/${websiteId}`,
          label: 'Analytics',
          icon: <BarChart2 className="h-4 w-4" />,
        },
        {
          to: `/settings/${websiteId}`,
          label: 'Settings',
          icon: <Settings2 className="h-4 w-4" />,
        },
      ]
    : []),
  {
    to: '/profile',
    label: 'Profile',
    icon: <CircleUser className="h-4 w-4" />,
  },
];

// ── AppLayout ──────────────────────────────────────────────────────────────
interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  // Match any route that carries a project id (:id segment)
  const analyticsMatch = useMatch('/analytics/:id');
  const settingsMatch  = useMatch('/settings/:id');
  const chatMatch      = useMatch('/chat/:id');

  const websiteId =
    analyticsMatch?.params.id ??
    settingsMatch?.params.id ??
    chatMatch?.params.id ??
    null;

  const items = buildNavItems(websiteId);

  // Show the project-switcher dropdown only when we're inside a project route
  const selectorHeader = websiteId ? (
    <WebsiteSelector currentWebsiteId={websiteId} />
  ) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-3 sm:px-4 py-6 mt-20">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          <aside className="lg:w-56 lg:shrink-0">
            <div className="border rounded-xl p-2 lg:sticky lg:top-24">
              <SidebarNav items={items} header={selectorHeader} />
            </div>
          </aside>

          <section className="flex-1 min-w-0">{children}</section>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
