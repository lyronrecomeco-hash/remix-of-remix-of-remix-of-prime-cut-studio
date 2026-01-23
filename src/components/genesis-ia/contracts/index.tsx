import { useState } from 'react';
import { ContractsList } from './ContractsList';
import { ContractWizard } from './ContractWizard';
import { ContractDetail } from './ContractDetail';

interface ContractsTabProps {
  affiliateId: string | null;
  userId?: string;
  onBack: () => void;
}

export type ContractView = 'list' | 'create' | 'detail';

export function ContractsTab({ affiliateId, userId, onBack }: ContractsTabProps) {
  const [view, setView] = useState<ContractView>('list');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  // Usar affiliateId se disponível, senão userId
  const effectiveId = affiliateId || userId || null;

  if (!effectiveId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <p className="text-muted-foreground">Carregando contratos...</p>
        <p className="text-sm text-muted-foreground/70">Se demorar, atualize a página.</p>
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
        affiliateId={effectiveId} 
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
      affiliateId={effectiveId}
      onCreateNew={() => setView('create')}
      onViewContract={handleViewContract}
    />
  );
}
