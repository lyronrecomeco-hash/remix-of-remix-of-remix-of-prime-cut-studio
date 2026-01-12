// Message Flow Canvas - Supreme Visual Interactive Canvas
import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  ConnectionLineType,
  MarkerType,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Save, Play, Pause, ZoomIn, ZoomOut, 
  Maximize2, Trash2, Lock, Unlock, Plus, AlertCircle,
  Activity, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageFlow, MessageNode, MessageEdge, NODE_CATEGORIES, FlowErrorLog } from '../../types';
import { NodePaletteModal } from './NodePaletteModal';
import { FlowTemplatesModal } from './FlowTemplatesModal';
import { IPhonePreview } from './IPhonePreview';
import { CustomEdge } from './CustomEdge';
import { AdvancedTextNode } from './nodes/AdvancedTextNode';
import { ButtonMessageNode } from './nodes/ButtonMessageNode';
import { ListMessageNode } from './nodes/ListMessageNode';
import { AudioPttNode } from './nodes/AudioPttNode';
import { PollNode } from './nodes/PollNode';
import { ReactionNode } from './nodes/ReactionNode';
import { PresenceNode } from './nodes/PresenceNode';
import { SmartDelayNode } from './nodes/SmartDelayNode';
import { ConditionNode } from './nodes/ConditionNode';
import { TriggerNode } from './nodes/TriggerNode';
import { GroupManagementNode } from './nodes/GroupManagementNode';
import { UtilityNode } from './nodes/UtilityNode';
import { NodeConfigModal } from './NodeConfigModal';
import { RealTimeErrorLogs } from './RealTimeErrorLogs';

interface MessageFlowCanvasProps {
  flow: MessageFlow;
  onBack: () => void;
  onSave: (nodes: MessageNode[], edges: MessageEdge[]) => void;
  onToggleActive: (id: string) => void;
}

// Custom node types mapping
const nodeTypes: NodeTypes = {
  'advanced-text': AdvancedTextNode,
  'button-message': ButtonMessageNode,
  'list-message': ListMessageNode,
  'audio-ptt': AudioPttNode,
  'poll': PollNode,
  'expected-reaction': ReactionNode,
  'presence': PresenceNode,
  'smart-delay': SmartDelayNode,
  'condition': ConditionNode,
  // Triggers
  'start-trigger': TriggerNode,
  'instance-connector': TriggerNode,
  'webhook-trigger': TriggerNode,
  'schedule-trigger': TriggerNode,
  // Group Management
  'group-welcome': GroupManagementNode,
  'group-goodbye': GroupManagementNode,
  'keyword-filter': GroupManagementNode,
  'keyword-delete': GroupManagementNode,
  'member-kick': GroupManagementNode,
  'member-warn': GroupManagementNode,
  'group-reminder': GroupManagementNode,
  'anti-spam': GroupManagementNode,
  'anti-link': GroupManagementNode,
  'group-rules': GroupManagementNode,
  'member-counter': GroupManagementNode,
  // Utilities
  'http-request': UtilityNode,
  'set-variable': UtilityNode,
  'end-flow': UtilityNode,
};

// Custom edge types mapping
const edgeTypes: EdgeTypes = {
  'custom': CustomEdge,
};

// Convert MessageNode to React Flow node
const toFlowNode = (node: MessageNode): Node => ({
  id: node.id,
  type: node.type,
  position: node.position,
  data: { ...node.data } as Record<string, unknown>,
  selected: node.selected,
});

// Convert React Flow node to MessageNode
const toMessageNode = (node: Node): MessageNode => {
  const data = node.data as Record<string, unknown>;
  return {
    id: node.id,
    type: node.type as MessageNode['type'],
    position: node.position,
    data: {
      label: (data?.label as string) || '',
      config: (data?.config as Record<string, any>) || {},
      isConfigured: (data?.isConfigured as boolean) || false,
    },
    selected: node.selected,
  };
};

// Convert edges - Clean modern edge
const toFlowEdge = (edge: MessageEdge): Edge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle,
  targetHandle: edge.targetHandle,
  data: { label: edge.label },
  type: 'custom',
});

// Modern edge options
const defaultEdgeOptions = {
  type: 'custom',
};

export const MessageFlowCanvas = ({ flow, onBack, onSave, onToggleActive }: MessageFlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes.map(toFlowNode));
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges.map(toFlowEdge));
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showErrorLogs, setShowErrorLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState<FlowErrorLog[]>([]);

  // Simulate real-time error logs
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulated error detection
      const unconfiguredNodes = nodes.filter(n => {
        const data = n.data as Record<string, unknown>;
        return !(data?.isConfigured as boolean);
      });
      
      if (unconfiguredNodes.length > 0 && Math.random() > 0.8) {
        const randomNode = unconfiguredNodes[Math.floor(Math.random() * unconfiguredNodes.length)];
        const data = randomNode.data as Record<string, unknown>;
        const newError: FlowErrorLog = {
          id: `error-${Date.now()}`,
          flowId: flow.id,
          nodeId: randomNode.id,
          nodeType: randomNode.type as any,
          errorType: 'validation',
          message: `Nó "${(data?.label as string) || randomNode.type}" não está configurado`,
          timestamp: new Date().toISOString(),
          resolved: false,
        };
        setErrorLogs(prev => [newError, ...prev].slice(0, 50));
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [nodes, flow.id]);

  // Handle connections
  const onConnect = useCallback((params: Connection) => {
    if (isLocked) return;
    setEdges((eds) => addEdge({
      ...params,
      ...defaultEdgeOptions,
    }, eds));
    setHasChanges(true);
  }, [setEdges, isLocked]);

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (isLocked) return;

    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('label');

    if (!type || !reactFlowWrapper.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = {
      x: event.clientX - bounds.left - 100,
      y: event.clientY - bounds.top - 50,
    };

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: label || type, 
        config: {},
        isConfigured: false 
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setHasChanges(true);
  }, [setNodes, isLocked]);

  // Handle node click for configuration (1 click instead of 2)
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (!isLocked) {
      setSelectedNode(node);
      setShowConfigModal(true);
    }
  }, [isLocked]);

  // Handle node delete
  const onDeleteSelected = useCallback(() => {
    if (isLocked) return;
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !nodes.find((n) => n.selected && (n.id === e.source || n.id === e.target))));
    setHasChanges(true);
  }, [setNodes, setEdges, nodes, isLocked]);

  // Save flow
  const handleSave = useCallback(() => {
    const messageNodes = nodes.map(toMessageNode);
    const messageEdges: MessageEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle || undefined,
      targetHandle: e.targetHandle || undefined,
      label: e.label as string,
      animated: e.animated,
    }));
    onSave(messageNodes, messageEdges);
    setHasChanges(false);
  }, [nodes, edges, onSave]);

  // Update node config
  const handleNodeConfigSave = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes((nds) => nds.map((n) => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, ...config, isConfigured: true } }
        : n
    ));
    setShowConfigModal(false);
    setHasChanges(true);
  }, [setNodes]);

  // Add node from modal
  const handleAddNode = useCallback((type: string, label: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 200 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: { 
        label, 
        config: {},
        isConfigured: false 
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowPaletteModal(false);
    setHasChanges(true);
  }, [setNodes]);

  // Load template into canvas
  const handleLoadTemplate = useCallback((templateNodes: MessageNode[], templateEdges: MessageEdge[]) => {
    setNodes(templateNodes.map(toFlowNode));
    setEdges(templateEdges.map(toFlowEdge));
    setShowTemplatesModal(false);
    setHasChanges(true);
  }, [setNodes, setEdges]);

  // MiniMap node color based on type
  const nodeColor = useCallback((node: Node) => {
    const category = NODE_CATEGORIES.find((c) => c.nodes.some((n) => n.type === node.type));
    if (category?.id === 'triggers') return '#10b981';
    if (category?.id === 'content') return '#3b82f6';
    if (category?.id === 'interactive') return '#a855f7';
    if (category?.id === 'group-management') return '#f43f5e';
    if (category?.id === 'flow-control') return '#f59e0b';
    return '#6b7280';
  }, []);

  const unresolvedErrors = errorLogs.filter(e => !e.resolved).length;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Minimal Header */}
      <motion.div 
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-14 flex items-center gap-3 px-4 border-b bg-card/95 backdrop-blur-xl z-20"
      >
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        
        <div className="h-6 w-px bg-border" />
        
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate">{flow.name}</h2>
          </div>
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 whitespace-nowrap">
                  Não salvo
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Error indicator */}
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "gap-1.5 h-8",
              unresolvedErrors > 0 && "text-red-500"
            )}
            onClick={() => setShowErrorLogs(!showErrorLogs)}
          >
            <AlertCircle className="w-4 h-4" />
            {unresolvedErrors > 0 && (
              <span className="text-xs font-medium">{unresolvedErrors}</span>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsLocked(!isLocked)}
          >
            {isLocked ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onDeleteSelected}
            disabled={isLocked}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />
          
          <Button 
            variant={flow.isActive ? "default" : "outline"} 
            size="sm"
            onClick={() => onToggleActive(flow.id)}
            className="gap-1.5 h-8"
          >
            {flow.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{flow.isActive ? 'Pausar' : 'Ativar'}</span>
          </Button>
          
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-1.5 h-8"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salvar</span>
          </Button>
        </div>
      </motion.div>

      {/* Canvas Area - Full Screen */}
      <div className="flex-1 relative bg-background" style={{ backgroundColor: 'hsl(var(--background))' }}>
        {/* React Flow Canvas */}
        <div 
          ref={reactFlowWrapper} 
          className="absolute inset-0 bg-background"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isLocked ? undefined : onNodesChange}
            onEdgesChange={isLocked ? undefined : onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            className="message-flow-canvas-supreme"
            proOptions={{ hideAttribution: true }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={24} 
              size={1.5} 
              color="hsl(var(--muted-foreground) / 0.15)"
            />
            <Controls 
              className="!bg-card !border !border-border !rounded-xl !shadow-xl [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
              showZoom
              showFitView
              showInteractive={false}
            />
            <MiniMap 
              nodeColor={nodeColor}
              maskColor="hsl(var(--background) / 0.9)"
              className="!bg-card !border !border-border !rounded-xl !shadow-xl"
              zoomable
              pannable
              style={{ width: 150, height: 100 }}
            />

            {/* Top Toolbar with Add Node */}
            <Panel position="top-center" className="!mt-4">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 px-4 py-2 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl"
              >
                <Button 
                  size="sm"
                  onClick={() => setShowPaletteModal(true)}
                  disabled={isLocked}
                  className="gap-2 rounded-xl h-9 px-4"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Nó
                </Button>
                <div className="w-px h-6 bg-border" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplatesModal(true)}
                  disabled={isLocked}
                  className="gap-2 rounded-xl h-9 px-4"
                >
                  <Activity className="w-4 h-4" />
                  Templates
                </Button>
              </motion.div>
            </Panel>

            {/* SVG Gradient Definition for Edges */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <defs>
                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(142 76% 36%)" />
                </linearGradient>
              </defs>
            </svg>
          </ReactFlow>
        </div>

        {/* Real-time Error Logs Panel */}
        <AnimatePresence>
          {showErrorLogs && (
            <RealTimeErrorLogs 
              errors={errorLogs}
              onClose={() => setShowErrorLogs(false)}
              onResolve={(id) => setErrorLogs(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e))}
            />
          )}
        </AnimatePresence>

        {/* iPhone 16 Pro Preview */}
        <IPhonePreview />
      </div>

      {/* Node Palette Modal */}
      <NodePaletteModal
        open={showPaletteModal}
        onOpenChange={setShowPaletteModal}
        onSelectNode={handleAddNode}
      />

      {/* Flow Templates Modal */}
      <FlowTemplatesModal
        open={showTemplatesModal}
        onOpenChange={setShowTemplatesModal}
        onSelectTemplate={handleLoadTemplate}
      />

      {/* Node Configuration Modal */}
      {selectedNode && (
        <NodeConfigModal
          open={showConfigModal}
          onOpenChange={setShowConfigModal}
          node={selectedNode}
          onSave={(config) => handleNodeConfigSave(selectedNode.id, config)}
        />
      )}

      {/* Modern Edge Styles */}
      <style>{`
        .message-flow-canvas-supreme .react-flow__edge-path {
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        
        .message-flow-canvas-supreme .react-flow__edge.selected .react-flow__edge-path {
          stroke-width: 4;
          filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.5));
        }
        
        .message-flow-canvas-supreme .react-flow__handle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid hsl(var(--background));
          transition: all 0.2s;
        }
        
        .message-flow-canvas-supreme .react-flow__handle:hover {
          transform: scale(1.3);
          filter: drop-shadow(0 0 6px currentColor);
        }
        
        .message-flow-canvas-supreme .react-flow__connection-line {
          stroke: hsl(var(--primary));
          stroke-width: 3;
          stroke-linecap: round;
        }
        
        .message-flow-canvas-supreme .react-flow__edge-interaction {
          stroke-width: 20;
        }
      `}</style>
    </div>
  );
};

// Wrapper with provider
export const MessageFlowCanvasWrapper = (props: MessageFlowCanvasProps) => (
  <ReactFlowProvider>
    <MessageFlowCanvas {...props} />
  </ReactFlowProvider>
);
