
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

const DashboardHeader = () => {
  const { theme, toggleTheme } = useTheme();

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

        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="relative h-9 w-9 rounded-full flex items-center justify-center border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.span>
        </motion.button>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
