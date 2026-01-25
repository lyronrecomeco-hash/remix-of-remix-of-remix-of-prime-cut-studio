import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Target, 
  BookOpen, 
  Zap, 
  Award,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AcademiaIntroductionProps {
  onStart: () => void;
}

export const AcademiaIntroduction = ({ onStart }: AcademiaIntroductionProps) => {
  const features = [
    {
      icon: BookOpen,
      title: 'Biblioteca de Atalhos',
      description: 'Prompts prontos para copiar e usar em qualquer situação de vendas'
    },
    {
      icon: Target,
      title: 'Simulador de Objeções',
      description: 'Pratique respostas com IA que simula clientes reais'
    },
    {
      icon: Zap,
      title: 'Scripts de Conversão',
      description: 'Roteiros profissionais para WhatsApp e telefone'
    },
    {
      icon: Users,
      title: 'Guias de Ligação',
      description: 'Técnicas avançadas de vendas por telefone por nicho'
    },
    {
      icon: Award,
      title: 'Checklists Práticos',
      description: 'Guias passo a passo com acompanhamento de progresso'
    }
  ];

  const stats = [
    { value: '50+', label: 'Scripts Prontos' },
    { value: '12+', label: 'Cenários de Simulação' },
    { value: '5', label: 'Nichos Cobertos' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 sm:py-10 px-4"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
          <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          Academia Genesis
        </h1>
        
        <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
          Seu centro de treinamento completo para dominar a arte da venda. 
          Ferramentas práticas, scripts testados e simuladores com IA para 
          você fechar mais contratos.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 sm:gap-12 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <Button 
          onClick={onStart}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Rocket className="w-4 h-4" />
          Começar Agora
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-4 sm:p-5 bg-white/5 border border-white/10 hover:border-primary/30 transition-all group"
              style={{ borderRadius: '14px' }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/30 transition-colors">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* What You'll Learn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/5 border border-white/10 p-4 sm:p-6 mx-2"
        style={{ borderRadius: '14px' }}
      >
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          O que você vai dominar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {[
            'Abordagem inicial que gera interesse',
            'Quebra de objeções mais comuns',
            'Técnicas de fechamento por telefone',
            'Scripts de WhatsApp que convertem',
            'Follow-up que recupera leads frios',
            'Qualificação rápida de oportunidades',
            'Apresentação de propostas irresistíveis',
            'Gatilhos de urgência sem parecer desesperado'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center pb-4"
      >
        <Button 
          onClick={onStart}
          size="lg"
          variant="outline"
          className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
        >
          Explorar Ferramentas
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};
