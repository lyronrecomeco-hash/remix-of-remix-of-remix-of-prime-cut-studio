/**
 * Real Flow Builder Demo - Based on WAFlowBuilder
 * Interactive drag-and-drop flow builder for the Sobre page
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  ConnectionLineType,
  SelectionMode,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MessageSquare,
  Bot,
  GitBranch,
  Zap,
  Timer,
  Send,
  LayoutGrid,
  Brain,
  Play,
  Plus,
  Trash2,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  MousePointer,
  Hand,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============= TYPES =============

type DemoNodeType = 'trigger' | 'message' | 'condition' | 'ai' | 'delay' | 'button' | 'end';

interface DemoNodeData {
  label: string;
  type: DemoNodeType;
  description?: string;
  config?: Record<string, any>;
}

interface DemoNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: DemoNodeData;
}

// ============= NODE COLORS =============

const NODE_COLORS: Record<DemoNodeType, string> = {
  trigger: '#10b981',
  message: '#3b82f6',
  condition: '#f59e0b',
  ai: '#8b5cf6',
  delay: '#6b7280',
  button: '#ec4899',
  end: '#ef4444'
};

// ============= NODE TEMPLATES =============

const NODE_TEMPLATES = [
  { type: 'trigger' as DemoNodeType, label: 'Gatilho', icon: Zap, description: 'Início do fluxo' },
  { type: 'message' as DemoNodeType, label: 'Mensagem', icon: MessageSquare, description: 'Enviar texto' },
  { type: 'condition' as DemoNodeType, label: 'Condição', icon: GitBranch, description: 'Dividir fluxo' },
  { type: 'ai' as DemoNodeType, label: 'IA', icon: Brain, description: 'Resposta inteligente' },
  { type: 'delay' as DemoNodeType, label: 'Aguardar', icon: Timer, description: 'Pausa temporizada' },
  { type: 'button' as DemoNodeType, label: 'Botões', icon: LayoutGrid, description: 'Opções interativas' },
  { type: 'end' as DemoNodeType, label: 'Fim', icon: Send, description: 'Finalizar fluxo' }
];

// ============= DEMO FLOWS =============

const DEMO_FLOWS = [
  {
    name: 'Atendimento',
    nodes: [
      { id: 'trigger-1', type: 'flowNode', position: { x: 150, y: 30 }, data: { label: 'Msg Recebida', type: 'trigger' as DemoNodeType, description: 'Cliente envia' } },
      { id: 'ai-1', type: 'flowNode', position: { x: 150, y: 130 }, data: { label: 'Luna IA', type: 'ai' as DemoNodeType, description: 'Processa' } },
      { id: 'condition-1', type: 'flowNode', position: { x: 150, y: 230 }, data: { label: 'Tipo', type: 'condition' as DemoNodeType, description: 'Classifica' } },
      { id: 'message-1', type: 'flowNode', position: { x: 50, y: 340 }, data: { label: 'Suporte', type: 'message' as DemoNodeType, description: 'Suporte' } },
      { id: 'message-2', type: 'flowNode', position: { x: 250, y: 340 }, data: { label: 'Vendas', type: 'message' as DemoNodeType, description: 'Vendas' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'ai-1', animated: true },
      { id: 'e2', source: 'ai-1', target: 'condition-1', animated: true },
      { id: 'e3', source: 'condition-1', target: 'message-1', sourceHandle: 'yes', animated: true },
      { id: 'e4', source: 'condition-1', target: 'message-2', sourceHandle: 'no', animated: true }
    ]
  },
  {
    name: 'Boas-vindas',
    nodes: [
      { id: 'trigger-1', type: 'flowNode', position: { x: 150, y: 30 }, data: { label: 'Novo Contato', type: 'trigger' as DemoNodeType, description: 'Novo cliente' } },
      { id: 'message-1', type: 'flowNode', position: { x: 150, y: 130 }, data: { label: 'Saudação', type: 'message' as DemoNodeType, description: 'Olá!' } },
      { id: 'delay-1', type: 'flowNode', position: { x: 150, y: 230 }, data: { label: 'Aguardar', type: 'delay' as DemoNodeType, description: '3 segundos' } },
      { id: 'button-1', type: 'flowNode', position: { x: 150, y: 330 }, data: { label: 'Menu', type: 'button' as DemoNodeType, description: 'Opções' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'message-1', animated: true },
      { id: 'e2', source: 'message-1', target: 'delay-1', animated: true },
      { id: 'e3', source: 'delay-1', target: 'button-1', animated: true }
    ]
  }
];

// ============= CUSTOM NODE COMPONENT =============

import { Handle, Position } from '@xyflow/react';

const DemoFlowNode = ({ data, selected, id }: { data: DemoNodeData; selected?: boolean; id: string }) => {
  const nodeType = data?.type || 'trigger';
  const color = NODE_COLORS[nodeType];
  const template = NODE_TEMPLATES.find(t => t.type === nodeType);
  const Icon = template?.icon || Zap;
  const isCondition = nodeType === 'condition';
  const isTrigger = nodeType === 'trigger';
  const isEnd = nodeType === 'end';

  const getCategory = () => {
    if (nodeType === 'trigger') return 'GATILHO';
    if (nodeType === 'condition') return 'CONDIÇÃO';
    if (nodeType === 'end') return 'FIM';
    return 'AÇÃO';
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'relative rounded-xl shadow-lg border bg-card min-w-[140px] sm:min-w-[180px] max-w-[180px] sm:max-w-[220px] transition-all',
        selected && 'ring-2 ring-offset-2 ring-offset-background'
      )}
      style={{
        borderColor: selected ? color : `${color}60`,
        // @ts-ignore
        '--tw-ring-color': color
      }}
    >
      {/* Category Badge */}
      <div
        className="absolute -top-2.5 left-3 px-2 py-0.5 rounded text-[8px] font-bold tracking-wide shadow-sm"
        style={{ backgroundColor: color, color: '#fff' }}
      >
        {getCategory()}
      </div>

      {/* Input Handle - Real React Flow Handle */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !rounded-full !border-2 !bg-card"
          style={{ borderColor: color, top: -6 }}
        />
      )}

      {/* Content */}
      <div className="p-2 sm:p-3 pt-3 sm:pt-4">
        <div className="flex items-start gap-2">
          <div
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[10px] sm:text-xs truncate">{data?.label || 'Nó'}</p>
            {data?.description && (
              <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1 hidden sm:block">{data.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Output Handles - Real React Flow Handles */}
      {!isEnd && (
        isCondition ? (
          <>
            <Handle
              type="source"
              position={Position.Bottom}
              id="yes"
              className="!w-3 !h-3 !rounded-full !bg-green-500 !border-2 !border-background"
              style={{ left: '25%', bottom: -6 }}
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id="no"
              className="!w-3 !h-3 !rounded-full !bg-red-500 !border-2 !border-background"
              style={{ left: '75%', bottom: -6 }}
            />
            <div className="absolute -bottom-5 left-1/4 -translate-x-1/2 text-[7px] font-bold text-green-500">SIM</div>
            <div className="absolute -bottom-5 left-3/4 -translate-x-1/2 text-[7px] font-bold text-red-500">NÃO</div>
          </>
        ) : (
          <Handle
            type="source"
            position={Position.Bottom}
            className="!w-3 !h-3 !rounded-full !border-2 !bg-card"
            style={{ borderColor: color, bottom: -6 }}
          />
        )
      )}
    </motion.div>
  );
};

const nodeTypes = { flowNode: DemoFlowNode };

// ============= MAIN COMPONENT =============

const FlowBuilderContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(DEMO_FLOWS[0].nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEMO_FLOWS[0].edges as Edge[]);
  const [selectedFlow, setSelectedFlow] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(-1);
  const [interactionMode, setInteractionMode] = useState<'select' | 'pan'>('pan');

  // Load demo flow
  const loadDemoFlow = useCallback((index: number) => {
    const flow = DEMO_FLOWS[index];
    setNodes(flow.nodes);
    setEdges(flow.edges as Edge[]);
    setSelectedFlow(index);
    setSimulationStep(-1);
    setTimeout(() => fitView({ padding: 0.3 }), 100);
  }, [setNodes, setEdges, fitView]);

  // Run simulation
  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationStep(0);
    
    const nodeIds = nodes.map(n => n.id);
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      if (step >= nodeIds.length) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationStep(-1);
      } else {
        setSimulationStep(step);
      }
    }, 1200);
  }, [nodes]);

  // Add node
  const addNode = useCallback((template: typeof NODE_TEMPLATES[0]) => {
    const newNode = {
      id: `${template.type}-${Date.now()}`,
      type: 'flowNode',
      position: { x: 250 + Math.random() * 100, y: 300 + Math.random() * 100 },
      data: {
        label: template.label,
        type: template.type,
        description: template.description
      }
    };
    setNodes(nds => [...nds, newNode]);
  }, [setNodes]);

  // Connection handler
  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ 
      ...params, 
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  // Fit view on load
  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.3 }), 200);
  }, [fitView]);

  return (
    <Card className="overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/10 bg-card/95 backdrop-blur-xl h-[400px] sm:h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur">
              <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-xs sm:text-sm">Flow Builder</h3>
                <Badge className="bg-white/20 text-white text-[8px] sm:text-[9px] border-white/30 hidden sm:inline-flex">INTERATIVO</Badge>
              </div>
              <p className="text-[9px] sm:text-[10px] text-white/80 hidden sm:block">Arraste e conecte os nós</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant={interactionMode === 'select' ? 'secondary' : 'ghost'}
              className="w-6 h-6 sm:w-7 sm:h-7 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setInteractionMode('select')}
            >
              <MousePointer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Button>
            <Button
              size="icon"
              variant={interactionMode === 'pan' ? 'secondary' : 'ghost'}
              className="w-6 h-6 sm:w-7 sm:h-7 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setInteractionMode('pan')}
            >
              <Hand className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-b bg-muted/30 flex items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-1">
          {DEMO_FLOWS.map((flow, idx) => (
            <Button
              key={flow.name}
              size="sm"
              variant={selectedFlow === idx ? 'default' : 'ghost'}
              className="h-6 sm:h-7 text-[9px] sm:text-[10px] px-1.5 sm:px-2"
              onClick={() => loadDemoFlow(idx)}
            >
              {flow.name}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="w-6 h-6 sm:w-7 sm:h-7 hidden sm:flex" onClick={() => zoomOut()}>
            <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="w-6 h-6 sm:w-7 sm:h-7 hidden sm:flex" onClick={() => zoomIn()}>
            <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Button>
          <Button
            size="sm"
            className={cn(
              "h-6 sm:h-7 text-[9px] sm:text-[10px] px-1.5 sm:px-2 gap-1",
              isSimulating && "bg-green-600 hover:bg-green-700"
            )}
            onClick={runSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <Activity className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline">Simulando...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">Simular</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={reactFlowWrapper} className="h-[260px] sm:h-[340px] relative touch-none">
        <ReactFlow
          nodes={nodes.map((n, idx) => ({
            ...n,
            selected: simulationStep === idx,
            data: {
              ...n.data,
              isActive: simulationStep === idx
            }
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          panOnDrag={interactionMode === 'pan'}
          selectionOnDrag={interactionMode === 'select'}
          selectionMode={SelectionMode.Partial}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          className="bg-gradient-to-b from-background to-muted/20"
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 }
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="hsl(var(--muted-foreground) / 0.15)" />
          
          {/* Node Palette - Hidden on mobile */}
          <Panel position="bottom-left" className="!left-2 !bottom-2 hidden sm:block">
            <div className="bg-card/95 backdrop-blur border rounded-lg p-2 shadow-lg">
              <p className="text-[9px] font-semibold text-muted-foreground mb-1.5 px-1">ADICIONAR NÓ</p>
              <div className="flex gap-1 flex-wrap max-w-[200px]">
                {NODE_TEMPLATES.slice(0, 4).map(template => (
                  <Tooltip key={template.type}>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        style={{ color: NODE_COLORS[template.type] }}
                        onClick={() => addNode(template)}
                      >
                        <template.icon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{template.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </Panel>

          {/* Simulation Status */}
          <AnimatePresence>
            {isSimulating && (
              <Panel position="top-center" className="!top-2">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 shadow-lg"
                >
                  <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Passo {simulationStep + 1}/{nodes.length}
                  </span>
                </motion.div>
              </Panel>
            )}
          </AnimatePresence>
        </ReactFlow>
      </div>

      {/* Footer */}
      <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-t bg-muted/30 flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            {nodes.length} nós
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-blue-500" />
            {edges.length} conexões
          </span>
        </div>
        <span className="hidden sm:inline">Drag & drop para reorganizar</span>
      </div>
    </Card>
  );
};

export const RealFlowBuilderDemo = () => (
  <ReactFlowProvider>
    <FlowBuilderContent />
  </ReactFlowProvider>
);
