
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-block mb-2">
          <div className="w-12 h-12 rounded-xl bg-fixy-500 text-white flex items-center justify-center">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-3 top-3 text-muted-foreground">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="auth-input pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-3 top-3 text-muted-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="auth-input pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="button" 
              className="text-xs text-fixy-600 hover:text-fixy-700 transition-colors"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="auth-button auth-button-primary" 
          disabled={isLoading}
        >
          {isLoading ? 
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              Signing in...
            </div> : 
            'Sign in'
          }
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" className="auth-button auth-button-secondary">
          Google
        </Button>
        <Button variant="outline" type="button" className="auth-button auth-button-secondary">
          Apple
        </Button>
      </div>

      <div className="text-center text-sm">
        Don't have an account?{" "}
        <button 
          type="button" 
          className="text-fixy-600 hover:text-fixy-700 font-medium transition-colors"
          onClick={() => navigate('/signup')}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default LoginForm;