import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronDown,
  Rocket,
  Target,
  Users,
  MessageSquare,
  TrendingUp,
  Zap,
  Clock,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  actionTab?: string;
  completed: boolean;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  estimatedTime: string;
  steps: GuideStep[];
}

const initialGuides: Guide[] = [
  {
    id: 'first-client',
    title: 'Primeiro Cliente em 7 Dias',
    description: 'Guia passo a passo para conseguir seu primeiro cliente usando a Genesis',
    icon: Rocket,
    color: 'emerald',
    estimatedTime: '7 dias',
    steps: [
      { id: '1-1', title: 'Configure sua mensagem base', description: 'Personalize o template de primeiro contato', action: 'Ir para Configurações', actionTab: 'settings', completed: false },
      { id: '1-2', title: 'Busque 10 empresas do seu nicho', description: 'Use o Radar para encontrar leads qualificados', action: 'Abrir Radar', actionTab: 'radar', completed: false },
      { id: '1-3', title: 'Analise o site de 5 empresas', description: 'Entenda as dores e oportunidades de cada uma', completed: false },
      { id: '1-4', title: 'Crie sua primeira proposta', description: 'Use a IA para gerar uma proposta personalizada', action: 'Criar Proposta', actionTab: 'prospects', completed: false },
      { id: '1-5', title: 'Envie mensagem para 3 leads', description: 'Use o atalho de primeiro contato', completed: false },
      { id: '1-6', title: 'Faça follow-up após 24h', description: 'Reengaje leads que não responderam', completed: false },
      { id: '1-7', title: 'Feche seu primeiro cliente!', description: 'Parabéns! Você está no caminho certo 🎉', completed: false }
    ]
  },
  {
    id: 'objection-master',
    title: 'Dominando Objeções',
    description: 'Aprenda a responder as objeções mais comuns de forma eficaz',
    icon: Target,
    color: 'blue',
    estimatedTime: '3 dias',
    steps: [
      { id: '2-1', title: 'Estude os 5 tipos de objeção', description: 'Preço, tempo, confiança, necessidade e urgência', completed: false },
      { id: '2-2', title: 'Pratique "Está caro" no simulador', description: 'A objeção mais comum', action: 'Abrir Simulador', completed: false },
      { id: '2-3', title: 'Pratique "Preciso pensar"', description: 'Segunda objeção mais frequente', action: 'Abrir Simulador', completed: false },
      { id: '2-4', title: 'Salve suas melhores respostas', description: 'Copie para a biblioteca de atalhos', completed: false },
      { id: '2-5', title: 'Aplique em uma negociação real', description: 'Teste o que aprendeu', completed: false }
    ]
  },
  {
    id: 'proposal-pro',
    title: 'Propostas que Convertem',
    description: 'Técnicas para criar propostas irresistíveis com IA',
    icon: TrendingUp,
    color: 'purple',
    estimatedTime: '2 dias',
    steps: [
      { id: '3-1', title: 'Analise o site do cliente', description: 'Identifique pontos fracos e oportunidades', action: 'Ir para Radar', actionTab: 'radar', completed: false },
      { id: '3-2', title: 'Use a IA para gerar análise', description: 'Deixe a IA encontrar problemas técnicos', completed: false },
      { id: '3-3', title: 'Personalize o template', description: 'Adapte a proposta para o nicho do cliente', action: 'Ir para Configurações', actionTab: 'settings', completed: false },
      { id: '3-4', title: 'Adicione depoimentos', description: 'Prova social aumenta conversão em 40%', completed: false },
      { id: '3-5', title: 'Defina deadline de resposta', description: 'Urgência saudável funciona', completed: false }
    ]
  }
];

const STORAGE_KEY = 'genesis-academy-guides';

export const PracticalGuides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [expandedGuide, setExpandedGuide] = useState<string | null>('first-client');

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedProgress = JSON.parse(saved);
        const merged = initialGuides.map(guide => ({
          ...guide,
          steps: guide.steps.map(step => ({
            ...step,
            completed: savedProgress[guide.id]?.[step.id] || false
          }))
        }));
        setGuides(merged);
      } catch {
        setGuides(initialGuides);
      }
    } else {
      setGuides(initialGuides);
    }
  }, []);

  // Save progress
  const saveProgress = (newGuides: Guide[]) => {
    const progress: Record<string, Record<string, boolean>> = {};
    newGuides.forEach(guide => {
      progress[guide.id] = {};
      guide.steps.forEach(step => {
        progress[guide.id][step.id] = step.completed;
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  };

  const toggleStep = (guideId: string, stepId: string) => {
    const newGuides = guides.map(guide => {
      if (guide.id !== guideId) return guide;
      return {
        ...guide,
        steps: guide.steps.map(step => {
          if (step.id !== stepId) return step;
          const newCompleted = !step.completed;
          if (newCompleted) {
            toast.success('Passo concluído! 🎉');
          }
          return { ...step, completed: newCompleted };
        })
      };
    });
    setGuides(newGuides);
    saveProgress(newGuides);
  };

  const getProgress = (guide: Guide) => {
    const completed = guide.steps.filter(s => s.completed).length;
    return Math.round((completed / guide.steps.length) * 100);
  };

  const getColorClasses = (color: string) => {
    // Use primary theme for all guides
    return { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30' };
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {guides.map((guide, index) => {
        const Icon = guide.icon;
        const isExpanded = expandedGuide === guide.id;
        const progress = getProgress(guide);
        const colors = getColorClasses(guide.color);
        const isComplete = progress === 100;

        return (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white/5 border transition-all duration-200 overflow-hidden ${
              isExpanded ? colors.border : 'border-white/10 hover:border-white/20'
            }`}
            style={{ borderRadius: '12px' }}
          >
            {/* Guide Header */}
            <button
              onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
              className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-4 text-left"
            >
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                {isComplete ? (
                  <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                ) : (
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <h3 className="font-semibold text-white text-xs sm:text-base truncate">{guide.title}</h3>
                  {isComplete && (
                    <Badge className="bg-emerald-500/90 text-white text-[8px] sm:text-[10px] px-1 sm:px-1.5">Completo</Badge>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-white/50 truncate">{guide.description}</p>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                  <Progress value={progress} className="h-1 sm:h-1.5 flex-1 bg-white/10" />
                  <span className="text-[10px] sm:text-xs text-white/40 flex-shrink-0">{progress}%</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <Badge variant="outline" className="border-white/10 text-white/40 text-[9px] sm:text-[10px] hidden sm:flex">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  {guide.estimatedTime}
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                ) : (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                )}
              </div>
            </button>

            {/* Steps */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2"
              >
                {guide.steps.map((step, stepIndex) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: stepIndex * 0.05 }}
                    className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all ${
                      step.completed 
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => toggleStep(guide.id, step.id)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-white/30 hover:text-white/50 transition-colors" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-medium ${step.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                        {step.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">{step.description}</p>
                    </div>

                    {step.action && !step.completed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2 hidden sm:flex"
                      >
                        <span className="hidden md:inline">{step.action}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
