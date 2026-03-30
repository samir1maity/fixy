import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import websiteApiService, { Website } from '@/services/website-api';
import { useAuth } from './auth-context';

interface WebsitesContextValue {
  websites: Website[];
  setWebsites: React.Dispatch<React.SetStateAction<Website[]>>;
  firstWebsiteId: string | null;
}

const WebsitesContext = createContext<WebsitesContextValue | null>(null);

export const WebsitesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);

  useEffect(() => {
    if (!user) return;
    websiteApiService.getWebsites()
      .then((data) => { if (data?.length) setWebsites(data); })
      .catch(() => {});
  }, [user]);

  const firstWebsiteId = websites.length ? String(websites[0].id) : null;

  return (
    <WebsitesContext.Provider value={{ websites, setWebsites, firstWebsiteId }}>
      {children}
    </WebsitesContext.Provider>
  );
};

export const useWebsites = () => {
  const ctx = useContext(WebsitesContext);
  if (!ctx) throw new Error('useWebsites must be used inside WebsitesProvider');
  return ctx;
};
