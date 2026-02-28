import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronsUpDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import websiteApiService, { Website } from '@/services/website-api';

// Dummy fallback while API is not ready
const DUMMY_WEBSITES: Website[] = [
  { id: 1, name: 'My Blog', domain: 'myblog.com', status: 'completed', chatbotActive: true, requestsToday: 12, requestsTotal: 340, lastChecked: '', api_secret: '' },
  { id: 2, name: 'E-commerce Store', domain: 'mystore.com', status: 'completed', chatbotActive: true, requestsToday: 5, requestsTotal: 120, lastChecked: '', api_secret: '' },
  { id: 3, name: 'Portfolio', domain: 'myportfolio.dev', status: 'pending', chatbotActive: false, requestsToday: 0, requestsTotal: 0, lastChecked: '', api_secret: '' },
];

// Given the current path, figure out which section we're in so we
// can keep the user in the same section when switching projects.
function getSection(pathname: string): string {
  if (pathname.startsWith('/analytics')) return 'analytics';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/chat')) return 'chat';
  return 'analytics';
}

interface WebsiteSelectorProps {
  currentWebsiteId: string;
}

const WebsiteSelector = ({ currentWebsiteId }: WebsiteSelectorProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [websites, setWebsites] = useState<Website[]>([]);

  useEffect(() => {
    websiteApiService
      .getWebsites()
      .then((data) => setWebsites(data?.length ? data : DUMMY_WEBSITES))
      .catch(() => setWebsites(DUMMY_WEBSITES));
  }, []);

  const current = websites.find((w) => String(w.id) === currentWebsiteId);
  const section = getSection(pathname);

  const handleSelect = (id: number) => {
    if (String(id) === currentWebsiteId) return;
    navigate(`/${section}/${id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between text-left font-normal h-8 px-2.5 text-xs"
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{current?.name ?? current?.domain ?? 'Select project'}</span>
          </span>
          <ChevronsUpDown className="h-3 w-3 shrink-0 text-muted-foreground ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {websites.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onSelect={() => handleSelect(w.id)}
            className={String(w.id) === currentWebsiteId ? 'bg-accent font-medium' : ''}
          >
            <Globe className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm">{w.name ?? w.domain}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WebsiteSelector;
