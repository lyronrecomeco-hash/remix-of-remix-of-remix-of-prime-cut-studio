import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Gift, 
  Users, 
  Link2,
  Crown,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromoReferral {
  id: string;
  referred_name: string | null;
  referred_email: string | null;
  plan_type: string;
  plan_value: number;
  status: string;
  created_at: string;
}

interface PromocionalTabProps {
  userId: string;
  onBack?: () => void;
}

export function PromocionalTab({ userId }: PromocionalTabProps) {
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoLinkId, setPromoLinkId] = useState<string>('');
  const [referrals, setReferrals] = useState<PromoReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const promoLink = `https://genesishub.cloud/promo/${promoCode}`;

  useEffect(() => {
    loadPromoData();
  }, [userId]);

  const loadPromoData = async () => {
    try {
      let { data: promoLinkData } = await supabase
        .from('promo_links')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!promoLinkData) {
        const code = generatePromoCode();
        const { data: newLink, error: createError } = await supabase
          .from('promo_links')
          .insert({ user_id: userId, promo_code: code })
          .select()
          .single();

        if (createError) throw createError;
        promoLinkData = newLink;
      }

      setPromoCode(promoLinkData.promo_code);
      setPromoLinkId(promoLinkData.id);

      const { data: referralData } = await supabase
        .from('promo_referrals')
        .select('*')
        .eq('promo_link_id', promoLinkData.id)
        .order('created_at', { ascending: false });

      setReferrals(referralData || []);
    } catch (error) {
      console.error('Erro ao carregar dados promocionais:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success('Link copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const getPlanLabel = (planType: string) => {
    return planType === 'monthly_promo' ? 'Mensal' : 'Anual';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Gift className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Link Promocional */}
      <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Seu Link Exclusivo</h3>
              <p className="text-sm text-white/50">Compartilhe para indicar novos usuários</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-white/80 truncate">
              {promoLink}
            </div>
            <Button 
              onClick={() => copyToClipboard(promoLink)}
              variant="outline"
              size="sm"
              className="flex-shrink-0 gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Planos Promocionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plano Mensal */}
        <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)] hover:border-white/20 transition-colors" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Mensal</h3>
                  <p className="text-xs text-white/50">Acesso completo</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                Promo
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">R$ 197</span>
              <span className="text-white/50 text-sm">/mês</span>
            </div>
          </CardContent>
        </Card>

        {/* Plano Anual */}
        <Card className="border border-primary/30 bg-[hsl(215_30%_12%)] hover:border-primary/50 transition-colors" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Anual</h3>
                  <p className="text-xs text-white/50">12 meses de acesso</p>
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border-0 text-xs">
                Melhor valor
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">R$ 697</span>
              <span className="text-white/50 text-sm">/ano</span>
            </div>
            <p className="text-xs text-green-400 mt-2">≈ R$ 58/mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Indicados */}
      <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[hsl(260_50%_30%_/_0.5)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[hsl(260_70%_70%)]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Indicações</h3>
              <p className="text-sm text-white/50">
                {referrals.length === 0 ? 'Nenhuma indicação ainda' : `${referrals.length} usuário${referrals.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
              <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                As indicações aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-sm font-medium text-white/50">Nome</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-white/50">Plano</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-white/50">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-white/50">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-white/5">
                      <td className="py-3 px-2">
                        <p className="font-medium text-white text-sm">
                          {referral.referred_name || 'Usuário'}
                        </p>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-white/70">
                          {getPlanLabel(referral.plan_type)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant="secondary"
                          className={`text-xs border-0 ${
                            referral.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {referral.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-medium text-white text-sm">
                          {formatCurrency(referral.plan_value)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
