import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected) {
      const timer = setTimeout(() => {
        const targetPath = isAuthenticated ? '/main' : '/auth';
        console.log('SplashScreen: Перенаправление на', targetPath);
        setLocation(targetPath);
        setHasRedirected(true);
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, hasRedirected, setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    </div>
  );
}
