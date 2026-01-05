import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Book, Zap, MessageSquare, GitBranch, Globe, Brain, Shield,
  Server, Lock, Webhook, Repeat, Play, Clock, Send, List, LayoutGrid,
  Tag, AlertTriangle, RefreshCw, Gauge, Calendar, Radio, Workflow,
  ChevronRight, Sparkles, CheckCircle2, Info, ExternalLink, Copy,
  Smartphone, Inbox, Timer, ListPlus, UserCog, HeartPulse, ShieldAlert,
  FileJson, Reply, FilterX, ListOrdered, GitMerge, Layers, Bot, Shuffle
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
  { id: 'automacao', title: 'Automação', icon: Repeat },
  { id: 'estabilidade', title: 'Estabilidade', icon: Shield },
  { id: 'infraestrutura', title: 'Infraestrutura', icon: Server },
  { id: 'seguranca', title: 'Segurança', icon: Lock },
  { id: 'ai', title: 'Agente IA', icon: Brain },
  { id: 'webhooks', title: 'Webhooks', icon: Webhook },
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
  <div className="p-4 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-colors">
    <div className="flex items-start gap-3">
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        {config && config.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {config.map((c, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] h-4 px-1.5">
                {c}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const CodeBlock = ({ code, language = 'json' }: { code: string; language?: string }) => (
  <div className="relative group">
    <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs">
      <code>{code}</code>
    </pre>
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => { navigator.clipboard.writeText(code); toast.success('Copiado!'); }}
    >
      <Copy className="w-3 h-3" />
    </Button>
  </div>
);

const FlowExample = ({ title, description, nodes }: { 
  title: string; 
  description: string; 
  nodes: { label: string; type: string; color: string }[];
}) => (
  <div className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/30">
    <h4 className="font-semibold text-sm mb-1">{title}</h4>
    <p className="text-xs text-muted-foreground mb-3">{description}</p>
    <div className="flex items-center gap-2 flex-wrap">
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center gap-1">
          <div 
            className="px-2 py-1 rounded text-[10px] font-medium text-white"
            style={{ backgroundColor: node.color }}
          >
            {node.label}
          </div>
          {i < nodes.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        </div>
      ))}
    </div>
  </div>
);

export default function FlowBuilderDocs() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('introducao');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/genesis')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Book className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Documentação Flow Builder</h1>
              <p className="text-[10px] text-muted-foreground">Genesis Hub - Motor de Automação</p>
            </div>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="gap-1">
              <Layers className="w-3 h-3" />
              70+ Componentes
            </Badge>
          </div>
        </div>
      </header>

      <div className="container flex gap-6 py-6">
        {/* Sidebar Navigation */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <nav className="sticky top-20 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Navegação
            </p>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    activeSection === section.id 
                      ? "bg-primary/10 text-primary font-medium" 
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
          <div className="max-w-4xl space-y-12">
            
            {/* Introdução */}
            <section id="introducao">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Book className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold">Introdução ao Flow Builder</h2>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  O Flow Builder do Genesis Hub é um motor de automação visual profissional inspirado no n8n. 
                  Permite criar fluxos complexos arrastando e conectando componentes, sem escrever código.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        70+ Componentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Biblioteca completa de nós para WhatsApp, APIs, IA, webhooks e muito mais.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="w-4 h-4 text-amber-500" />
                        IA Integrada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Nós nativos de IA para respostas inteligentes, decisões e embeddings.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-500" />
                        Enterprise Ready
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Controle de infraestrutura, segurança e estabilidade incluídos.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Filosofia do Sistema</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        O Flow Builder é <strong>agnóstico de canal</strong>: você pode criar automações 
                        que funcionam com WhatsApp, webhooks, APIs externas ou de forma totalmente independente. 
                        Os fluxos seguem um ciclo de vida formal (Draft → Validated → Active → Paused).
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Primeiros Passos */}
            <section id="primeiros-passos">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Primeiros Passos</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">1. Criando um novo fluxo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Acesse o painel Genesis e clique em <strong>"+ Novo Fluxo"</strong>. 
                    O fluxo será criado com status <Badge variant="outline">DRAFT</Badge>.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Adicionando componentes</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use um dos métodos abaixo:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Clique em "Adicionar passo..."</strong> no canvas vazio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Botão "Componentes"</strong> na barra de ferramentas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Arraste e solte</strong> do modal de componentes</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Conectando nós</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Clique no <strong>ponto de saída</strong> (●) de um nó e arraste até o 
                    <strong> ponto de entrada</strong> de outro. As conexões são validadas automaticamente.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4. Ativando o fluxo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Clique em <strong>"Ativar"</strong> para validar e publicar. O sistema verificará:
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Presença de nó inicial (trigger)</li>
                    <li>• Ausência de loops infinitos</li>
                    <li>• Conexões válidas entre nós</li>
                    <li>• Dependências de instância WhatsApp</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* WhatsApp */}
            <section id="whatsapp">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-[#25D366]" />
                <h2 className="text-2xl font-bold">Nós WhatsApp Nativos</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Componentes específicos para automação via WhatsApp. Requerem uma instância conectada.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={Play} 
                  title="Início do Fluxo" 
                  description="Ponto de partida quando uma mensagem é recebida"
                  color="#25D366"
                  config={['triggerType']}
                />
                <ComponentCard 
                  icon={MessageSquare} 
                  title="Enviar Texto" 
                  description="Envia mensagem de texto simples"
                  color="#25D366"
                  config={['text', 'typing', 'typingDuration']}
                />
                <ComponentCard 
                  icon={LayoutGrid} 
                  title="Enviar Botões" 
                  description="Mensagem com botões de resposta rápida (máx. 3)"
                  color="#128C7E"
                  config={['text', 'buttons[]']}
                />
                <ComponentCard 
                  icon={List} 
                  title="Enviar Lista" 
                  description="Menu de lista interativa com seções"
                  color="#075E54"
                  config={['title', 'buttonText', 'sections[]']}
                />
                <ComponentCard 
                  icon={Clock} 
                  title="Aguardar Resposta" 
                  description="Pausa e aguarda resposta do cliente"
                  color="#34B7F1"
                  config={['timeout', 'saveResponseTo']}
                />
                <ComponentCard 
                  icon={Inbox} 
                  title="Receber Mensagem" 
                  description="Captura mensagem e mídia recebida"
                  color="#25D366"
                  config={['saveAs', 'captureMedia']}
                />
              </div>

              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <strong>Importante:</strong> Estes nós só funcionam com uma instância WhatsApp conectada. 
                    Configure sua instância em "Instâncias" antes de ativar fluxos com estes componentes.
                  </p>
                </div>
              </div>
            </section>

            {/* Gatilhos */}
            <section id="gatilhos">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-green-500" />
                <h2 className="text-2xl font-bold">Gatilhos</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Definem como e quando um fluxo é iniciado. Todo fluxo precisa de pelo menos um gatilho.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={MessageSquare} 
                  title="Mensagem Recebida" 
                  description="Inicia quando palavras-chave são detectadas"
                  color="#22c55e"
                  config={['keywords[]', 'matchType']}
                />
                <ComponentCard 
                  icon={Zap} 
                  title="Primeiro Contato" 
                  description="Dispara no primeiro contato do cliente"
                  color="#22c55e"
                  config={['triggerType']}
                />
                <ComponentCard 
                  icon={Webhook} 
                  title="Webhook Trigger" 
                  description="Inicia por chamada HTTP externa"
                  color="#8b5cf6"
                  config={['method', 'path', 'secret']}
                />
                <ComponentCard 
                  icon={Calendar} 
                  title="Agendamento Cron" 
                  description="Execução agendada (ex: 0 9 * * *)"
                  color="#a78bfa"
                  config={['cron_expression', 'timezone']}
                />
              </div>
            </section>

            {/* Condições */}
            <section id="condicoes">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="w-5 h-5 text-yellow-500" />
                <h2 className="text-2xl font-bold">Condições</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Dividem o fluxo em caminhos diferentes baseado em lógica. Possuem saídas "SIM" e "NÃO".
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={GitBranch} 
                  title="Condição" 
                  description="Compara campo com valor esperado"
                  color="#eab308"
                  config={['field', 'operator', 'value']}
                />
                <ComponentCard 
                  icon={Shuffle} 
                  title="Split A/B" 
                  description="Divide tráfego em porcentagens"
                  color="#f97316"
                  config={['percentageA']}
                />
                <ComponentCard 
                  icon={Clock} 
                  title="Horário Comercial" 
                  description="Verifica se está dentro do horário"
                  color="#eab308"
                  config={['startHour', 'endHour', 'days']}
                />
                <ComponentCard 
                  icon={GitMerge} 
                  title="Switch/Case" 
                  description="Roteamento múltiplo por valor"
                  color="#5b21b6"
                  config={['expression', 'cases[]']}
                />
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Operadores disponíveis</h3>
                <div className="flex flex-wrap gap-2">
                  {['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'].map(op => (
                    <Badge key={op} variant="secondary" className="text-xs">{op}</Badge>
                  ))}
                </div>
              </div>
            </section>

            {/* Ações */}
            <section id="acoes">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-blue-500" />
                <h2 className="text-2xl font-bold">Ações</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={Send} 
                  title="Enviar Mensagem" 
                  description="Envia texto com simulação de digitação"
                  color="#3b82f6"
                  config={['text', 'typing']}
                />
                <ComponentCard 
                  icon={Globe} 
                  title="Chamar API" 
                  description="Requisição HTTP para sistemas externos"
                  color="#64748b"
                  config={['url', 'method', 'headers', 'body']}
                />
                <ComponentCard 
                  icon={Brain} 
                  title="Resposta IA" 
                  description="Gera resposta com inteligência artificial"
                  color="#14b8a6"
                  config={['prompt', 'model', 'temperature']}
                />
                <ComponentCard 
                  icon={Tag} 
                  title="Definir Variável" 
                  description="Salva valor no contexto do fluxo"
                  color="#10b981"
                  config={['name', 'value', 'scope']}
                />
              </div>
            </section>

            {/* Automação */}
            <section id="automacao">
              <div className="flex items-center gap-2 mb-4">
                <Repeat className="w-5 h-5 text-purple-500" />
                <h2 className="text-2xl font-bold">Automação Avançada</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Nós agnósticos de canal para lógicas complexas. Funcionam independentemente do WhatsApp.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={Globe} 
                  title="HTTP Request" 
                  description="Requisição avançada com auth e retries"
                  color="#7c3aed"
                  config={['method', 'url', 'auth_type', 'retries']}
                />
                <ComponentCard 
                  icon={Repeat} 
                  title="Loop For Each" 
                  description="Itera sobre array de itens"
                  color="#6d28d9"
                  config={['array_source', 'item_variable', 'limit']}
                />
                <ComponentCard 
                  icon={ExternalLink} 
                  title="Chamar Subfluxo" 
                  description="Executa outro fluxo como subrotina"
                  color="#4c1d95"
                  config={['flow_id', 'parameters', 'timeout']}
                />
                <ComponentCard 
                  icon={Radio} 
                  title="Emitir Evento" 
                  description="Dispara evento interno para outros fluxos"
                  color="#9333ea"
                  config={['event_name', 'payload', 'scope']}
                />
                <ComponentCard 
                  icon={Workflow} 
                  title="Transformar Dados" 
                  description="Map, filter, reduce em dados"
                  color="#a855f7"
                  config={['operation', 'source', 'expression']}
                />
              </div>
            </section>

            {/* Estabilidade */}
            <section id="estabilidade">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-orange-500" />
                <h2 className="text-2xl font-bold">Estabilidade & Resiliência</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Protegem seu fluxo contra falhas, limites de rate e problemas de conexão.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={Send} 
                  title="Fila de Envio" 
                  description="Envia via fila com garantia de entrega"
                  color="#f97316"
                  config={['priority', 'retry_limit', 'expiration']}
                />
                <ComponentCard 
                  icon={Shield} 
                  title="Proteção de Sessão" 
                  description="Limita mensagens para evitar ban"
                  color="#ea580c"
                  config={['max_per_minute', 'burst_limit', 'cooldown']}
                />
                <ComponentCard 
                  icon={Timer} 
                  title="Timeout Handler" 
                  description="Captura timeout e executa fallback"
                  color="#c2410c"
                  config={['timeout_seconds', 'on_timeout']}
                />
                <ComponentCard 
                  icon={RefreshCw} 
                  title="Política de Retry" 
                  description="Retentativas com backoff exponencial"
                  color="#fdba74"
                  config={['max_attempts', 'delay_seconds', 'jitter']}
                />
                <ComponentCard 
                  icon={Gauge} 
                  title="Limite de Taxa" 
                  description="Controla ritmo de execução"
                  color="#ffedd5"
                  config={['messages_per_minute', 'on_limit']}
                />
              </div>
            </section>

            {/* Infraestrutura */}
            <section id="infraestrutura">
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-5 h-5 text-cyan-500" />
                <h2 className="text-2xl font-bold">Infraestrutura</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Controle avançado de onde e como o fluxo é executado. Para casos enterprise.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={Globe} 
                  title="Atribuir Proxy" 
                  description="Associa proxy à execução"
                  color="#06b6d4"
                  config={['proxy_pool', 'type', 'sticky', 'ttl']}
                />
                <ComponentCard 
                  icon={Server} 
                  title="Atribuir Worker" 
                  description="Seleciona VPS/worker específico"
                  color="#0e7490"
                  config={['region', 'max_capacity', 'fallback']}
                />
                <ComponentCard 
                  icon={Play} 
                  title="Disparo Controlado" 
                  description="Execução em lotes com espaçamento"
                  color="#164e63"
                  config={['quantity', 'spacing', 'max_parallel']}
                />
                <ComponentCard 
                  icon={UserCog} 
                  title="Rotacionar Identidade" 
                  description="Troca proxy/worker/instância"
                  color="#22d3ee"
                  config={['rotate_proxy', 'rotate_worker']}
                />
              </div>
            </section>

            {/* Segurança */}
            <section id="seguranca">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-red-500" />
                <h2 className="text-2xl font-bold">Segurança</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={ShieldAlert} 
                  title="Limite de Execução" 
                  description="Protege contra abuso por tenant"
                  color="#dc2626"
                  config={['max_concurrent', 'max_per_hour', 'max_per_day']}
                />
                <ComponentCard 
                  icon={Gauge} 
                  title="Limite de Infraestrutura" 
                  description="Limita CPU, memória, throughput"
                  color="#b91c1c"
                  config={['cpu_limit', 'memory_limit', 'cooldown']}
                />
                <ComponentCard 
                  icon={HeartPulse} 
                  title="Condição de Saúde" 
                  description="Decisão baseada em health check"
                  color="#991b1b"
                  config={['check_proxy', 'check_worker', 'latency_threshold']}
                />
                <ComponentCard 
                  icon={Lock} 
                  title="Contexto Seguro" 
                  description="Isola execução e previne vazamento"
                  color="#7f1d1d"
                  config={['isolate', 'prevent_leak', 'allowed_variables']}
                />
              </div>
            </section>

            {/* Agente IA */}
            <section id="ai">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-amber-500" />
                <h2 className="text-2xl font-bold">Agente IA</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Integração nativa com modelos de IA. Plug-and-play com Lovable AI ou OpenAI.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={Brain} 
                  title="Executar Prompt IA" 
                  description="Executa prompt em modelo configurável"
                  color="#eab308"
                  config={['prompt', 'model', 'temperature', 'max_tokens']}
                />
                <ComponentCard 
                  icon={MessageSquare} 
                  title="Contexto de Chat" 
                  description="Mantém histórico conversacional"
                  color="#ca8a04"
                  config={['context_scope', 'max_history', 'auto_summarize']}
                />
                <ComponentCard 
                  icon={GitBranch} 
                  title="Decisão IA" 
                  description="Retorna decisão estruturada em JSON"
                  color="#a16207"
                  config={['decision_prompt', 'options[]', 'confidence']}
                />
                <ComponentCard 
                  icon={Zap} 
                  title="Embedding IA" 
                  description="Gera embeddings para busca semântica"
                  color="#854d0e"
                  config={['text_source', 'model', 'top_k']}
                />
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Modelos disponíveis</h3>
                <div className="flex flex-wrap gap-2">
                  {['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5', 'openai/gpt-5-mini'].map(m => (
                    <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                  ))}
                </div>
              </div>
            </section>

            {/* Webhooks */}
            <section id="webhooks">
              <div className="flex items-center gap-2 mb-4">
                <Webhook className="w-5 h-5 text-cyan-500" />
                <h2 className="text-2xl font-bold">Webhooks Universais</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Gateway universal para receber e processar eventos de qualquer sistema externo.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <ComponentCard 
                  icon={Webhook} 
                  title="Trigger Universal" 
                  description="Entrada do fluxo via webhook"
                  color="#06b6d4"
                  config={['webhook_id', 'expose_headers', 'expose_body']}
                />
                <ComponentCard 
                  icon={Lock} 
                  title="Autenticação" 
                  description="Valida token, HMAC, IP whitelist"
                  color="#0891b2"
                  config={['auth_type', 'token', 'hmac_secret']}
                />
                <ComponentCard 
                  icon={Shield} 
                  title="Verificar Assinatura" 
                  description="Valida assinatura Stripe/GitHub"
                  color="#0e7490"
                  config={['signature_header', 'secret', 'algorithm']}
                />
                <ComponentCard 
                  icon={Gauge} 
                  title="Rate Limit" 
                  description="Limite por webhook e IP"
                  color="#155e75"
                  config={['limit_per_minute', 'burst_limit']}
                />
                <ComponentCard 
                  icon={FileJson} 
                  title="Parser de Payload" 
                  description="Extrai dados com JSONPath/XPath/Regex"
                  color="#67e8f9"
                  config={['parser_type', 'extractions[]']}
                />
                <ComponentCard 
                  icon={GitBranch} 
                  title="Roteador de Eventos" 
                  description="Roteamento por tipo de evento"
                  color="#a5f3fc"
                  config={['route_field', 'routes[]']}
                />
                <ComponentCard 
                  icon={Reply} 
                  title="Resposta HTTP" 
                  description="Response customizada ao caller"
                  color="#cffafe"
                  config={['status_code', 'headers', 'body']}
                />
                <ComponentCard 
                  icon={AlertTriangle} 
                  title="Dead Letter Queue" 
                  description="Captura falhas para reprocessar"
                  color="#083344"
                  config={['capture_on', 'max_retries', 'notify']}
                />
              </div>
            </section>

            {/* Exemplos Práticos */}
            <section id="exemplos">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Exemplos Práticos</h2>
              </div>
              
              <div className="space-y-4">
                <FlowExample 
                  title="Atendimento Básico"
                  description="Responde automaticamente a mensagens de boas-vindas"
                  nodes={[
                    { label: 'Início', type: 'wa_start', color: '#25D366' },
                    { label: 'Condição', type: 'condition', color: '#eab308' },
                    { label: 'Enviar Texto', type: 'wa_send_text', color: '#25D366' },
                    { label: 'Fim', type: 'end', color: '#ef4444' }
                  ]}
                />

                <FlowExample 
                  title="Funil de Vendas com IA"
                  description="Qualifica leads e responde com inteligência artificial"
                  nodes={[
                    { label: 'Início', type: 'wa_start', color: '#25D366' },
                    { label: 'Contexto Chat', type: 'ai_chat_context', color: '#ca8a04' },
                    { label: 'Decisão IA', type: 'ai_decision', color: '#a16207' },
                    { label: 'Enviar Botões', type: 'wa_send_buttons', color: '#128C7E' },
                    { label: 'Aguardar', type: 'wa_wait_response', color: '#34B7F1' }
                  ]}
                />

                <FlowExample 
                  title="Integração E-commerce"
                  description="Recebe webhook do Shopify e notifica no WhatsApp"
                  nodes={[
                    { label: 'Webhook', type: 'webhook_universal_trigger', color: '#06b6d4' },
                    { label: 'Auth Guard', type: 'webhook_auth_guard', color: '#0891b2' },
                    { label: 'Parser', type: 'webhook_payload_parser', color: '#67e8f9' },
                    { label: 'Enviar Texto', type: 'wa_send_text', color: '#25D366' },
                    { label: 'Response', type: 'webhook_response', color: '#cffafe' }
                  ]}
                />

                <FlowExample 
                  title="Automação Resiliente"
                  description="Fluxo com proteção anti-spam e retry automático"
                  nodes={[
                    { label: 'Início', type: 'wa_start', color: '#25D366' },
                    { label: 'Session Guard', type: 'session_guard', color: '#ea580c' },
                    { label: 'Rate Limit', type: 'rate_limit', color: '#ffedd5' },
                    { label: 'Fila', type: 'queue_message', color: '#f97316' },
                    { label: 'Retry', type: 'retry_policy', color: '#fdba74' }
                  ]}
                />
              </div>
            </section>

            {/* Luna IA */}
            <section id="luna">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Luna IA - Sua Parceira</h2>
              </div>
              
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/20 shrink-0">
                    <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Construa fluxos conversando</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      A Luna é uma IA especializada em automação. Descreva o que você precisa em 
                      linguagem natural e ela constrói o fluxo automaticamente no canvas.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Exemplos de prompts:</p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>"Crie um fluxo de atendimento ao cliente com menu de opções"</li>
                        <li>"Quero um funil de vendas com qualificação por IA"</li>
                        <li>"Preciso de uma automação que recebe webhook e notifica no WhatsApp"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Processo Deliberativo</h4>
                  <ol className="space-y-1 text-xs text-muted-foreground">
                    <li>1. Entende sua necessidade</li>
                    <li>2. Propõe arquitetura</li>
                    <li>3. Aguarda aprovação</li>
                    <li>4. Constrói no canvas</li>
                  </ol>
                </div>
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Capacidades</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>✓ Gera fluxos complexos</li>
                    <li>✓ Conecta nós automaticamente</li>
                    <li>✓ Aplica boas práticas</li>
                    <li>✓ Explica cada decisão</li>
                  </ul>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
