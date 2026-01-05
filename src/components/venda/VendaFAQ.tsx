import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const faqs = [
  {
    question: 'Preciso saber programar para usar?',
    answer: 'Absolutamente não! O Genesis Hub foi desenvolvido para ser 100% visual e intuitivo. Nosso Flow Builder permite criar automações complexas apenas arrastando e soltando blocos. Se você sabe usar WhatsApp, sabe usar o Genesis.',
    highlight: true,
  },
  {
    question: 'A Luna substitui minha equipe de atendimento?',
    answer: 'A Luna complementa e potencializa sua equipe. Ela cuida das perguntas repetitivas, qualificação de leads e atendimentos simples 24/7, liberando sua equipe para focar em vendas complexas e atendimento personalizado de alto valor.',
  },
  {
    question: 'Meu WhatsApp pode ser banido?',
    answer: 'Usamos as melhores práticas e tecnologias anti-ban do mercado. Nosso sistema inclui delays inteligentes, limites de mensagem configuráveis e todas as precauções necessárias para manter sua conta 100% segura. Milhares de clientes usam diariamente sem problemas.',
  },
  {
    question: 'Quanto tempo leva para configurar?',
    answer: 'Em apenas 5 minutos você já pode estar online! Basta escanear o QR Code para conectar seu WhatsApp, escolher um template de fluxo pronto e pronto - sua automação está funcionando. Para fluxos personalizados, oferecemos templates e suporte para acelerar ainda mais.',
    highlight: true,
  },
  {
    question: 'Posso usar com múltiplos números?',
    answer: 'Sim! No plano Free você tem 1 número. Premium permite até 5 números diferentes em um único painel. E no Lifetime são instâncias ilimitadas. Perfeito para equipes, franquias e múltiplas unidades de negócio.',
  },
  {
    question: 'Como funciona o suporte?',
    answer: 'No plano Free você tem suporte por email com resposta em até 48h. Premium tem suporte prioritário com resposta em até 4 horas. Lifetime tem acesso direto ao nosso WhatsApp de suporte VIP com atendimento em tempo real.',
  },
  {
    question: 'A IA responde igual a um humano?',
    answer: 'A Luna é treinada com os modelos de IA mais avançados do mercado para manter conversas extremamente naturais. Ela entende contexto, nuances, responde dúvidas complexas e pode até conduzir vendas completas. Muitos clientes relatam que seus leads não percebem que estão falando com um bot!',
  },
  {
    question: 'E se eu não gostar? Posso cancelar?',
    answer: 'Claro! Oferecemos garantia incondicional de 7 dias. Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro sem perguntas. Além disso, você pode cancelar sua assinatura a qualquer momento diretamente pelo painel, sem multas ou burocracia.',
    highlight: true,
  },
  {
    question: 'O Genesis funciona com WhatsApp Business?',
    answer: 'Sim! O Genesis funciona tanto com WhatsApp normal quanto com WhatsApp Business. Inclusive, recomendamos o uso do Business para funcionalidades extras como catálogo de produtos e mensagens automáticas nativas.',
  },
  {
    question: 'Vocês oferecem treinamento?',
    answer: 'Sim! Todos os planos incluem acesso à nossa base de conhecimento com tutoriais em vídeo. O plano Lifetime inclui um onboarding VIP 1:1 personalizado onde configuramos tudo junto com você e treinamos sua equipe.',
  },
];

const VendaFAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Perguntas
            <br />
            <span className="text-muted-foreground">frequentes</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas antes de começar. 
            <span className="text-primary font-semibold"> Sem surpresas, sem pegadinhas.</span>
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <AccordionItem 
                  value={`item-${index}`}
                  className={`rounded-xl px-6 transition-all border ${
                    faq.highlight 
                      ? 'bg-primary/5 border-primary/20 data-[state=open]:border-primary/40' 
                      : 'bg-card/50 border-border/50 data-[state=open]:border-primary/30'
                  }`}
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5 gap-4">
                    <span className="font-semibold text-base pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 max-w-xl mx-auto"
        >
          <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/10 to-blue-600/10 border-primary/20 text-center">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Ainda tem dúvidas?</h3>
            <p className="text-muted-foreground mb-6">
              Nossa equipe está pronta para ajudar você a começar.
              Resposta em até 2 horas úteis.
            </p>
            <Button asChild className="group">
              <a 
                href="https://wa.me/5511999999999?text=Olá! Tenho dúvidas sobre o Genesis Hub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com Suporte
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaFAQ;
