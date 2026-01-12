import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Preciso de conhecimento técnico para usar?',
    answer: 'Não! O Genesis foi criado para ser 100% visual. Você arrasta blocos e conecta eles para criar seus fluxos. Não precisa escrever nenhuma linha de código. Se você sabe usar o WhatsApp, sabe usar o Genesis.',
  },
  {
    question: 'Quanto tempo leva para configurar?',
    answer: 'Menos de 5 minutos. Você conecta seu WhatsApp escaneando um QR Code, escolhe um template pronto ou cria seu fluxo do zero. Nossa equipe de suporte também pode fazer o setup completo para você gratuitamente.',
  },
  {
    question: 'Minha conta pode ser banida?',
    answer: 'O Genesis usa tecnologia anti-ban nativa com 99.9% de uptime. Seguimos todas as diretrizes do WhatsApp e usamos as melhores práticas do mercado. Em mais de 2 anos, temos menos de 0.1% de taxa de ban entre nossos clientes.',
  },
  {
    question: 'A Luna IA realmente funciona para vendas?',
    answer: 'Sim! A Luna foi treinada especificamente para vendas, não apenas FAQ. Ela entende contexto, qualifica leads, contorna objeções e fecha vendas. Nossos clientes reportam em média 340% de ROI nos primeiros 90 dias.',
  },
  {
    question: 'Posso usar meu número atual de WhatsApp?',
    answer: 'Pode sim! Você pode usar seu número pessoal, comercial ou criar um novo. O processo de conexão leva menos de 1 minuto escaneando um QR Code, exatamente como no WhatsApp Web.',
  },
  {
    question: 'E se eu não gostar, tem garantia?',
    answer: 'Temos garantia de 7 dias em todos os planos pagos. Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro, sem perguntas. Além disso, você pode testar gratuitamente antes de pagar.',
  },
  {
    question: 'Consigo integrar com meu CRM/ERP?',
    answer: 'Sim! O Genesis integra com os principais CRMs (Pipedrive, RD Station, HubSpot), ERPs, e-commerces (Shopify, WooCommerce), além de Webhooks, N8N e Zapier. Se usa API, integramos.',
  },
  {
    question: 'O suporte é brasileiro?',
    answer: 'Sim! Temos equipe 100% brasileira disponível 24 horas por dia, 7 dias por semana via chat, WhatsApp e videochamada. Respondemos em menos de 5 minutos no horário comercial.',
  },
];

const SiteFAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={ref} className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-blue-50 border border-blue-200 text-blue-700">
            <HelpCircle className="w-4 h-4" />
            Perguntas Frequentes
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Tire suas{' '}
            <span className="text-green-600">dúvidas</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            As perguntas mais comuns sobre o Genesis Hub.
            <strong className="text-gray-900"> Não encontrou sua resposta? </strong>
            Fale conosco!
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left p-6 rounded-2xl bg-white border transition-all ${
                  openIndex === index
                    ? 'border-green-200 shadow-lg shadow-green-100'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      openIndex === index ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Ainda tem dúvidas?</p>
              <p className="text-sm text-gray-600">Fale com nosso suporte 24h pelo WhatsApp</p>
            </div>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              Conversar
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteFAQ;
