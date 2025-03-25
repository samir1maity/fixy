
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 relative">
      <div className="blur-dot w-[350px] h-[350px] bg-fixy-pastel-peach top-0 left-0"></div>
      <div className="blur-dot w-[300px] h-[300px] bg-fixy-pastel-blue bottom-0 right-0"></div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative"
        >
          <motion.div
            variants={fadeIn("up", "tween", 0.3, 0)}
            className="relative z-10 p-12 md:p-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Website?
            </h2>
            
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Join thousands of businesses using Fixy to enhance customer experience, increase conversions, and provide 24/7 support.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 transition-colors min-w-[180px] rounded-xl font-medium"
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
            </div>
          </motion.div>
          
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-fixy-accent to-primary z-0"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/5"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white/5"></div>
            <div className="absolute top-40 right-20 w-20 h-20 rounded-full bg-white/5"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
