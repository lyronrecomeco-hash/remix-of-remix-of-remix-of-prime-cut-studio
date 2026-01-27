import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Quanto tempo leva para começar a usar?',
    answer: 'Imediatamente! Após o pagamento, você recebe acesso total ao painel em menos de 1 minuto. Já pode começar a prospectar clientes, gerar propostas e criar projetos na hora.',
  },
  {
    question: 'Preciso ter experiência com vendas ou tecnologia?',
    answer: 'Não! O Genesis Hub foi criado para quem está começando. A Academia Genesis inclui treinamentos de vendas do zero, e todas as ferramentas funcionam com poucos cliques — se você usa WhatsApp, consegue usar o Genesis.',
  },
  {
    question: 'Como funciona a busca de clientes?',
    answer: 'O Radar de Prospecção varre empresas por cidade e nicho, mostra quais não têm site (oportunidades quentes) e ainda gera propostas automáticas com IA. Você só precisa enviar pelo WhatsApp.',
  },
  {
    question: 'E se eu não conseguir vender?',
    answer: 'Garantia incondicional de 7 dias. Se não gostar ou achar que não é para você, devolvemos 100% do valor — sem perguntas. Você testa sem risco nenhum.',
  },
  {
    question: 'Consigo atender clientes de qualquer lugar?',
    answer: 'Sim! O painel funciona 100% online. Você pode prospectar em qualquer cidade do Brasil e até internacionalmente. Trabalhe de onde quiser, quando quiser.',
  },
  {
    question: 'O que está incluso no plano?',
    answer: 'Acesso completo a: Radar de Prospecção com IA, Gerador de Propostas Personalizadas, Biblioteca de Projetos, Academia de Vendas, Gestão de Contratos e suporte via WhatsApp. Tudo em um único login.',
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }: { 
  question: string; 
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full py-5 text-left hover:text-primary transition-colors group"
      >
        <span className="font-medium text-foreground pr-4 group-hover:text-primary transition-colors text-sm md:text-base">
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed text-sm md:text-base">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GenesisCommercialFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="faq" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container px-4 relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <HelpCircle className="w-4 h-4" />
            Tire Suas Dúvidas
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
            Perguntas{' '}
            <span className="text-primary">Frequentes</span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            As dúvidas mais comuns de quem está conhecendo o Genesis Hub.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/60 p-6 md:p-8"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

        {/* CTA after FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-card/40 border border-border/40">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-foreground mb-1">Ainda tem dúvidas?</p>
              <p className="text-sm text-muted-foreground">Nossa equipe responde em até 24h</p>
            </div>
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialFAQ;
