import { Outlet } from 'react-router-dom';
import { StoreAuthProvider } from '@/contexts/StoreAuthContext';

export function StoreWrapper() {
  return (
    <StoreAuthProvider>
      <Outlet />
    </StoreAuthProvider>
  );
}
