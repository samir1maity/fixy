import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import websiteApiService, { Website } from '@/services/website-api';
import { cn } from '@/lib/utils';

interface PageProjectSwitcherProps {
  /** The currently active website id (from useParams) */
  currentId: string | number;
  /** Route section to preserve when switching, e.g. "analytics" | "settings" */
  section: string;
}

const PageProjectSwitcher = ({ currentId, section }: PageProjectSwitcherProps) => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);

  useEffect(() => {
    websiteApiService
      .getWebsites()
      .then((data) => setWebsites(data ?? []))
      .catch(() => setWebsites([]));
  }, []);

  const current = websites.find((w) => String(w.id) === String(currentId));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          'flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5',
          'text-sm font-medium transition-colors hover:bg-accent outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary/40'
        )}>
          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="max-w-[160px] truncate">
            {current?.name ?? current?.domain ?? 'Select project'}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56" sideOffset={6}>
        {websites.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onSelect={() => String(w.id) !== String(currentId) && navigate(`/${section}/${w.id}`)}
            className={cn('gap-2', String(w.id) === String(currentId) && 'bg-accent font-medium')}
          >
            <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{w.name ?? w.domain}</span>
            {w.status === 'completed' && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/dashboard')} className="gap-2 text-muted-foreground">
          View all projects
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PageProjectSwitcher;
