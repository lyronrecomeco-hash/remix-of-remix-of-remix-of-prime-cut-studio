import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

const beforeAfter = {
  before: [
    'Responder manualmente cada mensagem',
    'Perder leads fora do horário',
    'Esquecer de fazer follow-up',
    'Copiar e colar respostas repetitivas',
  ],
  after: [
    'IA responde instantaneamente 24/7',
    'Leads qualificados automaticamente',
    'Follow-up automático programado',
    'Respostas personalizadas por contexto',
  ],
};

const stats = [
  { value: '87%', label: 'Menos tempo de resposta' },
  { value: '3x', label: 'Mais conversões' },
  { value: '50%', label: 'Redução de custos' },
];

const VendaSolution = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Sparkles className="w-4 h-4" />
            A Transformação
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Do caos para o
            <br />
            <span className="text-primary">controle total</span>
          </h2>
        </motion.div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20"
          >
            <h3 className="text-xl font-semibold text-red-500 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-sm">✗</span>
              Antes
            </h3>
            <ul className="space-y-4">
              {beforeAfter.before.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="text-red-500">•</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">✓</span>
              Depois
            </h3>
            <ul className="space-y-4">
              {beforeAfter.after.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-12"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VendaSolution;
