import { User, Mail, Phone, Key, Percent, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  affiliate_code: string;
  commission_rate_monthly: number;
  commission_rate_lifetime: number;
  total_earnings: number;
  available_balance: number;
  pending_balance: number;
  pix_key: string | null;
  pix_type: string | null;
  status: string;
  created_at?: string;
}

interface AffiliateProfileProps {
  affiliate: Affiliate;
}

const AffiliateProfile = ({ affiliate }: AffiliateProfileProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPixTypeLabel = (type: string | null) => {
    if (!type) return '-';
    const labels: Record<string, string> = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      email: 'E-mail',
      phone: 'Telefone',
      random: 'Chave Aleatória'
    };
    return labels[type] || type;
  };

  const profileFields = [
    { label: 'Nome Completo', value: affiliate.name, icon: User },
    { label: 'E-mail', value: affiliate.email, icon: Mail },
    { label: 'WhatsApp', value: affiliate.whatsapp || '-', icon: Phone },
    { label: 'Código de Afiliado', value: affiliate.affiliate_code, icon: Key },
    { label: 'Comissão Mensal', value: `${affiliate.commission_rate_monthly}%`, icon: Percent },
    { label: 'Comissão Vitalício', value: `${affiliate.commission_rate_lifetime}%`, icon: Percent },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meu Perfil</h2>
        <p className="text-muted-foreground mt-1">
          Visualize suas informações de cadastro
        </p>
      </div>

      {/* Profile Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileFields.map((field, index) => {
              const Icon = field.icon;
              return (
                <div
                  key={index}
                  className="p-4 bg-secondary/30 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">{field.label}</p>
                  </div>
                  <p className="font-medium text-foreground">{field.value}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* PIX Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Dados para Pagamento (PIX)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Tipo de Chave</p>
              <p className="font-medium text-foreground">
                {getPixTypeLabel(affiliate.pix_type)}
              </p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Chave PIX</p>
              <p className="font-medium text-foreground">
                {affiliate.pix_key || 'Não cadastrada'}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Para alterar seus dados de pagamento, entre em contato com o suporte.
          </p>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm text-muted-foreground mb-1">Saldo Disponível</p>
              <p className="text-xl font-bold text-green-500">
                {formatCurrency(affiliate.available_balance)}
              </p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-sm text-muted-foreground mb-1">Saldo Pendente</p>
              <p className="text-xl font-bold text-yellow-500">
                {formatCurrency(affiliate.pending_balance)}
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Ganho</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(affiliate.total_earnings)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <div className="p-4 bg-secondary/30 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Nota:</strong> Suas informações de perfil são gerenciadas pelo administrador. 
          Para qualquer alteração, entre em contato com o suporte através do canal oficial.
        </p>
      </div>
    </div>
  );
};

export default AffiliateProfile;
