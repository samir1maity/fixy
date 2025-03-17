import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import React from 'react';

const SuspenseFallback: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            {/* Logo */}
            <div className="mb-2">
              <div className="flex items-center justify-center gap-2">
                <div className="bg-gradient-to-r from-fixy-accent to-primary rounded-lg w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">F</span>
                </div>
                <span className="font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
                  Fixy
                </span>
              </div>
            </div>
    
            {/* Loading animation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              <Loader size={30} className="text-gray-400 dark:text-gray-500" />
            </motion.div>
            
            {/* <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-2">
              Loading...
            </p> */}
          </motion.div>
        </div>
      );
};

export default SuspenseFallback;