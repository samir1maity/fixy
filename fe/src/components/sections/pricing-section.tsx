
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for small personal websites.",
    price: "$0",
    period: "forever",
    features: [
      "500 chat messages per month",
      "Basic customization",
      "Single website",
      "Standard support",
      "Basic analytics"
    ],
    limitations: [
      "Fixy branding",
      "Limited customization",
      "No advanced features"
    ],
    isMostPopular: false,
    buttonText: "Get Started"
  },
  {
    name: "Pro",
    description: "Ideal for businesses and professional sites.",
    price: "$29",
    period: "per month",
    features: [
      "10,000 chat messages per month",
      "Advanced customization",
      "Up to 5 websites",
      "Priority support",
      "Full analytics dashboard",
      "No Fixy branding",
      "Training on custom data",
      "API access"
    ],
    limitations: [],
    isMostPopular: true,
    buttonText: "Start Free Trial"
  },
  {
    name: "Enterprise",
    description: "For large businesses with advanced needs.",
    price: "Custom",
    period: "pricing",
    features: [
      "Unlimited chat messages",
      "Complete customization",
      "Unlimited websites",
      "Dedicated support",
      "Advanced analytics with exports",
      "Custom integrations",
      "On-premise deployment option",
      "SLA guarantee",
      "HIPAA & GDPR compliance"
    ],
    limitations: [],
    isMostPopular: false,
    buttonText: "Contact Sales"
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 relative">
      <div className="blur-dot w-[350px] h-[350px] bg-fixy-pastel-purple -right-20 top-20"></div>
      
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
            Simple Pricing
          </motion.div>
          
          <motion.h2 
            variants={fadeIn("up", "tween", 0.3, 0.1)}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Choose the Perfect Plan for Your Needs
          </motion.h2>
          
          <motion.p 
            variants={fadeIn("up", "tween", 0.3, 0.2)}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            Start with our free plan or upgrade for more features. All plans include a 14-day money-back guarantee.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard 
              key={index}
              name={plan.name}
              description={plan.description}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              limitations={plan.limitations}
              isMostPopular={plan.isMostPopular}
              buttonText={plan.buttonText}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingCard = ({ 
  name, 
  description, 
  price, 
  period, 
  features, 
  limitations,
  isMostPopular,
  buttonText,
  index 
}: { 
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  limitations: string[];
  isMostPopular: boolean;
  buttonText: string;
  index: number;
}) => {
  return (
    <motion.div
      variants={fadeIn("up", "tween", 0.3, 0.1 * index)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className={`glass-card rounded-xl overflow-hidden transition-all duration-300 relative ${
        isMostPopular ? 'border-2 border-fixy-accent shadow-lg' : 'border border-gray-200 dark:border-gray-700'
      }`}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
    >
      {isMostPopular && (
        <div className="absolute top-0 inset-x-0">
          <div className="bg-gradient-to-r from-fixy-accent to-primary text-white text-xs font-semibold py-1 text-center">
            MOST POPULAR
          </div>
        </div>
      )}
      
      <div className="p-6 pb-0">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
        
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">/ {period}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 pt-0">
        <Button 
          className={`w-full mb-6 ${
            isMostPopular 
              ? 'bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90' 
              : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600'
          }`}
        >
          {buttonText}
        </Button>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Features:</p>
          
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          
          {limitations.length > 0 && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Limitations:</p>
              <ul className="space-y-2">
                {limitations.map((limitation, i) => (
                  <li key={i} className="flex items-start">
                    <X className="w-4 h-4 text-gray-400 mr-2 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-500">{limitation}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PricingSection;
