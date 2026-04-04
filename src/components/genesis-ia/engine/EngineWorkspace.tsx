import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Cpu, ArrowLeft, Save, Camera, ChevronLeft, ChevronRight, 
  Loader2, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EngineNodeComponent } from './components/EngineNode';
import { NodeCatalogPanel } from './components/NodeCatalogPanel';
import { AICommandPanel } from './components/AICommandPanel';
import { EngineOutputModal } from './components/EngineOutputModal';
import { useEngineSession } from './hooks/useEngineSession';
import { useEngineAI } from './hooks/useEngineAI';
import type { ProposalForEngine, EngineNode, EngineEdge } from './types';

interface EngineWorkspaceProps {
  affiliateId: string;
  proposal: ProposalForEngine;
  onBack: () => void;
}

export const EngineWorkspace = ({ affiliateId, proposal, onBack }: EngineWorkspaceProps) => {
  const {
    session, nodes, edges, loading, saving,
    setNodes, setEdges, addNode, createSnapshot,
  } = useEngineSession(affiliateId, proposal);

  const {
    isGenerating, streamContent, outputs, generate, clearStream,
  } = useEngineAI({
    nodes,
    edges,
    prospectContext: session?.prospect_context || {},
    sessionId: session?.id || null,
  });

  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [outputModal, setOutputModal] = useState<{ title: string; content: string } | null>(null);

  const nodeTypes = useMemo(() => ({
    engineNode: EngineNodeComponent,
  }), []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const updated = applyNodeChanges(changes, nodes) as EngineNode[];
    setNodes(updated);
  }, [nodes, setNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const updated = applyEdgeChanges(changes, edges) as EngineEdge[];
    setEdges(updated);
  }, [edges, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    const updated = addEdge(connection, edges) as EngineEdge[];
    setEdges(updated);
  }, [edges, setEdges]);

  // When a node's content changes
  const nodesWithHandlers = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        onContentChange: (content: string) => {
          const updated = nodes.map(node =>
            node.id === n.id ? { ...node, data: { ...node.data, content } } : node
          );
          setNodes(updated as EngineNode[]);
        },
      },
    }));
  }, [nodes, setNodes]);

  const handleGenerate = useCallback((type: string, instruction?: string) => {
    generate(type, instruction);
  }, [generate]);

  // Open last output in modal when generation completes
  useEffect(() => {
    if (!isGenerating && outputs.length > 0) {
      const last = outputs[outputs.length - 1];
      setOutputModal({ title: last.title, content: last.content });
    }
  }, [isGenerating, outputs.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-white/50">Carregando Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] -mx-3 sm:-mx-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 text-white/50 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Genesis Engine</h1>
              <p className="text-[10px] text-white/40 leading-tight truncate max-w-[200px]">{proposal.company_name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {saving && (
            <span className="text-[10px] text-white/30 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => createSnapshot()}
            className="h-8 px-2 text-xs text-white/50 hover:text-white gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Snapshot</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="h-8 w-8 p-0 text-white/50 hover:text-white sm:flex hidden"
          >
            {showLeftPanel ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Node Catalog */}
        <AnimatePresence>
          {showLeftPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-white/10 bg-[hsl(220_25%_11%)] overflow-y-auto flex-shrink-0 hidden sm:block"
            >
              <div className="p-3">
                <NodeCatalogPanel onAddNode={addNode} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            style={{ background: 'hsl(220, 25%, 10%)' }}
            defaultEdgeOptions={{
              style: { stroke: 'rgba(255,255,255,0.15)', strokeWidth: 2 },
              type: 'smoothstep',
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(255,255,255,0.05)"
            />
            <Controls
              className="!bg-white/5 !border-white/10 !rounded-xl [&_button]:!bg-white/5 [&_button]:!border-white/10 [&_button]:!text-white/50 [&_button:hover]:!bg-white/10"
            />
            
            {/* Mobile add node button */}
            <Panel position="bottom-left" className="sm:hidden">
              <Button
                size="sm"
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                className="h-9 bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white gap-1.5"
              >
                <PanelLeft className="w-4 h-4" />
                Blocos
              </Button>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right Panel - AI Commands */}
        <div className="w-[280px] sm:w-[300px] border-l border-white/10 bg-[hsl(220_25%_11%)] flex-shrink-0 flex flex-col overflow-hidden">
          <AICommandPanel
            isGenerating={isGenerating}
            streamContent={streamContent}
            outputs={outputs}
            onGenerate={handleGenerate}
          />
        </div>
      </div>

      {/* Output Modal */}
      <EngineOutputModal
        isOpen={!!outputModal}
        onClose={() => setOutputModal(null)}
        title={outputModal?.title || ''}
        content={outputModal?.content || ''}
      />

      {/* Mobile Left Panel Overlay */}
      <AnimatePresence>
        {showLeftPanel && (
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            className="fixed inset-y-0 left-0 z-50 w-[250px] bg-[hsl(220_25%_11%)] border-r border-white/10 sm:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-xs font-semibold text-white/70">Blocos</span>
              <button onClick={() => setShowLeftPanel(false)} className="text-white/50 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3">
              <NodeCatalogPanel onAddNode={(type) => { addNode(type); setShowLeftPanel(false); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
