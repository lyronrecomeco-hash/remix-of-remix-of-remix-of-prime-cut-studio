import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'O que é o Genesis Hub?',
    answer: 'O Genesis Hub é uma plataforma completa para consultores e agências digitais. Com ele você encontra clientes automaticamente via IA, gera propostas comerciais personalizadas, cria sites profissionais e gerencia todos os seus contratos — tudo em um único lugar.',
  },
  {
    question: 'Preciso ter conhecimento técnico?',
    answer: 'Absolutamente não! O Genesis Hub foi projetado para ser extremamente intuitivo. Tudo funciona com poucos cliques. Se você sabe usar WhatsApp, sabe usar o Genesis. E ainda oferecemos suporte dedicado para qualquer dúvida.',
  },
  {
    question: 'Como funciona o Radar de Prospecção?',
    answer: 'O Radar varre milhares de empresas em todo o Brasil, analisa a presença digital de cada uma e entrega leads qualificados diretamente no seu painel. Você escolhe o nicho e a região, e a IA faz o trabalho de pesquisa por você.',
  },
  {
    question: 'Posso testar antes de assinar?',
    answer: 'Sim! Oferecemos garantia incondicional de 7 dias. Você pode explorar todas as funcionalidades e, se não gostar, devolvemos 100% do seu investimento — sem perguntas, sem burocracia.',
  },
  {
    question: 'Quantos projetos/clientes posso ter?',
    answer: 'Não há limite! Você pode criar quantos projetos quiser, atender quantos clientes precisar e usar todas as ferramentas sem restrições. O Genesis Hub cresce junto com você.',
  },
  {
    question: 'O suporte está incluído?',
    answer: 'Sim! Todos os planos incluem suporte via WhatsApp com resposta em até 24 horas. Além disso, você tem acesso à Academia Genesis com treinamentos completos de vendas e uso da plataforma.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, sem multas ou fidelidade. Você pode cancelar sua assinatura quando quiser diretamente pelo painel. Seu acesso permanece ativo até o final do período já pago.',
  },
  {
    question: 'O Genesis Hub substitui outras ferramentas?',
    answer: 'Para muitos usuários, sim! O Genesis Hub concentra prospecção, propostas, criação de sites, contratos e treinamento em uma única plataforma. Isso significa menos assinaturas, menos abas abertas e mais produtividade.',
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
            Dúvidas Frequentes
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
            Perguntas{' '}
            <span className="text-primary">Frequentes</span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre o Genesis Hub e veja como podemos ajudar seu negócio a crescer.
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
