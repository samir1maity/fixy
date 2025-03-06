
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { 
  Bot, 
  Code, 
  LineChart, 
  Link, 
  Palette, 
  Shield, 
  Sparkles, 
  Zap 
} from 'lucide-react';

const features = [
  {
    icon: <Link className="w-5 h-5" />,
    title: "URL Integration",
    description: "Simply paste your website URL and Fixy automatically crawls and understands your content."
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI-Powered Responses",
    description: "Advanced AI generates accurate, natural responses based on your website content."
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: "Easy Installation",
    description: "Install with a simple code snippet or use our plugins for popular platforms."
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: "Customizable Design",
    description: "Fully customize the chatbot appearance to match your brand identity and website design."
  },
  {
    icon: <LineChart className="w-5 h-5" />,
    title: "Analytics Dashboard",
    description: "Track user interactions, popular questions, and conversion metrics."
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Data Privacy",
    description: "Enterprise-grade security with data encryption and GDPR compliance."
  },
  {
    icon: <Bot className="w-5 h-5" />,
    title: "Multi-language Support",
    description: "Communicate with your visitors in over 30 languages automatically."
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "24/7 Availability",
    description: "Provide instant responses to customer inquiries around the clock."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="blur-dot w-[300px] h-[300px] bg-fixy-pastel-peach -left-20 top-1/2"></div>
      
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
            Powerful Features
          </motion.div>
          
          <motion.h2 
            variants={fadeIn("up", "tween", 0.3, 0.1)}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Everything You Need to Create the Perfect Chatbot
          </motion.h2>
          
          <motion.p 
            variants={fadeIn("up", "tween", 0.3, 0.2)}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            Fixy combines powerful AI with user-friendly tools to help you create intelligent chatbots without any coding knowledge.
          </motion.p>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  index 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) => {
  return (
    <motion.div
      variants={fadeIn("up", "tween", 0.3, 0.1 * index)}
      className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-fixy-accent to-primary flex items-center justify-center mb-4">
        <div className="text-white">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
};

export default FeaturesSection;
