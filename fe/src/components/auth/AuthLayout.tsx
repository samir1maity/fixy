import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundShapes?: boolean;
}

const AuthLayout = ({ children, backgroundShapes = true }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-12 px-4">
      {backgroundShapes && (
        <>
          <div className="floating-shape w-64 h-64 bg-fixy-200 rounded-full top-0 -left-20 animate-float"></div>
          <div className="floating-shape w-96 h-96 bg-fixy-100 rounded-full bottom-0 -right-20 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="floating-shape w-72 h-72 bg-blue-100 rounded-full top-1/2 left-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
        </>
      )}
      
      <div className="auth-container relative z-10 animate-scale-in">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;