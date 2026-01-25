import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Target, 
  BookOpen, 
  Zap, 
  Award,
  CheckCircle2,
  Users,
  Phone,
  MessageCircle,
  FileText,
  Lightbulb,
  Trophy,
  Video
} from 'lucide-react';

export const AcademiaIntroduction = () => {
  const modules = [
    { icon: BookOpen, title: 'Atalhos', desc: 'Prompts prontos para copiar e usar' },
    { icon: FileText, title: 'Scripts', desc: 'Roteiros de conversão testados' },
    { icon: CheckCircle2, title: 'Guias', desc: 'Checklists passo a passo' },
    { icon: MessageCircle, title: 'Simulador', desc: 'Pratique objeções com IA' },
    { icon: Phone, title: 'Ligação', desc: 'Técnicas por nicho' },
    { icon: Video, title: 'TikTok', desc: 'Estratégias de viralização' },
    { icon: Lightbulb, title: 'Mindset', desc: 'Mentalidade vencedora' },
    { icon: Trophy, title: 'Cases', desc: 'Histórias de sucesso' },
    { icon: Users, title: 'Networking', desc: 'Conexões estratégicas' },
  ];

  const stats = [
    { value: '50+', label: 'Scripts Prontos' },
    { value: '15+', label: 'Simulações' },
    { value: '9', label: 'Módulos' }
  ];

  const topics = [
    'Abordagem inicial que gera interesse',
    'Quebra de objeções mais comuns',
    'Técnicas de fechamento por telefone',
    'Scripts de WhatsApp que convertem',
    'Follow-up que recupera leads frios',
    'Qualificação rápida de oportunidades',
    'Apresentação de propostas irresistíveis',
    'Gatilhos de urgência eficazes',
    'Viralização no TikTok para vendas',
    'Mentalidade de alta performance'
  ];

  return (
    <div className="space-y-4">
      {/* Hero compacto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 p-4 sm:p-5"
        style={{ borderRadius: '14px' }}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white mb-1">
              Academia Genesis
            </h1>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Plataforma de treinamento intensivo em vendas. Aqui você encontra scripts prontos, 
              simuladores de conversação com IA, roteiros de ligação e estratégias de viralização 
              para fechar mais contratos e escalar seus resultados.
            </p>
          </div>
        </div>

        {/* Stats inline */}
        <div className="flex gap-6 mt-4 pt-3 border-t border-white/10">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-lg sm:text-xl font-bold text-primary">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Módulos Grid */}
      <div>
        <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Módulos Disponíveis
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white/5 border border-white/10 p-2.5 sm:p-3 text-center hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                style={{ borderRadius: '10px' }}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-lg bg-primary/20 flex items-center justify-center mb-1.5 group-hover:bg-primary/30 transition-colors">
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-white/80 truncate">{mod.title}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* O que você vai dominar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 p-4"
        style={{ borderRadius: '14px' }}
      >
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          O que você vai dominar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {topics.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              className="flex items-center gap-2 text-xs text-white/70"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Dica */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary/10 border border-primary/20 p-3 flex items-start gap-3"
        style={{ borderRadius: '12px' }}
      >
        <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs sm:text-sm text-primary font-medium">Dica de ouro</p>
          <p className="text-[11px] sm:text-xs text-white/60">
            Navegue pelas abas acima para acessar cada módulo. Comece pelos Atalhos para resultados rápidos!
          </p>
        </div>
      </motion.div>
    </div>
  );
};
