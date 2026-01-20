import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'O que é a Genesis-IA?',
    answer: 'A Genesis-IA é um hub completo de negócios que permite criar sites personalizados, gerar propostas com IA, gerenciar contratos e acompanhar suas finanças — tudo em uma única plataforma intuitiva.',
  },
  {
    question: 'Para quem é a Genesis-IA?',
    answer: 'Para freelancers, agências, consultores e empreendedores que desejam profissionalizar seus serviços, criar projetos rapidamente e escalar suas operações sem complicação técnica.',
  },
  {
    question: 'Preciso saber programar?',
    answer: 'Não! A Genesis-IA foi desenvolvida para ser simples e intuitiva. Você cria sites, propostas e contratos apenas clicando e personalizando templates prontos. Se precisar de ajuda, nosso suporte está incluído.',
  },
  {
    question: 'Como funciona o Criador de Projetos?',
    answer: 'Você escolhe um nicho (petshop, barbearia, academia, etc.), seleciona um template profissional e personaliza com os dados do seu cliente. O projeto fica pronto em minutos, com hospedagem inclusa.',
  },
  {
    question: 'Posso gerar propostas comerciais?',
    answer: 'Sim! Nosso gerador de propostas usa IA para criar documentos profissionais personalizados para cada prospect. Basta preencher algumas informações e a IA faz o resto.',
  },
  {
    question: 'Como funciona a garantia de 7 dias?',
    answer: 'Oferecemos garantia incondicional de 7 dias. Se não ficar satisfeito por qualquer motivo, basta solicitar o reembolso e devolvemos 100% do seu investimento, sem perguntas.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim! Não temos fidelidade ou multa. Você pode cancelar sua assinatura quando quiser diretamente pelo painel. Seu acesso permanece ativo até o final do período já pago.',
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }: { 
  question: string; 
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full py-5 text-left hover:text-primary transition-colors group"
      >
        <span className="font-medium text-foreground pr-4 group-hover:text-primary transition-colors">{question}</span>
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
            <p className="pb-5 text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GenesisCommercialFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
            Tire suas dúvidas sobre a Genesis-IA.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 md:p-8"
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
          <p className="text-muted-foreground mb-4">
            Ainda tem dúvidas? Fale com nosso time!
          </p>
          <a 
            href="https://wa.me/5511999999999" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Falar no WhatsApp →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialFAQ;
