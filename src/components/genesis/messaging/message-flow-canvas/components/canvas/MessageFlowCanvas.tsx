// Message Flow Canvas - Visual Interactive Canvas
import { useCallback, useRef, useState, useMemo } from 'react';
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
  ConnectionLineType,
  MarkerType,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Save, Play, Pause, Settings2, ZoomIn, ZoomOut, 
  Maximize2, Undo, Redo, Copy, Trash2, Lock, Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageFlow, MessageNode, MessageEdge, NODE_CATEGORIES } from '../../types';
import { NodePalette } from './NodePalette';
import { AdvancedTextNode } from './nodes/AdvancedTextNode';
import { ButtonMessageNode } from './nodes/ButtonMessageNode';
import { ListMessageNode } from './nodes/ListMessageNode';
import { AudioPttNode } from './nodes/AudioPttNode';
import { PollNode } from './nodes/PollNode';
import { ReactionNode } from './nodes/ReactionNode';
import { PresenceNode } from './nodes/PresenceNode';
import { SmartDelayNode } from './nodes/SmartDelayNode';
import { ConditionNode } from './nodes/ConditionNode';
import { NodeConfigModal } from './NodeConfigModal';

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

// Convert edges
const toFlowEdge = (edge: MessageEdge): Edge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle,
  targetHandle: edge.targetHandle,
  label: edge.label,
  animated: edge.animated,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
});

export const MessageFlowCanvas = ({ flow, onBack, onSave, onToggleActive }: MessageFlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes.map(toFlowNode));
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges.map(toFlowEdge));
  const [isPaletteDocked, setIsPaletteDocked] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasChanges, setHasChanges] = useState(false);

  // Handle connections
  const onConnect = useCallback((params: Connection) => {
    if (isLocked) return;
    setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: true,
      style: { strokeWidth: 2, stroke: 'hsl(var(--primary))' },
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

  // Handle node selection for configuration
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowConfigModal(true);
  }, []);

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
        ? { ...n, data: { ...n.data, config, isConfigured: true } }
        : n
    ));
    setShowConfigModal(false);
    setHasChanges(true);
  }, [setNodes]);

  // MiniMap node color based on type
  const nodeColor = useCallback((node: Node) => {
    const category = NODE_CATEGORIES.find((c) => c.nodes.some((n) => n.type === node.type));
    if (category?.id === 'content') return '#3b82f6';
    if (category?.id === 'interactive') return '#a855f7';
    if (category?.id === 'flow-control') return '#f59e0b';
    return '#6b7280';
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Canvas Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 p-3 border-b bg-card/80 backdrop-blur-sm z-10"
      >
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex-1 flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-sm">{flow.name}</h2>
            <p className="text-xs text-muted-foreground">{flow.description || 'Sem descrição'}</p>
          </div>
          {hasChanges && (
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
              Alterações não salvas
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
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

          <div className="w-px h-6 bg-border" />
          
          <Button 
            variant={flow.isActive ? "default" : "outline"} 
            size="sm"
            onClick={() => onToggleActive(flow.id)}
            className="gap-2"
          >
            {flow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {flow.isActive ? 'Pausar' : 'Ativar'}
          </Button>
          
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </motion.div>

      {/* Canvas Area */}
      <div className="flex-1 flex">
        {/* Node Palette */}
        <AnimatePresence>
          {isPaletteDocked && (
            <NodePalette 
              onClose={() => setIsPaletteDocked(false)}
              isLocked={isLocked}
            />
          )}
        </AnimatePresence>

        {/* React Flow Canvas */}
        <div 
          ref={reactFlowWrapper} 
          className="flex-1"
          style={{ height: '100%' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isLocked ? undefined : onNodesChange}
            onEdgesChange={isLocked ? undefined : onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
            }}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            className="message-flow-canvas"
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              className="!bg-muted/30"
            />
            <Controls 
              className="!bg-card !border-border !shadow-lg"
              showZoom
              showFitView
              showInteractive={false}
            />
            <MiniMap 
              nodeColor={nodeColor}
              maskColor="hsl(var(--background) / 0.8)"
              className="!bg-card !border-border !shadow-lg"
              zoomable
              pannable
            />

            {/* Floating palette toggle when collapsed */}
            {!isPaletteDocked && (
              <Panel position="top-left">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsPaletteDocked(true)}
                  className="shadow-lg"
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Nós
                </Button>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Node Configuration Modal */}
      {selectedNode && (
        <NodeConfigModal
          open={showConfigModal}
          onOpenChange={setShowConfigModal}
          node={selectedNode}
          onSave={(config) => handleNodeConfigSave(selectedNode.id, config)}
        />
      )}
    </div>
  );
};

// Wrapper with provider
export const MessageFlowCanvasWrapper = (props: MessageFlowCanvasProps) => (
  <ReactFlowProvider>
    <MessageFlowCanvas {...props} />
  </ReactFlowProvider>
);
