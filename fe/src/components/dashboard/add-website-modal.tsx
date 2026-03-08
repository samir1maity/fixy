import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Loader2, Upload, FileText, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type Tab = 'url' | 'file' | 'text';

export interface AddWebsiteFormData {
  name: string;
  tab: Tab;
  url?: string;
  file?: File;
  textContent?: string;
}

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddWebsiteFormData) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'url', label: 'Website URL', icon: <Link className="h-4 w-4" /> },
  { id: 'file', label: 'Upload File', icon: <Upload className="h-4 w-4" /> },
  { id: 'text', label: 'Paste Text', icon: <FileText className="h-4 w-4" /> },
];

const AddWebsiteModal = ({ isOpen, onClose, onSubmit, loading }: AddWebsiteModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('url');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName('');
    setUrl('');
    setTextContent('');
    setFile(null);
    setProgress(0);
    setActiveTab('url');
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    const allowed = ['application/pdf', 'text/plain'];
    if (!allowed.includes(f.type)) {
      toast({ title: 'Invalid file type', description: 'Only PDF and .txt files are supported', variant: 'destructive' });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 10 MB', variant: 'destructive' });
      return;
    }
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: 'Name is required', description: 'Please enter a name for this knowledge base', variant: 'destructive' });
      return;
    }

    if (activeTab === 'url' && !url.trim()) {
      toast({ title: 'URL is required', description: 'Please enter a valid website URL', variant: 'destructive' });
      return;
    }
    if (activeTab === 'file' && !file) {
      toast({ title: 'File is required', description: 'Please select a PDF or text file to upload', variant: 'destructive' });
      return;
    }
    if (activeTab === 'text' && !textContent.trim()) {
      toast({ title: 'Text is required', description: 'Please paste some text content', variant: 'destructive' });
      return;
    }

    try {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 95 ? prev : prev + 5));
      }, 300);

      await onSubmit({
        name: name.trim(),
        tab: activeTab,
        url: activeTab === 'url' ? url.trim() : undefined,
        file: activeTab === 'file' ? file ?? undefined : undefined,
        textContent: activeTab === 'text' ? textContent.trim() : undefined,
      });

      setProgress(100);
      setTimeout(() => {
        clearInterval(interval);
        reset();
        onClose();
      }, 1000);
    } catch (error) {
      setProgress(0);
      toast({
        title: 'Failed to add',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
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
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-5 relative mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={loading}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-4 text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-fixy-accent to-primary mx-auto flex items-center justify-center mb-3">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Add Knowledge Base</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add a website, upload a document, or paste text</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Website Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                  maxLength={50}
                  className="w-full h-9 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{name.length}/50</p>
              </div>

              {/* Tabs */}
              <div className="flex rounded-lg border overflow-hidden">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={loading}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'url' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Website URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    disabled={loading}
                    className="w-full h-9 text-sm"
                  />
                </div>
              )}

              {activeTab === 'file' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                    PDF or Text file <span className="text-gray-400">(max 10 MB)</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                      dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setFile(null); }}
                          className="text-gray-400 hover:text-red-500 ml-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Drag & drop or <span className="text-primary font-medium">browse</span></p>
                        <p className="text-xs text-gray-400 mt-1">PDF, TXT supported</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      className="hidden"
                      onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'text' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Paste your text</label>
                  <Textarea
                    placeholder="Paste your content here..."
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    disabled={loading}
                    className="w-full text-sm min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{textContent.length} chars</p>
                </div>
              )}

              {/* Progress */}
              {loading && (
                <div>
                  <Progress value={progress} className="h-2 bg-gray-100 dark:bg-gray-800" />
                  <p className="text-xs text-center mt-1.5 text-gray-500 dark:text-gray-400">Processing...</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-9 text-sm bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing</>
                ) : (
                  'Add Knowledge Base'
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
