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
import websiteApiService from '@/services/website-api';

// Mock data for websites
const mockWebsites = [
  {
    id: 1,
    name: 'E-commerce Store',
    url: 'https://myecommerce.com',
    status: 'healthy' as 'healthy',
    chatbotActive: true,
    requestsToday: 243,
    requestsTotal: 5892,
    lastChecked: '2 mins ago'
  },
  {
    id: 2,
    name: 'Portfolio Website',
    url: 'https://myportfolio.dev',
    status: 'healthy' as 'healthy',
    chatbotActive: true,
    requestsToday: 56,
    requestsTotal: 1248,
    lastChecked: '5 mins ago'
  },
  {
    id: 3,
    name: 'Company Blog',
    url: 'https://ourblog.com',
    status: 'issues' as 'issues',
    chatbotActive: false,
    requestsToday: 0,
    requestsTotal: 4571,
    lastChecked: '10 mins ago'
  }
];

// Mock data for stats
const mockStats = {
  totalWebsites: 3,
  activeWebsites: 2,
  totalRequests: 11711,
  requestsToday: 299
};

const Dashboard = () => {
  const { toast } = useToast();
  const [websites, setWebsites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { loading, error, execute } = useApi({
    showErrorToast: true,
    errorMessage: "Login failed. Please check your credentials.",
  });
  
  useEffect(() => {
    handleRefresh();
  }, []);
  
  const handleRefresh = async () => {
    toast({
      title: "Refreshing website status",
      description: "Checking health status for all websites",
    });
    // Here you would typically fetch updated data
    const result = await execute(
      () => websiteApiService.getWebsites(),
      {
        showSuccessToast: true,
        successMessage: "Website status refreshed successfully!",
      }
    );
    console.log('result -->', result);
    setWebsites(result);
  };
  
  const handleAddWebsite = () => {
    setIsAddModalOpen(true);
  };

  const handleSubmitWebsite = async (url: string) => {

    const result = await execute(
      () => websiteApiService.registerWebsite(url),
      {
        showSuccessToast: true,
        successMessage: "Website registered successfully!",
      }
    );

    console.log('result', result);
  };
  
  const filteredWebsites = websites.filter(website => 
    // website.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    website.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
            <ProfileDropdown />
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
        <DashboardStats stats={mockStats} />
        
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
          {filteredWebsites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
          
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
      
      {/* Add Website Modal */}
      <AddWebsiteModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitWebsite}
        loading={loading}
        error={error}
      />
    </motion.div>
  );
};

export default Dashboard;
