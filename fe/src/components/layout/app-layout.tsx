import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CircleUser, MessageSquare, LogOut } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { useAuth } from '@/contexts/auth-context';

type AppLayoutScope = 'main' | 'chat';

interface SidebarItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const SIDEBAR_BY_SCOPE: Record<AppLayoutScope, SidebarItem[]> = {
  main: [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      end: true,
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: <CircleUser className="h-4 w-4" />,
    },
  ],
  chat: [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: <CircleUser className="h-4 w-4" />,
    },
    {
      to: '/dashboard',
      label: 'Websites',
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ],
};

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap ${
    isActive
      ? 'bg-primary/10 text-primary font-medium'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  }`;

interface AppLayoutProps {
  children: ReactNode;
  scope?: AppLayoutScope;
}

const AppLayout = ({ children, scope = 'main' }: AppLayoutProps) => {
  const { logout } = useAuth();
  const sidebarItems = SIDEBAR_BY_SCOPE[scope];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-3 sm:px-4 py-6 mt-20">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <aside className="lg:w-56 lg:shrink-0">
            <div className="border rounded-xl p-2 lg:sticky lg:top-24">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {sidebarItems.map((item) => (
                  <NavLink key={`${item.to}-${item.label}`} to={item.to} end={item.end} className={sidebarLinkClass}>
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </nav>
            </div>
          </aside>

          <section className="flex-1 min-w-0">{children}</section>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
