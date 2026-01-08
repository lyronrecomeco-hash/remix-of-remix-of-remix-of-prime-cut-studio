/**
 * Flow Builder Demo para página Sobre
 * Versão simplificada e interativa do Flow Builder real
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Bot,
  GitBranch,
  Zap,
  Brain,
  Send,
  Plus,
  X,
  Play,
  Trash2,
  GripVertical,
  Loader2,
  Clock,
  Users,
  Filter,
  Database,
  Webhook,
  Settings,
  CheckCircle2,
  ArrowRight,
  Timer,
  Image,
  FileText,
  Phone,
  Mail,
  Calendar,
  ShoppingCart,
  MousePointerClick
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Tipos de nós disponíveis
const NODE_TYPES = {
  trigger: {
    category: 'Gatilhos',
    types: [
      { id: 'msg_received', label: 'Mensagem Recebida', icon: MessageSquare, color: 'bg-green-500' },
      { id: 'keyword', label: 'Palavra-chave', icon: Filter, color: 'bg-green-600' },
      { id: 'webhook', label: 'Webhook', icon: Webhook, color: 'bg-green-700' },
    ]
  },
  ai: {
    category: 'Inteligência',
    types: [
      { id: 'luna_ai', label: 'Luna IA', icon: Brain, color: 'bg-purple-500' },
      { id: 'classify', label: 'Classificar Intenção', icon: Filter, color: 'bg-purple-600' },
      { id: 'sentiment', label: 'Análise Sentimento', icon: Bot, color: 'bg-purple-700' },
    ]
  },
  condition: {
    category: 'Condições',
    types: [
      { id: 'if_else', label: 'Se/Senão', icon: GitBranch, color: 'bg-amber-500' },
      { id: 'switch', label: 'Switch/Case', icon: Settings, color: 'bg-amber-600' },
      { id: 'time_check', label: 'Horário', icon: Clock, color: 'bg-amber-700' },
    ]
  },
  action: {
    category: 'Ações',
    types: [
      { id: 'send_text', label: 'Enviar Texto', icon: Send, color: 'bg-blue-500' },
      { id: 'send_image', label: 'Enviar Imagem', icon: Image, color: 'bg-blue-600' },
      { id: 'send_file', label: 'Enviar Arquivo', icon: FileText, color: 'bg-blue-700' },
      { id: 'api_call', label: 'Chamar API', icon: Webhook, color: 'bg-cyan-500' },
      { id: 'save_data', label: 'Salvar Dados', icon: Database, color: 'bg-cyan-600' },
    ]
  },
  integration: {
    category: 'Integrações',
    types: [
      { id: 'crm', label: 'Atualizar CRM', icon: Users, color: 'bg-pink-500' },
      { id: 'email', label: 'Enviar Email', icon: Mail, color: 'bg-pink-600' },
      { id: 'calendar', label: 'Agendar', icon: Calendar, color: 'bg-pink-700' },
      { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, color: 'bg-rose-500' },
    ]
  },
};

interface FlowNode {
  id: string;
  typeId: string;
  label: string;
  icon: any;
  color: string;
  category: string;
}

// Templates de flows prontos
const FLOW_TEMPLATES = [
  {
    name: 'Atendimento Básico',
    nodes: [
      { typeId: 'msg_received', label: 'Msg Recebida', category: 'trigger' },
      { typeId: 'luna_ai', label: 'Luna IA', category: 'ai' },
      { typeId: 'send_text', label: 'Responder', category: 'action' },
    ]
  },
  {
    name: 'Qualificação de Lead',
    nodes: [
      { typeId: 'keyword', label: 'Palavra-chave', category: 'trigger' },
      { typeId: 'classify', label: 'Classificar', category: 'ai' },
      { typeId: 'if_else', label: 'Verifica Intenção', category: 'condition' },
      { typeId: 'crm', label: 'Salvar Lead', category: 'integration' },
      { typeId: 'send_text', label: 'Resposta', category: 'action' },
    ]
  },
  {
    name: 'Suporte Automatizado',
    nodes: [
      { typeId: 'msg_received', label: 'Mensagem', category: 'trigger' },
      { typeId: 'sentiment', label: 'Sentimento', category: 'ai' },
      { typeId: 'switch', label: 'Roteamento', category: 'condition' },
      { typeId: 'api_call', label: 'Buscar Dados', category: 'action' },
      { typeId: 'luna_ai', label: 'Gerar Resposta', category: 'ai' },
      { typeId: 'send_text', label: 'Enviar', category: 'action' },
    ]
  },
];

export const FlowBuilderDemo = () => {
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: '1', typeId: 'msg_received', label: 'Mensagem Recebida', icon: MessageSquare, color: 'bg-green-500', category: 'trigger' },
    { id: '2', typeId: 'luna_ai', label: 'Luna IA Analisa', icon: Brain, color: 'bg-purple-500', category: 'ai' },
    { id: '3', typeId: 'if_else', label: 'Verifica Intenção', icon: GitBranch, color: 'bg-amber-500', category: 'condition' },
    { id: '4', typeId: 'send_text', label: 'Resposta Automática', icon: Send, color: 'bg-blue-500', category: 'action' },
  ]);
  
  const [activeStep, setActiveStep] = useState(-1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Encontrar node type por ID
  const findNodeType = (typeId: string) => {
    for (const category of Object.values(NODE_TYPES)) {
      const found = category.types.find(t => t.id === typeId);
      if (found) return found;
    }
    return null;
  };

  // Adicionar nó
  const addNode = (typeId: string, categoryKey: string) => {
    const nodeType = findNodeType(typeId);
    if (!nodeType) return;

    const newNode: FlowNode = {
      id: Date.now().toString(),
      typeId,
      label: nodeType.label,
      icon: nodeType.icon,
      color: nodeType.color,
      category: categoryKey,
    };
    setNodes([...nodes, newNode]);
    setShowNodePicker(false);
  };

  // Remover nó
  const removeNode = (id: string) => {
    if (nodes.length <= 2) return;
    setNodes(nodes.filter(n => n.id !== id));
  };

  // Carregar template
  const loadTemplate = (template: typeof FLOW_TEMPLATES[0]) => {
    const newNodes = template.nodes.map((n, idx) => {
      const nodeType = findNodeType(n.typeId);
      return {
        id: `t-${idx}-${Date.now()}`,
        typeId: n.typeId,
        label: n.label,
        icon: nodeType?.icon || MessageSquare,
        color: nodeType?.color || 'bg-gray-500',
        category: n.category,
      };
    });
    setNodes(newNodes);
    setSimulationLogs([]);
    setActiveStep(-1);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newNodes = [...nodes];
    const [removed] = newNodes.splice(draggedIndex, 1);
    newNodes.splice(index, 0, removed);
    setNodes(newNodes);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Simular execução do flow
  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    setActiveStep(-1);

    const logMessages: Record<string, string> = {
      msg_received: '📱 Mensagem recebida via webhook WhatsApp Business API',
      keyword: '🔍 Analisando palavras-chave: "agendamento", "consulta"...',
      webhook: '🌐 Webhook externo acionado com payload JSON',
      luna_ai: '🧠 Luna IA processando contexto e histórico de conversa...',
      classify: '📊 Classificando intenção: SUPORTE (87% confiança)',
      sentiment: '💭 Análise de sentimento: POSITIVO (score: 0.78)',
      if_else: '🔀 Condição avaliada: TRUE → seguindo branch principal',
      switch: '🎯 Switch/Case: roteando para case "vendas"',
      time_check: '⏰ Verificação horário: dentro do horário comercial',
      send_text: '💬 Enviando mensagem de texto personalizada...',
      send_image: '🖼️ Enviando imagem via API WhatsApp...',
      send_file: '📄 Enviando documento PDF anexado...',
      api_call: '🔗 Chamando API externa: GET /api/customer/123',
      save_data: '💾 Salvando dados no banco PostgreSQL...',
      crm: '👥 Atualizando registro no CRM: lead qualificado',
      email: '📧 Enviando email de notificação...',
      calendar: '📅 Criando evento no calendário...',
      ecommerce: '🛒 Verificando status do pedido #12345',
    };

    for (let i = 0; i < nodes.length; i++) {
      setActiveStep(i);
      const node = nodes[i];
      const log = logMessages[node.typeId] || `⚙️ Executando: ${node.label}`;
      
      setSimulationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
      await new Promise(r => setTimeout(r, 1200 + Math.random() * 500));
    }

    setSimulationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Flow executado com sucesso em ${nodes.length} etapas!`]);
    await new Promise(r => setTimeout(r, 800));
    setIsSimulating(false);
    setActiveStep(-1);
  };

  return (
    <Card className="overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/10 bg-card/95 backdrop-blur-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 sm:p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur">
              <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Flow Builder Genesis</h3>
              <p className="text-[10px] sm:text-xs text-white/70">Arraste, conecte e simule</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
              {nodes.length} nós
            </Badge>
            <Badge className="bg-green-500/30 text-white border-green-400/30 text-[10px]">
              Interativo
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Templates */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs text-muted-foreground self-center">Templates:</span>
          {FLOW_TEMPLATES.map((template) => (
            <Button
              key={template.name}
              variant="outline"
              size="sm"
              onClick={() => loadTemplate(template)}
              disabled={isSimulating}
              className="text-[10px] sm:text-xs h-6 sm:h-7 px-2"
            >
              {template.name}
            </Button>
          ))}
        </div>

        {/* Flow Canvas - Horizontal scroll no mobile */}
        <div className="relative p-3 sm:p-4 bg-muted/30 rounded-xl border min-h-[140px] sm:min-h-[180px] overflow-x-auto">
          <div className={cn(
            "flex items-center gap-1.5 sm:gap-2",
            isMobile ? "min-w-max" : "flex-wrap justify-center"
          )}>
            {nodes.map((node, index) => {
              const Icon = node.icon;
              const isActive = activeStep === index;
              const isDone = activeStep > index;
              
              return (
                <div key={node.id} className="flex items-center">
                  <motion.div
                    draggable={!isSimulating && !isMobile}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isActive ? 1.08 : 1,
                      y: isActive ? -4 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="relative group cursor-grab active:cursor-grabbing"
                  >
                    <div className={cn(
                      "flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-xl border-2 transition-all min-w-[60px] sm:min-w-[80px]",
                      isActive 
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/30" 
                        : isDone
                          ? "border-green-500/50 bg-green-500/5"
                          : "border-border/50 bg-card hover:border-primary/50"
                    )}>
                      {/* Drag handle - apenas desktop */}
                      {!isMobile && !isSimulating && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}

                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all",
                        node.color,
                        isActive && "animate-pulse shadow-lg"
                      )}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-medium text-center leading-tight line-clamp-2">
                        {node.label}
                      </span>
                      
                      {/* Status badge */}
                      {isDone && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 bg-background rounded-full" />
                        </motion.div>
                      )}
                      
                      {/* Delete button */}
                      {nodes.length > 2 && !isSimulating && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNode(node.id);
                          }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Connector */}
                  {index < nodes.length - 1 && (
                    <motion.div 
                      className="flex items-center mx-0.5 sm:mx-1"
                      animate={{
                        opacity: activeStep > index ? 1 : 0.4,
                      }}
                    >
                      <motion.div 
                        className={cn(
                          "w-4 sm:w-6 h-0.5",
                          activeStep > index ? "bg-green-500" : "bg-border"
                        )}
                        animate={{
                          scaleX: activeStep === index ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 0.5, repeat: activeStep === index ? Infinity : 0 }}
                      />
                      <ArrowRight className={cn(
                        "w-2.5 h-2.5 sm:w-3 sm:h-3 -ml-0.5",
                        activeStep > index ? "text-green-500" : "text-muted-foreground/50"
                      )} />
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Add node button */}
            {nodes.length < 8 && !isSimulating && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNodePicker(true)}
                className="flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all min-w-[60px] sm:min-w-[80px]"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium text-primary">Adicionar</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Node Picker Modal */}
        <AnimatePresence>
          {showNodePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-muted/50 rounded-xl border p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Selecione um componente</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowNodePicker(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <ScrollArea className="max-h-[200px] sm:max-h-[240px]">
                  <div className="space-y-3">
                    {Object.entries(NODE_TYPES).map(([key, category]) => (
                      <div key={key}>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1.5">{category.category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {category.types.map((type) => {
                            const Icon = type.icon;
                            return (
                              <motion.button
                                key={type.id}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => addNode(type.id, key)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-card border hover:border-primary/50 transition-colors"
                              >
                                <div className={cn("w-5 h-5 rounded flex items-center justify-center", type.color)}>
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-[10px] sm:text-xs">{type.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulation Console */}
        <AnimatePresence>
          {simulationLogs.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-900 rounded-lg p-2.5 sm:p-3 font-mono text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 max-h-[120px] sm:max-h-[140px] overflow-y-auto">
                {simulationLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "leading-relaxed",
                      log.includes('✅') ? "text-green-400" : "text-gray-300"
                    )}
                  >
                    <span className="text-gray-500">{log.split(']')[0]}]</span>
                    <span>{log.split(']')[1]}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Run Button */}
        <Button 
          onClick={runSimulation}
          disabled={isSimulating || nodes.length < 2}
          className="w-full h-10 sm:h-11 font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Simulando... ({activeStep + 1}/{nodes.length})
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Simular Execução do Flow
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-[10px] text-center text-muted-foreground">
          <MousePointerClick className="w-3 h-3 inline mr-1" />
          Arraste para reordenar • Clique para adicionar • Este é o motor real do Genesis
        </p>
      </CardContent>
    </Card>
  );
};

export default FlowBuilderDemo;
