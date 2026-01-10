/**
 * CAKTO AUTOMATION MODAL - Modal com regras e produtos
 * Permite criar, editar e gerenciar regras de automação
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  Package,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Megaphone,
  Settings2,
  CreditCard,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CaktoEventType, CAKTO_EVENT_LABELS, CAKTO_EVENT_COLORS } from './types';
import { toast } from 'sonner';

interface CaktoAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceId: string;
  integrationId?: string;
}

interface CaktoProduct {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  type: 'unique' | 'subscription';
  status: 'active' | 'blocked' | 'deleted';
  category?: { id: string; name: string };
}

interface CaktoRule {
  id: string;
  instance_id: string;
  integration_id: string;
  event_type: CaktoEventType;
  campaign_id: string | null;
  is_active: boolean;
  delay_seconds: number;
  delay_max_seconds: number;
  anti_ban_enabled: boolean;
  cooldown_minutes: number;
  max_per_hour: number;
  created_at: string;
  campaign?: {
    id: string;
    name: string;
    status: string;
  };
}

interface Campaign {
  id: string;
  name: string;
  status: string;
}

const EVENT_ICONS: Record<CaktoEventType, typeof ShoppingCart> = {
  initiate_checkout: ShoppingCart,
  pix_generated: CreditCard,
  pix_expired: XCircle,
  purchase_approved: CheckCircle2,
  purchase_refused: XCircle,
  purchase_refunded: RotateCcw,
  purchase_chargeback: AlertTriangle,
  checkout_abandonment: Clock,
  boleto_generated: CreditCard,
  boleto_expired: XCircle,
};

const ALL_EVENT_TYPES: CaktoEventType[] = [
  'initiate_checkout',
  'pix_generated',
  'pix_expired',
  'purchase_approved',
  'purchase_refused',
  'purchase_refunded',
  'purchase_chargeback',
  'checkout_abandonment',
  'boleto_generated',
  'boleto_expired',
];

export function CaktoAutomationModal({ 
  open, 
  onOpenChange, 
  instanceId,
  integrationId 
}: CaktoAutomationModalProps) {
  const [activeTab, setActiveTab] = useState('rules');
  
  // Products state - now fetched from local DB via edge function
  const [products, setProducts] = useState<CaktoProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  // Rules state
  const [rules, setRules] = useState<CaktoRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editingRule, setEditingRule] = useState<CaktoEventType | null>(null);
  const [savingRule, setSavingRule] = useState(false);
  
  // Form state for editing
  const [ruleForm, setRuleForm] = useState<{
    campaign_id: string;
    delay_seconds: number;
    delay_max_seconds: number;
    cooldown_minutes: number;
    max_per_hour: number;
    anti_ban_enabled: boolean;
  }>({
    campaign_id: '',
    delay_seconds: 0,
    delay_max_seconds: 0,
    cooldown_minutes: 60,
    max_per_hour: 50,
    anti_ban_enabled: true,
  });

  // Fetch products from local database (synced by edge function)
  const fetchProducts = useCallback(async () => {
    if (!integrationId) return;
    setLoadingProducts(true);
    try {
      let query = supabase
        .from('genesis_cakto_products')
        .select('*')
        .eq('integration_id', integrationId)
        .order('name', { ascending: true });

      if (productSearch) {
        query = query.ilike('name', `%${productSearch}%`);
      }

      if (productFilter && productFilter !== 'all') {
        query = query.eq('status', productFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        if (error.code === '42P01') {
          setProducts([]);
          return;
        }
        throw error;
      }

      console.log('[CaktoAutomationModal] Products fetched:', data?.length);

      // Map to expected format
      const mappedProducts = (data || []).map(p => ({
        id: p.external_id,
        name: p.name || 'Sem nome',
        image: p.image_url || '',
        description: p.description || '',
        price: Number(p.price) || 0,
        type: (p.metadata as any)?.type || 'unique',
        status: (p.status || 'active') as 'active' | 'blocked' | 'deleted',
        category: (p.metadata as any)?.category,
      }));

      setProducts(mappedProducts);

      // Get last sync time
      const { data: intData } = await supabase
        .from('genesis_instance_integrations')
        .select('metadata, last_sync_at')
        .eq('id', integrationId)
        .single();
      
      if (intData?.last_sync_at) {
        setLastSync(intData.last_sync_at);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoadingProducts(false);
    }
  }, [integrationId, productSearch, productFilter]);

  // Sync products from Cakto API
  const syncProducts = useCallback(async () => {
    if (!integrationId) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('cakto-sync', {
        body: { action: 'sync_products', integrationId },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || 'Produtos sincronizados!');
        setLastSync(new Date().toISOString());
        await fetchProducts();
      } else {
        throw new Error(data?.error || 'Falha na sincronização');
      }
    } catch (err) {
      console.error('Sync error:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  }, [integrationId, fetchProducts]);

  // Fetch rules from database
  const fetchRules = useCallback(async () => {
    if (!instanceId || !integrationId) return;
    setLoadingRules(true);
    try {
      const { data, error } = await supabase
        .from('genesis_cakto_event_rules')
        .select(`
          *,
          campaign:genesis_campaigns(id, name, status)
        `)
        .eq('instance_id', instanceId)
        .eq('integration_id', integrationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRules((data as CaktoRule[]) || []);
    } catch (err) {
      console.error('Error fetching rules:', err);
      toast.error('Erro ao carregar regras');
    } finally {
      setLoadingRules(false);
    }
  }, [instanceId, integrationId]);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!instanceId) return;
    try {
      const { data, error } = await supabase
        .from('genesis_campaigns')
        .select('id, name, status')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  }, [instanceId]);

  // Setup realtime subscription for rules
  useEffect(() => {
    if (!open || !instanceId || !integrationId) return;

    const channel = supabase
      .channel('cakto-rules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'genesis_cakto_event_rules',
          filter: `instance_id=eq.${instanceId}`,
        },
        () => {
          fetchRules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, instanceId, integrationId, fetchRules]);

  // Initial data fetch - fetch products immediately when modal opens
  useEffect(() => {
    if (open && integrationId) {
      fetchRules();
      fetchCampaigns();
      fetchProducts(); // Always fetch products when modal opens
    }
  }, [open, integrationId, fetchRules, fetchCampaigns, fetchProducts]);

  // Refetch products when filter/search changes
  useEffect(() => {
    if (open && activeTab === 'products' && integrationId) {
      fetchProducts();
    }
  }, [productSearch, productFilter]);
  // Get rule for a specific event type
  const getRuleForEvent = (eventType: CaktoEventType): CaktoRule | undefined => {
    return rules.find(r => r.event_type === eventType);
  };

  // Start editing a rule
  const startEditing = (eventType: CaktoEventType) => {
    const existingRule = getRuleForEvent(eventType);
    if (existingRule) {
      setRuleForm({
        campaign_id: existingRule.campaign_id || '',
        delay_seconds: existingRule.delay_seconds || 0,
        delay_max_seconds: existingRule.delay_max_seconds || 0,
        cooldown_minutes: existingRule.cooldown_minutes || 60,
        max_per_hour: existingRule.max_per_hour || 50,
        anti_ban_enabled: existingRule.anti_ban_enabled ?? true,
      });
    } else {
      setRuleForm({
        campaign_id: '',
        delay_seconds: 0,
        delay_max_seconds: 0,
        cooldown_minutes: 60,
        max_per_hour: 50,
        anti_ban_enabled: true,
      });
    }
    setEditingRule(eventType);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingRule(null);
    setRuleForm({
      campaign_id: '',
      delay_seconds: 0,
      delay_max_seconds: 0,
      cooldown_minutes: 60,
      max_per_hour: 50,
      anti_ban_enabled: true,
    });
  };

  // Save rule
  const saveRule = async (eventType: CaktoEventType) => {
    if (!integrationId || !ruleForm.campaign_id) {
      toast.error('Selecione uma campanha');
      return;
    }

    setSavingRule(true);
    try {
      const existingRule = getRuleForEvent(eventType);
      
      const ruleData = {
        instance_id: instanceId,
        integration_id: integrationId,
        event_type: eventType,
        campaign_id: ruleForm.campaign_id,
        delay_seconds: ruleForm.delay_seconds,
        delay_max_seconds: ruleForm.delay_max_seconds,
        cooldown_minutes: ruleForm.cooldown_minutes,
        max_per_hour: ruleForm.max_per_hour,
        anti_ban_enabled: ruleForm.anti_ban_enabled,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (existingRule) {
        const { error } = await supabase
          .from('genesis_cakto_event_rules')
          .update(ruleData)
          .eq('id', existingRule.id);
        
        if (error) throw error;
        toast.success('Regra atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('genesis_cakto_event_rules')
          .insert(ruleData);
        
        if (error) throw error;
        toast.success('Regra criada com sucesso');
      }

      setEditingRule(null);
      fetchRules();
    } catch (err: any) {
      console.error('Error saving rule:', err);
      toast.error(err.message || 'Erro ao salvar regra');
    } finally {
      setSavingRule(false);
    }
  };

  // Toggle rule active status
  const toggleRuleActive = async (rule: CaktoRule) => {
    try {
      const { error } = await supabase
        .from('genesis_cakto_event_rules')
        .update({ 
          is_active: !rule.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rule.id);

      if (error) throw error;
      toast.success(rule.is_active ? 'Regra desativada' : 'Regra ativada');
      fetchRules();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar regra');
    }
  };

  // Delete rule
  const deleteRule = async (rule: CaktoRule) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;

    try {
      const { error } = await supabase
        .from('genesis_cakto_event_rules')
        .delete()
        .eq('id', rule.id);

      if (error) throw error;
      toast.success('Regra excluída');
      fetchRules();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir regra');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            Central de Automação Cakto
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 grid w-fit grid-cols-2">
            <TabsTrigger value="rules" className="gap-2 px-6">
              <Zap className="w-4 h-4" />
              Regras ({rules.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 px-6">
              <Package className="w-4 h-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          {/* RULES TAB */}
          <TabsContent value="rules" className="flex-1 overflow-auto m-0 p-6">
            {loadingRules ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Configure regras para disparar campanhas automaticamente quando eventos ocorrerem na Cakto.
                  </p>
                  <Button variant="outline" size="sm" onClick={fetchRules}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                </div>

                <div className="space-y-3">
                  {ALL_EVENT_TYPES.map(eventType => {
                    const colors = CAKTO_EVENT_COLORS[eventType];
                    const Icon = EVENT_ICONS[eventType];
                    const rule = getRuleForEvent(eventType);
                    const isEditing = editingRule === eventType;

                    return (
                      <Card key={eventType} className={`${colors.border} border transition-all`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${colors.text}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{CAKTO_EVENT_LABELS[eventType]}</p>
                                {rule && (
                                  <Badge variant={rule.is_active ? 'default' : 'secondary'} className="text-xs">
                                    {rule.is_active ? 'Ativo' : 'Inativo'}
                                  </Badge>
                                )}
                              </div>

                              {isEditing ? (
                                /* Editing Form */
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 space-y-4"
                                >
                                  {/* Campaign Select */}
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium flex items-center gap-2">
                                      <Megaphone className="w-3 h-3" />
                                      Campanha a disparar
                                    </Label>
                                    <Select
                                      value={ruleForm.campaign_id}
                                      onValueChange={(v) => setRuleForm(f => ({ ...f, campaign_id: v }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma campanha" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {campaigns.map(c => (
                                          <SelectItem key={c.id} value={c.id}>
                                            <span className="flex items-center gap-2">
                                              {c.name}
                                              <Badge variant="outline" className="text-xs ml-2">
                                                {c.status}
                                              </Badge>
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Delay Settings */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium">Delay mínimo (segundos)</Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={ruleForm.delay_seconds}
                                        onChange={(e) => setRuleForm(f => ({ ...f, delay_seconds: parseInt(e.target.value) || 0 }))}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium">Delay máximo (segundos)</Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={ruleForm.delay_max_seconds}
                                        onChange={(e) => setRuleForm(f => ({ ...f, delay_max_seconds: parseInt(e.target.value) || 0 }))}
                                      />
                                    </div>
                                  </div>

                                  {/* Rate Limiting */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium">Cooldown (minutos)</Label>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={ruleForm.cooldown_minutes}
                                        onChange={(e) => setRuleForm(f => ({ ...f, cooldown_minutes: parseInt(e.target.value) || 0 }))}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium">Máx. por hora</Label>
                                      <Input
                                        type="number"
                                        min={1}
                                        value={ruleForm.max_per_hour}
                                        onChange={(e) => setRuleForm(f => ({ ...f, max_per_hour: parseInt(e.target.value) || 1 }))}
                                      />
                                    </div>
                                  </div>

                                  {/* Anti-ban */}
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <Label className="text-xs font-medium">Anti-ban ativo</Label>
                                      <p className="text-xs text-muted-foreground">Delays aleatórios para evitar bloqueios</p>
                                    </div>
                                    <Switch
                                      checked={ruleForm.anti_ban_enabled}
                                      onCheckedChange={(v) => setRuleForm(f => ({ ...f, anti_ban_enabled: v }))}
                                    />
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 pt-2">
                                    <Button
                                      size="sm"
                                      onClick={() => saveRule(eventType)}
                                      disabled={savingRule || !ruleForm.campaign_id}
                                    >
                                      {savingRule ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                      )}
                                      Salvar
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                      <X className="w-4 h-4 mr-2" />
                                      Cancelar
                                    </Button>
                                  </div>
                                </motion.div>
                              ) : rule ? (
                                /* Rule exists - show summary */
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Megaphone className="w-3 h-3" />
                                    {rule.campaign?.name || 'Sem campanha'}
                                  </span>
                                  {rule.delay_seconds > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {rule.delay_seconds}s delay
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Nenhuma regra configurada
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            {!isEditing && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {rule ? (
                                  <>
                                    <Switch
                                      checked={rule.is_active}
                                      onCheckedChange={() => toggleRuleActive(rule)}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => startEditing(eventType)}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => deleteRule(rule)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEditing(eventType)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Configurar
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {campaigns.length === 0 && (
                  <Card className="border-dashed border-amber-500/50 bg-amber-500/5">
                    <CardContent className="py-6 text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                      <p className="font-medium">Nenhuma campanha encontrada</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Crie uma campanha primeiro para vincular às regras de automação.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="flex-1 min-h-0 flex flex-col m-0 p-6 overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                  />
                </div>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="blocked">Bloqueados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                {lastSync && (
                  <span className="text-xs text-muted-foreground">
                    Sync: {new Date(lastSync).toLocaleDateString('pt-BR')}
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={syncProducts} 
                  disabled={syncing || !integrationId}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              {loadingProducts ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
              ) : products.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="font-medium">Nenhum produto encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clique em "Sincronizar" para buscar produtos da Cakto.
                    </p>
                    <Button 
                      variant="default" 
                      className="mt-4 gap-2"
                      onClick={syncProducts}
                      disabled={syncing}
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                      Sincronizar Agora
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{product.name}</p>
                          <p className="text-lg font-bold text-primary">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status === 'active' ? 'Ativo' : product.status === 'blocked' ? 'Bloqueado' : 'Deletado'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {product.type === 'subscription' ? 'Assinatura' : 'Único'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
