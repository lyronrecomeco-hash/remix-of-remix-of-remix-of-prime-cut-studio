import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { HelpCircle, Plus, Minus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: 'A Genesis funciona com o WhatsApp Business?',
    answer: 'Sim! A Genesis funciona tanto com WhatsApp pessoal quanto com WhatsApp Business. A integração é feita via QR Code, sem precisar de API oficial paga.',
  },
  {
    question: 'Preciso ter conhecimento técnico para usar?',
    answer: 'Não! A Genesis foi feita para ser simples. O Flow Builder é visual (arrastar e soltar) e você consegue criar automações em minutos. Temos tutoriais em vídeo e suporte para te ajudar.',
  },
  {
    question: 'A Luna IA realmente entende o que os clientes falam?',
    answer: 'Sim! A Luna usa inteligência artificial avançada que entende contexto, gírias, erros de digitação e até áudios. Ela aprende com cada conversa e fica mais inteligente com o tempo.',
  },
  {
    question: 'Posso testar antes de pagar?',
    answer: 'Claro! Oferecemos 7 dias de teste grátis em todos os planos, sem precisar de cartão de crédito. Você tem acesso completo a todas as funcionalidades.',
  },
  {
    question: 'Quantas mensagens posso enviar por mês?',
    answer: 'Depende do plano. O Starter tem 1.000 mensagens/mês, o Pro tem 10.000 e o Enterprise é ilimitado. Se precisar de mais, podemos criar um plano personalizado.',
  },
  {
    question: 'Meu WhatsApp pode ser banido?',
    answer: 'A Genesis segue as boas práticas do WhatsApp e usa limites de envio seguros. Nosso sistema protege seu número, mas recomendamos não fazer spam ou enviar mensagens para contatos que não autorizaram.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim! Não temos fidelidade. Você pode cancelar quando quiser pelo próprio painel, sem precisar falar com ninguém. Se cancelar nos primeiros 7 dias, devolvemos 100% do valor.',
  },
  {
    question: 'Vocês oferecem suporte?',
    answer: 'Sim! O Starter tem suporte por email (resposta em até 24h). O Pro tem suporte prioritário via WhatsApp. O Enterprise tem gerente de sucesso dedicado + suporte 24/7.',
  },
];

const ComercialFAQ = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-purple-600">Dúvidas Frequentes</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Perguntas <span className="text-emerald-500">frequentes</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Não encontrou sua dúvida? Fale com nosso suporte!
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-white shadow-xl shadow-gray-200/50 border-2 border-emerald-200'
                    : 'bg-white shadow-lg shadow-gray-100 border-2 border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className={`font-bold text-lg ${openIndex === index ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    openIndex === index ? 'bg-emerald-100' : 'bg-gray-100'
                  }`}>
                    {openIndex === index ? (
                      <Minus className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-gray-900">Ainda tem dúvidas?</p>
              <p className="text-gray-600 text-sm">Nossa equipe está pronta para ajudar!</p>
            </div>
            <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-6 shadow-lg shadow-green-500/25">
              Falar no WhatsApp
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialFAQ;
