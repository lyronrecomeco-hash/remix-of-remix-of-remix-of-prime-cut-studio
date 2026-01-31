import { Outlet, Navigate } from 'react-router-dom';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { GymBottomNav } from './GymBottomNav';
import { Loader2 } from 'lucide-react';

export function GymAppLayout() {
  const { isAuthenticated, isLoading } = useGymAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/academiapro/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      <GymBottomNav />
    </div>
  );
}
