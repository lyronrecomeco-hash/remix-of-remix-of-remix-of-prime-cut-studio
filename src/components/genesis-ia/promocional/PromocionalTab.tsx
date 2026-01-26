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
  HelpCircle,
  Target,
  Megaphone,
  Star,
  CheckCircle2,
  AlertCircle
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
      {/* Header do Programa */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Handshake className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Programa de Parceiros</h2>
          <p className="text-sm text-white/50">Indique e acompanhe suas conversões</p>
        </div>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalIndicados}</p>
              <p className="text-xs text-white/50">Total de Indicações</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{indicadosAtivos}</p>
              <p className="text-xs text-white/50">Indicações Ativas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(valorTotal)}</p>
              <p className="text-xs text-white/50">Valor Gerado</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Benefícios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">Valores Exclusivos</p>
              <p className="text-xs text-white/50">Preços não disponíveis no site</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">Acompanhamento</p>
              <p className="text-xs text-white/50">Veja todas as suas indicações</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">Link Permanente</p>
              <p className="text-xs text-white/50">Seu código exclusivo não expira</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link Promocional */}
      <Card className="border border-primary/30 bg-white/5" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Seu Link de Parceiro</h3>
              <p className="text-sm text-white/50">Compartilhe em grupos e redes sociais</p>
            </div>
          </div>
          <p className="text-sm text-white/60 mb-4 pl-[52px]">
            Todas as assinaturas através deste link serão contabilizadas automaticamente.
          </p>
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
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Planos Disponíveis para Indicados
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Estes são os planos que seus indicados terão acesso ao clicar no seu link. 
          Valores promocionais exclusivos para parceiros.
        </p>
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
                    <h3 className="font-semibold text-white">Plano Mensal</h3>
                    <p className="text-xs text-white/50">Acesso completo por 30 dias</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                  Promocional
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">R$ 197</span>
                <span className="text-white/50 text-sm">/mês</span>
              </div>
              <p className="text-xs text-white/40 mt-2">Renovação automática • Cancele quando quiser</p>
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
                    <h3 className="font-semibold text-white">Plano Anual</h3>
                    <p className="text-xs text-white/50">12 meses de acesso completo</p>
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
              <p className="text-xs text-green-400 mt-2">Equivale a R$ 58/mês • Economia de 70%</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dicas de Sucesso */}
      <Card className="border border-white/[0.08] bg-white/5" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Dicas de Sucesso</h3>
              <p className="text-sm text-white/50">Estratégias para indicar com eficiência</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Seja Autêntico</p>
                  <p className="text-xs text-white/50">Compartilhe sua experiência real</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Mostre Resultados</p>
                  <p className="text-xs text-white/50">Demonstre os benefícios obtidos</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Seja Transparente</p>
                  <p className="text-xs text-white/50">Informe que é seu link exclusivo</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Foco no Valor</p>
                  <p className="text-xs text-white/50">Destaque benefícios reais</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Indicados */}
      <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(260_50%_30%_/_0.5)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[hsl(260_70%_70%)]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Suas Indicações</h3>
                <p className="text-sm text-white/50">
                  Usuários que assinaram através do seu link
                </p>
              </div>
            </div>
            {referrals.length > 0 && (
              <Badge variant="secondary" className="bg-white/10 text-white border-0">
                {referrals.length} {referrals.length === 1 ? 'indicação' : 'indicações'}
              </Badge>
            )}
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-medium mb-2">
                Nenhuma indicação ainda
              </p>
              <p className="text-white/40 text-sm max-w-sm mx-auto">
                Apresente a Genesis IA para pessoas que podem se beneficiar da ferramenta. 
                Quando alguém assinar, aparecerá aqui automaticamente.
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

      {/* FAQ / Regras */}
      <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Como Funciona</h3>
              <p className="text-sm text-white/50">Regras do programa de parceiros</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  <p className="text-sm font-medium text-white">Copie seu link exclusivo</p>
                  <p className="text-xs text-white/50">O link é único e vinculado à sua conta</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <p className="text-sm font-medium text-white">Compartilhe com interessados</p>
                  <p className="text-xs text-white/50">Pessoas que querem automatizar o atendimento via WhatsApp</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <p className="text-sm font-medium text-white">Acompanhe suas indicações</p>
                  <p className="text-xs text-white/50">Veja em tempo real quem assinou pelo seu link</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-400/90">
                Os valores promocionais são exclusivos para indicações e não estão disponíveis publicamente no site.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
