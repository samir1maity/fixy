
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
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
        description: "Your account has been created",
      });
      navigate('/login');
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
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Enter your details to create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-3 top-3 text-muted-foreground">
              <User className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Full Name"
              className="auth-input pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

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
          <div className="text-xs text-muted-foreground">
            Password must be at least 8 characters long
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
              Creating account...
            </div> : 
            'Create account'
          }
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
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
        Already have an account?{" "}
        <button 
          type="button" 
          className="text-fixy-600 hover:text-fixy-700 font-medium transition-colors"
          onClick={() => navigate('/login')}
        >
          Sign in
        </button>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
        <a href="#" className="underline hover:text-fixy-600 transition-colors">Terms of Service</a>
        {" "}and{" "}
        <a href="#" className="underline hover:text-fixy-600 transition-colors">Privacy Policy</a>
      </div>
    </div>
  );
};

export default SignupForm;