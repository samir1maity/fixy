import React from 'react';
import { useAuth } from '../contexts/auth-context';
import Index from '@/pages/Index';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
   <Index/>
  );
};

export default Dashboard; 