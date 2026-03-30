import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/use-api';
import ReactMarkdown from 'react-markdown';
import chatApiService from '@/services/chat-api';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useWebsites } from '@/contexts/websites-context';
import AppShell from '@/components/layout/AppShell';

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const [input, setInput] = useState('');
  const [siteName, setSiteName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Secret comes from the already-authenticated context — always fresh, never stale
  const { websites, getWebsiteSecret } = useWebsites();
  const apiSecret = id ? getWebsiteSecret(Number(id)) : null;

  const { messages, sessionId, addMessage, clearChat, updateSessionId } = useChatHistory(id || 'default');

  const { loading, execute } = useApi({
    showErrorToast: true,
    errorMessage: "Failed to send message",
  });

  // Resolve display name from context (no extra API call needed)
  useEffect(() => {
    if (!id) return;
    const website = websites.find((w) => w.id === Number(id));
    if (website) {
      const name = website.name || website.domain;
      setSiteName(name);
      if (messages.length === 0) {
        addMessage('assistant', `👋 Hi there! I'm your AI assistant for ${name}. How can I help you today?`);
      }
    }
  }, [id, websites]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    
    addMessage('user', input);
    
    const currentInput = input;
    setInput('');
    
    try {
      const response = await execute(() => 
        chatApiService.sendMessage({
          query: currentInput,
          websiteId: Number(id),
          sessionId: sessionId || undefined
        }, apiSecret || undefined)
      );
      
      if (response) {
        addMessage('assistant', response.answer);
        
        if (response.sessionId && response.sessionId !== sessionId) {
          updateSessionId(response.sessionId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    clearChat();
    toast({
      title: "Chat cleared",
      description: "Your conversation history has been cleared",
    });
    
    setTimeout(() => {
      addMessage('assistant', `👋 Hi there! I'm your AI assistant for ${siteName || 'your website'}. How can I help you today?`);
    }, 100);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-4 flex flex-col items-start">
          <div className="flex items-center mb-2 w-full justify-between gap-3">
            <div className="flex items-center min-w-0">
              <h1 className="text-2xl font-bold">Test Chatbot</h1>
              {siteName && (
                <span className="ml-3 text-sm text-muted-foreground truncate">
                  {siteName}
                </span>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearChat}
              className="text-destructive hover:text-destructive h-9"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Test how your AI assistant responds to questions about your website content
          </p>
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-card border rounded-xl overflow-hidden flex flex-col flex-1 min-h-0"
        >
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="space-y-5">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-3 mr-0' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {message.role === 'user' 
                        ? <User className="h-4 w-4" /> 
                        : <Bot className="h-4 w-4" />
                      }
                    </div>
                    <div className={`rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      {message.role === 'user' ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed text-left
                          [&_p]:mb-2 [&_p]:leading-relaxed [&_p]:text-left last:[&_p]:mb-0
                          [&_ul]:mt-1 [&_ul]:mb-2 [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-left
                          [&_ol]:mt-1 [&_ol]:mb-2 [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:text-left
                          [&_ul>li]:list-disc [&_ol>li]:list-decimal [&_li]:leading-snug [&_li]:text-left
                          [&_strong]:font-semibold
                          [&_h1]:font-bold [&_h1]:text-base [&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-left
                          [&_h2]:font-semibold [&_h2]:text-sm [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-left
                          [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-left
                          [&_code]:bg-background [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono
                          [&_hr]:border-border [&_hr]:my-2
                          [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="border-t p-4 bg-card">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 h-9"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || loading}
                className="h-9 bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default ChatPage; 
