
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DashboardHeader = () => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-lg shadow-sm dark:bg-gray-900/80"
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-fixy-accent to-primary rounded-lg w-8 h-8 flex items-center justify-center"
          >
            <span className="text-white font-bold text-lg">F</span>
          </motion.div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
            Fixy
          </span>
        </Link>

        {/* <nav className="hidden md:flex items-center space-x-8">
          <Button 
            className="bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90 transition-opacity"
          >
            Feedback form
          </Button>
        </nav> */}
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
