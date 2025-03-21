import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, Lock, Mail } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import userApiService from "@/services/user-api";
import { useAuth } from "@/contexts/auth-context";
import { toast as sonnerToast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const { error, execute } = useApi({
    showErrorToast: true,
    errorMessage: "Login failed. Please check your credentials.",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit");
    e.preventDefault();
    setLoading(true);

    try {
      const result = await execute(
        () => userApiService.login({ email, password }),
        {
          showSuccessToast: true,
          successMessage: "Login successful!",
        }
      );
      console.log("result", result);
      if (result) {
        login(result.token, result.user);
        sonnerToast.success("Login successful!", {
          description: "Welcome back!",
          position: "top-right",
          duration: 5000,
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      sonnerToast.error("Login failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      {/* Background Decorations */}
      <div className="blur-dot w-64 h-64 top-0 left-0 bg-fixy-pastel-purple opacity-40"></div>
      <div className="blur-dot w-80 h-80 bottom-0 right-0 bg-fixy-pastel-blue opacity-30"></div>

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sign in to access your account
          </p>
        </div>

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

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
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
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-fixy-accent hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && <div className="error">{error.message}</div>}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-fixy-accent to-primary hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-fixy-accent hover:text-primary transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
