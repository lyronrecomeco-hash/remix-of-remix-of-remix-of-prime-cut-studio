import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  Cpu, ArrowLeft, Camera, Loader2, PanelLeft, PanelLeftClose,
  PanelRight, PanelRightClose, ChevronLeft, Rocket, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { EngineNodeComponent } from './components/EngineNode';
import { WhatsAppNodeComponent } from './components/WhatsAppNodeComponent';
import { NodeCatalogPanel } from './components/NodeCatalogPanel';
import { AICommandPanel } from './components/AICommandPanel';
import { ExecutionPanel } from './components/ExecutionPanel';
import { FlowControls } from './components/FlowControls';
import { ExecutionLogsPanel } from './components/ExecutionLogsPanel';
import { WhatsAppConfigModal } from './components/WhatsAppConfigModal';
import { useEngineSession } from './hooks/useEngineSession';
import { useEngineAI } from './hooks/useEngineAI';
import { useFlowRuntime } from './hooks/useFlowRuntime';
import type { ProposalForEngine, EngineNode, EngineEdge } from './types';
import { BLOCK_CATEGORIES } from './types';

interface EngineWorkspaceProps {
  affiliateId: string;
  proposal: ProposalForEngine;
  onBack: () => void;
}

export const EngineWorkspace = ({ affiliateId, proposal, onBack }: EngineWorkspaceProps) => {
  const {
    session, nodes, edges, loading, saving,
    setNodes, setEdges, addNode, createSnapshot, addMultipleNodes,
  } = useEngineSession(affiliateId, proposal);

  const {
    isGenerating, outputs, lastActionType, generate, messages, activityLog, handleApproval,
  } = useEngineAI({
    nodes,
    edges,
    prospectContext: session?.prospect_context || {},
    sessionId: session?.id || null,
    onCanvasAction: handleCanvasAction,
  });

  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // Flow Runtime
  const {
    flowStatus, validationErrors, executionLogs, preFlightSummary,
    validateFlow, generatePreFlight, runFlow, pauseFlow, resetFlow, retryFailed,
  } = useFlowRuntime({
    nodes,
    edges,
    setNodes,
    sessionId: session?.id || null,
    userId,
  });

  const nodeTypes = useMemo(() => ({
    engineNode: EngineNodeComponent,
    whatsappNode: WhatsAppNodeComponent,
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
    // Determine semantic edge type based on source/target node categories
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    let semanticType: 'data_flow' | 'execution_flow' = 'data_flow';
    if (sourceNode?.data?.nodeType && targetNode?.data?.nodeType) {
      const { BLOCK_CATEGORIES } = require('./types');
      const sourceCat = BLOCK_CATEGORIES[sourceNode.data.nodeType];
      const targetCat = BLOCK_CATEGORIES[targetNode.data.nodeType];
      // If connecting to/from an action block, it's an execution flow
      if (sourceCat === 'action' || targetCat === 'action') {
        semanticType = 'execution_flow';
      }
    }

    const newEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}`,
      type: 'smoothstep',
      animated: semanticType === 'execution_flow',
      style: {
        stroke: semanticType === 'execution_flow' ? '#3b82f680' : 'rgba(255,255,255,0.12)',
        strokeWidth: semanticType === 'execution_flow' ? 2 : 1.5,
      },
      data: { semanticType },
    };
    setEdges([...edges, newEdge] as EngineEdge[]);
  }, [edges, nodes, setEdges]);

  // AI canvas action handler
  function handleCanvasAction(action: { type: string; nodes?: any[]; edges?: any[] }) {
    if (action.type === 'add_nodes' && action.nodes) {
      addMultipleNodes(action.nodes, action.edges);
    }
  }

  // Smart Auto-Arrange
  const handleAutoArrange = useCallback(() => {
    const CATEGORY_ORDER = ['Descoberta', 'Estratégia', 'Técnico', 'Execução'];
    const NODE_CATALOG_MAP: Record<string, string> = {
      prospect: 'Descoberta', diagnosis: 'Descoberta', pain: 'Descoberta', opportunity: 'Descoberta',
      strategy: 'Estratégia', offer: 'Estratégia', differentials: 'Estratégia', objections: 'Estratégia', approach: 'Estratégia',
      scope: 'Técnico', structure: 'Técnico', integrations: 'Técnico', automation: 'Técnico',
      followup: 'Execução', checklist: 'Execução', deploy: 'Execução', prompt: 'Execução', notes: 'Execução', whatsapp: 'Execução',
    };

    const COL_WIDTH = 320;
    const ROW_HEIGHT = 200;
    const START_X = 80;
    const START_Y = 80;

    const categorized: Record<string, EngineNode[]> = {};
    nodes.forEach(n => {
      const cat = NODE_CATALOG_MAP[n.data?.nodeType || ''] || 'Execução';
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(n);
    });

    const updated = nodes.map(n => {
      const cat = NODE_CATALOG_MAP[n.data?.nodeType || ''] || 'Execução';
      const colIndex = CATEGORY_ORDER.indexOf(cat);
      const catNodes = categorized[cat] || [];
      const rowIndex = catNodes.indexOf(n);
      return {
        ...n,
        position: {
          x: START_X + colIndex * COL_WIDTH,
          y: START_Y + rowIndex * ROW_HEIGHT,
        },
      };
    });

    setNodes(updated as EngineNode[]);
  }, [nodes, setNodes]);

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'hsl(220, 25%, 10%)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-white/50">Carregando Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'hsl(220, 25%, 10%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/10 bg-white/[0.03] backdrop-blur-md flex-shrink-0 h-12">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-white leading-none">Genesis Engine</h1>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <span className="text-xs text-white/40 truncate max-w-[120px] hidden sm:block">{proposal.company_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {saving && (
            <span className="text-[10px] text-white/30 flex items-center gap-1 mr-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Salvando
            </span>
          )}

          {/* Flow Controls */}
          <div className="hidden sm:flex">
            <FlowControls
              flowStatus={flowStatus}
              validationErrors={validationErrors}
              preFlightSummary={preFlightSummary}
              onValidate={validateFlow}
              onGeneratePreFlight={generatePreFlight}
              onRun={runFlow}
              onPause={pauseFlow}
              onReset={resetFlow}
              onRetryFailed={retryFailed}
              nodeCount={nodes.length}
            />
          </div>

          <div className="w-px h-4 bg-white/10 hidden sm:block ml-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAutoArrange}
            className="h-7 px-2 text-[11px] text-white/40 hover:text-white hover:bg-white/5 gap-1 hidden sm:flex"
            title="Auto organizar canvas"
          >
            <LayoutGrid className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => createSnapshot()}
            className="h-7 px-2 text-[11px] text-white/40 hover:text-white hover:bg-white/5 gap-1"
          >
            <Camera className="w-3 h-3" />
          </Button>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/5 hidden sm:flex"
          >
            {showLeftPanel ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/5 hidden sm:flex"
          >
            {showRightPanel ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel */}
          {showLeftPanel && (
            <>
              <ResizablePanel defaultSize={14} minSize={10} maxSize={22} className="hidden sm:block">
                <div className="h-full overflow-y-auto bg-white/[0.02] border-r border-white/[0.06]">
                  <div className="p-3">
                    <NodeCatalogPanel onAddNode={(type) => {
                      if (type === 'whatsapp') {
                        setShowWhatsAppModal(true);
                      }
                      addNode(type);
                    }} />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle className="hidden sm:flex w-px bg-white/[0.06] hover:bg-primary/30 transition-colors" />
            </>
          )}

          {/* Canvas */}
          <ResizablePanel defaultSize={showLeftPanel && showRightPanel ? 58 : showRightPanel ? 72 : showLeftPanel ? 86 : 100} minSize={35}>
            <div className="h-full relative flex flex-col">
              <div className="flex-1">
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
                    style: { stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1.5 },
                    type: 'smoothstep',
                    animated: true,
                  }}
                >
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1}
                    color="rgba(255,255,255,0.04)"
                  />
                  <Controls
                    className="!bg-white/[0.04] !border-white/[0.08] !rounded-lg [&_button]:!bg-white/[0.04] [&_button]:!border-white/[0.08] [&_button]:!text-white/40 [&_button:hover]:!bg-white/10 [&_button:hover]:!text-white/70"
                  />
                  
                  {/* Canvas overlay during structure generation */}
                  {isGenerating && lastActionType === 'build_structure' && (
                    <Panel position="top-center">
                      <div className="mt-4 px-4 py-2.5 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-lg flex items-center gap-2.5">
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                        <span className="text-xs text-primary font-medium">Montando estrutura no canvas...</span>
                      </div>
                    </Panel>
                  )}

                  {/* Flow execution overlay */}
                  {flowStatus === 'running' && (
                    <Panel position="top-center">
                      <div className="mt-4 px-4 py-2.5 bg-purple-500/10 backdrop-blur-md border border-purple-500/20 rounded-lg flex items-center gap-2.5">
                        <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                        <span className="text-xs text-purple-300 font-medium">Executando fluxo...</span>
                      </div>
                    </Panel>
                  )}
                  
                  {/* Mobile buttons */}
                  <Panel position="bottom-left" className="sm:hidden flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setMobileLeftOpen(true)}
                      className="h-8 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-white/60 hover:text-white gap-1 text-xs"
                    >
                      <PanelLeft className="w-3.5 h-3.5" />
                      Blocos
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowRightPanel(!showRightPanel)}
                      className="h-8 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-white/60 hover:text-white gap-1 text-xs"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      IA
                    </Button>
                  </Panel>
                </ReactFlow>
              </div>

              {/* Execution Logs (bottom of canvas) */}
              {(executionLogs.length > 0 || validationErrors.length > 0) && (
                <ExecutionLogsPanel
                  logs={executionLogs}
                  validationErrors={validationErrors}
                />
              )}
            </div>
          </ResizablePanel>

          {/* Right Panel */}
          {showRightPanel && (
            <>
              <ResizableHandle withHandle className="hidden sm:flex w-px bg-white/[0.06] hover:bg-primary/30 transition-colors" />
              <ResizablePanel defaultSize={28} minSize={20} maxSize={45} className="hidden sm:block">
                <div className="h-full overflow-hidden bg-white/[0.02] border-l border-white/[0.06] flex flex-col">
                  <AICommandPanel
                    isGenerating={isGenerating}
                    outputs={outputs}
                    onGenerate={handleGenerate}
                    messages={messages}
                    activityLog={activityLog}
                    prospectName={proposal.company_name}
                    nodes={nodes}
                    lastActionType={lastActionType}
                    onAutoArrange={handleAutoArrange}
                    onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                    onApproval={handleApproval}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Mobile Left Panel Overlay */}
      <AnimatePresence>
        {mobileLeftOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileLeftOpen(false)}
              className="fixed inset-0 z-[101] bg-black/50 sm:hidden"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed inset-y-0 left-0 z-[102] w-[240px] bg-[hsl(220_25%_11%)] border-r border-white/[0.08] sm:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
                <span className="text-xs font-semibold text-white/60">Blocos</span>
                <button onClick={() => setMobileLeftOpen(false)} className="text-white/40 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <NodeCatalogPanel onAddNode={(type) => { 
                  if (type === 'whatsapp') setShowWhatsAppModal(true);
                  addNode(type); 
                  setMobileLeftOpen(false); 
                }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile AI Panel */}
      <AnimatePresence>
        {showRightPanel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed inset-x-0 bottom-0 z-[101] h-[60vh] bg-[hsl(220_25%_11%)] border-t border-white/[0.08] sm:hidden flex flex-col rounded-t-2xl"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-white/60">IA Contextual</span>
              <button onClick={() => setShowRightPanel(false)} className="text-white/40 hover:text-white text-xs">Fechar</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AICommandPanel
                isGenerating={isGenerating}
                outputs={outputs}
                onGenerate={handleGenerate}
                messages={messages}
                activityLog={activityLog}
                prospectName={proposal.company_name}
                nodes={nodes}
                lastActionType={lastActionType}
                onAutoArrange={handleAutoArrange}
                onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                onApproval={handleApproval}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Config Modal */}
      {userId && (
        <WhatsAppConfigModal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          userId={userId}
          sessionId={session?.id}
        />
      )}
    </div>
  );
};
