import { PerformanceDashboard } from '@/components/genesis-ia/performance/PerformanceDashboard';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';

interface OfertaQuenteTabProps {
  onBack?: () => void;
}

export const OfertaQuenteTab = ({ onBack }: OfertaQuenteTabProps) => {
  const { user } = useGenesisAuth();

  return (
    <PerformanceDashboard affiliateId={null} userId={user?.id || ''} />
  );
};
