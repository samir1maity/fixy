import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
} from 'lucide-react';
import { 
  fadeIn, 
  fadeUp, 
  staggerContainer 
} from '@/lib/motion';
import WebsiteCard from '@/components/dashboard/website-card';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import AddWebsiteModal, { AddWebsiteFormData } from '@/components/dashboard/add-website-modal';
import AppShell from '@/components/layout/AppShell';
import { useApi } from '@/hooks/use-api';
import websiteApiService, { Website } from '@/services/website-api';
import analyticsApiService, { UserChatStats } from '@/services/analytics-api';
import { useAuth } from '@/contexts/auth-context';
import { usePolling } from '@/hooks/use-polling';
import { toast as sonnerToast } from "sonner";


const Dashboard = () => {
  const { toast } = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<UserChatStats>({
    totalWebsites: 0,
    activeWebsites: 0,
    todayChats: 0,
    totalChats: 0
  });
  const [pendingWebsites, setPendingWebsites] = useState<number[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const { loading: websitesLoading, execute: executeWebsiteFetch } = useApi({
    showErrorToast: true,
    errorMessage: "Failed to load websites",
  });
  
  const { execute: executeStatsFetch } = useApi({
    showErrorToast: true,
    errorMessage: "Failed to load statistics",
  });
  
  // Polling hook for checking website status
  const { startPolling, stopPolling, isPolling } = usePolling(
    async () => {
      // Important: Don't reset the websites array here
      const allWebsites = await executeWebsiteFetch(() => websiteApiService.getWebsites());
      
      if (allWebsites) {
        // Update websites without losing the current display
        setWebsites(allWebsites);
        
        // Check for any pending or embedding websites
        const pending = allWebsites.filter(
          website => website.status === 'pending' || website.status === 'embedding'
        ).map(w => w.id);
        
        setPendingWebsites(pending);
        
        if (pending.length === 0) {
          console.log('No pending websites, stopping polling');
          stopPolling();
          
          if (pendingWebsites.length > 0) {
            sonnerToast.success("Processing complete", {
              description: "All websites have been processed",
              position: "top-right",
              duration: 5000,
            });
          }
        }
      }
      
      return allWebsites;
    },
    {
      interval: 5000,
      maxAttempts: 60, // 5 minutes max (60 * 5s)
      onError: () => {
        sonnerToast.error("Error", {
          description: "Failed to update website status",
          position: "top-right",
          duration: 5000,
        });
      }
    }
  );

  useEffect(() => {
    loadWebsites();
    handleFetchStats();
  }, [isRefreshing]);

  const loadWebsites = async () => {
    const data = await executeWebsiteFetch(() => websiteApiService.getWebsites());
    if (data) {
      setWebsites(data);
      setInitialLoadComplete(true);
      
      // Check for any pending or embedding websites
      const pending = data.filter(
        website => website.status === 'pending' || website.status === 'embedding'
      ).map(w => w.id);
      
      if (pending.length > 0) {
        setPendingWebsites(pending);
        startPolling();
      }
    }
  };
  
  // fetching user stats - count of websites, active websites, today chats, total chats
  const handleFetchStats = async () => {
    const result = await executeStatsFetch(
      () => analyticsApiService.getUserChatStats(),
      {
        showSuccessToast: false,
      }
    );
    
    if (result) {
      setStats(result);
    }
  };

  const handleAddWebsite = () => {
    setIsAddModalOpen(true);
  };

  const handleSubmitWebsite = async (formData: AddWebsiteFormData) => {
    try {
      const response = await executeWebsiteFetch(() => websiteApiService.registerWebsite(formData));

      if (response) {
        const domain = formData.url ? new URL(formData.url).hostname : formData.name.toLowerCase().replace(/\s+/g, '-');
        const newWebsite: Website = {
          id: response.id,
          domain,
          status: 'pending',
          chatbotActive: false,
          requestsToday: 0,
          requestsTotal: 0,
          lastChecked: new Date().toISOString(),
          name: formData.name,
          api_secret: response.api_secret
        };

        setWebsites(prev => [...prev, newWebsite]);
        setPendingWebsites(prev => [...prev, response.id]);

        startPolling();
        setIsAddModalOpen(false);

        toast({
          title: "Added successfully",
          description: "Your content is being processed. This may take a few minutes.",
        });
      }
    } catch (error) {
      console.error('Error adding website:', error);
    }
  };
  
  const filteredWebsites = websites.filter(website =>
    (website.name || website.domain).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRefresh = () => {
    executeWebsiteFetch(() => websiteApiService.getWebsites());
    handleFetchStats();
  };

  return (
    <AppShell>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
        <motion.div 
          variants={fadeUp()}
          initial="hidden"
          animate="show"
        >
          <h1 className="text-2xl font-bold mb-1">Your Chatbots</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor your website chatbots</p>
        </motion.div>
        {/* <div className="flex items-center mt-3 md:mt-0 space-x-2">
          <ProfileDropdown 
            user={user} 
            onLogout={logout}
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleRefresh} variant="outline" size="sm" className="h-9 w-9 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleAddWebsite} size="sm" className="h-9 px-3 text-sm bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" /> Add Website
            </Button>
          </motion.div>
        </div> */}
      </div>
      
      {/* Dashboard Stats */}
      <DashboardStats stats={stats} />
      
      {/* Search */}
      <div className="my-4 relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search websites..."
          className="h-9 pl-10 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Websites List */}
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {/* Show loading state only on initial load, not during polling */}
        {websitesLoading && !initialLoadComplete && (
          <div className="col-span-full text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading websites...</p>
          </div>
        )}
        
        {/* Always show websites once initial load is complete */}
        {initialLoadComplete && filteredWebsites.map((website) => (
          <WebsiteCard
            key={website.id}
            website={website}
            isPending={pendingWebsites.includes(website.id)}
            isPolling={isPolling}
            onKnowledgeUpdated={() => {
              setPendingWebsites(prev => [...prev, website.id]);
              startPolling();
            }}
          />
        ))}
        
        {initialLoadComplete && filteredWebsites.length === 0 && (
          <div className="col-span-full text-center py-4">No websites found</div>
        )}
        
        {/* Add New Website Card */}
        {initialLoadComplete && (
          <motion.div
            variants={fadeIn()}
            className="border border-dashed rounded-xl flex items-center justify-center p-4 h-52 cursor-pointer hover:border-primary transition-colors"
            onClick={handleAddWebsite}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-medium mb-1">Add New Website</h3>
              <p className="text-xs text-muted-foreground">Connect a new website to create a chatbot</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AddWebsiteModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitWebsite}
        loading={websitesLoading}
        error={websitesLoading ? new Error("Error registering website") : null}
        pdfEnabled={websites[0]?.pdfEnabled ?? false}
      />
    </AppShell>
  );
};

export default Dashboard;
