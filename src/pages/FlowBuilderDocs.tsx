import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Book, Zap, MessageSquare, GitBranch, Globe, Brain, Shield,
  Server, Lock, Webhook, Repeat, Play, Clock, Send, List, LayoutGrid,
  Tag, AlertTriangle, RefreshCw, Gauge, Calendar, Radio, Workflow,
  ChevronRight, Sparkles, CheckCircle2, Info, ExternalLink, Copy,
  Smartphone, Inbox, Timer, ListPlus, UserCog, HeartPulse, ShieldAlert,
  FileJson, Reply, FilterX, ListOrdered, GitMerge, Layers, Bot, Shuffle,
  Target, TrendingUp, Code2, Database, Users, Settings, Lightbulb,
  ArrowRightLeft, MousePointer, CircleStop, UserPlus, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import lunaAvatar from '@/assets/luna-avatar.png';

interface DocSection {
  id: string;
  title: string;
  icon: any;
}

const SECTIONS: DocSection[] = [
  { id: 'introducao', title: 'Introdução', icon: Book },
  { id: 'primeiros-passos', title: 'Primeiros Passos', icon: Play },
  { id: 'whatsapp', title: 'Nós WhatsApp', icon: Smartphone },
  { id: 'gatilhos', title: 'Gatilhos', icon: Zap },
  { id: 'condicoes', title: 'Condições', icon: GitBranch },
  { id: 'acoes', title: 'Ações', icon: Send },
  { id: 'automacao', title: 'Automação Avançada', icon: Repeat },
  { id: 'estabilidade', title: 'Estabilidade', icon: Shield },
  { id: 'infraestrutura', title: 'Infraestrutura', icon: Server },
  { id: 'seguranca', title: 'Segurança', icon: Lock },
  { id: 'ai', title: 'Agente IA', icon: Brain },
  { id: 'webhooks', title: 'Webhooks Universais', icon: Webhook },
  { id: 'variaveis', title: 'Variáveis e Contexto', icon: Database },
  { id: 'boas-praticas', title: 'Boas Práticas', icon: Lightbulb },
  { id: 'exemplos', title: 'Exemplos Práticos', icon: Sparkles },
  { id: 'luna', title: 'Luna IA', icon: Bot },
];

const ComponentCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color,
  config 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  color: string;
  config?: string[];
}) => (
  <div className="p-5 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all">
    <div className="flex items-start gap-4">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-base">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        {config && config.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {config.map((c, i) => (
              <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                {c}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const CodeBlock = ({ code, title }: { code: string; title?: string }) => (
  <div className="relative group rounded-xl overflow-hidden border border-border/50">
    {title && (
      <div className="px-4 py-2 bg-muted/50 border-b border-border/50 flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="outline" className="text-xs">Exemplo</Badge>
      </div>
    )}
    <pre className="bg-muted/30 p-5 overflow-x-auto text-sm font-mono">
      <code className="text-foreground">{code}</code>
    </pre>
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => { navigator.clipboard.writeText(code); toast.success('Código copiado!'); }}
    >
      <Copy className="w-4 h-4" />
    </Button>
  </div>
);

const FlowExample = ({ title, description, nodes }: { 
  title: string; 
  description: string; 
  nodes: { label: string; type: string; color: string }[];
}) => (
  <div className="p-5 rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/30 hover:border-primary/30 transition-all">
    <h4 className="font-bold text-base mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <div className="flex items-center gap-2 flex-wrap">
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center gap-2">
          <div 
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: node.color }}
          >
            {node.label}
          </div>
          {i < nodes.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      ))}
    </div>
  </div>
);

const InfoCard = ({ title, children, variant = 'info' }: { 
  title: string; 
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'tip';
}) => {
  const styles = {
    info: { bg: 'bg-primary/5', border: 'border-primary/20', icon: Info, color: 'text-primary' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle, color: 'text-amber-600' },
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, color: 'text-emerald-600' },
    tip: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Lightbulb, color: 'text-purple-600' }
  };
  
  const { bg, border, icon: Icon, color } = styles[variant];
  
  return (
    <div className={cn("p-5 rounded-xl border", bg, border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", color)} />
        <div>
          <h4 className="font-bold text-base mb-1">{title}</h4>
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default function FlowBuilderDocs() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('introducao');

  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map(s => document.getElementById(s.id));
      const scrollPos = window.scrollY + 150;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/genesis')} className="gap-2 text-base">
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Painel
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Documentação do Flow Builder</h1>
              <p className="text-xs text-muted-foreground">Genesis Hub - Motor de Automação Visual</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
              <Layers className="w-4 h-4" />
              70+ Componentes
            </Badge>
          </div>
        </div>
      </header>

      <div className="container flex gap-8 py-8">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-3">
              Conteúdo
            </p>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all text-left",
                    activeSection === section.id 
                      ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl space-y-16">
            
            {/* ========== INTRODUÇÃO ========== */}
            <section id="introducao">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Book className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Introdução ao Flow Builder</h2>
                    <p className="text-muted-foreground">Motor de automação visual profissional</p>
                  </div>
                </div>
                
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  O <strong className="text-foreground">Genesis Flow Builder</strong> é uma ferramenta de automação visual profissional inspirada no n8n e Zapier. 
                  Permite criar fluxos complexos de automação arrastando e conectando componentes, sem escrever código. 
                  Ideal para atendimento via WhatsApp, integrações com APIs, processamento de dados e muito mais.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        70+ Componentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Biblioteca completa de nós para WhatsApp, APIs externas, IA integrada, webhooks universais e muito mais.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="w-5 h-5 text-amber-500" />
                        IA Nativa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Nós de IA para respostas inteligentes, análise de intenção, tomada de decisão e embeddings semânticos.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        Enterprise Ready
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Controle de infraestrutura, estabilidade, segurança avançada e monitoramento em tempo real.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <InfoCard title="Filosofia do Sistema" variant="info">
                  <p className="mb-2">
                    O Flow Builder é <strong>agnóstico de canal</strong>: você pode criar automações que funcionam com WhatsApp, 
                    webhooks externos, APIs, agendamentos cron ou de forma totalmente independente.
                  </p>
                  <p>
                    Os fluxos seguem um ciclo de vida formal: <Badge variant="outline">DRAFT</Badge> → 
                    <Badge variant="outline" className="mx-1">VALIDATED</Badge> → 
                    <Badge variant="outline" className="mx-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">ACTIVE</Badge> → 
                    <Badge variant="outline">PAUSED</Badge>
                  </p>
                </InfoCard>
              </motion.div>
            </section>

            {/* ========== PRIMEIROS PASSOS ========== */}
            <section id="primeiros-passos">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Play className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Primeiros Passos</h2>
                  <p className="text-muted-foreground">Como criar seu primeiro fluxo de automação</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">1</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Criando um Novo Fluxo</h3>
                        <p className="text-muted-foreground">
                          Acesse o painel Genesis e clique no botão <strong>"+ Novo Fluxo"</strong>. 
                          O fluxo será criado automaticamente com status <Badge variant="outline">DRAFT</Badge> e você será direcionado para o editor visual.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">2</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Adicionando Componentes</h3>
                        <p className="text-muted-foreground mb-3">
                          Existem três formas de adicionar componentes ao seu fluxo:
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>Clique em <strong>"Adicionar passo..."</strong> no canvas vazio</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>Use o botão <strong>"Componentes"</strong> na barra de ferramentas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span><strong>Arraste e solte</strong> diretamente do modal de componentes</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">3</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Conectando os Nós</h3>
                        <p className="text-muted-foreground">
                          Clique no <strong>ponto de saída</strong> (●) de um nó e arraste até o <strong>ponto de entrada</strong> do próximo nó. 
                          As conexões são validadas automaticamente para garantir que a lógica faça sentido.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">4</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Ativando o Fluxo</h3>
                        <p className="text-muted-foreground mb-3">
                          Quando estiver satisfeito, clique em <strong>"Ativar"</strong>. O sistema validará:
                        </p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Presença de pelo menos um nó de gatilho (trigger)</li>
                          <li>• Ausência de loops infinitos</li>
                          <li>• Todas as conexões estão válidas</li>
                          <li>• Dependências de instância WhatsApp satisfeitas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <InfoCard title="Dica: Use a Luna IA" variant="tip">
                  Se você não sabe por onde começar, clique no botão <strong>"Criar com Luna IA"</strong> e descreva 
                  o que você quer automatizar. A Luna vai construir o fluxo completo para você em segundos!
                </InfoCard>
              </div>
            </section>

            {/* ========== WHATSAPP ========== */}
            <section id="whatsapp">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Nós WhatsApp Nativos</h2>
                  <p className="text-muted-foreground">Componentes específicos para automação via WhatsApp</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                Estes componentes permitem interagir diretamente com o WhatsApp, enviando mensagens, botões, listas e capturando respostas.
                <strong className="text-foreground"> Requerem uma instância WhatsApp conectada.</strong>
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ComponentCard 
                  icon={Play} 
                  title="Início do Fluxo (wa_start)" 
                  description="Ponto de partida quando uma mensagem é recebida no WhatsApp. Dispara o fluxo baseado em palavras-chave configuradas."
                  color="#25D366"
                  config={['triggerType', 'keywords[]', 'matchType']}
                />
                <ComponentCard 
                  icon={MessageSquare} 
                  title="Enviar Texto (wa_send_text)" 
                  description="Envia uma mensagem de texto simples para o contato. Suporta variáveis dinâmicas e formatação WhatsApp."
                  color="#25D366"
                  config={['text', 'typing', 'typingDuration']}
                />
                <ComponentCard 
                  icon={LayoutGrid} 
                  title="Enviar Botões (wa_send_buttons)" 
                  description="Envia mensagem com até 3 botões de resposta rápida. Ideal para menus simples e confirmações."
                  color="#128C7E"
                  config={['text', 'buttons[]', 'header', 'footer']}
                />
                <ComponentCard 
                  icon={List} 
                  title="Enviar Lista (wa_send_list)" 
                  description="Envia um menu de lista interativa com seções e itens. Perfeito para catálogos e menus extensos."
                  color="#075E54"
                  config={['title', 'buttonText', 'sections[]']}
                />
                <ComponentCard 
                  icon={Clock} 
                  title="Aguardar Resposta (wa_wait_response)" 
                  description="Pausa a execução e aguarda uma resposta do cliente. Define timeout e variável para armazenar a resposta."
                  color="#34B7F1"
                  config={['timeout', 'saveResponseTo', 'timeoutAction']}
                />
                <ComponentCard 
                  icon={Inbox} 
                  title="Receber Mensagem (wa_receive)" 
                  description="Captura e processa mensagens recebidas, incluindo mídia (imagens, áudios, documentos)."
                  color="#25D366"
                  config={['saveAs', 'captureMedia', 'mediaTypes[]']}
                />
              </div>

              <InfoCard title="Importante: Instância WhatsApp" variant="warning">
                Estes nós só funcionam com uma instância WhatsApp conectada e ativa. Configure sua instância em 
                <strong> "Instâncias"</strong> no painel antes de ativar fluxos que usam estes componentes.
              </InfoCard>
            </section>

            {/* ========== GATILHOS ========== */}
            <section id="gatilhos">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Gatilhos (Triggers)</h2>
                  <p className="text-muted-foreground">Definem quando e como um fluxo é iniciado</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                Todo fluxo precisa de pelo menos um gatilho. Eles determinam o evento que inicia a execução do fluxo.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ComponentCard 
                  icon={MessageSquare} 
                  title="Mensagem Recebida" 
                  description="Dispara quando uma mensagem contendo palavras-chave específicas é recebida."
                  color="#22c55e"
                  config={['keywords[]', 'matchType', 'caseSensitive']}
                />
                <ComponentCard 
                  icon={UserPlus} 
                  title="Primeiro Contato" 
                  description="Dispara automaticamente quando um novo contato envia a primeira mensagem."
                  color="#22c55e"
                  config={['saveContactAs']}
                />
                <ComponentCard 
                  icon={Webhook} 
                  title="Webhook Trigger" 
                  description="Inicia o fluxo quando um webhook externo é recebido. Ideal para integrações."
                  color="#22c55e"
                  config={['webhookId', 'method', 'authRequired']}
                />
                <ComponentCard 
                  icon={Calendar} 
                  title="Cron / Agendamento" 
                  description="Executa o fluxo em horários programados usando expressões cron."
                  color="#22c55e"
                  config={['cronExpression', 'timezone', 'enabled']}
                />
                <ComponentCard 
                  icon={MousePointer} 
                  title="Clique em Botão" 
                  description="Dispara quando o usuário clica em um botão específico de uma mensagem anterior."
                  color="#22c55e"
                  config={['buttonId', 'fromFlowId']}
                />
                <ComponentCard 
                  icon={Radio} 
                  title="Evento do Sistema" 
                  description="Dispara em eventos internos como criação de lead, nova venda, etc."
                  color="#22c55e"
                  config={['eventType', 'filters']}
                />
              </div>
            </section>

            {/* ========== CONDIÇÕES ========== */}
            <section id="condicoes">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Condições (Branching)</h2>
                  <p className="text-muted-foreground">Crie lógica condicional e ramificações no fluxo</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                Condições permitem criar ramificações no fluxo baseadas em dados, respostas do usuário ou variáveis do sistema.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ComponentCard 
                  icon={GitBranch} 
                  title="Decisão (IF/ELSE)" 
                  description="Avalia uma condição e direciona para caminhos diferentes baseado no resultado."
                  color="#a855f7"
                  config={['condition', 'trueLabel', 'falseLabel']}
                />
                <ComponentCard 
                  icon={Filter} 
                  title="Switch Case" 
                  description="Avalia múltiplas condições e direciona para o primeiro caso que corresponder."
                  color="#a855f7"
                  config={['expression', 'cases[]', 'defaultCase']}
                />
                <ComponentCard 
                  icon={Shuffle} 
                  title="Split A/B" 
                  description="Divide o tráfego em porcentagens para testes A/B e experimentos."
                  color="#a855f7"
                  config={['percentageA', 'percentageB']}
                />
                <ComponentCard 
                  icon={ArrowRightLeft} 
                  title="Expressão IF" 
                  description="Avalia expressões JavaScript personalizadas para lógicas complexas."
                  color="#a855f7"
                  config={['expression', 'variables']}
                />
              </div>

              <CodeBlock 
                title="Exemplo de Expressão Condicional"
                code={`// Verificar se é horário comercial
const hora = new Date().getHours();
const horarioComercial = hora >= 9 && hora < 18;

// Verificar valor do lead
const leadValue = context.lead?.value || 0;
const isHighValue = leadValue > 1000;

// Combinar condições
return horarioComercial && isHighValue;`}
              />
            </section>

            {/* ========== AÇÕES ========== */}
            <section id="acoes">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Send className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Ações</h2>
                  <p className="text-muted-foreground">Executam operações e processam dados</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ComponentCard 
                  icon={Globe} 
                  title="HTTP Request" 
                  description="Faz requisições HTTP para APIs externas com suporte a todos os métodos e autenticação."
                  color="#3b82f6"
                  config={['url', 'method', 'headers', 'body', 'auth']}
                />
                <ComponentCard 
                  icon={Tag} 
                  title="Aplicar Tag" 
                  description="Adiciona ou remove tags de um contato para segmentação e organização."
                  color="#3b82f6"
                  config={['tagName', 'action']}
                />
                <ComponentCard 
                  icon={Database} 
                  title="Salvar Variável" 
                  description="Armazena um valor em uma variável para uso posterior no fluxo."
                  color="#3b82f6"
                  config={['variableName', 'value', 'scope']}
                />
                <ComponentCard 
                  icon={Timer} 
                  title="Aguardar / Delay" 
                  description="Pausa a execução do fluxo por um período determinado."
                  color="#3b82f6"
                  config={['duration', 'unit']}
                />
                <ComponentCard 
                  icon={CircleStop} 
                  title="Finalizar Fluxo" 
                  description="Encerra a execução do fluxo atual, opcionalmente com uma mensagem final."
                  color="#3b82f6"
                  config={['finalMessage', 'status']}
                />
                <ComponentCard 
                  icon={Repeat} 
                  title="Chamar Subfluxo" 
                  description="Executa outro fluxo como uma função, passando e recebendo dados."
                  color="#3b82f6"
                  config={['subflowId', 'inputData', 'waitForCompletion']}
                />
              </div>
            </section>

            {/* ========== AUTOMAÇÃO AVANÇADA ========== */}
            <section id="automacao">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Repeat className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Automação Avançada</h2>
                  <p className="text-muted-foreground">Recursos para fluxos complexos e de alta escala</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                Estes componentes permitem criar automações sofisticadas com loops, transformações de dados e orquestração de processos.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ComponentCard 
                  icon={Repeat} 
                  title="Loop For Each" 
                  description="Itera sobre uma lista executando ações para cada item. Ideal para processamento em lote."
                  color="#6366f1"
                  config={['collection', 'itemVariable', 'indexVariable']}
                />
                <ComponentCard 
                  icon={ArrowRightLeft} 
                  title="Data Transform" 
                  description="Aplica operações de map, filter e reduce em conjuntos de dados."
                  color="#6366f1"
                  config={['operation', 'expression', 'outputVariable']}
                />
                <ComponentCard 
                  icon={Radio} 
                  title="Event Emitter" 
                  description="Emite eventos que podem disparar outros fluxos ou sistemas externos."
                  color="#6366f1"
                  config={['eventName', 'payload', 'async']}
                />
                <ComponentCard 
                  icon={Workflow} 
                  title="Subflow Call" 
                  description="Chama outro fluxo como uma função reutilizável."
                  color="#6366f1"
                  config={['subflowId', 'inputMapping', 'outputMapping']}
                />
              </div>

              <InfoCard title="Performance em Escala" variant="success">
                Para fluxos que processam grandes volumes, utilize o componente <strong>Webhook Queue</strong> para 
                enfileirar requisições e o <strong>Rate Limit</strong> para controlar a taxa de execução.
              </InfoCard>
            </section>

            {/* ========== AGENTE IA ========== */}
            <section id="ai">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Agente IA</h2>
                  <p className="text-muted-foreground">Inteligência artificial integrada nativamente</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                O Flow Builder possui integração nativa com modelos de IA, permitindo criar bots inteligentes, 
                analisar intenções, tomar decisões e processar linguagem natural.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ComponentCard 
                  icon={MessageSquare} 
                  title="AI Prompt Execute" 
                  description="Executa um prompt em um modelo de IA e retorna a resposta. Suporta múltiplos provedores."
                  color="#f59e0b"
                  config={['prompt', 'model', 'temperature', 'maxTokens']}
                />
                <ComponentCard 
                  icon={Brain} 
                  title="AI Chat Context" 
                  description="Mantém contexto de conversa entre múltiplas interações para respostas mais naturais."
                  color="#f59e0b"
                  config={['contextId', 'maxMessages', 'systemPrompt']}
                />
                <ComponentCard 
                  icon={GitBranch} 
                  title="AI Decision" 
                  description="Usa IA para tomar decisões estruturadas retornando JSON parseável."
                  color="#f59e0b"
                  config={['prompt', 'outputSchema', 'strictMode']}
                />
                <ComponentCard 
                  icon={Database} 
                  title="AI Embedding" 
                  description="Gera embeddings vetoriais para busca semântica e similaridade."
                  color="#f59e0b"
                  config={['text', 'model', 'storeInVariable']}
                />
              </div>

              <CodeBlock 
                title="Exemplo: Prompt de Classificação"
                code={`{
  "prompt": "Classifique a intenção do cliente baseado na mensagem: '{{mensagem}}'",
  "model": "gpt-4o-mini",
  "temperature": 0.3,
  "outputSchema": {
    "intent": "string",
    "confidence": "number",
    "suggestedAction": "string"
  }
}`}
              />
            </section>

            {/* ========== WEBHOOKS UNIVERSAIS ========== */}
            <section id="webhooks">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Webhook className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Webhooks Universais</h2>
                  <p className="text-muted-foreground">Receba e processe eventos de qualquer sistema externo</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                A categoria de webhooks permite integrar qualquer sistema externo com validação, 
                autenticação, rate limiting e processamento de payloads.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <ComponentCard 
                  icon={Webhook} 
                  title="Webhook Universal Trigger" 
                  description="Recebe webhooks de qualquer origem com validação flexível de payload."
                  color="#06b6d4"
                  config={['path', 'methods[]', 'validation']}
                />
                <ComponentCard 
                  icon={Shield} 
                  title="Webhook Auth Guard" 
                  description="Valida autenticação via API Key, Bearer Token ou assinatura HMAC."
                  color="#06b6d4"
                  config={['authType', 'secret', 'headerName']}
                />
                <ComponentCard 
                  icon={FileJson} 
                  title="Payload Parser" 
                  description="Extrai dados do payload usando JSONPath, XPath ou Regex."
                  color="#06b6d4"
                  config={['parseMethod', 'expression', 'outputVariable']}
                />
                <ComponentCard 
                  icon={ListOrdered} 
                  title="Webhook Queue" 
                  description="Enfileira webhooks para processamento assíncrono e ordenado."
                  color="#06b6d4"
                  config={['queueName', 'priority', 'retryPolicy']}
                />
                <ComponentCard 
                  icon={Reply} 
                  title="Webhook Response" 
                  description="Define resposta HTTP customizada para o webhook recebido."
                  color="#06b6d4"
                  config={['statusCode', 'headers', 'body']}
                />
                <ComponentCard 
                  icon={FilterX} 
                  title="Deduplication" 
                  description="Evita processamento duplicado usando identificador único."
                  color="#06b6d4"
                  config={['deduplicationKey', 'windowSeconds']}
                />
              </div>
            </section>

            {/* ========== VARIÁVEIS E CONTEXTO ========== */}
            <section id="variaveis">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Database className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Variáveis e Contexto</h2>
                  <p className="text-muted-foreground">Como armazenar e usar dados durante a execução</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                O Flow Builder mantém um contexto de execução onde você pode armazenar e recuperar variáveis. 
                As variáveis podem ter diferentes escopos e tempos de vida.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Variáveis de Execução</CardTitle>
                    <CardDescription>Escopo: Execução atual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Existem apenas durante a execução atual do fluxo. Perfeitas para dados temporários.
                    </p>
                    <Badge variant="outline" className="mt-3">{"{{variavel}}"}</Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Variáveis de Sessão</CardTitle>
                    <CardDescription>Escopo: Conversa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Persistem durante toda a conversa com o usuário. Ideais para dados de contexto.
                    </p>
                    <Badge variant="outline" className="mt-3">{"{{session.nome}}"}</Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Variáveis Globais</CardTitle>
                    <CardDescription>Escopo: Fluxo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Disponíveis em todo o fluxo. Use para configurações e constantes.
                    </p>
                    <Badge variant="outline" className="mt-3">{"{{global.apiKey}}"}</Badge>
                  </CardContent>
                </Card>
              </div>

              <CodeBlock 
                title="Exemplo: Usando Variáveis"
                code={`// Acessar dados do contato
{{contact.name}}
{{contact.phone}}

// Usar resposta capturada
{{ultimaResposta}}

// Dados da requisição HTTP
{{httpResponse.data.id}}
{{httpResponse.status}}

// Variáveis de sistema
{{now}}
{{flowId}}
{{executionId}}`}
              />
            </section>

            {/* ========== BOAS PRÁTICAS ========== */}
            <section id="boas-praticas">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Boas Práticas</h2>
                  <p className="text-muted-foreground">Recomendações para criar fluxos robustos</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <InfoCard title="1. Sempre tenha tratamento de erros" variant="success">
                  Use nós de tratamento de erro em pontos críticos do fluxo, especialmente após chamadas HTTP e 
                  operações de IA. Configure fallbacks para quando serviços externos estiverem indisponíveis.
                </InfoCard>
                
                <InfoCard title="2. Use timeouts adequados" variant="tip">
                  Configure timeouts realistas nos nós de aguardar resposta. Um timeout muito curto frustra o usuário, 
                  muito longo pode travar recursos. Recomendamos 30-60 segundos para respostas simples.
                </InfoCard>
                
                <InfoCard title="3. Evite loops infinitos" variant="warning">
                  O sistema detecta loops automaticamente, mas evite criar lógicas onde um fluxo pode chamar a si mesmo 
                  indefinidamente. Use contadores e condições de saída.
                </InfoCard>
                
                <InfoCard title="4. Modularize com subfluxos" variant="tip">
                  Para lógicas que se repetem, crie subfluxos reutilizáveis. Isso facilita manutenção e testes.
                </InfoCard>
                
                <InfoCard title="5. Documente com nomes claros" variant="info">
                  Dê nomes descritivos aos seus fluxos e nós. "Atendimento Inicial - Menu Principal" é melhor 
                  que "Fluxo 1". Seu eu futuro agradece!
                </InfoCard>
              </div>
            </section>

            {/* ========== EXEMPLOS PRÁTICOS ========== */}
            <section id="exemplos">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Exemplos Práticos</h2>
                  <p className="text-muted-foreground">Fluxos prontos para inspirar seus projetos</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <FlowExample
                  title="Atendimento com Menu de Opções"
                  description="Fluxo básico de atendimento com menu de botões e direcionamento para áreas específicas."
                  nodes={[
                    { label: 'Início', type: 'trigger', color: '#25D366' },
                    { label: 'Boas-vindas', type: 'message', color: '#25D366' },
                    { label: 'Menu', type: 'buttons', color: '#128C7E' },
                    { label: 'Decisão', type: 'condition', color: '#a855f7' },
                    { label: 'Resposta', type: 'message', color: '#25D366' }
                  ]}
                />
                
                <FlowExample
                  title="Qualificação de Lead com IA"
                  description="Usa inteligência artificial para qualificar leads e direcionar para vendedor adequado."
                  nodes={[
                    { label: 'Webhook', type: 'trigger', color: '#22c55e' },
                    { label: 'AI Classify', type: 'ai', color: '#f59e0b' },
                    { label: 'Switch', type: 'condition', color: '#a855f7' },
                    { label: 'Tag Lead', type: 'action', color: '#3b82f6' },
                    { label: 'Notificar', type: 'action', color: '#3b82f6' }
                  ]}
                />
                
                <FlowExample
                  title="Agendamento Automático"
                  description="Sistema completo de agendamento com verificação de disponibilidade e confirmação."
                  nodes={[
                    { label: 'Início', type: 'trigger', color: '#25D366' },
                    { label: 'Perguntar Data', type: 'message', color: '#25D366' },
                    { label: 'Aguardar', type: 'wait', color: '#34B7F1' },
                    { label: 'Verificar API', type: 'http', color: '#3b82f6' },
                    { label: 'Disponível?', type: 'condition', color: '#a855f7' },
                    { label: 'Confirmar', type: 'message', color: '#25D366' }
                  ]}
                />
                
                <FlowExample
                  title="Integração E-commerce"
                  description="Recebe webhook de nova venda e dispara fluxo de pós-venda automatizado."
                  nodes={[
                    { label: 'Webhook', type: 'trigger', color: '#22c55e' },
                    { label: 'Parse', type: 'webhook', color: '#06b6d4' },
                    { label: 'Salvar DB', type: 'action', color: '#3b82f6' },
                    { label: 'WhatsApp', type: 'message', color: '#25D366' },
                    { label: 'Email', type: 'action', color: '#3b82f6' }
                  ]}
                />
              </div>
            </section>

            {/* ========== LUNA IA ========== */}
            <section id="luna">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl overflow-hidden ring-4 ring-primary/20">
                  <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Luna IA - Sua Arquiteta</h2>
                  <p className="text-muted-foreground">Crie fluxos complexos conversando naturalmente</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">
                A <strong className="text-foreground">Luna</strong> é uma IA arquiteta de fluxos integrada ao Flow Builder. 
                Basta descrever o que você precisa automatizar em linguagem natural e ela constrói o fluxo completo para você.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Como Funciona
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p><strong>1.</strong> Clique em "Criar com Luna IA" no canvas vazio ou na barra de ferramentas</p>
                    <p><strong>2.</strong> Descreva em português o que você quer automatizar</p>
                    <p><strong>3.</strong> Luna analisa e propõe uma arquitetura de fluxo</p>
                    <p><strong>4.</strong> Você aprova e ela constrói o fluxo em tempo real</p>
                  </CardContent>
                </Card>
                
                <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Dicas para Bons Prompts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>• Seja específico sobre o objetivo do fluxo</p>
                    <p>• Mencione integrações necessárias (WhatsApp, APIs, etc)</p>
                    <p>• Descreva condições e ramificações desejadas</p>
                    <p>• Indique se precisa de IA para respostas inteligentes</p>
                  </CardContent>
                </Card>
              </div>

              <InfoCard title="Exemplos de Prompts para Luna" variant="tip">
                <ul className="space-y-2 mt-2">
                  <li>• "Crie um atendimento ao cliente com menu de opções para suporte, vendas e financeiro"</li>
                  <li>• "Quero um funil de vendas que qualifica leads perguntando sobre orçamento e prazo"</li>
                  <li>• "Monte um sistema de agendamento que verifica disponibilidade via API e confirma com o cliente"</li>
                  <li>• "Preciso de um bot que responde perguntas frequentes usando IA"</li>
                </ul>
              </InfoCard>
            </section>

            {/* Footer */}
            <div className="border-t pt-12 mt-12">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Precisa de ajuda?</h3>
                <p className="text-muted-foreground mb-4">
                  Nossa equipe está pronta para ajudar você a criar automações incríveis.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/genesis')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Painel
                  </Button>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Falar com Suporte
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
