
import { ReactNode } from 'react';
import DemoMode from './DemoMode';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // For demo purposes, we'll show the DemoMode component
  // In a real app, this would check authentication status
  const isAuthenticated = false; // This would come from your auth system
  
  if (!isAuthenticated) {
    return <DemoMode />;
  }
  
  return <>{children}</>;
}
