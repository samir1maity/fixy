
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Marketing Director",
    company: "GrowthTech",
    avatar: "/placeholder.svg",
    quote: "Fixy transformed our customer service. The AI chatbot understands our product documentation perfectly and handles over 70% of inquiries without human intervention.",
    rating: 5
  },
  {
    name: "Michael Chen",
    title: "E-commerce Owner",
    company: "StyleHub",
    avatar: "/placeholder.svg",
    quote: "Implementation was so easy! Within 30 minutes of signing up, we had a fully functional chatbot answering customer questions about our products and policies.",
    rating: 5
  },
  {
    name: "Alex Rivera",
    title: "Product Manager",
    company: "SaaS Solutions",
    avatar: "/placeholder.svg",
    quote: "The analytics dashboard gives us incredible insights into what our customers are asking about, helping us improve our product and documentation.",
    rating: 4
  },
  {
    name: "Emily Parker",
    title: "Customer Support Lead",
    company: "TechAdvance",
    avatar: "/placeholder.svg",
    quote: "Our support team can now focus on complex issues while Fixy handles the routine questions. It's been a game-changer for our workflow and customer satisfaction.",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 relative">
      <div className="blur-dot w-[350px] h-[350px] bg-fixy-pastel-blue top-10 -right-20"></div>
      <div className="blur-dot w-[250px] h-[250px] bg-fixy-pastel-purple bottom-10 -left-20"></div>
      
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
            Customer Stories
          </motion.div>
          
          <motion.h2 
            variants={fadeIn("up", "tween", 0.3, 0.1)}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            What Our Customers Say
          </motion.h2>
          
          <motion.p 
            variants={fadeIn("up", "tween", 0.3, 0.2)}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            Discover how businesses are transforming their customer experience with Fixy chatbots.
          </motion.p>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index}
              name={testimonial.name}
              title={testimonial.title}
              company={testimonial.company}
              avatar={testimonial.avatar}
              quote={testimonial.quote}
              rating={testimonial.rating}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ 
  name, 
  title,
  company,
  avatar,
  quote, 
  rating,
  index 
}: { 
  name: string;
  title: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  index: number;
}) => {
  return (
    <motion.div
      variants={fadeIn("up", "tween", 0.3, 0.1 * index)}
      className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col"
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div className="flex mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      
      <div className="mb-6 flex-1">
        <Quote className="w-8 h-8 text-fixy-accent/20 mb-2" />
        <p className="text-gray-600 dark:text-gray-300 italic">{quote}</p>
      </div>
      
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}, {company}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialsSection;
