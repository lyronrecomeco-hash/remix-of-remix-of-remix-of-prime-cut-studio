import { useState } from 'react';
import { ContractsList } from './ContractsList';
import { ContractWizard } from './ContractWizard';
import { ContractDetail } from './ContractDetail';

interface ContractsTabProps {
  affiliateId: string | null;
  onBack: () => void;
}

export type ContractView = 'list' | 'create' | 'detail';

export function ContractsTab({ affiliateId, onBack }: ContractsTabProps) {
  const [view, setView] = useState<ContractView>('list');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  if (!affiliateId) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const handleViewContract = (contractId: string) => {
    setSelectedContractId(contractId);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedContractId(null);
    setView('list');
  };

  if (view === 'create') {
    return (
      <ContractWizard 
        affiliateId={affiliateId} 
        onBack={handleBackToList}
        onComplete={handleBackToList}
      />
    );
  }

  if (view === 'detail' && selectedContractId) {
    return (
      <ContractDetail
        contractId={selectedContractId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <ContractsList
      affiliateId={affiliateId}
      onCreateNew={() => setView('create')}
      onViewContract={handleViewContract}
    />
  );
}
