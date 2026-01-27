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
  Shield,
  Target,
  Star,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Rocket,
  DollarSign,
  Sparkles,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WithdrawalModal } from './WithdrawalModal';

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
  const [availableBalance, setAvailableBalance] = useState(0);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const promoLink = `https://genesishub.cloud/promo/${promoCode}`;

  useEffect(() => {
    loadPromoData();
  }, [userId]);

  useEffect(() => {
    if (promoLinkId) {
      loadBalance();
    }
  }, [promoLinkId, userId]);

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

  const loadBalance = async () => {
    try {
      const { data: referralData } = await supabase
        .from('promo_referrals')
        .select('plan_value')
        .eq('promo_link_id', promoLinkId)
        .eq('status', 'active');

      const { data: withdrawalsData } = await supabase
        .from('promotional_withdrawals')
        .select('amount, status')
        .eq('promotional_user_id', userId)
        .in('status', ['pending', 'paid']);

      const totalCommission = (referralData || []).reduce((acc, r) => acc + (r.plan_value * 0.10), 0);
      const totalWithdrawn = (withdrawalsData || []).reduce((acc, w) => acc + w.amount, 0);
      
      setAvailableBalance(Math.max(0, totalCommission - totalWithdrawn));
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
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
  const comissaoTotal = valorTotal * 0.10;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Rocket className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/30 flex items-center justify-center border border-primary/30">
              <Rocket className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Multiplique com Genesis Hub
                <Sparkles className="w-5 h-5 text-primary" />
              </h2>
              <p className="text-white/60">Ganhe comissões por cada indicação que converter</p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowWithdrawalModal(true)}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
            style={{ borderRadius: '12px' }}
          >
            <Banknote className="w-4 h-4" />
            Sacar Comissões
            {availableBalance > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0 ml-1">
                {formatCurrency(availableBalance)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-white/[0.08] bg-white/[0.02]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{totalIndicados}</p>
            <p className="text-xs text-white/50">Indicações</p>
          </CardContent>
        </Card>

        <Card className="border border-white/[0.08] bg-white/[0.02]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{indicadosAtivos}</p>
            <p className="text-xs text-white/50">Convertidas</p>
          </CardContent>
        </Card>

        <Card className="border border-white/[0.08] bg-white/[0.02]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(valorTotal)}</p>
            <p className="text-xs text-white/50">Gerado</p>
          </CardContent>
        </Card>

        <Card className="border border-primary/30 bg-primary/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(comissaoTotal)}</p>
            <p className="text-xs text-primary/70">Comissões</p>
          </CardContent>
        </Card>
      </div>

      {/* Seu Link Exclusivo */}
      <Card className="border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent overflow-hidden" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Link2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">Seu Link Exclusivo</h3>
              <p className="text-sm text-white/60">
                Cada pessoa que assinar através deste link gera <span className="text-primary font-semibold">10% de comissão</span> diretamente para você.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white/80 truncate">
              {promoLink}
            </div>
            <Button 
              onClick={() => copyToClipboard(promoLink)}
              className="flex-shrink-0 gap-2 bg-primary hover:bg-primary/90"
              style={{ borderRadius: '10px' }}
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Por que indicar? */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Por que indicar Genesis Hub?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-white/[0.08] bg-white/[0.02] hover:border-primary/30 transition-colors" style={{ borderRadius: '14px' }}>
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium text-white mb-1">Venda Fácil</h4>
              <p className="text-sm text-white/50">
                Produto que se vende sozinho. Automação de WhatsApp é o que todo negócio precisa.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/[0.08] bg-white/[0.02] hover:border-primary/30 transition-colors" style={{ borderRadius: '14px' }}>
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="font-medium text-white mb-1">Comissões Reais</h4>
              <p className="text-sm text-white/50">
                10% de cada venda vai direto para sua conta. Sem limite de ganhos.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/[0.08] bg-white/[0.02] hover:border-primary/30 transition-colors" style={{ borderRadius: '14px' }}>
            <CardContent className="p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-medium text-white mb-1">Link Permanente</h4>
              <p className="text-sm text-white/50">
                Seu código nunca expira. Indicações de meses atrás ainda contam.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Planos que seus indicados terão acesso */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Planos Promocionais Exclusivos
        </h3>
        <p className="text-sm text-white/50 mb-4">
          Seus indicados terão acesso a valores especiais que <span className="text-primary">não existem no site público</span>.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-white/[0.08] bg-white/[0.02] hover:border-white/20 transition-all group" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Plano Mensal</h4>
                    <p className="text-xs text-white/50">Acesso completo</p>
                  </div>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                  Promocional
                </Badge>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-white">R$ 197</span>
                <span className="text-white/50 text-sm">/mês</span>
              </div>
              <p className="text-xs text-white/40">
                Sua comissão: <span className="text-primary font-medium">R$ 19,70</span> por venda
              </p>
            </CardContent>
          </Card>

          <Card className="border border-primary/30 bg-primary/5 hover:border-primary/50 transition-all relative overflow-hidden" style={{ borderRadius: '14px' }}>
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
              Mais vendido
            </div>
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
                  -70% OFF
                </Badge>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-white">R$ 697</span>
                <span className="text-white/50 text-sm">/ano</span>
              </div>
              <p className="text-xs text-primary">
                Sua comissão: <span className="font-medium">R$ 69,70</span> por venda
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de Indicações */}
      <Card className="border border-white/[0.08] bg-white/[0.02]" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Suas Indicações</h3>
                <p className="text-sm text-white/50">Acompanhe em tempo real</p>
              </div>
            </div>
            {referrals.length > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                {referrals.length} {referrals.length === 1 ? 'indicação' : 'indicações'}
              </Badge>
            )}
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-white/70 font-medium mb-2">
                Nenhuma indicação ainda
              </p>
              <p className="text-white/40 text-sm max-w-sm mx-auto mb-4">
                Compartilhe seu link e comece a ganhar comissões por cada pessoa que assinar.
              </p>
              <Button 
                onClick={() => copyToClipboard(promoLink)}
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar meu link
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-sm font-medium text-white/50">Nome</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-white/50">Plano</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-white/50">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-white/50">Comissão</th>
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
                          variant="secondary"
                          className={`text-xs border-0 ${
                            referral.status === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {referral.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-medium text-primary text-sm">
                          {formatCurrency(referral.plan_value * 0.10)}
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

      {/* Como funciona */}
      <Card className="border border-white/[0.08] bg-white/[0.02]" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Como funciona</h3>
              <p className="text-sm text-white/50">3 passos para começar a lucrar</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-white">Copie seu link exclusivo</p>
                <p className="text-sm text-white/50">Seu código é único e vinculado à sua conta permanentemente</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-white">Compartilhe com quem precisa</p>
                <p className="text-sm text-white/50">Empresas que usam WhatsApp são o público perfeito</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-white">Receba suas comissões</p>
                <p className="text-sm text-white/50">10% de cada venda, direto via PIX quando você quiser</p>
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Dica de ouro</p>
                <p className="text-xs text-white/60">
                  Mostre como você usa a Genesis Hub no seu negócio. Resultados reais vendem mais que qualquer argumento.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Saque */}
      <WithdrawalModal 
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        userId={userId}
        availableBalance={availableBalance}
        onWithdrawalSubmitted={loadBalance}
      />
    </div>
  );
}
