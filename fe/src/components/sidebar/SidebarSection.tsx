import { ReactNode } from 'react';
import { useSidebar } from './SidebarContext';
import { cn } from '@/lib/utils';

interface SidebarSectionProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

const SidebarSection = ({ label, children, className }: SidebarSectionProps) => {
  const { collapsed } = useSidebar();

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {label && !collapsed && (
        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
          {label}
        </p>
      )}
      {label && collapsed && (
        <div className="mx-auto my-2 h-px w-6 rounded-full bg-border" />
      )}
      {children}
    </div>
  );
};

export default SidebarSection;
