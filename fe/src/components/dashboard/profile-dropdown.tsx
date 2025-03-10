
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2 border rounded-full p-1.5 pr-3 hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">John Doe</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-xl border bg-background shadow-lg"
          >
            <div className="p-2">
              <div className="p-3 border-b">
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">john@example.com</p>
              </div>
              
              <div className="py-1">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
