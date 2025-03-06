
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-sm dark:bg-gray-900/80'
          : 'bg-transparent'
      }`}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#testimonials">Testimonials</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <Link to="/dashboard">
            <Button 
              className="bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90 transition-opacity"
            >
              Dashboard
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-gray-700 dark:text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden container py-4 mt-2"
        >
          <nav className="flex flex-col space-y-4">
            <MobileNavLink 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </MobileNavLink>
            <MobileNavLink 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </MobileNavLink>
            <MobileNavLink 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </MobileNavLink>
            <MobileNavLink 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </MobileNavLink>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                className="bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90 transition-opacity w-full"
              >
                Dashboard
              </Button>
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <motion.a
    href={href}
    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium"
    whileHover={{ y: -2 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    {children}
  </motion.a>
);

const MobileNavLink = ({ 
  href, 
  onClick, 
  children 
}: { 
  href: string; 
  onClick: () => void; 
  children: React.ReactNode 
}) => (
  <motion.a
    href={href}
    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium px-2 py-1"
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
  >
    {children}
  </motion.a>
);

export default Navbar;
