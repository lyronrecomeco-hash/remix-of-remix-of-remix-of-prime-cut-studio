import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, GitBranch, Clock, Send, Bot, Users,
  ArrowRight, Zap, CheckCircle2, MousePointer, Play,
  Sparkles, AlertCircle, List, Image, FileText, Webhook,
  Database, ShoppingCart, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Tipos de nós reais do Flow Builder Genesis
const nodeTypes = {
  wa_start: { icon: Zap, color: 'from-green-500 to-emerald-600', label: 'Início' },
  wa_send_text: { icon: Send, color: 'from-blue-500 to-cyan-600', label: 'Mensagem' },
  wa_send_buttons: { icon: List, color: 'from-violet-500 to-purple-600', label: 'Botões' },
  wa_send_list: { icon: List, color: 'from-indigo-500 to-blue-600', label: 'Lista' },
  wa_send_image: { icon: Image, color: 'from-pink-500 to-rose-600', label: 'Imagem' },
  wa_wait_response: { icon: Clock, color: 'from-amber-500 to-orange-600', label: 'Aguardar' },
  wa_condition: { icon: GitBranch, color: 'from-purple-500 to-violet-600', label: 'Condição' },
  wa_ai_response: { icon: Bot, color: 'from-cyan-500 to-teal-600', label: 'Luna IA' },
  wa_delay: { icon: Clock, color: 'from-slate-500 to-zinc-600', label: 'Delay' },
  wa_http: { icon: Webhook, color: 'from-orange-500 to-red-600', label: 'HTTP' },
  wa_crm: { icon: Database, color: 'from-emerald-500 to-green-600', label: 'CRM' },
  wa_transfer: { icon: Users, color: 'from-blue-600 to-indigo-600', label: 'Transferir' },
  wa_end: { icon: CheckCircle2, color: 'from-green-500 to-emerald-600', label: 'Fim' },
};

interface FlowNode {
  id: string;
  type: keyof typeof nodeTypes;
  x: number;
  y: number;
  data?: {
    text?: string;
    buttons?: string[];
  };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'success' | 'error' | 'default';
}

// Fluxo real de exemplo - Atendimento Clínica
const demoFlow: FlowNode[] = [
  { id: '1', type: 'wa_start', x: 50, y: 140 },
  { id: '2', type: 'wa_send_buttons', x: 180, y: 140, data: { text: 'Olá! Sou a Luna 👋', buttons: ['Agendar', 'Dúvidas', 'Falar com Humano'] } },
  { id: '3', type: 'wa_condition', x: 340, y: 140 },
  { id: '4', type: 'wa_ai_response', x: 500, y: 60 },
  { id: '5', type: 'wa_http', x: 500, y: 140 },
  { id: '6', type: 'wa_transfer', x: 500, y: 220 },
  { id: '7', type: 'wa_send_text', x: 660, y: 100, data: { text: 'Consulta agendada! ✅' } },
  { id: '8', type: 'wa_end', x: 820, y: 140 },
];

const demoEdges: FlowEdge[] = [
  { id: 'e1', source: '1', target: '2' },
  { id: 'e2', source: '2', target: '3' },
  { id: 'e3', source: '3', target: '4', label: 'Dúvidas', type: 'default' },
  { id: 'e4', source: '3', target: '5', label: 'Agendar', type: 'success' },
  { id: 'e5', source: '3', target: '6', label: 'Humano', type: 'error' },
  { id: 'e6', source: '4', target: '7' },
  { id: 'e7', source: '5', target: '7' },
  { id: 'e8', source: '6', target: '8' },
  { id: 'e9', source: '7', target: '8' },
];

const VendaFlowDemo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [animatingPath, setAnimatingPath] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-play animation
  useEffect(() => {
    if (!isInView || !autoPlay) return;
    
    const sequence = ['1', '2', '3', '5', '7', '8'];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < sequence.length) {
        setActiveNode(sequence[index]);
        setCurrentStep(index);
        index++;
      } else {
        index = 0;
        setCurrentStep(0);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isInView, autoPlay]);

  const runAnimation = useCallback(() => {
    if (animatingPath) return;
    setAnimatingPath(true);
    setAutoPlay(false);
    
    const sequence = ['1', '2', '3', '5', '7', '8'];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < sequence.length) {
        setActiveNode(sequence[index]);
        setCurrentStep(index);
        index++;
      } else {
        clearInterval(interval);
        setAnimatingPath(false);
        setTimeout(() => setAutoPlay(true), 2000);
      }
    }, 800);
  }, [animatingPath]);

  const getEdgeColor = (edge: FlowEdge, isActive: boolean) => {
    if (isActive) return 'hsl(var(--primary))';
    switch (edge.type) {
      case 'success': return 'rgba(34,197,94,0.4)';
      case 'error': return 'rgba(239,68,68,0.4)';
      default: return 'rgba(148,163,184,0.3)';
    }
  };

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <GitBranch className="w-4 h-4" />
            Flow Builder Profissional
            <Badge variant="secondary" className="ml-1 text-[10px]">NOVO</Badge>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Crie automações de
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              nível enterprise
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            O mesmo sistema usado por empresas que faturam <strong className="text-foreground">R$ 1M+/mês</strong>.
            <br className="hidden md:block" />
            Arraste, solte e veja a mágica acontecer. <span className="text-primary font-semibold">Zero código.</span>
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8">
            {[
              { value: '+15', label: 'Componentes' },
              { value: '3min', label: 'Setup médio' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Flow Builder Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
            {/* Mac-style Toolbar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" />
                </div>
                <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-slate-400">fluxo-atendimento-clinica.json</span>
                  <Badge className="text-[9px] py-0 px-1.5 bg-green-500/20 text-green-400 border-green-500/30">Salvo</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runAnimation}
                  disabled={animatingPath}
                  className="gap-2 bg-slate-800/50 border-slate-700/50 hover:bg-primary/20 hover:border-primary/30"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Simular</span>
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative h-[320px] md:h-[380px] bg-slate-900/80 rounded-xl overflow-hidden border border-slate-800/50">
              {/* Dot Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              {/* Connections SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {demoEdges.map((edge) => {
                  const source = demoFlow.find(n => n.id === edge.source);
                  const target = demoFlow.find(n => n.id === edge.target);
                  if (!source || !target) return null;
                  
                  const isActive = activeNode === edge.source || activeNode === edge.target;
                  const sx = source.x + 55;
                  const sy = source.y + 25;
                  const tx = target.x;
                  const ty = target.y + 25;
                  
                  // Curved path
                  const midX = (sx + tx) / 2;
                  const path = `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
                  
                  return (
                    <g key={edge.id}>
                      <motion.path
                        d={path}
                        fill="none"
                        stroke={getEdgeColor(edge, isActive)}
                        strokeWidth={isActive ? 3 : 2}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        style={{ filter: isActive ? 'url(#glow)' : 'none' }}
                      />
                      {/* Animated particle */}
                      {isActive && (
                        <motion.circle
                          r="4"
                          fill="hsl(var(--primary))"
                          initial={{ offsetDistance: '0%' }}
                          animate={{ offsetDistance: '100%' }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{ offsetPath: `path('${path}')` }}
                        />
                      )}
                      {/* Edge Label */}
                      {edge.label && (
                        <text
                          x={midX}
                          y={(sy + ty) / 2 - 8}
                          textAnchor="middle"
                          className="text-[9px] fill-slate-500 font-medium"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {demoFlow.map((node, index) => {
                const nodeType = nodeTypes[node.type];
                const Icon = nodeType.icon;
                const isActive = activeNode === node.id;
                
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.08, type: 'spring', stiffness: 200 }}
                    className="absolute cursor-pointer"
                    style={{ left: node.x, top: node.y }}
                    onMouseEnter={() => !animatingPath && setActiveNode(node.id)}
                    onMouseLeave={() => !animatingPath && !autoPlay && setActiveNode(null)}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        y: isActive ? -2 : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="relative group"
                    >
                      {/* Glow Effect */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`absolute -inset-2 rounded-2xl bg-gradient-to-br ${nodeType.color} blur-xl opacity-40`}
                          />
                        )}
                      </AnimatePresence>
                      
                      {/* Node Card */}
                      <div className={`
                        relative flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl
                        bg-gradient-to-br ${nodeType.color}
                        shadow-lg ${isActive ? 'shadow-primary/50 ring-2 ring-white/20' : 'shadow-black/30'}
                        text-white font-medium text-xs md:text-sm
                        transition-all duration-300
                      `}>
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{nodeType.label}</span>
                        
                        {/* Tooltip on hover */}
                        {node.data?.text && (
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap max-w-[150px] truncate">
                              {node.data.text}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Active Pulse */}
                      {isActive && (
                        <motion.div
                          className="absolute -inset-1 rounded-2xl border-2 border-white/30"
                          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Progress Indicator */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((step) => (
                  <motion.div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      step <= currentStep ? 'bg-primary' : 'bg-slate-700'
                    }`}
                    animate={step === currentStep ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                ))}
              </div>

              {/* Drag Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5 }}
                className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-slate-500"
              >
                <MousePointer className="w-3 h-3" />
                <span className="hidden sm:inline">Arraste para conectar</span>
              </motion.div>
            </div>

            {/* Components Legend */}
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500">Componentes disponíveis</p>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  +15 tipos
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(nodeTypes).slice(0, 8).map(([key, { icon: Icon, color, label }]) => (
                  <motion.div 
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center bg-gradient-to-br ${color}`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-slate-400 hidden sm:inline">{label}</span>
                  </motion.div>
                ))}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/30 border border-dashed border-slate-700/50 text-xs text-slate-500">
                  +7 mais...
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-10 md:mt-12 text-center"
          >
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 border-2 border-background flex items-center justify-center text-[10px] text-white font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">+2.847 empresas</span> já automatizaram
              </p>
            </div>

            <Button asChild size="lg" className="group text-base px-8 py-6 shadow-xl shadow-primary/25">
              <Link to="/genesis" className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                Criar Meu Primeiro Fluxo Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <p className="mt-4 text-sm text-muted-foreground">
              ⚡ Setup em 5 minutos • Sem cartão de crédito • Suporte incluso
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaFlowDemo;
