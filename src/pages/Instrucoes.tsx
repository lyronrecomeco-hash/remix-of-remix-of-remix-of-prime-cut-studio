import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Smartphone, 
  QrCode, 
  Link2, 
  Rocket, 
  Users, 
  MessageSquare, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Settings,
  Eye,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Zap,
  Lock,
  TrendingUp,
  Timer,
  Ban,
  Heart,
  BookOpen,
  Lightbulb,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const sections: Section[] = [
  { id: 'inicio', title: 'Começando', icon: <Rocket className="w-5 h-5" /> },
  { id: 'instancia', title: 'Conectar Instância', icon: <Smartphone className="w-5 h-5" /> },
  { id: 'cakto', title: 'Integração Cakto', icon: <Link2 className="w-5 h-5" />, badge: 'E-commerce' },
  { id: 'campanhas', title: 'Criar Campanhas', icon: <Target className="w-5 h-5" /> },
  { id: 'contatos', title: 'Contatos & Filtros', icon: <Users className="w-5 h-5" /> },
  { id: 'monitoramento', title: 'Monitoramento', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'antiban', title: 'Sistema Anti-Ban', icon: <Shield className="w-5 h-5" />, badge: 'Importante', badgeVariant: 'destructive' },
  { id: 'dicas', title: 'Dicas & Boas Práticas', icon: <Lightbulb className="w-5 h-5" /> },
];

// Helper Components
const SectionHeader = forwardRef<HTMLDivElement, { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  badge?: string;
}>(({ icon, title, description, badge }, ref) => (
  <div ref={ref} className="mb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          {title}
          {badge && (
            <Badge variant="secondary" className="text-xs">{badge}</Badge>
          )}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
));
SectionHeader.displayName = 'SectionHeader';

const StepCard = ({ step, title, description, children }: {
  step: number;
  title: string;
  description: string;
  children?: React.ReactNode;
}) => (
  <Card className="bg-card border-border overflow-hidden">
    <CardContent className="p-0">
      <div className="flex">
        <div className="w-16 shrink-0 bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{step}</span>
        </div>
        <div className="p-4 flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {children}
        </div>
      </div>
    </CardContent>
  </Card>
);

const FeatureCard = ({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="text-center p-4">
    <div className="mx-auto w-fit mb-3">{icon}</div>
    <h4 className="font-semibold text-foreground">{title}</h4>
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
  </div>
);

const EventBadge = ({ name, description }: { name: string; description: string }) => (
  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
    <div>
      <p className="text-sm font-medium text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

const StatusBadge = ({ status, color, description }: { 
  status: string; 
  color: string;
  description: string;
}) => (
  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <div>
      <p className="text-sm font-medium text-foreground">{status}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

// Section Content Components
const InicioSection = () => (
  <div className="space-y-6">
    <SectionHeader 
      icon={<Rocket className="w-6 h-6" />}
      title="Começando com o Genesis"
      description="Visão geral do sistema de automação WhatsApp"
    />
    
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-primary" />}
            title="Automação Inteligente"
            description="Envio de mensagens automatizadas com controle anti-ban"
          />
          <FeatureCard
            icon={<ShoppingCart className="w-8 h-8 text-primary" />}
            title="Recuperação de Vendas"
            description="Integração com Cakto para recuperar carrinhos abandonados"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-primary" />}
            title="Monitoramento Real-time"
            description="Acompanhe o status de todas as suas campanhas"
          />
        </div>
      </CardContent>
    </Card>

    <div className="p-4 bg-muted/30 rounded-xl border border-border">
      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-500" />
        Fluxo Básico de Uso
      </h4>
      <ol className="space-y-3 text-sm text-muted-foreground">
        <li className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">1</span>
          Conecte sua instância WhatsApp (escaneie o QR Code)
        </li>
        <li className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">2</span>
          Configure a integração Cakto com suas credenciais
        </li>
        <li className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">3</span>
          Crie campanhas para diferentes eventos (PIX gerado, abandono, etc)
        </li>
        <li className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">4</span>
          Monitore os envios e ajuste conforme necessário
        </li>
      </ol>
    </div>

    <Card className="bg-blue-500/5 border-blue-500/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-blue-500/10">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Dica de Navegação</h4>
            <p className="text-sm text-muted-foreground">
              Use o menu lateral para navegar entre as seções ou os botões "Anterior" e "Próximo" na parte inferior. 
              Cada seção contém informações detalhadas sobre um aspecto específico do sistema.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const InstanciaSection = () => (
  <div className="space-y-6">
    <SectionHeader 
      icon={<Smartphone className="w-6 h-6" />}
      title="Conectar Instância WhatsApp"
      description="Passo a passo para conectar seu WhatsApp"
    />

    <StepCard
      step={1}
      title="Criar Nova Instância"
      description="No painel Genesis, clique em 'Nova Instância' e dê um nome identificador para ela (ex: Loja Principal, Suporte, etc)"
    />
    
    <StepCard
      step={2}
      title="Escanear QR Code"
      description="Abra o WhatsApp no seu celular, vá em Configurações > Dispositivos Conectados > Conectar Dispositivo e escaneie o QR Code exibido na tela"
    >
      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-500">Atenção!</p>
            <p className="text-muted-foreground mt-1">
              Use um número de WhatsApp dedicado para automação. Evite usar seu número pessoal para não correr risco de banimento.
            </p>
          </div>
        </div>
      </div>
    </StepCard>

    <StepCard
      step={3}
      title="Aguardar Conexão"
      description="Após escanear, aguarde alguns segundos. O status mudará para 'Conectado' com um indicador verde."
    />

    <StepCard
      step={4}
      title="Verificar Status"
      description="Na lista de instâncias, verifique se aparece 'Online' e o número do WhatsApp conectado."
    >
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado
        </Badge>
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Clock className="w-3 h-3 mr-1" /> Conectando...
        </Badge>
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          <Ban className="w-3 h-3 mr-1" /> Desconectado
        </Badge>
      </div>
    </StepCard>

    <Card className="bg-green-500/5 border-green-500/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-500 mb-2">Pronto!</h4>
            <p className="text-sm text-muted-foreground">
              Após conectar, sua instância está pronta para enviar mensagens. O próximo passo é configurar a integração Cakto.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const CaktoSection = () => (
  <div className="space-y-6">
    <SectionHeader 
      icon={<Link2 className="w-6 h-6" />}
      title="Integração Cakto"
      description="Configure a integração com a plataforma Cakto"
      badge="E-commerce"
    />

    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4">📋 Pré-requisitos</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Conta ativa na plataforma Cakto
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Acesso ao painel de desenvolvedor da Cakto
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Client ID e Client Secret gerados
          </li>
        </ul>
      </CardContent>
    </Card>

    <StepCard
      step={1}
      title="Obter Credenciais na Cakto"
      description="Acesse o painel da Cakto, vá em Configurações > API/Integrações e gere um novo par de credenciais (Client ID e Client Secret)"
    />

    <StepCard
      step={2}
      title="Acessar Hub Cakto"
      description="No painel Genesis, clique no card 'Cakto' para acessar o hub de integração"
    />

    <StepCard
      step={3}
      title="Conectar Integração"
      description="Clique em 'Conectar Cakto' na instância desejada e preencha o Client ID e Client Secret obtidos"
    />

    <StepCard
      step={4}
      title="Testar Conexão"
      description="Use o botão 'Testar Conexão' para verificar se as credenciais estão corretas. Você verá uma confirmação verde se tudo estiver ok."
    />

    <StepCard
      step={5}
      title="Configurar Webhook"
      description="Após conectar, copie a URL do Webhook fornecida e configure-a no painel da Cakto para receber eventos em tempo real"
    >
      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Webhook URL:</strong> Essa URL receberá todos os eventos da Cakto (compras, PIX gerado, abandonos, etc)
        </p>
      </div>
    </StepCard>

    <Card className="bg-green-500/5 border-green-500/20">
      <CardContent className="p-6">
        <h4 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Eventos Disponíveis da Cakto
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <EventBadge name="PIX Gerado" description="Cliente gerou boleto/PIX" />
          <EventBadge name="Compra Aprovada" description="Pagamento confirmado" />
          <EventBadge name="Abandonados" description="Checkout sem pagamento" />
          <EventBadge name="Reembolso" description="Pedido reembolsado" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const CampanhasSection = () => (
  <div className="space-y-6">
    <SectionHeader 
      icon={<Target className="w-6 h-6" />}
      title="Criar Campanhas"
      description="Configure campanhas automatizadas para diferentes eventos"
    />

    <StepCard
      step={1}
      title="Acessar Campanhas"
      description="No hub Cakto, clique em 'Gerenciar Integração' na instância desejada. Você verá o painel completo com campanhas, contatos e analytics."
    />

    <StepCard
      step={2}
      title="Nova Campanha"
      description="Clique em 'Nova Campanha' e selecione o tipo de evento que deseja automatizar (PIX gerado, abandonados, etc)"
    />

    <StepCard
      step={3}
      title="Configurar Período"
      description="Defina o período de busca de contatos. Por exemplo: últimos 7 dias de PIX gerados que ainda não pagaram."
    />

    <StepCard
      step={4}
      title="Escrever Mensagem"
      description="Crie a mensagem que será enviada. Use variáveis como {nome} e {produto} para personalizar."
    >
      <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
        <p className="text-sm font-medium text-foreground mb-2">Exemplo de mensagem:</p>
        <code className="text-xs text-muted-foreground block bg-background/50 p-3 rounded">
          Olá {'{nome}'}, vi que você se interessou pelo {'{produto}'}! 🛒<br/><br/>
          O pagamento ainda está pendente. Posso te ajudar com algo?
        </code>
      </div>
    </StepCard>

    <StepCard
      step={5}
      title="Buscar Contatos"
      description="O sistema buscará automaticamente os contatos que se encaixam nos critérios. Você verá quantos contatos serão impactados."
    />

    <StepCard
      step={6}
      title="Iniciar Campanha"
      description="Revise tudo e clique em 'Iniciar Campanha'. Os envios começarão respeitando os limites anti-ban configurados."
    />

    <Card className="bg-muted/30 border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Variáveis Disponíveis
        </h4>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <code className="bg-background/50 px-3 py-2 rounded text-muted-foreground">{'{nome}'} - Nome do cliente</code>
          <code className="bg-background/50 px-3 py-2 rounded text-muted-foreground">{'{produto}'} - Nome do produto</code>
          <code className="bg-background/50 px-3 py-2 rounded text-muted-foreground">{'{valor}'} - Valor da compra</code>
          <code className="bg-background/50 px-3 py-2 rounded text-muted-foreground">{'{link}'} - Link de pagamento</code>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ContatosSection = () => (
  <div className="space-y-6">
    <SectionHeader 
      icon={<Users className="w-6 h-6" />}
      title="Contatos & Filtros"
      description="Entenda como os contatos são gerenciados e filtrados"
    />

    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Filtros Automáticos
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          O sistema aplica filtros inteligentes para proteger suas campanhas:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Já Pagou</p>
              <p className="text-xs text-muted-foreground">Contatos que já pagaram são automaticamente removidos</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Já Recebeu Mensagem</p>
              <p className="text-xs text-muted-foreground">Evita enviar a mesma campanha duas vezes para o mesmo contato</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
            <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Duplicados</p>
              <p className="text-xs text-muted-foreground">Mesmo número em múltiplas transações aparece apenas uma vez</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-orange-500/5 rounded-lg border border-orange-500/10">
            <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">DDDs Inválidos</p>
              <p className="text-xs text-muted-foreground">Números com DDDs que não existem são removidos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-yellow-500/5 border-yellow-500/20">
      <CardContent className="p-6">
        <h4 className="font-semibold text-yellow-500 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Observações Importantes
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            Contatos são buscados em tempo real da API da Cakto
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            O status de pagamento é verificado antes de cada envio
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            Contatos em outras campanhas ativas são automaticamente excluídos
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            O sistema armazena histórico para evitar reenvios
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4">📊 Estatísticas de Contatos</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Na tela de contatos você verá:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="font-medium text-foreground text-sm">Total Encontrados</p>
            <p className="text-xs text-muted-foreground">Contatos retornados pela API</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="font-medium text-foreground text-sm">Após Filtros</p>
            <p className="text-xs text-muted-foreground">Contatos válidos após aplicar filtros</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="font-medium text-foreground text-sm">Já Pagaram</p>
            <p className="text-xs text-muted-foreground">Quantos foram removidos por já terem pago</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="font-medium text-foreground text-sm">Duplicados</p>
            <p className="text-xs text-muted-foreground">Quantos eram números repetidos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const MonitoramentoSection = () => (
  <div className="space-y-6">
    <SectionHeader 
      icon={<BarChart3 className="w-6 h-6" />}
      title="Monitoramento"
      description="Acompanhe suas campanhas em tempo real"
    />

    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          O que Monitorar
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-green-500" />
              <p className="font-medium text-foreground text-sm">Campanhas Ativas</p>
            </div>
            <p className="text-xs text-muted-foreground">Veja quantas campanhas estão rodando e seu progresso</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <p className="font-medium text-foreground text-sm">Taxa de Entrega</p>
            </div>
            <p className="text-xs text-muted-foreground">Porcentagem de mensagens entregues com sucesso</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <p className="font-medium text-foreground text-sm">Respostas</p>
            </div>
            <p className="text-xs text-muted-foreground">Quantos clientes responderam às mensagens</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="font-medium text-foreground text-sm">Erros</p>
            </div>
            <p className="text-xs text-muted-foreground">Mensagens que falharam e precisam de atenção</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4">📋 Status das Mensagens</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <StatusBadge status="Queued" color="bg-gray-500" description="Na fila aguardando envio" />
          <StatusBadge status="Sending" color="bg-yellow-500" description="Sendo enviada agora" />
          <StatusBadge status="Sent" color="bg-blue-500" description="Enviada ao WhatsApp" />
          <StatusBadge status="Delivered" color="bg-green-500" description="Entregue ao destinatário" />
          <StatusBadge status="Read" color="bg-green-600" description="Lida pelo destinatário" />
          <StatusBadge status="Replied" color="bg-purple-500" description="Destinatário respondeu" />
          <StatusBadge status="Failed" color="bg-red-500" description="Falha no envio" />
          <StatusBadge status="Cancelled" color="bg-gray-400" description="Cancelada manualmente" />
        </div>
      </CardContent>
    </Card>

    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          Atualização em Tempo Real
        </h4>
        <p className="text-sm text-muted-foreground">
          O painel de monitoramento atualiza automaticamente a cada poucos segundos. 
          Você também pode forçar uma atualização clicando no botão de refresh.
        </p>
      </CardContent>
    </Card>

    <Card className="bg-muted/30 border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-3">⚙️ Controles de Campanha</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Pause className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Pausar</p>
              <p className="text-xs text-muted-foreground">Interrompe temporariamente os envios</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Play className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Retomar</p>
              <p className="text-xs text-muted-foreground">Continua os envios de onde parou</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Ban className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Cancelar</p>
              <p className="text-xs text-muted-foreground">Cancela todos os envios pendentes</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AntibanSection = () => (
  <div className="space-y-6">
    <SectionHeader 
      icon={<Shield className="w-6 h-6" />}
      title="Sistema Anti-Ban"
      description="Proteção inteligente contra banimento do WhatsApp"
    />

    <Card className="bg-red-500/5 border-red-500/20">
      <CardContent className="p-6">
        <h4 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Por que é Importante?
        </h4>
        <p className="text-sm text-muted-foreground">
          O WhatsApp monitora comportamentos suspeitos e pode banir números que enviam muitas mensagens em sequência. 
          O sistema anti-ban foi desenvolvido para simular comportamento humano e proteger seu número.
        </p>
      </CardContent>
    </Card>

    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Mecanismos de Proteção
        </h4>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <Timer className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Intervalos Inteligentes</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pausa aleatória entre cada mensagem (configurável de 10s a 60s) para simular digitação humana
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <Pause className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Pausas Automáticas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Após enviar um lote de mensagens, o sistema faz uma pausa maior antes de continuar
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <TrendingUp className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Backoff Exponencial</p>
              <p className="text-xs text-muted-foreground mt-1">
                Se detectar erros, aumenta os intervalos progressivamente para dar tempo ao WhatsApp
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">Limites por Período</p>
              <p className="text-xs text-muted-foreground mt-1">
                Controla quantidade máxima de mensagens por hora e por dia
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Configurações Recomendadas
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Configuração</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Conservador</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Moderado</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Agressivo</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3">Msgs/minuto</td>
                <td className="py-3 text-green-500">1-2</td>
                <td className="py-3 text-yellow-500">3-4</td>
                <td className="py-3 text-red-500">5-6</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3">Msgs/hora</td>
                <td className="py-3 text-green-500">30-50</td>
                <td className="py-3 text-yellow-500">60-100</td>
                <td className="py-3 text-red-500">150+</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3">Msgs/dia</td>
                <td className="py-3 text-green-500">200-300</td>
                <td className="py-3 text-yellow-500">500-800</td>
                <td className="py-3 text-red-500">1000+</td>
              </tr>
              <tr>
                <td className="py-3">Intervalo</td>
                <td className="py-3 text-green-500">30-60s</td>
                <td className="py-3 text-yellow-500">15-30s</td>
                <td className="py-3 text-red-500">10-15s</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-500 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Recomendamos começar com configurações conservadoras
          </p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-yellow-500/5 border-yellow-500/20">
      <CardContent className="p-6">
        <h4 className="font-semibold text-yellow-500 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Sinais de Alerta
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            Muitas mensagens com status "Failed" seguidas
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            WhatsApp pedindo verificação frequente
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            Desconexões frequentes da instância
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            Taxa de entrega caindo drasticamente
          </li>
        </ul>
        <p className="mt-4 text-sm text-yellow-500 font-medium">
          Se notar esses sinais, pause as campanhas e aumente os intervalos!
        </p>
      </CardContent>
    </Card>
  </div>
);

const DicasSection = () => (
  <div className="space-y-6">
    <SectionHeader 
      icon={<Lightbulb className="w-6 h-6" />}
      title="Dicas & Boas Práticas"
      description="Maximize seus resultados e proteja sua conta"
    />

    <div className="grid md:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <h4 className="font-semibold text-foreground">Mensagens Humanizadas</h4>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use o nome do cliente ({'{nome}'})</li>
            <li>• Varie o texto entre campanhas</li>
            <li>• Evite parecer robô/automático</li>
            <li>• Use emojis com moderação</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <h4 className="font-semibold text-foreground">Horários Ideais</h4>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Evite madrugada (00h-07h)</li>
            <li>• Melhores: 10h-12h e 14h-18h</li>
            <li>• Finais de semana com moderação</li>
            <li>• Respeite o horário comercial</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <h4 className="font-semibold text-foreground">Evite Insistência</h4>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Não envie mais de 2-3x por lead</li>
            <li>• Espaçe as mensagens em dias</li>
            <li>• Respeite quem não responde</li>
            <li>• Ofereça opção de sair</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <h4 className="font-semibold text-foreground">Segmentação</h4>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Crie campanhas específicas por evento</li>
            <li>• Personalize por produto/valor</li>
            <li>• Teste diferentes abordagens</li>
            <li>• Analise o que funciona melhor</li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Sempre Teste Antes
        </h4>
        <p className="text-sm text-muted-foreground">
          Antes de enviar para centenas de contatos, faça um teste pequeno (5-10 mensagens) 
          para verificar se o texto está correto, as variáveis estão funcionando e não há erros.
        </p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-full shrink-0">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Dica de Ouro</h4>
            <p className="text-sm text-muted-foreground">
              O melhor resultado vem quando você trata cada mensagem como se fosse conversar 
              pessoalmente com o cliente. Automação é sobre escala, mas o toque humano faz a diferença. 
              Seja genuíno, ofereça ajuda real, e os resultados virão naturalmente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h4 className="font-semibold text-foreground mb-4">📈 Métricas de Sucesso</h4>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-500/10 rounded-xl">
            <p className="text-2xl font-bold text-green-500">{'>'} 90%</p>
            <p className="text-xs text-muted-foreground mt-1">Taxa de Entrega</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-xl">
            <p className="text-2xl font-bold text-blue-500">5-15%</p>
            <p className="text-xs text-muted-foreground mt-1">Taxa de Resposta</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-xl">
            <p className="text-2xl font-bold text-purple-500">2-5%</p>
            <p className="text-xs text-muted-foreground mt-1">Taxa de Conversão</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Main Component
export default function Instrucoes() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('inicio');

  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < sections.length - 1;

  const goToSection = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && canGoBack) {
      setActiveSection(sections[currentIndex - 1].id);
    } else if (direction === 'next' && canGoNext) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'inicio': return <InicioSection />;
      case 'instancia': return <InstanciaSection />;
      case 'cakto': return <CaktoSection />;
      case 'campanhas': return <CampanhasSection />;
      case 'contatos': return <ContatosSection />;
      case 'monitoramento': return <MonitoramentoSection />;
      case 'antiban': return <AntibanSection />;
      case 'dicas': return <DicasSection />;
      default: return <InicioSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/genesis')}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Central de Instruções
              </h1>
              <p className="text-sm text-muted-foreground">Guia completo do WhatsApp Genesis</p>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              {currentIndex + 1} / {sections.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <Card className="bg-card/50 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Navegação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {sections.map((section, index) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          activeSection === section.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="flex-1 text-left truncate">{section.title}</span>
                        {section.badge && (
                          <Badge variant={section.badgeVariant || 'secondary'} className="text-[10px] px-1.5 py-0">
                            {section.badge}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            {/* Mobile Navigation */}
            <div className="lg:hidden mb-6">
              <Card className="bg-card/50 border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {sections.map((section, index) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                          activeSection === section.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <span className="font-bold">{index + 1}</span>
                        <span className="hidden sm:inline">{section.title}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => goToSection('prev')}
                  disabled={!canGoBack}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                <div className="flex items-center gap-1">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        activeSection === section.id
                          ? 'bg-primary w-6'
                          : 'bg-muted hover:bg-muted-foreground/30'
                      }`}
                      title={section.title}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => goToSection('next')}
                  disabled={!canGoNext}
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Next Section Preview */}
              {canGoNext && (
                <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Próxima seção:</p>
                  <button
                    onClick={() => goToSection('next')}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    {sections[currentIndex + 1].icon}
                    <span className="font-medium">{sections[currentIndex + 1].title}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
