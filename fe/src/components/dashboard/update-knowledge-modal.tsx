import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Upload, FileText, RefreshCw, PlusCircle, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import websiteApiService from '@/services/website-api';

interface UpdateKnowledgeModalProps {
  websiteId: number;
  websiteName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pdfEnabled?: boolean;
}

type Mode = 'reset' | 'append';
type Tab = 'file' | 'text';

const UpdateKnowledgeModal = ({
  websiteId,
  websiteName,
  isOpen,
  onClose,
  onSuccess,
  pdfEnabled = false,
}: UpdateKnowledgeModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>('append');
  const [tab, setTab] = useState<Tab>('file');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setMode('append');
    setTab('file');
    setFile(null);
    setTextContent('');
    setDragOver(false);
  };

  const handleClose = () => {
    if (!loading) { reset(); onClose(); }
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'file' && !file) {
      toast({ title: 'No file selected', description: 'Please select a PDF or .txt file', variant: 'destructive' });
      return;
    }
    if (tab === 'text' && !textContent.trim()) {
      toast({ title: 'No text provided', description: 'Please paste some text content', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await websiteApiService.updateKnowledge(websiteId, mode, {
        file: tab === 'file' ? file ?? undefined : undefined,
        textContent: tab === 'text' ? textContent.trim() : undefined,
      });
      toast({
        title: mode === 'reset' ? 'Knowledge base reset' : 'Content added',
        description: 'Processing started. The chatbot will update shortly.',
      });
      reset();
      onClose();
      onSuccess();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
            {/* Close */}
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-5">
              <h2 className="text-lg font-bold">Update Knowledge Base</h2>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{websiteName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mode selector */}
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Update mode</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setMode('append')}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                      mode === 'append'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <PlusCircle className="h-4 w-4" /> Add content
                    </span>
                    <span className="text-xs text-muted-foreground">Append to existing knowledge</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setMode('reset')}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                      mode === 'reset'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-red-400/50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <RefreshCw className="h-4 w-4" /> Full reset
                    </span>
                    <span className="text-xs text-muted-foreground">Delete all & rebuild</span>
                  </button>
                </div>

                {mode === 'reset' && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md px-3 py-2">
                    All existing knowledge will be permanently cleared and rebuilt from the new content.
                  </p>
                )}
              </div>

              {/* Input tabs */}
              <div className="flex rounded-lg border overflow-hidden">
                {([
                  { id: 'file' as Tab, label: 'Upload File', icon: <Upload className="h-4 w-4" /> },
                  { id: 'text' as Tab, label: 'Paste Text', icon: <FileText className="h-4 w-4" /> },
                ]).map(t => {
                  const isFileLocked = t.id === 'file' && !pdfEnabled;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={loading || isFileLocked}
                      onClick={() => !isFileLocked && setTab(t.id)}
                      title={isFileLocked ? 'PDF upload is disabled. Use Paste Text.' : undefined}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                        isFileLocked
                          ? 'opacity-40 cursor-not-allowed bg-transparent text-gray-400 dark:text-gray-600'
                          : tab === t.id
                            ? 'bg-primary text-white'
                            : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isFileLocked ? <Lock className="h-4 w-4" /> : t.icon}
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* File drop zone */}
              {tab === 'file' && (
                <div
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setFile(null); }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop or <span className="text-primary font-medium">browse</span></p>
                      <p className="text-xs text-gray-400 mt-1">PDF, TXT · max 10 MB</p>
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
              )}

              {/* Text area */}
              {tab === 'text' && (
                <div>
                  <Textarea
                    placeholder="Paste your content here..."
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    disabled={loading}
                    className="w-full text-sm min-h-[130px] resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{textContent.length} chars</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-9 text-sm ${
                  mode === 'reset'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90'
                }`}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
                ) : mode === 'reset' ? (
                  <><RefreshCw className="mr-2 h-4 w-4" />Reset & Rebuild</>
                ) : (
                  <><PlusCircle className="mr-2 h-4 w-4" />Add to Knowledge Base</>
                )}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateKnowledgeModal;
