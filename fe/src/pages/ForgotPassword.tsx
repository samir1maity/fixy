
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call - replace with actual logic later
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Reset link sent to your email!");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      {/* Background Decorations */}
      <div className="blur-dot w-64 h-64 top-0 left-0 bg-fixy-pastel-blue opacity-40"></div>
      <div className="blur-dot w-64 h-64 bottom-0 right-0 bg-fixy-pastel-purple opacity-30"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-xl"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="bg-gradient-to-r from-fixy-accent to-primary rounded-lg w-8 h-8 flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-fixy-accent to-primary">
                Fixy
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {!isSubmitted 
              ? "We'll send you a link to reset your password" 
              : "Check your email for the reset link"}
          </p>
        </div>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        ) : (
          <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              Please check your inbox and spam folder
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-fixy-accent hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;