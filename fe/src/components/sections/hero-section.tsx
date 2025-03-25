
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, MessageSquare } from 'lucide-react';
import { fadeIn, scaleIn } from '@/lib/motion';
import { useState } from 'react';

const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center pb-10 pt-28 overflow-hidden">
      {/* Background Gradient Blobs */}
      <div className="blur-dot w-[400px] h-[400px] bg-fixy-pastel-purple top-20 -left-40"></div>
      <div className="blur-dot w-[500px] h-[500px] bg-fixy-pastel-blue bottom-20 -right-40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div 
              variants={fadeIn("up", "tween", 0.2, 0)}
              className="inline-block px-4 py-1 mb-6 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 shadow-sm"
            >
              <span className="text-gray-800 font-medium">AI-powered website chatbots made simple</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeIn("up", "tween", 0.3, 0.1)}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            >
              Build Your Website Chatbot <br className="hidden lg:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">With Ease</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn("up", "tween", 0.3, 0.2)}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Transform your website with an AI chatbot that understands your content. Simply paste your URL, and Fixy creates a custom chatbot that helps your visitors find what they need.
            </motion.p>
            
            <motion.div 
              variants={fadeIn("up", "tween", 0.3, 0.3)}
              className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90 transition-opacity min-w-[180px] rounded-xl"
              >
                Get Started Free
                <ArrowRight size={16} className="ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 min-w-[180px] rounded-xl"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate="show"
            variants={scaleIn(0.5, 0.3)}
            className="relative"
          >
            <motion.div 
              className="relative z-10 glass-card rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-fixy-accent" />
                  <span className="font-medium">Fixy Assistant</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <ChatMessage 
                    isBot={true}
                    message="Hello! I'm your AI assistant powered by Fixy. How can I help you today?"
                  />
                  
                  <ChatMessage 
                    isBot={false}
                    message="What are your provides?"
                  />
                  
                  <ChatMessage 
                    isBot={true}
                    message="Our service provides a seamless way to engage with your visitors. Create a personalized chatbot that understands your content and enhances user interaction, all at no cost."
                  />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage 
                      isBot={false}
                      message="Can I customize the appearance of the chatbot?"
                    />
                    
                    <ChatMessage 
                      isBot={true}
                      message="Yes! You can fully customize the chatbot's appearance to match your brand, including colors, icons, and chat interface layout."
                      isTyping={true}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute -z-10 w-full h-full top-8 left-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-fixy-pastel-mint to-fixy-pastel-blue opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ChatMessage = ({ 
  isBot, 
  message, 
  isTyping = false 
}: { 
  isBot: boolean;
  message: string;
  isTyping?: boolean;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div 
        className={`rounded-2xl p-3 max-w-xs sm:max-w-sm inline-block ${
          isBot 
            ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mr-12' 
            : 'bg-fixy-accent text-white ml-12'
        }`}
      >
        <div className="flex items-start">
          {isBot && (
            <Bot className="w-5 h-5 mr-2 mt-0.5 text-fixy-accent" />
          )}
          <div>
            {isTyping ? (
              <div className="flex space-x-1 items-center h-4 px-2">
                <motion.div 
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 }}
                  className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full"
                ></motion.div>
                <motion.div 
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full"
                ></motion.div>
                <motion.div 
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full"
                ></motion.div>
              </div>
            ) : (
              <p className={`text-sm ${isBot ? 'text-gray-800 dark:text-gray-200' : 'text-white'}`}>{message}</p>
            )}
          </div>
          {!isBot && (
            <MessageSquare className="w-5 h-5 ml-2 mt-0.5 text-white" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
