/**
 * Seção de Configuração de Planos
 * Permite admin configurar valores dos planos
 */

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Check, AlertCircle, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_cents: number;
  promo_price_cents: number | null;
  duration_months: number;
  is_popular: boolean;
  discount_percentage: number | null;
  tagline: string | null;
  features: string[];
}

export function PlansConfigSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [editedPlans, setEditedPlans] = useState<Record<string, Partial<Plan>>>({});

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('checkout_plans')
        .select('*')
        .order('duration_months', { ascending: true });

      if (error) throw error;
      
      setPlans(data?.map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features as string[] : [],
      })) || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(planId: string, field: keyof Plan, value: any) {
    setEditedPlans(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: value,
      },
    }));
  }

  function getEditedValue<T>(planId: string, field: keyof Plan, originalValue: T): T {
    return editedPlans[planId]?.[field] !== undefined 
      ? editedPlans[planId][field] as T 
      : originalValue;
  }

  async function savePlan(plan: Plan) {
    const edits = editedPlans[plan.id];
    if (!edits) return;

    setSavingPlanId(plan.id);
    try {
      const updateData: Record<string, unknown> = {};
      
      if (edits.price_cents !== undefined) updateData.price_cents = edits.price_cents;
      if (edits.promo_price_cents !== undefined) updateData.promo_price_cents = edits.promo_price_cents;
      if (edits.is_popular !== undefined) updateData.is_popular = edits.is_popular;
      if (edits.discount_percentage !== undefined) updateData.discount_percentage = edits.discount_percentage;
      if (edits.tagline !== undefined) updateData.tagline = edits.tagline;

      const { error } = await supabase
        .from('checkout_plans')
        .update(updateData)
        .eq('id', plan.id);

      if (error) throw error;

      toast.success(`${plan.display_name} atualizado!`);
      
      // Clear edits and reload
      setEditedPlans(prev => {
        const next = { ...prev };
        delete next[plan.id];
        return next;
      });
      
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Erro ao salvar plano');
    } finally {
      setSavingPlanId(null);
    }
  }

  function formatCurrency(cents: number): string {
    return (cents / 100).toFixed(2).replace('.', ',');
  }

  function parseCurrency(value: string): number {
    const clean = value.replace(/[^\d,]/g, '').replace(',', '.');
    return Math.round(parseFloat(clean || '0') * 100);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configurar Planos</h3>
          <p className="text-sm text-muted-foreground">
            Defina os valores dos planos comercial e promocional
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const hasChanges = editedPlans[plan.id] && Object.keys(editedPlans[plan.id]).length > 0;
          const isSaving = savingPlanId === plan.id;
          const isPopular = getEditedValue(plan.id, 'is_popular', plan.is_popular);

          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative transition-all",
                isPopular && "ring-2 ring-primary"
              )}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    POPULAR
                  </span>
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {plan.display_name}
                </CardTitle>
                <CardDescription>
                  {plan.duration_months} {plan.duration_months === 1 ? 'mês' : 'meses'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price Commercial */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Valor Comercial (R$)
                  </Label>
                  <Input
                    type="text"
                    value={formatCurrency(getEditedValue(plan.id, 'price_cents', plan.price_cents))}
                    onChange={(e) => handleChange(plan.id, 'price_cents', parseCurrency(e.target.value))}
                    className="h-10"
                  />
                </div>

                {/* Price Promo */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Valor Promocional (R$)
                  </Label>
                  <Input
                    type="text"
                    value={formatCurrency(getEditedValue(plan.id, 'promo_price_cents', plan.promo_price_cents || plan.price_cents))}
                    onChange={(e) => handleChange(plan.id, 'promo_price_cents', parseCurrency(e.target.value))}
                    className="h-10"
                  />
                </div>

                {/* Discount % */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Desconto Exibido (%)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={getEditedValue(plan.id, 'discount_percentage', plan.discount_percentage || 0)}
                    onChange={(e) => handleChange(plan.id, 'discount_percentage', parseInt(e.target.value) || 0)}
                    className="h-10"
                  />
                </div>

                {/* Tagline */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Subtítulo
                  </Label>
                  <Input
                    type="text"
                    value={getEditedValue(plan.id, 'tagline', plan.tagline || '')}
                    onChange={(e) => handleChange(plan.id, 'tagline', e.target.value)}
                    placeholder="Ex: Ideal para começar"
                    className="h-10"
                  />
                </div>

                {/* Is Popular */}
                <div className="flex items-center justify-between pt-2">
                  <Label className="text-sm">Marcar como Popular</Label>
                  <Switch
                    checked={isPopular}
                    onCheckedChange={(checked) => handleChange(plan.id, 'is_popular', checked)}
                  />
                </div>

                {/* Save Button */}
                {hasChanges && (
                  <Button
                    onClick={() => savePlan(plan)}
                    disabled={isSaving}
                    className="w-full mt-2"
                    size="sm"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Sincronização Automática</p>
            <p>
              Os valores configurados aqui são usados automaticamente na página comercial 
              e nas páginas promocionais. Alterações são aplicadas imediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
