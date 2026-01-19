import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Gift, 
  Users, 
  Link2, 
  Sparkles,
  Crown,
  Zap,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [referrals, setReferrals] = useState<PromoReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const promoLink = `https://genesishub.cloud/promo/${promoCode}`;
  
  const divulgationText = `Pessoal, eles liberaram esse link aqui com acesso ao painel por um valor menor.
Não aparece no site e não sei até quando vai ficar disponível.

${promoLink}`;

  useEffect(() => {
    loadPromoData();
  }, [userId]);

  const loadPromoData = async () => {
    try {
      // Buscar ou criar link promocional do usuário
      let { data: promoLink, error } = await supabase
        .from('promo_links')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!promoLink) {
        // Gerar código único
        const code = generatePromoCode();
        const { data: newLink, error: createError } = await supabase
          .from('promo_links')
          .insert({ user_id: userId, promo_code: code })
          .select()
          .single();

        if (createError) throw createError;
        promoLink = newLink;
      }

      setPromoCode(promoLink.promo_code);

      // Buscar referrals
      const { data: referralData } = await supabase
        .from('promo_referrals')
        .select('*')
        .eq('promo_link_id', promoLink.id)
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

  const copyToClipboard = async (text: string, type: 'link' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      }
      toast.success('Copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const getPlanLabel = (planType: string) => {
    return planType === 'monthly_promo' ? 'Mensal Promo' : 'Anual Promo';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Gift className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Área Exclusiva</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Promocional</h1>
        <p className="text-muted-foreground mt-2">
          Compartilhe seu link exclusivo e acompanhe suas indicações
        </p>
      </div>

      {/* Bloco 1 - Link Promocional */}
      <Card className="border border-white/10 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5 text-primary" />
            Seu Link Promocional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Este link concede acesso a planos promocionais não exibidos no site oficial.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 rounded-lg bg-muted/50 border border-border font-mono text-sm truncate">
              {promoLink}
            </div>
            <Button 
              onClick={() => copyToClipboard(promoLink, 'link')}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bloco 2 - Planos Promocionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plano Mensal */}
        <Card className="border border-white/10 bg-card/50 backdrop-blur relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Promocional
            </Badge>
          </div>
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Plano Mensal</h3>
                <p className="text-xs text-muted-foreground">Acesso completo</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">R$ 197</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-xs text-green-400 mt-1">
                Economia em relação ao site comercial
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plano Anual */}
        <Card className="border border-primary/30 bg-card/50 backdrop-blur relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              Melhor Custo-Benefício
            </Badge>
          </div>
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Plano Anual</h3>
                <p className="text-xs text-muted-foreground">Acesso completo por 12 meses</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">R$ 697</span>
                <span className="text-muted-foreground">/ano</span>
              </div>
              <p className="text-xs text-green-400 mt-1">
                Equivale a R$ 58/mês • Economia máxima
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bloco 3 - Texto para Divulgação */}
      <Card className="border border-white/10 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            Texto para Divulgação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Copie e cole este texto pronto para suas lives e grupos.
          </p>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {divulgationText}
            </p>
          </div>
          <Button 
            onClick={() => copyToClipboard(divulgationText, 'text')}
            variant="outline"
            className="w-full"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Texto
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Bloco 4 - Lista de Indicados */}
      <Card className="border border-white/10 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            Usuários que Usaram seu Link
            {referrals.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {referrals.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum usuário utilizou seu link ainda.
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Compartilhe seu link e acompanhe suas indicações aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Plano</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-border/50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {referral.referred_name || 'Usuário'}
                          </p>
                          {referral.referred_email && (
                            <p className="text-xs text-muted-foreground">
                              {referral.referred_email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-xs">
                          {getPlanLabel(referral.plan_type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant="secondary"
                          className={
                            referral.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }
                        >
                          {referral.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-medium text-foreground">
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
