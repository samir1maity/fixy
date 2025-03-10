
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, EyeIcon, EyeOffIcon, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import userApiService from "@/services/user-api";
import { useAuth } from "@/contexts/auth-context";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const {login} = useAuth();
  const { loading, error, execute } = useApi({
    showErrorToast: true,
    errorMessage: "Login failed. Please check your credentials.",
  });

  const validatePassword = async (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    const result = await execute(
      () => userApiService.register({name, email, password}),
      {
        showSuccessToast: true,
        successMessage: "Account created successfully!",
      }
    )

    if (result) {
      login(result.token, result.user)
      navigate("/dashboard")
    }
  };

  const passwordStrength = password ? (password.length < 8 ? "weak" : "strong") : "";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      {/* Background Decorations */}
      <div className="blur-dot w-64 h-64 top-0 right-0 bg-fixy-pastel-peach opacity-40"></div>
      <div className="blur-dot w-80 h-80 bottom-0 left-0 bg-fixy-pastel-mint opacity-30"></div>
      
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create an account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Sign up to get started with Fixy</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
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
          
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 ${
                  passwordStrength === "weak" ? "border-red-300" : 
                  passwordStrength === "strong" ? "border-green-300" : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-1 text-xs">
                <CheckCircle2 
                  className={`h-3 w-3 ${validatePassword(password) ? "text-green-500" : "text-gray-400"}`} 
                />
                <span className={validatePassword(password) ? "text-green-600" : "text-gray-500"}>
                  At least 8 characters
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 ${
                  confirmPassword && password !== confirmPassword ? "border-red-300" : 
                  confirmPassword && password === confirmPassword ? "border-green-300" : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword && (
              <div className="flex items-center gap-1 text-xs">
                <CheckCircle2 
                  className={`h-3 w-3 ${password === confirmPassword ? "text-green-500" : "text-gray-400"}`} 
                />
                <span className={password === confirmPassword ? "text-green-600" : "text-gray-500"}>
                  Passwords match
                </span>
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-fixy-accent hover:text-primary transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;