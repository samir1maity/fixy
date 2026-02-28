import { useLocation, useMatch, Link } from 'react-router-dom';
import { Menu, Sun, Moon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useSidebar } from '@/components/sidebar/SidebarContext';
import { sidebar as tokens, topbar } from '@/styles/tokens';
import { cn } from '@/lib/utils';

// ── Breadcrumb ─────────────────────────────────────────────────────────────
interface BreadcrumbSegment {
  label: string;
  href?: string;
}

function useBreadcrumbs(): BreadcrumbSegment[] {
  const { pathname } = useLocation();
  const analyticsMatch = useMatch('/analytics/:id');
  const settingsMatch  = useMatch('/settings/:id');
  const chatMatch      = useMatch('/chat/:id');

  if (pathname === '/dashboard')  return [{ label: 'Projects' }];
  if (pathname === '/profile')    return [{ label: 'Profile' }];
  if (pathname === '/api-keys')   return [{ label: 'API Keys' }];

  if (analyticsMatch) {
    return [
      { label: 'Projects', href: '/dashboard' },
      { label: 'Analytics' },
    ];
  }
  if (settingsMatch) {
    return [
      { label: 'Projects', href: '/dashboard' },
      { label: 'Settings' },
    ];
  }
  if (chatMatch) {
    return [
      { label: 'Projects', href: '/dashboard' },
      { label: 'Test Chatbot' },
    ];
  }

  return [{ label: 'Dashboard' }];
}

// ── User Avatar ────────────────────────────────────────────────────────────
const UserMenu = () => {
  const { user, logout } = useAuth();
  const initial = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="User menu"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-xs font-semibold text-white ring-2 ring-background hover:ring-primary/30 transition-all outline-none focus-visible:ring-primary/50"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ── Topbar ─────────────────────────────────────────────────────────────────
const Topbar = () => {
  const { collapsed, setMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const breadcrumbs = useBreadcrumbs();

  const sidebarWidth = collapsed ? tokens.widthCollapsed : tokens.widthExpanded;

  return (
    <motion.header
      animate={{ paddingLeft: sidebarWidth }}
      transition={{ duration: tokens.transitionMs / 1000, ease: [0.4, 0, 0.2, 1] }}
      style={{ height: topbar.height }}
      className="fixed left-0 right-0 top-0 z-30 hidden lg:flex items-center border-b border-border/60 bg-background/80 backdrop-blur-md px-4 gap-3"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 min-w-0">
        {breadcrumbs.map((seg, i) => (
          <span key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
            {seg.href ? (
              <Link
                to={seg.href}
                className="truncate text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {seg.label}
              </Link>
            ) : (
              <span className="truncate text-sm font-medium text-foreground">{seg.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.span>
        </Button>

        <UserMenu />
      </div>
    </motion.header>
  );
};

// ── Mobile Topbar ──────────────────────────────────────────────────────────
export const MobileTopbar = () => {
  const { setMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const breadcrumbs = useBreadcrumbs();
  const { user, logout } = useAuth();
  const initial = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header
      style={{ height: topbar.height }}
      className="fixed left-0 right-0 top-0 z-30 flex lg:hidden items-center border-b border-border/60 bg-background/80 backdrop-blur-md px-3 gap-2"
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-1.5 mr-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-700 to-indigo-800">
          <span className="text-[10px] font-bold text-white">F</span>
        </div>
        <span className="text-sm font-semibold">Fixy</span>
      </Link>

      {/* Breadcrumb — last segment only on mobile */}
      {breadcrumbs.length > 0 && (
        <span className="text-sm font-medium text-foreground truncate">
          {breadcrumbs[breadcrumbs.length - 1].label}
        </span>
      )}

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-xs font-semibold text-white outline-none">
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground truncate">{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Topbar;
