import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, MessageSquare, ExternalLink, Copy, Eye, EyeOff, Check, PenSquare } from 'lucide-react';
import { fadeUp } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface WebsiteCardProps {
  website: {
    id: number;
    name: string;
    domain: string;
    status: 'healthy' | 'issues' | 'pending';
    chatbotActive: boolean;
    requestsToday: number;
    requestsTotal: number;
    lastChecked: string;
  };
}

const WebsiteCard = ({ website }: WebsiteCardProps) => {
  const { toast } = useToast();
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate a consistent API key based on website ID
  const apiKey = `fixy_${website.id}_${btoa(website.domain).substring(0, 8)}`;
  
  const toggleSecret = () => {
    setShowSecret(!showSecret);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({
      title: "API Key copied",
      description: "The API key has been copied to your clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <motion.div
      variants={fadeUp()}
      className="border rounded-xl p-6 hover:shadow-md transition-shadow bg-card text-card-foreground relative"
    >
      {/* Test Chat Button */}
      <Link 
        to={`/chat/${website.id}`}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
        title="Test Chatbot"
      >
        <PenSquare className="h-4 w-4 text-primary" />
      </Link>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* <h3 className="font-semibold text-lg">{website.name}</h3> */}
          <a
            href={website.domain} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-semibold text-muted-foreground flex items-center hover:text-primary transition-colors"
          >
            {website.domain} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
        {/* <div className="flex items-center">
          {website.status === 'healthy' ? (
            <div className="flex items-center text-green-500">
              <Heart className="h-5 w-5 mr-1.5" />
              <span className="text-sm font-medium">Healthy</span>
            </div>
          ) : (
            <div className="flex items-center text-amber-500">
              <AlertTriangle className="h-5 w-5 mr-1.5" />
              <span className="text-sm font-medium">Issues</span>
            </div>
          )}
        </div> */}
      </div>
      
      {/* API Secret Key Section */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-muted-foreground">API Key</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSecret}
            className="h-8 w-8 p-0"
          >
            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="bg-muted/50 p-2 rounded-lg font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
              {showSecret ? apiKey : '•'.repeat(24)}
            </div>
            
            {/* Gradient overlay when hidden */}
            {!showSecret && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-background/20 rounded-lg pointer-events-none" />
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 flex items-center justify-center"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Use this key to integrate the chatbot with your website
        </p>
      </div>
      
      {/* Status Badge */}
      <div className="mt-4 flex justify-end">
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${
          website.status === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          website.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            website.status === 'healthy' ? 'bg-green-500' :
            website.status === 'pending' ? 'bg-amber-500' :
            'bg-red-500'
          }`}></span>
          {website.status === 'healthy' ? 'Active' : 
           website.status === 'pending' ? 'Processing' : 'Issues'}
        </div>
      </div>
    </motion.div>
  );
};

export default WebsiteCard;
