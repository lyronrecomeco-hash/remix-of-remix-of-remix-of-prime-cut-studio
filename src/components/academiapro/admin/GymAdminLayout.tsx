import { Outlet, Navigate } from 'react-router-dom';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { GymAdminSidebar } from './GymAdminSidebar';
import { Loader2 } from 'lucide-react';

export function GymAdminLayout() {
  const { isAuthenticated, isLoading, isAdmin, isInstructor } = useGymAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
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
    <div className="min-h-screen bg-background text-foreground flex">
      <GymAdminSidebar />
      {/* Main Content - Scrollable only, sidebar stays fixed */}
      <main className="flex-1 lg:ml-64 overflow-auto min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
