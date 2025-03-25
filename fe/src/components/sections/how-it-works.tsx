
import { motion } from 'framer-motion';
import { fadeIn, slideIn } from '@/lib/motion';
import { ArrowRight, CheckCircle, MessageSquare, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: "01",
    icon: <Globe className="w-5 h-5" />,
    title: "Add Your Website",
    description: "Enter your website URL to create a new chatbot."
  },
  {
    number: "02",
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Test Your Chatbot",
    description: "Test your chatbot with the provided interface to ensure it meets your needs."
  },
  {
    number: "03",
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Use API Secret",
    description: "Use the API secret to integrate our API and enhance your chatbot's functionality."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 relative">
      <div className="blur-dot w-[400px] h-[400px] bg-fixy-pastel-blue -right-20 bottom-20"></div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div 
            variants={fadeIn("up", "tween", 0.2, 0)}
            className="bg-gradient-to-r from-fixy-accent/10 to-primary/10 text-fixy-accent font-medium py-1 px-4 rounded-full inline-block mb-4"
          >
            Simple Process
          </motion.div>
          
          <motion.h2 
            variants={fadeIn("up", "tween", 0.3, 0.1)}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            How Fixy Works
          </motion.h2>
          
          <motion.p 
            variants={fadeIn("up", "tween", 0.3, 0.2)}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            Create and deploy your AI chatbot in minutes with these simple steps.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <motion.div 
            className="col-span-1 lg:col-span-2 order-2 lg:order-1"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div 
              variants={slideIn("left", "tween", 0.3, 0.1)}
              className="glass-card rounded-xl p-8 relative overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-6">Try It Yourself</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                    Enter your website URL
                  </label>
                  <div className="flex">
                    <Input 
                      placeholder="https://example.com" 
                      className="rounded-r-none focus-visible:ring-offset-0 focus-visible:ring-1"
                    />
                    <Button 
                      className="rounded-l-none bg-gradient-to-r from-fixy-accent to-primary"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Scanning website...
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-fixy-accent to-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    ></motion.div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium mb-2">Your chatbot will:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span className="text-sm">Understand your website content</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span className="text-sm">Answer customer questions accurately</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span className="text-sm">Be ready to deploy in minutes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="col-span-1 lg:col-span-3 order-1 lg:order-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="space-y-6">
              {steps.map((step, index) => (
                <StepCard 
                  key={index}
                  number={step.number}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ 
  number, 
  icon, 
  title, 
  description, 
  index 
}: { 
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) => {
  return (
    <motion.div
      variants={fadeIn("right", "tween", 0.3, 0.1 * index)}
      className="flex items-start p-6 glass-card rounded-xl transition-all duration-300"
      whileHover={{ x: 10, transition: { duration: 0.2 } }}
    >
      <div className="mr-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-fixy-accent to-primary flex items-center justify-center">
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex items-center mb-2">
          <span className="text-gray-400 dark:text-gray-500 text-sm font-mono mr-2">{number}</span>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </motion.div>
  );
};

export default HowItWorks;
