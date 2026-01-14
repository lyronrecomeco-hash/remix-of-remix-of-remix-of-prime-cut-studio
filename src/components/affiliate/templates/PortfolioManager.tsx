import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Eye, 
  Copy, 
  Trash2, 
  Pencil, 
  ExternalLink, 
  MoreVertical,
  FolderOpen,
  Plus,
  Loader2,
  TrendingUp,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AffiliateTemplateConfig } from './types';

interface PortfolioManagerProps {
  configs: AffiliateTemplateConfig[];
  loading: boolean;
  onEdit: (config: AffiliateTemplateConfig) => void;
  onDelete: (id: string) => Promise<boolean>;
  onCreateNew: () => void;
}

export function PortfolioManager({ 
  configs: initialConfigs, 
  loading, 
  onEdit, 
  onDelete,
  onCreateNew 
}: PortfolioManagerProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [configs, setConfigs] = useState(initialConfigs);
  const [refreshing, setRefreshing] = useState(false);
  
  // Test automation modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testingConfig, setTestingConfig] = useState<AffiliateTemplateConfig | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Update configs when props change
  useEffect(() => {
    setConfigs(initialConfigs);
  }, [initialConfigs]);

  // Real-time subscription for views
  useEffect(() => {
    if (configs.length === 0) return;

    const configIds = configs.map(c => c.id);
    
    const channel = supabase
      .channel('portfolio-views')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'affiliate_template_configs',
          filter: `id=in.(${configIds.join(',')})`,
        },
        (payload) => {
          const updated = payload.new as any;
          setConfigs(prev => prev.map(c => 
            c.id === updated.id 
              ? { ...c, views_count: updated.views_count }
              : c
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [configs.length]);

  const refreshViews = async () => {
    if (configs.length === 0) return;
    
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_template_configs')
        .select('id, views_count')
        .in('id', configs.map(c => c.id));

      if (!error && data) {
        const viewsMap: Record<string, number> = {};
        data.forEach(d => { viewsMap[d.id] = d.views_count; });
        
        setConfigs(prev => prev.map(c => ({
          ...c,
          views_count: viewsMap[c.id] ?? c.views_count
        })));
        
        toast.success('Visualizações atualizadas!');
      }
    } catch (error) {
      console.error('Error refreshing views:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const copyLink = (uniqueCode: string) => {
    const link = `${window.location.origin}/demo/${uniqueCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  const openPreview = (uniqueCode: string) => {
    window.open(`/demo/${uniqueCode}`, '_blank');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    await onDelete(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  const openTestModal = (config: AffiliateTemplateConfig) => {
    setTestingConfig(config);
    setTestPhone('');
    setTestResult(null);
    setTestModalOpen(true);
  };

  const handleSendTest = async () => {
    if (!testingConfig || !testPhone) return;
    
    setSendingTest(true);
    setTestResult(null);
    
    try {
      const demoLink = `${window.location.origin}/demo/${testingConfig.unique_code}`;
      const message = `🧪 *TESTE DE AUTOMAÇÃO*\n\nOlá! Este é um teste do portfólio "${testingConfig.client_name || testingConfig.template_name}".\n\n🔗 Link da demo: ${demoLink}\n\n✅ Se você recebeu esta mensagem, a automação está funcionando corretamente!`;
      
      // Clean phone number
      const cleanPhone = testPhone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp-genesis', {
        body: {
          to: formattedPhone,
          message,
          instanceId: null // Use global instance
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setTestResult('success');
        toast.success('Teste enviado com sucesso!');
      } else {
        // Fallback to WhatsApp Web
        const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
        window.open(waLink, '_blank');
        setTestResult('success');
        toast.success('Abrindo WhatsApp Web...');
      }
    } catch (error) {
      console.error('Error sending test:', error);
      setTestResult('error');
      
      // Fallback to WhatsApp Web
      const cleanPhone = testPhone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      const demoLink = `${window.location.origin}/demo/${testingConfig.unique_code}`;
      const message = `🧪 *TESTE DE AUTOMAÇÃO*\n\nOlá! Este é um teste do portfólio "${testingConfig.client_name || testingConfig.template_name}".\n\n🔗 Link da demo: ${demoLink}`;
      
      const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(waLink, '_blank');
      toast.info('Abrindo WhatsApp Web como alternativa');
    } finally {
      setSendingTest(false);
    }
  };

  const totalViews = configs.reduce((acc, c) => acc + c.views_count, 0);
  const activeCount = configs.filter(c => c.is_active).length;
  const avgViews = configs.length > 0 ? Math.round(totalViews / configs.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <FolderOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum portfólio criado
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Crie seu primeiro portfólio personalizado para enviar aos seus clientes potenciais.
        </p>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeiro Portfólio
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Stats Summary with Refresh */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Estatísticas em Tempo Real</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshViews}
            disabled={refreshing}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{configs.length}</div>
              <div className="text-xs text-muted-foreground">Portfólios</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-2xl font-bold text-foreground">{totalViews}</span>
              </div>
              <div className="text-xs text-muted-foreground">Visualizações</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Ativos</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span className="text-2xl font-bold text-foreground">{avgViews}</span>
              </div>
              <div className="text-xs text-muted-foreground">Média/Portfólio</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        <div className="grid gap-4">
          <AnimatePresence>
            {configs.map((config, index) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">
                            {config.client_name || 'Sem nome'}
                          </h4>
                          {config.is_active ? (
                            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Template: {config.template_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono bg-muted px-2 py-0.5 rounded">
                            /demo/{config.unique_code}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-blue-500">
                            <Eye className="w-3 h-3" />
                            {config.views_count}
                          </span>
                          <span>•</span>
                          <span>
                            {format(new Date(config.created_at), "dd 'de' MMM", { locale: ptBR })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(config.unique_code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPreview(config.unique_code)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openTestModal(config)}>
                              <Send className="w-4 h-4 mr-2" />
                              Enviar Teste
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPreview(config.unique_code)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyLink(config.unique_code)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(config)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteId(config.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir portfólio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O link deixará de funcionar imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Teste de Automação */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Testar Automação
            </DialogTitle>
            <DialogDescription>
              Envie um teste para seu WhatsApp para verificar se a automação está funcionando.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {testingConfig && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{testingConfig.client_name || testingConfig.template_name}</p>
                <p className="text-xs text-muted-foreground">Template: {testingConfig.template_name}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="test-phone">Seu número de WhatsApp</Label>
              <Input
                id="test-phone"
                placeholder="(11) 99999-9999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Você receberá uma mensagem de teste com o link do portfólio.
              </p>
            </div>

            {testResult === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600">Teste enviado com sucesso!</span>
              </div>
            )}

            {testResult === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-amber-600">Abrindo WhatsApp Web como alternativa...</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setTestModalOpen(false)}>
              Fechar
            </Button>
            <Button 
              onClick={handleSendTest} 
              disabled={!testPhone || sendingTest}
              className="gap-2"
            >
              {sendingTest ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar Teste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
