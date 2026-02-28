import { useEffect, useState } from 'react';
import { Link, useMatch, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  Settings2,
  CircleUser,
  LogOut,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from './SidebarContext';
import websiteApiService from '@/services/website-api';
import { cn } from '@/lib/utils';
import { sidebar as tokens } from '@/styles/tokens';

// ── Simple nav link ────────────────────────────────────────────────────────
const NavItem = ({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )
    }
  >
    <span className="h-4 w-4 shrink-0">{icon}</span>
    {label}
  </NavLink>
);

// ── Nav item that resolves a project id before navigating ──────────────────
// When the user is not on a project route, falls back to the first website.
const ProjectNavItem = ({
  section,
  activeId,
  icon,
  label,
  firstWebsiteId,
}: {
  section: 'analytics' | 'settings';
  activeId: string | null;
  icon: React.ReactNode;
  label: string;
  firstWebsiteId: string | null;
}) => {
  const navigate = useNavigate();
  const isActive = !!activeId; // active when we're on this section

  const handleClick = () => {
    const target = activeId ?? firstWebsiteId;
    if (target) {
      navigate(`/${section}/${target}`);
    }
    // if no websites exist at all, do nothing (button stays inert)
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
      {label}
    </button>
  );
};

// ── Sidebar body ───────────────────────────────────────────────────────────
const SidebarBody = ({
  analyticsId,
  settingsId,
}: {
  analyticsId: string | null;
  settingsId: string | null;
}) => {
  const { logout, user } = useAuth();
  const [firstWebsiteId, setFirstWebsiteId] = useState<string | null>(null);

  // Fetch website list once to know where to navigate when no project is active
  useEffect(() => {
    websiteApiService
      .getWebsites()
      .then((data) => {
        if (data?.length) setFirstWebsiteId(String(data[0].id));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full flex-col">

      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-border/60 px-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
            <span className="text-xs font-bold text-white">F</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Fixy</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Projects"
          end
        />
        <ProjectNavItem
          section="analytics"
          activeId={analyticsId}
          icon={<BarChart2 className="h-4 w-4" />}
          label="Analytics"
          firstWebsiteId={firstWebsiteId}
        />
        <ProjectNavItem
          section="settings"
          activeId={settingsId}
          icon={<Settings2 className="h-4 w-4" />}
          label="Settings"
          firstWebsiteId={firstWebsiteId}
        />
        <NavItem
          to="/profile"
          icon={<CircleUser className="h-4 w-4" />}
          label="Profile"
        />
      </nav>

      {/* User strip */}
      <div className="shrink-0 border-t border-border/60 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-xs font-semibold text-white select-none">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {user?.email ?? 'User'}
          </p>
          <button
            onClick={logout}
            aria-label="Log out"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

// ── Desktop sidebar ────────────────────────────────────────────────────────
const DesktopSidebar = ({
  analyticsId, settingsId,
}: { analyticsId: string | null; settingsId: string | null }) => (
  <aside
    style={{ width: tokens.widthExpanded }}
    className="fixed left-0 top-0 hidden h-screen border-r border-border/60 bg-background lg:flex flex-col z-40"
  >
    <SidebarBody analyticsId={analyticsId} settingsId={settingsId} />
  </aside>
);

// ── Mobile drawer ──────────────────────────────────────────────────────────
const MobileDrawer = ({
  analyticsId, settingsId,
}: { analyticsId: string | null; settingsId: string | null }) => {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            key="drawer"
            initial={{ x: -tokens.widthExpanded }}
            animate={{ x: 0 }}
            exit={{ x: -tokens.widthExpanded }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: tokens.widthExpanded }}
            className="fixed left-0 top-0 h-screen border-r border-border/60 bg-background z-50 lg:hidden"
          >
            <div className="absolute right-2 top-3.5 z-10">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarBody analyticsId={analyticsId} settingsId={settingsId} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Root export ────────────────────────────────────────────────────────────
const Sidebar = () => {
  const analyticsMatch = useMatch('/analytics/:id');
  const settingsMatch  = useMatch('/settings/:id');
  const chatMatch      = useMatch('/chat/:id');

  const analyticsId = analyticsMatch?.params.id ?? chatMatch?.params.id ?? null;
  const settingsId  = settingsMatch?.params.id ?? null;

  return (
    <>
      <DesktopSidebar analyticsId={analyticsId} settingsId={settingsId} />
      <MobileDrawer   analyticsId={analyticsId} settingsId={settingsId} />
    </>
  );
};

export default Sidebar;
