import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  CheckSquare, 
  Target,
  Phone,
  FileText,
  Home,
  MessageCircle,
  Lightbulb,
  Trophy,
  Users,
  TrendingUp,
  Video
} from 'lucide-react';
import { ShortcutsLibrary } from './ShortcutsLibrary';
import { PracticalGuides } from './PracticalGuides';
import { ObjectionSimulator } from './ObjectionSimulator';
import { PhoneScenarios } from './PhoneScenarios';
import { ConversionScripts } from './ConversionScripts';
import { AcademiaIntroduction } from './AcademiaIntroduction';
import { TikTokStrategies } from './TikTokStrategies';

interface AcademiaGenesisTabProps {
  onBack?: () => void;
}

// Tipo atualizado com introdução como primeira opção e novas abas incluindo TikTok
type TabId = 'intro' | 'shortcuts' | 'scripts' | 'guides' | 'simulator' | 'phone' | 'tiktok' | 'mindset' | 'networking';

const tabs = [
  { id: 'intro' as TabId, icon: Home, label: 'Introdução' },
  { id: 'shortcuts' as TabId, icon: BookOpen, label: 'Atalhos' },
  { id: 'scripts' as TabId, icon: FileText, label: 'Scripts' },
  { id: 'guides' as TabId, icon: CheckSquare, label: 'Guias' },
  { id: 'simulator' as TabId, icon: Target, label: 'Chat' },
  { id: 'phone' as TabId, icon: Phone, label: 'Ligação' },
  { id: 'tiktok' as TabId, icon: Video, label: 'TikTok' },
  { id: 'mindset' as TabId, icon: Lightbulb, label: 'Mindset' },
  { id: 'networking' as TabId, icon: Users, label: 'Networking' },
];

export const AcademiaGenesisTab = ({ onBack }: AcademiaGenesisTabProps) => {
  // Agora inicia na introdução por padrão
  const [activeTab, setActiveTab] = useState<TabId>('intro');

  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white">Academia Genesis</h2>
            <p className="text-[10px] sm:text-xs text-white/50">Ferramentas práticas para acelerar seus resultados</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Horizontally Scrollable */}
      <div className="overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 sm:gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 border transition-all duration-200 flex-shrink-0 ${
                  isActive 
                    ? 'bg-primary/20 border-primary/40 text-white' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-white/50'}`} />
                <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-white/70'}`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'intro' && <AcademiaIntroduction />}
          {activeTab === 'shortcuts' && <ShortcutsLibrary />}
          {activeTab === 'scripts' && <ConversionScripts />}
          {activeTab === 'guides' && <PracticalGuides />}
          {activeTab === 'simulator' && <ObjectionSimulator />}
          {activeTab === 'phone' && <PhoneScenarios />}
          {activeTab === 'tiktok' && <TikTokStrategies />}
          {activeTab === 'mindset' && <MindsetSection />}
          {activeTab === 'networking' && <NetworkingSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Nova seção: Mindset de Vendas
const MindsetSection = () => {
  const mindsetItems = [
    {
      title: 'Mentalidade de Abundância',
      description: 'Entenda que há clientes suficientes para todos. Não tenha medo de perder uma venda.',
      tip: 'Cada "não" te aproxima do próximo "sim".',
      icon: TrendingUp
    },
    {
      title: 'Foco no Valor, Não no Preço',
      description: 'Sempre comunique o valor e benefícios antes de falar sobre preço.',
      tip: 'Pessoas pagam mais por soluções que resolvem problemas reais.',
      icon: Lightbulb
    },
    {
      title: 'Persistência Inteligente',
      description: 'Follow-up não é insistência. É demonstrar interesse genuíno.',
      tip: '80% das vendas acontecem após o 5º contato.',
      icon: Target
    },
    {
      title: 'Escuta Ativa',
      description: 'O cliente sempre diz o que precisa. Aprenda a ouvir antes de falar.',
      tip: 'Faça mais perguntas do que afirmações.',
      icon: MessageCircle
    },
    {
      title: 'Autoridade Natural',
      description: 'Demonstre conhecimento, mas sem arrogância. Seja o especialista acessível.',
      tip: 'Eduque o cliente e ele confiará em você.',
      icon: Trophy
    },
    {
      title: 'Resiliência Emocional',
      description: 'Não leve rejeições para o lado pessoal. Cada experiência é aprendizado.',
      tip: 'Mantenha uma rotina de autocuidado para manter a energia.',
      icon: Users
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-2">🧠 Mindset do Vendedor de Alta Performance</h3>
        <p className="text-white/60 text-sm">
          Antes de aprender técnicas, é essencial desenvolver a mentalidade correta. 
          Vendedores de sucesso pensam diferente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mindsetItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-white/60 text-xs mb-2">{item.description}</p>
                <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                  <p className="text-primary text-xs font-medium">💡 {item.tip}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Nova seção: Networking
const NetworkingSection = () => {
  const tips = [
    {
      title: 'LinkedIn Estratégico',
      content: 'Otimize seu perfil, publique conteúdo de valor e conecte-se com decisores do seu nicho.',
      action: 'Adicione 10 pessoas por dia do seu nicho ideal.'
    },
    {
      title: 'Eventos e Meetups',
      content: 'Participe de eventos do seu setor. Networking presencial ainda é muito valioso.',
      action: 'Marque presença em pelo menos 1 evento por mês.'
    },
    {
      title: 'Parcerias Estratégicas',
      content: 'Identifique profissionais complementares e crie sistemas de indicação mútua.',
      action: 'Proponha uma parceria com 3 profissionais este mês.'
    },
    {
      title: 'Comunidades Online',
      content: 'Entre em grupos do WhatsApp, Telegram e Discord do seu nicho. Seja útil antes de vender.',
      action: 'Contribua com valor genuíno antes de fazer ofertas.'
    },
    {
      title: 'Follow-up de Relacionamento',
      content: 'Mantenha contato com clientes antigos e leads. Relacionamento gera indicações.',
      action: 'Envie uma mensagem de valor para 5 contatos antigos por semana.'
    },
    {
      title: 'Personal Branding',
      content: 'Construa sua autoridade online. Pessoas compram de quem elas conhecem e confiam.',
      action: 'Crie conteúdo educacional 3x por semana nas redes.'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-2">🤝 Networking & Conexões</h3>
        <p className="text-white/60 text-sm">
          Sua rede de contatos é seu maior ativo. Aprenda a construir relacionamentos que geram negócios.
        </p>
      </div>

      <div className="space-y-3">
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm mb-1">{tip.title}</h4>
                <p className="text-white/60 text-xs mb-2">{tip.content}</p>
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                  <span className="text-primary text-xs font-medium">🎯 Ação: {tip.action}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};