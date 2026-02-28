import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, useSidebar } from '@/components/sidebar/SidebarContext';
import Sidebar from '@/components/sidebar/Sidebar';
import Topbar, { MobileTopbar } from '@/components/topbar/Topbar';
import { sidebar as tokens, topbar } from '@/styles/tokens';

// ── Inner layout — needs sidebar context ───────────────────────────────────
const ShellInner = ({ children }: { children: ReactNode }) => {
  const { collapsed } = useSidebar();
  const sidebarWidth = collapsed ? tokens.widthCollapsed : tokens.widthExpanded;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <MobileTopbar />

      {/* Main content — offset by sidebar width on desktop, topbar height on all */}
      <motion.main
        animate={{ paddingLeft: sidebarWidth }}
        transition={{ duration: tokens.transitionMs / 1000, ease: [0.4, 0, 0.2, 1] }}
        className="lg:block hidden"
        style={{ paddingTop: topbar.height }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {children}
        </div>
      </motion.main>

      {/* Mobile — no sidebar offset, just topbar offset */}
      <main
        className="lg:hidden block"
        style={{ paddingTop: topbar.height }}
      >
        <div className="px-3 py-4">
          {children}
        </div>
      </main>
    </div>
  );
};

// ── AppShell — wraps everything, provides context ──────────────────────────
interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <ShellInner>{children}</ShellInner>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AppShell;
