import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const AddWebsiteModal = ({ isOpen, onClose, onSubmit, loading, error }: AddWebsiteModalProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL is required",
        description: "Please enter a valid website URL",
        variant: "destructive"
      });
      return;
    }

    try {
      // setIsLoading(true);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);
      
      await onSubmit(url);
      
      // Complete the progress
      setProgress(100);
      
      // Close after a delay
      setTimeout(() => {
        clearInterval(interval);
        // setIsLoading(false);
        setUrl('');
        setProgress(0);
        onClose();
        
        toast({
          title: "Website added successfully",
          description: "Your website is now being processed",
        });
      }, 1500);
      
    } catch (error) {
      // setIsLoading(false);
      setProgress(0);
      toast({
        title: "Failed to add website",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={loading}
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-fixy-accent to-primary mx-auto flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Add New Website</h2>
              <p className="text-gray-500 dark:text-gray-400">Enter your website URL to create a new chatbot</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
              </div>
              
              {loading && (
                <div className="mb-4">
                  <Progress value={progress} className="h-2 bg-gray-100 dark:bg-gray-800" />
                  <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
                    Processing your website...
                  </p>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  'Add Website'
                )}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddWebsiteModal; 