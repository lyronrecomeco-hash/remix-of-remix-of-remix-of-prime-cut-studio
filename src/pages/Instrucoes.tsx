import { useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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

export default function Instrucoes() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('inicio');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        {section.icon}
                        <span className="flex-1 text-left">{section.title}</span>
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
            <div className="space-y-12">
              
              {/* Seção: Começando */}
              <section id="inicio" className="scroll-mt-24">
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

                <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Fluxo Básico de Uso
                  </h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
                      Conecte sua instância WhatsApp (escaneie o QR Code)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
                      Configure a integração Cakto com suas credenciais
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
                      Crie campanhas para diferentes eventos (PIX gerado, abandono, etc)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">4</span>
                      Monitore os envios e ajuste conforme necessário
                    </li>
                  </ol>
                </div>
              </section>

              {/* Seção: Conectar Instância */}
              <section id="instancia" className="scroll-mt-24">
                <SectionHeader 
                  icon={<Smartphone className="w-6 h-6" />}
                  title="Conectar Instância WhatsApp"
                  description="Passo a passo para conectar seu WhatsApp"
                />

                <div className="space-y-6">
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
                </div>
              </section>

              {/* Seção: Integração Cakto */}
              <section id="cakto" className="scroll-mt-24">
                <SectionHeader 
                  icon={<Link2 className="w-6 h-6" />}
                  title="Integração Cakto"
                  description="Configure a integração com a plataforma Cakto"
                  badge="E-commerce"
                />

                <div className="space-y-6">
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
              </section>

              {/* Seção: Criar Campanhas */}
              <section id="campanhas" className="scroll-mt-24">
                <SectionHeader 
                  icon={<Target className="w-6 h-6" />}
                  title="Criar Campanhas"
                  description="Configure campanhas automatizadas para diferentes eventos"
                />

                <div className="space-y-6">
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
                    description="Revise os contatos, a mensagem e clique em 'Iniciar Campanha'. Os envios começarão respeitando os limites anti-ban."
                  />
                </div>
              </section>

              {/* Seção: Contatos & Filtros */}
              <section id="contatos" className="scroll-mt-24">
                <SectionHeader 
                  icon={<Users className="w-6 h-6" />}
                  title="Contatos & Filtros"
                  description="Entenda como os contatos são processados"
                />

                <div className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-4">🔍 Filtros Automáticos</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        O sistema aplica filtros inteligentes para evitar spam e mensagens desnecessárias:
                      </p>
                      <ul className="space-y-3">
                        <FilterItem 
                          title="Já Pagou" 
                          description="Contatos que já realizaram o pagamento são automaticamente removidos"
                          icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
                        />
                        <FilterItem 
                          title="Já Recebeu Mensagem" 
                          description="Contatos que já receberam mensagem em qualquer campanha são pulados"
                          icon={<MessageSquare className="w-4 h-4 text-blue-500" />}
                        />
                        <FilterItem 
                          title="Duplicados" 
                          description="Mesmo número em eventos diferentes é contado apenas uma vez"
                          icon={<Users className="w-4 h-4 text-yellow-500" />}
                        />
                        <FilterItem 
                          title="DDD Inválido" 
                          description="Números com DDD inválido são removidos automaticamente"
                          icon={<Ban className="w-4 h-4 text-red-500" />}
                        />
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Observações Importantes
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Contatos em status "enviado", "entregue", "lido" ou "na fila" não aparecem em novas campanhas</li>
                        <li>• O sistema verifica compras aprovadas para não enviar para quem já pagou</li>
                        <li>• Números internacionais podem ter comportamento diferente</li>
                        <li>• Sempre verifique a quantidade de contatos antes de iniciar</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Seção: Monitoramento */}
              <section id="monitoramento" className="scroll-mt-24">
                <SectionHeader 
                  icon={<BarChart3 className="w-6 h-6" />}
                  title="Monitoramento"
                  description="Acompanhe suas campanhas em tempo real"
                />

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <StatusCard
                      title="Campanhas Ativas"
                      description="Visualize todas as campanhas em execução"
                      icon={<Play className="w-6 h-6 text-green-500" />}
                    />
                    <StatusCard
                      title="Taxa de Entrega"
                      description="Acompanhe quantas mensagens foram entregues"
                      icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
                    />
                    <StatusCard
                      title="Respostas"
                      description="Veja quem respondeu às suas mensagens"
                      icon={<MessageSquare className="w-6 h-6 text-primary" />}
                    />
                    <StatusCard
                      title="Erros"
                      description="Identifique e corrija problemas de envio"
                      icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
                    />
                  </div>

                  <Card className="bg-card border-border">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-4">📊 Status de Mensagens</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <StatusBadge status="queued" label="Na Fila" description="Aguardando envio" />
                        <StatusBadge status="sending" label="Enviando" description="Em processo de envio" />
                        <StatusBadge status="sent" label="Enviado" description="Enviado com sucesso" />
                        <StatusBadge status="delivered" label="Entregue" description="Chegou ao destinatário" />
                        <StatusBadge status="read" label="Lido" description="Destinatário visualizou" />
                        <StatusBadge status="replied" label="Respondido" description="Destinatário respondeu" />
                        <StatusBadge status="failed" label="Falhou" description="Erro no envio" />
                        <StatusBadge status="cancelled" label="Cancelado" description="Envio cancelado" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        O que Monitorar
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Taxa de entrega baixa:</strong> Pode indicar números inválidos ou problemas de conexão</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Muitos erros:</strong> Verifique se a instância está conectada e o WhatsApp ativo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Campanha pausada:</strong> O sistema pode pausar automaticamente por segurança</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span><strong>Velocidade de envio:</strong> Respeite os limites para evitar banimento</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Seção: Anti-Ban */}
              <section id="antiban" className="scroll-mt-24">
                <SectionHeader 
                  icon={<Shield className="w-6 h-6" />}
                  title="Sistema Anti-Ban"
                  description="Proteção inteligente contra banimento do WhatsApp"
                  badge="Importante"
                  badgeVariant="destructive"
                />

                <div className="space-y-6">
                  <Card className="bg-destructive/5 border-destructive/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-destructive mb-2">Por que isso é importante?</h4>
                          <p className="text-sm text-muted-foreground">
                            O WhatsApp monitora comportamentos suspeitos e pode banir números que enviam muitas mensagens em pouco tempo. 
                            Nosso sistema anti-ban implementa diversas proteções para manter seu número seguro.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <ProtectionCard
                      icon={<Timer className="w-6 h-6" />}
                      title="Intervalos Inteligentes"
                      description="Tempo variável entre mensagens para simular comportamento humano"
                    />
                    <ProtectionCard
                      icon={<Pause className="w-6 h-6" />}
                      title="Pausas Automáticas"
                      description="O sistema pausa automaticamente após detectar risco"
                    />
                    <ProtectionCard
                      icon={<RefreshCw className="w-6 h-6" />}
                      title="Backoff Exponencial"
                      description="Em caso de erro, o sistema aguarda cada vez mais antes de tentar novamente"
                    />
                    <ProtectionCard
                      icon={<Clock className="w-6 h-6" />}
                      title="Limites por Período"
                      description="Limites de mensagens por minuto, hora e dia"
                    />
                  </div>

                  <Card className="bg-card border-border">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-4">⚙️ Configurações de Proteção</h4>
                      <div className="space-y-4">
                        <LimitRow label="Mensagens por minuto" value="3-5" />
                        <LimitRow label="Mensagens por hora" value="~60" />
                        <LimitRow label="Mensagens por dia" value="~500" />
                        <LimitRow label="Intervalo entre mensagens" value="15-45 segundos" />
                        <LimitRow label="Pausa após burst" value="2-5 minutos" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Boas Práticas Anti-Ban
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Use um número dedicado para automação, não o pessoal</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Evite enviar mensagens idênticas para muitos contatos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Personalize as mensagens com nome e produto</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Respeite os limites de envio do sistema</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Não force o envio quando o sistema pausar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Monitore a taxa de bloqueios e ajuste se necessário</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Seção: Dicas */}
              <section id="dicas" className="scroll-mt-24">
                <SectionHeader 
                  icon={<Lightbulb className="w-6 h-6" />}
                  title="Dicas & Boas Práticas"
                  description="Maximize seus resultados com essas dicas"
                />

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TipCard
                      number={1}
                      title="Mensagens Humanizadas"
                      description="Escreva mensagens como se fosse uma pessoa real. Evite linguagem robótica ou muito formal."
                    />
                    <TipCard
                      number={2}
                      title="Timing Certo"
                      description="Envie mensagens de recuperação em horários comerciais. Evite madrugada e finais de semana."
                    />
                    <TipCard
                      number={3}
                      title="Não Seja Insistente"
                      description="Uma ou duas mensagens de follow-up são suficientes. Mais que isso vira spam."
                    />
                    <TipCard
                      number={4}
                      title="Teste Antes"
                      description="Sempre envie uma mensagem de teste para seu próprio número antes de iniciar uma campanha."
                    />
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Dica de Ouro
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A melhor forma de evitar banimento é criar <strong className="text-foreground">relacionamento genuíno</strong> com seus clientes. 
                        Use a automação para <strong className="text-foreground">iniciar conversas</strong>, não para fazer spam. 
                        Quando um cliente responder, continue a conversa manualmente sempre que possível.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-4">🎯 Métricas de Sucesso</h4>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <MetricCard
                          label="Taxa de Entrega"
                          target="> 95%"
                          description="Indica qualidade da base de contatos"
                        />
                        <MetricCard
                          label="Taxa de Resposta"
                          target="> 10%"
                          description="Indica engajamento das mensagens"
                        />
                        <MetricCard
                          label="Taxa de Conversão"
                          target="> 5%"
                          description="Vendas recuperadas sobre total"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Footer */}
              <div className="pt-8 pb-12 border-t border-border">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Dúvidas? Entre em contato com o suporte.
                  </p>
                  <Button onClick={() => navigate('/genesis')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Painel
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function SectionHeader({ icon, title, description, badge, badgeVariant }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {badge && (
              <Badge variant={badgeVariant || 'secondary'}>{badge}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-4">
      <div className="w-16 h-16 rounded-2xl bg-background/50 flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description, children }: { 
  step: number; 
  title: string; 
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
            {step}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventBadge({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
      <div>
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground ml-2">- {description}</span>
      </div>
    </div>
  );
}

function FilterItem({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
      {icon}
      <div>
        <span className="text-sm font-medium text-foreground">{title}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StatusCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, label, description }: { status: string; label: string; description: string }) {
  const colors: Record<string, string> = {
    queued: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    sending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    sent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
    read: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    replied: 'bg-primary/10 text-primary border-primary/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    cancelled: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  };

  return (
    <div className={`p-2.5 rounded-lg border ${colors[status]}`}>
      <span className="text-sm font-medium">{label}</span>
      <p className="text-xs opacity-75">{description}</p>
    </div>
  );
}

function ProtectionCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge variant="outline" className="font-mono">{value}</Badge>
    </div>
  );
}

function TipCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {number}
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, target, description }: { label: string; target: string; description: string }) {
  return (
    <div className="text-center p-4 bg-muted/30 rounded-xl">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary">{target}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
