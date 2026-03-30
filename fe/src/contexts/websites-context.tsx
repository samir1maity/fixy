import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import websiteApiService, { Website } from '@/services/website-api';
import { useAuth } from './auth-context';

interface WebsitesContextValue {
  websites: Website[];
  setWebsites: React.Dispatch<React.SetStateAction<Website[]>>;
  firstWebsiteId: string | null;
  /** Returns the api_secret for a given website id, or null if not loaded yet. */
  getWebsiteSecret: (websiteId: number) => string | null;
}

const WebsitesContext = createContext<WebsitesContextValue | null>(null);

export const WebsitesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);

  useEffect(() => {
    if (!user) return;
    // Also purge any stale api_secret_* keys that may have been written previously
    Object.keys(localStorage)
      .filter((k) => k.startsWith('api_secret_'))
      .forEach((k) => localStorage.removeItem(k));

    websiteApiService.getWebsites()
      .then((data) => { if (data?.length) setWebsites(data); })
      .catch(() => {});
  }, [user]);

  const firstWebsiteId = websites.length ? String(websites[0].id) : null;

  const getWebsiteSecret = (websiteId: number): string | null => {
    return websites.find((w) => w.id === websiteId)?.api_secret ?? null;
  };

  return (
    <WebsitesContext.Provider value={{ websites, setWebsites, firstWebsiteId, getWebsiteSecret }}>
      {children}
    </WebsitesContext.Provider>
  );
};

export const useWebsites = () => {
  const ctx = useContext(WebsitesContext);
  if (!ctx) throw new Error('useWebsites must be used inside WebsitesProvider');
  return ctx;
};
