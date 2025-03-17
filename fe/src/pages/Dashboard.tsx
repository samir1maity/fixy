import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Globe, 
  Plus, 
  Search, 
  Heart, 
  AlertTriangle, 
  Activity,
  MessageSquare,
  RefreshCw,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { 
  fadeIn, 
  fadeUp, 
  staggerContainer 
} from '@/lib/motion';
import WebsiteCard from '@/components/dashboard/website-card';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import ProfileDropdown from '@/components/dashboard/profile-dropdown';
import AddWebsiteModal from '@/components/dashboard/add-website-modal';
import { useApi } from '@/hooks/use-api';
import websiteApiService, { Website } from '@/services/website-api';
import analyticsApiService, { UserChatStats } from '@/services/analytics-api';
import { useAuth } from '@/contexts/auth-context';
import { usePolling } from '@/hooks/use-polling';
import { toast as sonnerToast } from "sonner";


const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
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

  const { loading: websitesLoading, execute: executeWebsiteFetch } = useApi({
    showErrorToast: true,
    errorMessage: "Login failed. Please check your credentials.",
  });
  
  const { loading: statsLoading, execute: executeStatsFetch } = useApi({
    showErrorToast: true,
    errorMessage: "Login failed. Please check your credentials.",
  });
  
  // Polling hook for checking website status
  const { startPolling, stopPolling } = usePolling(
    async () => {
      const allWebsites = await executeWebsiteFetch(() => websiteApiService.getWebsites());
      console.log('allWebsites -->', allWebsites);
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
    handleFetchStats()
  }, [isRefreshing]);

  const loadWebsites = async () => {
    const data = await executeWebsiteFetch(() => websiteApiService.getWebsites());
    if (data) {
      setWebsites(data);
      
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
        showSuccessToast: true,
      }
    );
    console.log('result -->', result);
    if(!result) return;
    if (result) {
      setStats(result);
    }
  };

  const handleAddWebsite = () => {
    setIsAddModalOpen(true);
  };

  const handleSubmitWebsite = async (url: string) => {
    try {
      const response = await executeWebsiteFetch(() => websiteApiService.registerWebsite(url));
      
      if (response) {
        // Add the new website to the list with pending status
        const newWebsite: Website = {
          id: response.id,
          domain: new URL(url).hostname,
          status: 'pending',
          chatbotActive: false,
          requestsToday: 0,
          requestsTotal: 0,
          lastChecked: new Date().toISOString(),
          name: new URL(url).hostname,
          api_secret: response.api_secret
        };
        
        setWebsites(prev => [...prev, newWebsite]);
        setPendingWebsites(prev => [...prev, response.id]);
        
        // Start polling if not already polling
        startPolling();
        
        setIsAddModalOpen(false);
        
        toast({
          title: "Website added",
          description: "Your website is being processed. This may take a few minutes.",
        });
      }
    } catch (error) {
      console.error('Error adding website:', error);
    }
  };
  
  const filteredWebsites = websites.filter(website => 
    // website.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    website.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRefresh = () => {
    executeWebsiteFetch(() => websiteApiService.getWebsites());
    handleFetchStats();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div 
            variants={fadeUp()}
            initial="hidden"
            animate="show"
          >
            <h1 className="text-3xl font-bold mb-2">Your Chatbots</h1>
            <p className="text-muted-foreground">Manage and monitor your website chatbots</p>
          </motion.div>
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <ProfileDropdown 
              user={user} 
              onLogout={logout}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={handleRefresh} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={handleAddWebsite} className="bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Add Website
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Dashboard Stats */}
        <DashboardStats stats={stats} />
        
        {/* Search */}
        <div className="my-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search websites..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Websites List */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {websitesLoading && <div className="text-center py-4">Loading websites...</div>}
          {!websitesLoading && filteredWebsites.map((website) => (
            <WebsiteCard 
              key={website.id} 
              website={website} 
              isPending={pendingWebsites.includes(website.id)}
            />
          ))}
          
          {!websitesLoading && filteredWebsites.length === 0 && <div className="text-center py-4">No websites found</div>}
          
          {/* Add New Website Card */}
          <motion.div
            variants={fadeIn()}
            className="border border-dashed rounded-xl flex items-center justify-center p-6 h-64 cursor-pointer hover:border-primary transition-colors"
            onClick={handleAddWebsite}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Add New Website</h3>
              <p className="text-sm text-muted-foreground">Connect a new website to create a chatbot</p>
            </div>
          </motion.div>
        </motion.div>
      </main>
      

      <AddWebsiteModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitWebsite}
        loading={websitesLoading}
        error={websitesLoading ? new Error("Error registering website") : null}
      />
    </motion.div>
  );
};

export default Dashboard;
