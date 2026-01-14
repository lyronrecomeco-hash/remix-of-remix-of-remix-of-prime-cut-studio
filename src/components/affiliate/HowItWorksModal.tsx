import { useState } from 'react';
import { 
  HelpCircle, 
  DollarSign,
  Clock,
  Gift,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Wallet,
  Calendar,
  Search,
  MessageSquare,
  Globe,
  Send,
  Target,
  Sparkles,
  LayoutTemplate
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HowItWorksModalProps {
  commissionMonthly: number;
  commissionLifetime: number;
}

const HowItWorksModal = ({ commissionMonthly, commissionLifetime }: HowItWorksModalProps) => {
  const [open, setOpen] = useState(false);

  const affiliateSteps = [
    {
      icon: Users,
      title: 'Compartilhe seu link',
      description: 'Use seu link exclusivo de afiliado para indicar novos usuários. Você pode compartilhar em redes sociais, WhatsApp, e-mail ou qualquer canal.'
    },
    {
      icon: CheckCircle,
      title: 'Usuário se cadastra',
      description: 'Quando alguém clica no seu link e realiza o cadastro, o sistema automaticamente vincula essa pessoa à sua conta de afiliado.'
    },
    {
      icon: DollarSign,
      title: 'Receba comissões',
      description: 'A cada pagamento realizado pelos usuários que você indicou, você recebe uma comissão diretamente no seu saldo.'
    },
    {
      icon: Wallet,
      title: 'Solicite o saque',
      description: 'Com saldo mínimo de R$ 50, você pode solicitar a transferência via PIX. O processamento leva até 3 dias úteis.'
    }
  ];

  const prospectionSteps = [
    {
      icon: Search,
      title: 'Busque Clientes',
      description: 'Use a busca global para encontrar empresas em qualquer país. Filtre por nicho, cidade e até por empresas sem site para melhor conversão.'
    },
    {
      icon: Sparkles,
      title: 'Mensagens com IA',
      description: 'O sistema gera automaticamente mensagens personalizadas para cada empresa, adaptadas ao idioma nativo do país selecionado.'
    },
    {
      icon: LayoutTemplate,
      title: 'Crie Portfólios Demo',
      description: 'Em "Modelos Prontos", crie sites de demonstração personalizados. Cada portfólio gera um link único que você envia junto com a proposta.'
    },
    {
      icon: Send,
      title: 'Envie Propostas',
      description: 'Envie a mensagem via WhatsApp direto do sistema, junto com o link da demo. Acompanhe visualizações em "Meus Portfólios".'
    },
    {
      icon: Target,
      title: 'Converta Clientes',
      description: 'Quando o cliente aceitar a proposta, você recebe sua comissão. Quanto mais demos visualizadas, maior sua taxa de conversão.'
    }
  ];

  const commissionRules = [
    {
      icon: Calendar,
      title: 'Comissão Mensal',
      value: `${commissionMonthly}%`,
      description: 'Sobre cada pagamento mensal dos usuários que você indicou'
    },
    {
      icon: Gift,
      title: 'Comissão Vitalícia',
      value: `${commissionLifetime}%`,
      description: 'Sobre planos vitalícios adquiridos pelos seus indicados'
    }
  ];

  const rules = [
    'Comissões são creditadas após 7 dias da confirmação do pagamento',
    'Saques mínimos de R$ 50,00 via PIX',
    'Prazo de processamento de até 3 dias úteis',
    'Cookies de rastreamento válidos por 30 dias',
    'Não é permitido usar o próprio link para se beneficiar',
    'Contas fraudulentas serão bloqueadas sem direito a saque'
  ];

  const prospectionTips = [
    'Empresas sem site têm 3x mais chances de conversão',
    'Mensagens em idioma nativo aumentam taxa de resposta',
    'Envie o link da demo junto com a primeira mensagem',
    'Acompanhe visualizações para fazer follow-up',
    'Use o filtro de área para prospectar bairros específicos'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-border hover:bg-primary hover:text-primary-foreground">
          <HelpCircle className="w-4 h-4" />
          Como Funciona
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Central de Ajuda
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="prospection" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prospection" className="gap-2">
              <Target className="w-4 h-4" />
              Prospecção
            </TabsTrigger>
            <TabsTrigger value="affiliate" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Afiliados
            </TabsTrigger>
          </TabsList>

          {/* Prospecção Tab */}
          <TabsContent value="prospection" className="space-y-6 mt-6">
            {/* Passos de Prospecção */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Como Prospectar Clientes
              </h3>
              <div className="space-y-3">
                {prospectionSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-secondary/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{index + 1}. {step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dicas */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Dicas para Melhor Conversão
              </h4>
              <ul className="space-y-2">
                {prospectionTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Afiliados Tab */}
          <TabsContent value="affiliate" className="space-y-6 mt-6">
            {/* Passos */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Passo a Passo</h3>
              <div className="space-y-4">
                {affiliateSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-secondary/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{index + 1}. {step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comissões */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Suas Comissões
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {commissionRules.map((rule, index) => {
                  const Icon = rule.icon;
                  return (
                    <div key={index} className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">{rule.title}</span>
                      </div>
                      <p className="text-3xl font-bold text-primary">{rule.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regras */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Regras Importantes
              </h3>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <ul className="space-y-2">
                  {rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prazo de Saque */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-semibold text-foreground">Prazo de Processamento</h4>
                  <p className="text-sm text-muted-foreground">
                    Saques são processados em até <strong className="text-green-500">3 dias úteis</strong> após a solicitação.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default HowItWorksModal;
