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
  TrendingUp
} from 'lucide-react';
import { ShortcutsLibrary } from './ShortcutsLibrary';
import { PracticalGuides } from './PracticalGuides';
import { ObjectionSimulator } from './ObjectionSimulator';
import { PhoneScenarios } from './PhoneScenarios';
import { ConversionScripts } from './ConversionScripts';
import { AcademiaIntroduction } from './AcademiaIntroduction';

interface AcademiaGenesisTabProps {
  onBack?: () => void;
}

// Tipo atualizado com introdução como primeira opção e novas abas
type TabId = 'intro' | 'shortcuts' | 'scripts' | 'guides' | 'simulator' | 'phone' | 'mindset' | 'cases' | 'networking';

const tabs = [
  { id: 'intro' as TabId, icon: Home, label: 'Introdução', description: 'Visão geral' },
  { id: 'shortcuts' as TabId, icon: BookOpen, label: 'Atalhos', description: 'Prompts prontos' },
  { id: 'scripts' as TabId, icon: FileText, label: 'Scripts', description: 'Roteiros de venda' },
  { id: 'guides' as TabId, icon: CheckSquare, label: 'Guias', description: 'Checklists' },
  { id: 'simulator' as TabId, icon: Target, label: 'Chat', description: 'Objeções' },
  { id: 'phone' as TabId, icon: Phone, label: 'Ligação', description: 'Por nicho' },
  { id: 'mindset' as TabId, icon: Lightbulb, label: 'Mindset', description: 'Mentalidade' },
  { id: 'cases' as TabId, icon: Trophy, label: 'Cases', description: 'Sucesso' },
  { id: 'networking' as TabId, icon: Users, label: 'Networking', description: 'Conexões' },
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

      {/* Tab Navigation - Mobile Optimized */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border transition-all duration-200 flex-shrink-0 ${
                isActive 
                  ? 'bg-primary/20 border-primary/40 text-white' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                isActive ? 'bg-primary/30' : 'bg-white/10'
              }`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-primary' : 'text-white/60'}`} />
              </div>
              <div className="text-left">
                <p className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                  {tab.label}
                </p>
                <p className="text-[10px] sm:text-xs text-white/40 hidden sm:block">{tab.description}</p>
              </div>
            </motion.button>
          );
        })}
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
          {activeTab === 'intro' && <AcademiaIntroduction onStart={() => setActiveTab('shortcuts')} />}
          {activeTab === 'shortcuts' && <ShortcutsLibrary />}
          {activeTab === 'scripts' && <ConversionScripts />}
          {activeTab === 'guides' && <PracticalGuides />}
          {activeTab === 'simulator' && <ObjectionSimulator />}
          {activeTab === 'phone' && <PhoneScenarios />}
          {activeTab === 'mindset' && <MindsetSection />}
          {activeTab === 'cases' && <SuccessCasesSection />}
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

// Nova seção: Cases de Sucesso
const SuccessCasesSection = () => {
  const cases = [
    {
      name: 'Carlos - Consultor de RH',
      result: 'R$ 47.000 em 30 dias',
      description: 'Começou do zero usando apenas os scripts da Academia. Fechou 3 contratos recorrentes.',
      testimonial: 'Os roteiros de ligação foram game-changer. Antes eu gaguejava, agora fecho com confiança.'
    },
    {
      name: 'Ana - Agência de Marketing',
      result: '12 clientes novos/mês',
      description: 'Usou o simulador de objeções diariamente por 2 semanas. Sua taxa de fechamento dobrou.',
      testimonial: 'Praticar objeções no simulador me preparou para qualquer coisa que o cliente fale.'
    },
    {
      name: 'João - Freelancer Dev',
      result: 'De R$ 3k para R$ 18k/mês',
      description: 'Aplicou as técnicas de qualificação e aprendeu a filtrar clientes que pagam bem.',
      testimonial: 'Entendi que o problema não era falta de cliente, era falta de posicionamento.'
    },
    {
      name: 'Marina - Contadora',
      result: '85% de conversão',
      description: 'Usou os guias práticos para estruturar sua abordagem comercial completa.',
      testimonial: 'Agora tenho um processo. Não vou mais para reuniões sem saber exatamente o que fazer.'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-2">🏆 Cases de Sucesso</h3>
        <p className="text-white/60 text-sm">
          Histórias reais de pessoas que aplicaram o conteúdo da Academia e transformaram seus resultados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cases.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">{item.name}</h4>
              <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
                {item.result}
              </span>
            </div>
            <p className="text-white/70 text-sm mb-3">{item.description}</p>
            <div className="bg-white/5 border-l-2 border-primary/50 pl-3 py-2">
              <p className="text-white/60 text-xs italic">"{item.testimonial}"</p>
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
                <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2">
                  <span className="text-cyan-400 text-xs font-medium">🎯 Ação: {tip.action}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};