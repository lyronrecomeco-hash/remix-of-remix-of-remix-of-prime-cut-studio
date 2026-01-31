import { Outlet, Navigate } from 'react-router-dom';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { GymAdminSidebar } from './GymAdminSidebar';
import { Loader2 } from 'lucide-react';

export function GymAdminLayout() {
  const { isAuthenticated, isLoading, isAdmin, isInstructor } = useGymAuth();

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

  if (!isAdmin && !isInstructor) {
    return <Navigate to="/academiapro/app" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <GymAdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
