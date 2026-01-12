import VendaHeader from '@/components/venda/VendaHeader';
import VendaHero from '@/components/venda/VendaHero';
import VendaProblems from '@/components/venda/VendaProblems';
import VendaSolution from '@/components/venda/VendaSolution';
import VendaFeatures from '@/components/venda/VendaFeatures';
import VendaFlowDemo from '@/components/venda/VendaFlowDemo';
import VendaRealWhatsApp from '@/components/venda/VendaRealWhatsApp';
import VendaAgentesIA from '@/components/venda/VendaAgentesIA';
import VendaBusinessShowcase from '@/components/venda/VendaBusinessShowcase';
import VendaFreeTools from '@/components/venda/VendaFreeTools';
import VendaLiveDemo from '@/components/venda/VendaLiveDemo';
import VendaSocialProof from '@/components/venda/VendaSocialProof';
import VendaPricing from '@/components/venda/VendaPricing';
import VendaFAQ from '@/components/venda/VendaFAQ';
import VendaFinalCTA from '@/components/venda/VendaFinalCTA';
import VendaFooter from '@/components/venda/VendaFooter';

const GenesisVenda = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <VendaHeader />
      <VendaHero />
      <VendaProblems />
      <VendaSolution />
      <VendaFeatures />
      <VendaFlowDemo />
      <VendaRealWhatsApp />
      <VendaAgentesIA />
      <VendaBusinessShowcase />
      <VendaLiveDemo />
      <VendaSocialProof />
      <VendaPricing />
      <VendaFreeTools />
      <VendaFAQ />
      <VendaFinalCTA />
      <VendaFooter />
    </div>
  );
};

export default GenesisVenda;
