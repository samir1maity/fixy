
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, MessageSquare, ExternalLink } from 'lucide-react';
import { fadeUp } from '@/lib/motion';
import { Button } from '@/components/ui/button';

interface WebsiteCardProps {
  website: {
    id: number;
    name: string;
    url: string;
    status: 'healthy' | 'issues' | 'pending';
    chatbotActive: boolean;
    requestsToday: number;
    requestsTotal: number;
    lastChecked: string;
  };
}

const WebsiteCard = ({ website }: WebsiteCardProps) => {
  return (
    <motion.div
      variants={fadeUp()}
      className="border rounded-xl p-6 hover:shadow-md transition-shadow bg-card text-card-foreground"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{website.name}</h3>
          <a 
            href={website.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground flex items-center hover:text-primary transition-colors"
          >
            {website.url} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
        <div className="flex items-center">
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
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-2xl font-semibold">{website.requestsToday}</p>
          <p className="text-xs text-muted-foreground flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" /> Requests
          </p>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold">{website.requestsTotal.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" /> Requests
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Last checked: {website.lastChecked}
        </p>
        <Button
          variant={website.chatbotActive ? "default" : "outline"}
          size="sm"
          className={website.chatbotActive ? "bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90" : ""}
        >
          {website.chatbotActive ? "Active" : "Inactive"}
        </Button>
      </div>
    </motion.div>
  );
};

export default WebsiteCard;
