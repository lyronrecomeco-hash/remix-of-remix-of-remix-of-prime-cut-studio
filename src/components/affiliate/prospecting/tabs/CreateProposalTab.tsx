import { FileText, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CreateProposalTabProps {
  affiliateId: string;
}

export const CreateProposalTab = ({ affiliateId }: CreateProposalTabProps) => {
  return (
    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      <CardContent className="p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">
          Criar Proposta com IA
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Gere propostas personalizadas automaticamente com nossa IA avançada. 
          Selecione um prospect no Histórico para começar.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          IA Avançada Disponível
        </div>
      </CardContent>
    </Card>
  );
};
