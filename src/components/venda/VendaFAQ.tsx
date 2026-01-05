import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Preciso saber programar para usar?',
    answer: 'Não! O Genesis Hub foi feito para ser 100% visual. Nosso Flow Builder permite criar automações complexas apenas arrastando e soltando blocos. Qualquer pessoa consegue usar.',
  },
  {
    question: 'A Luna substitui minha equipe de atendimento?',
    answer: 'A Luna complementa sua equipe. Ela cuida das perguntas repetitivas e atendimentos simples 24/7, liberando sua equipe para focar em vendas complexas e atendimento personalizado.',
  },
  {
    question: 'Meu WhatsApp pode ser banido?',
    answer: 'Usamos as melhores práticas e tecnologias anti-ban. Nosso sistema inclui delays inteligentes, limites de mensagem e todas as precauções necessárias para manter sua conta segura.',
  },
  {
    question: 'Quanto tempo leva para configurar?',
    answer: 'Em 5 minutos você já pode estar online! Basta escanear o QR Code para conectar seu WhatsApp e configurar seu primeiro fluxo de atendimento.',
  },
  {
    question: 'Posso usar com múltiplos números?',
    answer: 'Sim! No plano Premium você pode conectar até 5 números diferentes, e no Lifetime são instâncias ilimitadas. Perfeito para equipes e múltiplas unidades.',
  },
  {
    question: 'Como funciona o suporte?',
    answer: 'No plano Free você tem suporte por email. Premium tem suporte prioritário com resposta em até 4h. Lifetime tem acesso direto ao nosso WhatsApp de suporte VIP.',
  },
  {
    question: 'A IA responde igual a um humano?',
    answer: 'A Luna é treinada com inteligência artificial avançada para manter conversas naturais. Ela entende contexto, responde dúvidas e pode até fazer vendas. Muitos clientes não percebem que é um bot!',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim! Não há fidelidade ou multa. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel, sem burocracia.',
  },
];

const VendaFAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary">
            <HelpCircle className="w-4 h-4" />
            Dúvidas Frequentes
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Perguntas
            <br />
            <span className="text-muted-foreground">frequentes</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card/50 border border-border/50 rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaFAQ;
