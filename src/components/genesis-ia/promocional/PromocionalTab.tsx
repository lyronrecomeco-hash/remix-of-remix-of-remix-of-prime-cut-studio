import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Gift, 
  Users, 
  Link2,
  Crown,
  Zap,
  Handshake,
  TrendingUp,
  CheckCircle2,
  Sparkles
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

  // Estatísticas
  const totalIndicados = referrals.length;
  const indicadosAtivos = referrals.filter(r => r.status === 'active').length;
  const valorTotal = referrals.filter(r => r.status === 'active').reduce((acc, r) => acc + r.plan_value, 0);

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
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 pb-4 border-b border-white/10"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-cyan-500/20 flex items-center justify-center border border-primary/20">
          <Handshake className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Programa de Parceiros
            <Sparkles className="w-5 h-5 text-primary" />
          </h2>
          <p className="text-sm text-white/50">Indique e acompanhe suas conversões</p>
        </div>
      </motion.div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{totalIndicados}</p>
                <p className="text-xs text-white/50">Total Indicações</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{indicadosAtivos}</p>
                <p className="text-xs text-white/50">Indicações Ativas</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{formatCurrency(valorTotal)}</p>
                <p className="text-xs text-white/50">Valor Gerado</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Link Promocional - Destaque Principal */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
        <Card className="bg-gradient-to-br from-primary/10 to-cyan-500/5 backdrop-blur-xl border border-primary/30 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Seu Link Exclusivo</h3>
                <p className="text-sm text-white/50">Compartilhe e acompanhe suas indicações</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 font-mono text-sm text-primary truncate">
                {promoLink}
              </div>
              <Button 
                onClick={() => copyToClipboard(promoLink)}
                className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl px-6"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copiado!' : 'Copiar Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Planos Disponíveis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Planos para Indicados</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plano Mensal */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Plano Mensal</h4>
                    <p className="text-xs text-white/50">Acesso completo</p>
                  </div>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">
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
          <Card className="bg-white/5 backdrop-blur-xl border border-primary/30 rounded-2xl hover:border-primary/50 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Plano Anual</h4>
                    <p className="text-xs text-white/50">12 meses completos</p>
                  </div>
                </div>
                <Badge className="bg-primary/20 text-primary border-0 text-xs">
                  Melhor Valor
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">R$ 697</span>
                <span className="text-white/50 text-sm">/ano</span>
              </div>
              <p className="text-xs text-primary mt-2">Economia de 70%</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Lista de Indicações */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Suas Indicações</h3>
                  <p className="text-sm text-white/50">Usuários que assinaram pelo seu link</p>
                </div>
              </div>
              {referrals.length > 0 && (
                <Badge className="bg-primary/20 text-primary border-0">
                  {referrals.length} {referrals.length === 1 ? 'indicação' : 'indicações'}
                </Badge>
              )}
            </div>

            {referrals.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 font-medium mb-2">Nenhuma indicação ainda</p>
                <p className="text-white/40 text-sm max-w-sm mx-auto">
                  Compartilhe seu link e acompanhe aqui quem assinou.
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
                      <tr key={referral.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
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
                            className={`text-xs border-0 ${
                              referral.status === 'active' 
                                ? 'bg-cyan-500/20 text-cyan-400' 
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
      </motion.div>
    </div>
  );
}
