import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import UpdateKnowledgeModal from './update-knowledge-modal';

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
  onKnowledgeUpdated?: () => void;
}

const WebsiteCard = ({ website, isPending = false, onKnowledgeUpdated }: WebsiteCardProps) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const getStatusDisplay = () => {
    if (isPending) {
      return (
        <span className="flex items-center">
          Processing <Loader2 className="ml-1 h-3 w-3 animate-spin" />
        </span>
      );
    }
    return website.status === "completed"
      ? "Active"
      : website.status === "pending" || website.status === "embedding"
        ? "Processing"
        : "Issues";
  };

  const canUpdateKnowledge = website.status === 'completed' || website.status === 'failed';

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold truncate max-w-[200px]" title={website.name}>{website.name}</h3>
          </div>

          <div className="flex justify-end">
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

        <div className="mt-4 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">Requests today</span>
            <span className="text-sm font-medium">{website.requestsToday}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">Total requests</span>
            <span className="text-sm font-medium">{website.requestsTotal}</span>
          </div>
        </div>

        {website.status === 'failed' && website.statusMessage && (
          <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-xs sm:text-sm">
            <p className="font-medium mb-1">Processing Failed</p>
            <p>{website.statusMessage}</p>
          </div>
        )}

        {(website.status === 'completed' || canUpdateKnowledge) && (
          <div className={`mt-4 ${website.status === 'completed' ? 'grid grid-cols-2 gap-2' : ''}`}>
            {website.status === 'completed' && (
              <Link to={`/chat/${website.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Test Chatbot
                </Button>
              </Link>
            )}
            {canUpdateKnowledge && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary"
                onClick={() => setIsUpdateModalOpen(true)}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Update KB
              </Button>
            )}
          </div>
        )}
      </motion.div>

      <UpdateKnowledgeModal
        websiteId={website.id}
        websiteName={website.name}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => { onKnowledgeUpdated?.(); }}
      />
    </>
  );
};

export default WebsiteCard;
