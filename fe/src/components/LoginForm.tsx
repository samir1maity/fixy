import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../hooks/use-api';
import userApiService from '../services/user-api';
import { useAuth } from '../contexts/auth-context';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the intended destination from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  const { loading, error, execute } = useApi({
    showErrorToast: true,
    errorMessage: 'Login failed. Please check your credentials.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await execute(
      () => userApiService.login({ email, password }),
      { 
        showSuccessToast: true,
        successMessage: 'Login successful!',
      }
    );
    
    if (result) {
      // Use the login function from auth context
      login(result.token, result.user);
      
      // Navigate to the intended destination
      navigate(from, { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      {error && <div className="error">{error.message}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm; 