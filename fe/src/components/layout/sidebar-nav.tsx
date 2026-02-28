import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export interface SidebarItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap ${
    isActive
      ? 'bg-primary/10 text-primary font-medium'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  }`;

interface SidebarNavProps {
  items: SidebarItem[];
  /** Optional node rendered at the top of the nav (e.g. project switcher) */
  header?: ReactNode;
}

const SidebarNav = ({ items, header }: SidebarNavProps) => {
  const { logout } = useAuth();

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
      {header && <div className="mb-1">{header}</div>}

      {items.map((item) => (
        <NavLink
          key={`${item.to}-${item.label}`}
          to={item.to}
          end={item.end}
          className={linkClass}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground whitespace-nowrap mt-auto"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </nav>
  );
};

export default SidebarNav;
