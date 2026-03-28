import { useEffect, useState } from 'react';
import { Link, useMatch, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  Settings2,
  CircleUser,
  KeyRound,
  Lock,
  LogOut,
  X,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  websitesLoaded,
  overrideTo,
}: {
  section: 'analytics' | 'settings';
  activeId: string | null;
  icon: React.ReactNode;
  label: string;
  firstWebsiteId: string | null;
  websitesLoaded: boolean;
  overrideTo?: string;
}) => {
  const navigate = useNavigate();
  const isActive = !!activeId;
  const isLoading = !websitesLoaded;
  const isLocked = websitesLoaded && !firstWebsiteId && !activeId;
  const isDisabled = isLoading || isLocked;

  const handleClick = () => {
    if (isDisabled) return;
    if (overrideTo) { navigate(overrideTo); return; }
    const target = activeId ?? firstWebsiteId;
    if (target) navigate(`/${section}/${target}`);
  };

  const btn = (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        isDisabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground'
      )}
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
      {label}
      {isDisabled && <Lock className="ml-auto h-3 w-3 shrink-0" />}
    </button>
  );

  if (isLocked) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a project first to access {label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return btn;
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
  const [websitesLoaded, setWebsitesLoaded] = useState(false);

  // Fetch website list once to know where to navigate when no project is active
  useEffect(() => {
    websiteApiService
      .getWebsites()
      .then((data) => {
        if (data?.length) setFirstWebsiteId(String(data[0].id));
      })
      .catch(() => {})
      .finally(() => setWebsitesLoaded(true));
  }, []);

  return (
    <div className="flex h-full flex-col">

      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-border/60 px-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-700 to-indigo-800 shadow-sm">
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
          websitesLoaded={websitesLoaded}
        />
        <ProjectNavItem
          section="settings"
          activeId={settingsId}
          icon={<Settings2 className="h-4 w-4" />}
          label="Settings"
          firstWebsiteId={firstWebsiteId}
          websitesLoaded={websitesLoaded}
        />
        <ProjectNavItem
          section="settings"
          activeId={null}
          icon={<KeyRound className="h-4 w-4" />}
          label="API Keys"
          firstWebsiteId={firstWebsiteId}
          websitesLoaded={websitesLoaded}
          overrideTo="/api-keys"
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
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-xs font-semibold text-white select-none">
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
