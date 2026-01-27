/**
 * Viral SaaS Tab - Lista de SaaS mais vendidos com alta conversão
 * Explica porque cada modelo é viral
 */

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Repeat,
  DollarSign,
  Zap,
  Calendar,
  Building2,
  Truck,
  GraduationCap,
  Heart,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ViralSaasModel {
  id: string;
  name: string;
  emoji: string;
  icon: React.ElementType;
  category: string;
  conversionRate: string;
  avgMRR: string;
  description: string;
  whyViral: string[];
  targetAudience: string;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
}

const VIRAL_SAAS_MODELS: ViralSaasModel[] = [
  {
    id: 'agendamento',
    name: 'Sistema de Agendamento',
    emoji: '📅',
    icon: Calendar,
    category: 'Produtividade',
    conversionRate: '12-18%',
    avgMRR: 'R$ 97-297',
    description: 'Plataforma white-label para barbearias, clínicas, consultórios e salões gerenciarem agendamentos.',
    whyViral: [
      'Todo negócio local precisa de agendamento online',
      'Alta retenção: clientes dependem da ferramenta diariamente',
      'Efeito de rede: clientes finais recomendam para outros profissionais',
      'Baixo churn: migração é dolorosa após configurar',
    ],
    targetAudience: 'Barbearias, clínicas, dentistas, personal trainers, estéticas',
    difficulty: 'Médio',
  },
  {
    id: 'delivery',
    name: 'Sistema de Delivery',
    emoji: '🚚',
    icon: Truck,
    category: 'E-commerce',
    conversionRate: '15-22%',
    avgMRR: 'R$ 147-497',
    description: 'Plataforma para restaurantes, pizzarias e lanchonetes criarem seu próprio app de pedidos.',
    whyViral: [
      'Fuga das taxas do iFood (30%+) é urgente',
      'ROI claro: economiza milhares em taxas mensais',
      'Restaurantes indicam para outros donos do ramo',
      'Clientes finais preferem apps próprios por fidelidade',
    ],
    targetAudience: 'Pizzarias, hamburguerias, restaurantes, açaí, marmitarias',
    difficulty: 'Avançado',
  },
  {
    id: 'crm',
    name: 'CRM + Automação',
    emoji: '💼',
    icon: Users,
    category: 'Vendas',
    conversionRate: '8-14%',
    avgMRR: 'R$ 197-997',
    description: 'Gestão de leads, pipeline de vendas e automações de follow-up.',
    whyViral: [
      'Empresas perdem dinheiro sem acompanhamento de leads',
      'Retorno mensurável: aumento de conversão de vendas',
      'Expansão natural: times crescem e precisam de mais licenças',
      'Dados são ativos: difícil abandonar após popular',
    ],
    targetAudience: 'Imobiliárias, consultorias, agências, corretores',
    difficulty: 'Avançado',
  },
  {
    id: 'cursos',
    name: 'Plataforma de Cursos',
    emoji: '🎓',
    icon: GraduationCap,
    category: 'Educação',
    conversionRate: '10-16%',
    avgMRR: 'R$ 97-397',
    description: 'Sistema para infoprodutores e coaches hospedarem e venderem cursos online.',
    whyViral: [
      'Mercado de infoprodutos explodiu no Brasil',
      'Professores indicam para outros professores',
      'Conteúdo é rei: após subir cursos, não migra',
      'Upsell fácil: certificados, comunidade, mentorias',
    ],
    targetAudience: 'Coaches, professores, especialistas, influencers',
    difficulty: 'Médio',
  },
  {
    id: 'atendimento',
    name: 'Chatbot + Atendimento',
    emoji: '💬',
    icon: MessageSquare,
    category: 'Automação',
    conversionRate: '14-20%',
    avgMRR: 'R$ 147-597',
    description: 'Automação de WhatsApp com chatbots, filas e atendimento multicanal.',
    whyViral: [
      'WhatsApp é o principal canal de vendas no BR',
      'Economia de tempo é imediata e mensurável',
      'Empresas precisam atender 24h sem contratar',
      'Integrações com CRM aumentam lock-in',
    ],
    targetAudience: 'Lojas, imobiliárias, clínicas, escritórios, e-commerces',
    difficulty: 'Avançado',
  },
  {
    id: 'financeiro',
    name: 'Gestão Financeira',
    emoji: '💰',
    icon: DollarSign,
    category: 'Finanças',
    conversionRate: '9-13%',
    avgMRR: 'R$ 67-297',
    description: 'Controle de caixa, contas a pagar/receber e relatórios para MEIs e PMEs.',
    whyViral: [
      '15+ milhões de MEIs no Brasil precisam de controle',
      'Substituiu planilhas de Excel desorganizadas',
      'Obrigações fiscais criam necessidade contínua',
      'Indicação natural: contadores recomendam para clientes',
    ],
    targetAudience: 'MEIs, autônomos, pequenos comerciantes, freelancers',
    difficulty: 'Fácil',
  },
  {
    id: 'marketplace',
    name: 'Marketplace de Serviços',
    emoji: '🏪',
    icon: ShoppingCart,
    category: 'Marketplace',
    conversionRate: '6-10%',
    avgMRR: 'R$ 0 (comissão)',
    description: 'Plataforma que conecta prestadores de serviço a clientes finais.',
    whyViral: [
      'Efeito de rede duplo: mais oferta atrai demanda',
      'Modelo de comissão escala sem custo fixo',
      'Nicho específico = menor competição',
      'Prestadores viram evangelistas do serviço',
    ],
    targetAudience: 'Nicho local: diaristas, mecânicos, eletricistas, pet',
    difficulty: 'Avançado',
  },
  {
    id: 'saude',
    name: 'Gestão de Clínicas',
    emoji: '🏥',
    icon: Heart,
    category: 'Saúde',
    conversionRate: '11-17%',
    avgMRR: 'R$ 197-697',
    description: 'Prontuário eletrônico, agendamento e gestão de clínicas médicas.',
    whyViral: [
      'Regulamentação força digitalização do prontuário',
      'Clínicas indicam para médicos parceiros',
      'Histórico do paciente cria lock-in definitivo',
      'Expansão: novas especialidades = novas licenças',
    ],
    targetAudience: 'Clínicas, consultórios, fisioterapeutas, nutricionistas',
    difficulty: 'Avançado',
  },
];

const difficultyColors: Record<string, string> = {
  'Fácil': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Médio': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Avançado': 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const ViralSaasTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">SaaS com Alta Conversão</h2>
          <p className="text-sm text-white/50">Modelos de negócio que mais vendem e retêm clientes</p>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary/10 to-cyan-500/5 border border-primary/20 p-4 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white/80 leading-relaxed">
              Estes são os <span className="text-primary font-semibold">modelos de SaaS mais vendidos</span> no mercado brasileiro. 
              Cada um foi selecionado por ter <span className="text-cyan-400 font-medium">alta taxa de conversão</span> e 
              <span className="text-emerald-400 font-medium"> viralidade orgânica comprovada</span>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* SaaS Grid */}
      <div className="space-y-4">
        {VIRAL_SAAS_MODELS.map((saas, index) => {
          const IconComponent = saas.icon;
          return (
            <motion.div
              key={saas.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 hover:border-primary/30 rounded-xl p-4 sm:p-5 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-2xl">{saas.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white truncate">{saas.name}</h3>
                    <Badge variant="outline" className={`text-[10px] ${difficultyColors[saas.difficulty]}`}>
                      {saas.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <IconComponent className="w-3 h-3" />
                      {saas.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      {saas.conversionRate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-cyan-400" />
                      {saas.avgMRR}/mês
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/60 mb-4">{saas.description}</p>

              {/* Why Viral */}
              <div className="bg-white/5 rounded-lg p-3 mb-3">
                <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Por que é viral?
                </h4>
                <ul className="space-y-1.5">
                  {saas.whyViral.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                      <ArrowRight className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Audience */}
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-white/60">Público:</span>
                <span>{saas.targetAudience}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <BarChart3 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">8-22%</p>
          <p className="text-[10px] text-white/40">Taxa de Conversão</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <DollarSign className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">R$ 97-997</p>
          <p className="text-[10px] text-white/40">MRR Médio</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">8 modelos</p>
          <p className="text-[10px] text-white/40">Validados</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ViralSaasTab;
