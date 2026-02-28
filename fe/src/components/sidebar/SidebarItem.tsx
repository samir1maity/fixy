import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from './SidebarContext';
import { cn } from '@/lib/utils';

export interface SidebarItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  badge?: string | number;
}

const SidebarItem = ({ to, label, icon, end, badge }: SidebarItemProps) => {
  const { collapsed } = useSidebar();

  const content = (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 group',
          'hover:bg-accent hover:text-foreground',
          isActive
            ? 'bg-primary/10 text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:rounded-full before:bg-primary'
            : 'text-muted-foreground',
          collapsed && 'justify-center px-2'
        )
      }
    >
      <span className="shrink-0 h-4 w-4 flex items-center justify-center">{icon}</span>

      {!collapsed && (
        <span className="truncate flex-1">{label}</span>
      )}

      {!collapsed && badge !== undefined && (
        <span className="ml-auto shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary leading-none">
          {badge}
        </span>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {label}
          {badge !== undefined && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

export default SidebarItem;
