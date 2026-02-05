import { Outlet, Navigate } from 'react-router-dom';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { StoreAdminSidebar } from './StoreAdminSidebar';
import { Loader2 } from 'lucide-react';

export function StoreAdminLayout() {
  const { isAuthenticated, isLoading } = useStoreAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/loja/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreAdminSidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
