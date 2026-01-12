import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, Search, GitBranch, BarChart2, Mic, Library,
  AlertTriangle, ArrowLeft, Filter, SortAsc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessageFlows } from './hooks/useMessageFlows';
import { FlowCard } from './components/FlowCard';
import { CreateFlowModal } from './components/CreateFlowModal';
import { AudioLibraryModal } from './components/AudioLibraryModal';
import { ErrorLogsPanel } from './components/ErrorLogsPanel';

export const MessageFlowCanvasMain = () => {
  const {
    flows, selectedFlowId, setSelectedFlowId, errorLogs,
    createFlow, deleteFlow, duplicateFlow, toggleFlowActive,
    resolveError, clearResolvedErrors
  } = useMessageFlows();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAudioLibrary, setShowAudioLibrary] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFlows = flows.filter(f => f.isActive).length;
  const unresolvedErrors = errorLogs.filter(e => !e.resolved).length;

  const handleCreateFlow = (name: string, description?: string) => {
    const newFlow = createFlow(name, description);
    setSelectedFlowId(newFlow.id);
  };

  // Canvas view (editing a flow) - placeholder for full canvas implementation
  if (selectedFlowId) {
    const selectedFlow = flows.find(f => f.id === selectedFlowId);
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b bg-background">
          <Button variant="ghost" size="sm" onClick={() => setSelectedFlowId(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold">{selectedFlow?.name}</h2>
            <p className="text-xs text-muted-foreground">{selectedFlow?.description || 'Sem descrição'}</p>
          </div>
          <Badge variant={selectedFlow?.isActive ? 'default' : 'secondary'}>
            {selectedFlow?.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center">
            <GitBranch className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg mb-2">Canvas Visual</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              O canvas visual completo será implementado aqui. 
              Arraste nós de mensagem para criar seu flow inteligente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Flows</p>
                <p className="text-2xl font-bold">{flows.length}</p>
              </div>
              <GitBranch className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeFlows}</p>
              </div>
              <BarChart2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            "bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20"
          )}
          onClick={() => setShowAudioLibrary(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Biblioteca</p>
                <p className="text-sm font-medium text-purple-600">Áudios PTT</p>
              </div>
              <Mic className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "bg-gradient-to-br",
          unresolvedErrors > 0 
            ? "from-amber-500/10 to-amber-500/5 border-amber-500/20"
            : "from-gray-500/10 to-gray-500/5 border-gray-500/20"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Erros</p>
                <p className={cn("text-2xl font-bold", unresolvedErrors > 0 && "text-amber-600")}>
                  {unresolvedErrors}
                </p>
              </div>
              <AlertTriangle className={cn("w-8 h-8 opacity-50", unresolvedErrors > 0 ? "text-amber-500" : "text-gray-400")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar flows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <SortAsc className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Flow
          </Button>
        </div>
      </div>

      {/* Flows Grid */}
      <ScrollArea className="h-[400px]">
        {filteredFlows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <GitBranch className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-semibold text-lg mb-2">Nenhum Message Flow</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Crie seu primeiro flow de mensagens para configurar comportamentos 
              inteligentes reutilizáveis em suas automações.
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeiro Flow
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            <AnimatePresence>
              {filteredFlows.map((flow) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  onSelect={setSelectedFlowId}
                  onEdit={setSelectedFlowId}
                  onDuplicate={duplicateFlow}
                  onDelete={deleteFlow}
                  onToggleActive={toggleFlowActive}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Error Logs */}
      {errorLogs.length > 0 && (
        <ErrorLogsPanel
          errors={errorLogs}
          onResolve={resolveError}
          onClearResolved={clearResolvedErrors}
        />
      )}

      {/* Modals */}
      <CreateFlowModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreate={handleCreateFlow}
      />
      
      <AudioLibraryModal
        open={showAudioLibrary}
        onOpenChange={setShowAudioLibrary}
      />
    </div>
  );
};
