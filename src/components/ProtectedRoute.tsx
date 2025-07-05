// components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getItem } from '@/lib/storage';

interface SessionData {
  user?: {
    id: string;
    email?: string;
  };
}

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const update = () => {
      const s = getItem<SessionData>('session');
      setSession(s);
      setLoading(false);
    };

    update();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', update);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', update);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // If there's no logged-in user, redirect to sign-in
  if (!session?.user?.id) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
