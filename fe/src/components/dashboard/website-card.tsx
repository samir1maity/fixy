import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Eye, EyeOff, PenSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';

interface WebsiteCardProps {
  website: {
    id: number;
    name: string;
    domain: string;
    status: 'completed' | 'failed' | 'pending' | 'embedding';
    chatbotActive: boolean;
    requestsToday: number;
    requestsTotal: number;
    api_secret: string;
    statusMessage?: string;
  };
  isPending?: boolean;
  isPolling?: boolean;
}

const WebsiteCard = ({ website, isPending = false, isPolling = false }: WebsiteCardProps) => {
  const [showSecret, setShowSecret] = useState(false);
  const [apiSecret, setApiSecret] = useState<string | null>(website.api_secret);
  const { toast } = useToast();
console.log('website after adding to dashboard-->', website);
  const handleCopyDomain = () => {
    navigator.clipboard.writeText(website.domain);
    sonnerToast.success("Domain copied", {
      position: "top-right",
      duration: 3000,
    });
  };

  const handleCopySecret = () => {
    console.log('first')
    if (apiSecret) {
      navigator.clipboard.writeText(apiSecret);
      sonnerToast.success("Api Secret copied", {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  // Determine the status display
  const getStatusDisplay = () => {
    if (isPending) {
      return (
        <span className="flex items-center">
          Processing <Loader2 className="ml-1 h-3 w-3 animate-spin" />
        </span>
      );
    } else {
      return website.status === 'completed' ? 'Active' : 
             website.status === 'pending' || website.status === 'embedding' ? 'Processing' : 'Issues';
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-1">{website.name}</h3>
          <div className="flex items-center text-muted-foreground">
            <span className="text-sm">{website.domain}</span>
            <button 
              onClick={handleCopyDomain}
              className="ml-1.5 text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${
            website.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            website.status === 'pending' || website.status === 'embedding' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              website.status === 'completed' ? 'bg-green-500' :
              website.status === 'pending' || website.status === 'embedding' ? 'bg-amber-500' :
              'bg-red-500'
            }`}></span>
            {getStatusDisplay()}
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Requests today</span>
          <span className="font-medium">{website.requestsToday}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total requests</span>
          <span className="font-medium">{website.requestsTotal}</span>
        </div>
      </div>
      
      {website.status === 'completed' && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">API Secret</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSecret(!showSecret)}
              className="h-8 px-2"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="relative">
            <div className="bg-muted rounded p-2 flex items-center justify-between">
              <div className="overflow-hidden">
                {showSecret ? (
                  <span className="text-xs font-mono">{website.api_secret || '••••••••••••••••••••••••••'}</span>
                ) : (
                  <span className="text-xs font-mono">••••••••••••••••••••••••••</span>
                )}
              </div>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopySecret}
                  className="h-6 w-6 p-0"
                  disabled={!apiSecret}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {website.status === 'failed' && website.statusMessage && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
          <p className="font-medium mb-1">Processing Failed</p>
          <p>{website.statusMessage}</p>
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <a 
          href={`https://${website.domain}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center"
        >
          Visit website <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </a>
        
        {website.status === 'completed' && (
          <Link to={`/chat/${website.id}`}>
            <Button 
              variant="outline" 
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Test Chatbot
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default WebsiteCard;
