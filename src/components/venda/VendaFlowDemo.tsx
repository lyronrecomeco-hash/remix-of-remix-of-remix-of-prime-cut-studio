import { useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  MessageSquare, GitBranch, Clock, Send, Bot, 
  ArrowRight, Plus, Zap, CheckCircle, MousePointer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface DemoNode {
  id: string;
  type: 'start' | 'message' | 'condition' | 'ai' | 'delay' | 'end';
  label: string;
  x: number;
  y: number;
  connected?: string[];
}

const initialNodes: DemoNode[] = [
  { id: '1', type: 'start', label: 'Início', x: 50, y: 150, connected: ['2'] },
  { id: '2', type: 'message', label: 'Saudação', x: 200, y: 150, connected: ['3'] },
  { id: '3', type: 'condition', label: 'Horário?', x: 380, y: 150, connected: ['4', '5'] },
  { id: '4', type: 'ai', label: 'Luna IA', x: 520, y: 80, connected: ['6'] },
  { id: '5', type: 'delay', label: 'Aguardar', x: 520, y: 220, connected: ['6'] },
  { id: '6', type: 'end', label: 'Fim', x: 680, y: 150 },
];

const nodeIcons = {
  start: Zap,
  message: MessageSquare,
  condition: GitBranch,
  ai: Bot,
  delay: Clock,
  end: CheckCircle,
};

const nodeColors = {
  start: 'from-green-500 to-emerald-600',
  message: 'from-blue-500 to-cyan-600',
  condition: 'from-amber-500 to-orange-600',
  ai: 'from-violet-500 to-purple-600',
  delay: 'from-slate-500 to-zinc-600',
  end: 'from-emerald-500 to-green-600',
};

const VendaFlowDemo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [animatingPath, setAnimatingPath] = useState(false);

  const runAnimation = useCallback(() => {
    if (animatingPath) return;
    setAnimatingPath(true);
    
    const sequence = ['1', '2', '3', '4', '6'];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < sequence.length) {
        setActiveNode(sequence[index]);
        index++;
      } else {
        clearInterval(interval);
        setAnimatingPath(false);
        setActiveNode(null);
      }
    }, 800);
  }, [animatingPath]);

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary">
            <GitBranch className="w-4 h-4" />
            Flow Builder Visual
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Crie automações complexas
            <br />
            <span className="text-muted-foreground">arrastando e soltando</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zero código. Interface visual intuitiva. Construa fluxos de atendimento 
            profissionais em minutos.
          </p>
        </motion.div>

        {/* Flow Builder Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-6 bg-slate-950/50 backdrop-blur border-border/50 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-sm text-muted-foreground">flow-atendimento.json</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runAnimation}
                  disabled={animatingPath}
                  className="gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Simular Fluxo
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative h-[300px] bg-slate-900/50 rounded-xl overflow-hidden">
              {/* Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              {/* Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {initialNodes.map((node) =>
                  node.connected?.map((targetId) => {
                    const target = initialNodes.find((n) => n.id === targetId);
                    if (!target) return null;
                    
                    const isActive = activeNode === node.id || activeNode === targetId;
                    
                    return (
                      <motion.line
                        key={`${node.id}-${targetId}`}
                        x1={node.x + 40}
                        y1={node.y + 25}
                        x2={target.x}
                        y2={target.y + 25}
                        stroke={isActive ? 'hsl(var(--primary))' : 'rgba(148,163,184,0.3)'}
                        strokeWidth={isActive ? 3 : 2}
                        strokeDasharray={isActive ? '0' : '5,5'}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    );
                  })
                )}
              </svg>

              {/* Nodes */}
              {initialNodes.map((node, index) => {
                const Icon = nodeIcons[node.type];
                const isActive = activeNode === node.id;
                
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className={`absolute cursor-pointer transition-all duration-300 ${
                      isActive ? 'scale-110 z-10' : 'hover:scale-105'
                    }`}
                    style={{ left: node.x, top: node.y }}
                    onMouseEnter={() => !animatingPath && setActiveNode(node.id)}
                    onMouseLeave={() => !animatingPath && setActiveNode(null)}
                  >
                    <div className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl
                      bg-gradient-to-br ${nodeColors[node.type]}
                      shadow-lg ${isActive ? 'shadow-primary/50 ring-2 ring-primary/50' : 'shadow-black/20'}
                      text-white font-medium text-sm
                    `}>
                      <Icon className="w-4 h-4" />
                      {node.label}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add Node Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 }}
                className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <MousePointer className="w-3 h-3" />
                Arraste para criar conexões
              </motion.div>
            </div>

            {/* Node Types Legend */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3">Componentes disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(nodeIcons).map(([type, Icon]) => (
                  <div 
                    key={type}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50 text-xs"
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center bg-gradient-to-br ${nodeColors[type as keyof typeof nodeColors]}`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="capitalize">{type === 'ai' ? 'IA' : type === 'message' ? 'Mensagem' : type === 'condition' ? 'Condição' : type === 'delay' ? 'Delay' : type === 'start' ? 'Início' : 'Fim'}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground mb-4">
              +15 componentes prontos para usar. Integração nativa com IA.
            </p>
            <Button asChild size="lg" className="group">
              <Link to="/genesis" className="flex items-center gap-2">
                Criar Meu Primeiro Fluxo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaFlowDemo;
