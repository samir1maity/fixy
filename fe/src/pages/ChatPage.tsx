import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/use-api';
import ReactMarkdown from 'react-markdown';
import apiService from '@/services/api';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import chatApiService, { ChatResponse } from '@/services/chat-api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [websiteInfo, setWebsiteInfo] = useState<{ domain: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { loading, execute } = useApi({
    showErrorToast: true,
    errorMessage: "Failed to send message",
  });

  useEffect(() => {
    // Fetch website info
    const fetchWebsiteInfo = async () => {
      try {
        const response = await apiService.get(`/websites/${id}`);
        // setWebsiteInfo(response);
        
        // Add welcome message
        setMessages([
          {
            id: '0',
            role: 'assistant',
            content: `👋 Hi there! I'm your AI assistant for. How can I help you today?`,
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load website information",
          variant: "destructive"
        });
      }
    };
    
    fetchWebsiteInfo();
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    console.log('input -->', input);
    try {
      const response = await execute(() => 
        chatApiService.sendMessage({
          query: input,
          websiteId: Number(id)
        })
      );
      
      if (response) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // If there are follow-up questions, add them as a suggestion
        // if (response.followupQuestions && response.followupQuestions.length > 0) {
        //   const suggestionsContent = `
        //     Here are some follow-up questions you might want to ask:

        //     ${response.followupQuestions.map(q => `- ${q}`).join('\n')}
        //   `;
          
        //   const suggestionsMessage: Message = {
        //     id: (Date.now() + 2).toString(),
        //     role: 'assistant',
        //     content: suggestionsContent,
        //     timestamp: new Date()
        //   };
          
        //   setMessages(prev => [...prev, suggestionsMessage]);
        // }
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 mt-20 flex flex-col h-[calc(100vh-80px)]">
        <div className="mb-6 flex flex-col items-start">
          <div className="flex items-center mb-2">
            <Link to="/dashboard" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Test Chatbot</h1>
            {websiteInfo && (
              <span className="ml-4 text-muted-foreground">
                {websiteInfo.domain}
              </span>
            )}
          </div>
          <p className="text-muted-foreground ml-14">
            Test how your AI assistant responds to questions about your website content
          </p>
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-card border rounded-xl overflow-hidden flex flex-col flex-1"
        >
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
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
                    <div className={`rounded-lg p-4 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
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
                    <div className="rounded-lg p-4 bg-muted flex items-center space-x-2">
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
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default ChatPage; 