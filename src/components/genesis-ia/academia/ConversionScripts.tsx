import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Copy, 
  Check, 
  ChevronRight,
  Sparkles,
  Target,
  MessageSquare,
  Phone,
  DollarSign,
  Users,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Script {
  id: string;
  title: string;
  category: 'abertura' | 'qualificacao' | 'apresentacao' | 'objecao' | 'fechamento';
  context: string;
  script: string;
  tips: string[];
}

const scripts: Script[] = [
  // ABERTURA
  {
    id: 'abertura-whatsapp',
    title: 'Abertura Fria no WhatsApp',
    category: 'abertura',
    context: 'Primeiro contato com lead que não te conhece',
    script: `Olá [NOME], tudo bem?

Sou [SEU NOME] da [EMPRESA]. 

Vi que você [CONTEXTO: tem uma loja no bairro X / trabalha com Y / postou sobre Z].

Temos ajudado [TIPO DE NEGÓCIO] a [BENEFÍCIO PRINCIPAL] em média [RESULTADO ESPECÍFICO].

Posso te mostrar como funciona em 2 minutos?`,
    tips: [
      'Personalize com algo específico sobre o negócio',
      'Seja direto - não enrole',
      'Termine com pergunta de sim/não'
    ]
  },
  {
    id: 'abertura-telefone',
    title: 'Abertura por Telefone',
    category: 'abertura',
    context: 'Ligação fria para prospect',
    script: `Olá, [NOME]? Aqui é [SEU NOME] da [EMPRESA].

Peguei seu contato através de [FONTE]. Você tem 30 segundos?

[SE SIM]
Rapidamente: ajudamos [TIPO DE NEGÓCIO] a [BENEFÍCIO]. Trabalhamos com [CLIENTE SIMILAR] e eles [RESULTADO].

Faz sentido conversarmos 5 minutos para eu entender se podemos ajudar você também?`,
    tips: [
      'Peça permissão para continuar',
      'Mencione referência ou fonte',
      'Limite o tempo prometido'
    ]
  },
  {
    id: 'abertura-referencia',
    title: 'Abertura com Indicação',
    category: 'abertura',
    context: 'Lead indicado por cliente existente',
    script: `Oi [NOME], tudo bem?

O [NOME DO INDICADOR] me passou seu contato. Ele é cliente nosso e comentou que vocês conversaram sobre [TEMA].

Ele achou que faria sentido a gente conversar também.

Você tem 5 minutos para eu explicar o que fazemos?`,
    tips: [
      'Mencione o indicador logo no início',
      'Credibilidade instantânea',
      'Funciona 3x melhor que contato frio'
    ]
  },
  // QUALIFICAÇÃO
  {
    id: 'qualificacao-basica',
    title: 'Perguntas de Qualificação',
    category: 'qualificacao',
    context: 'Entender se o lead é qualificado',
    script: `Antes de eu te mostrar a solução, preciso entender melhor sua situação:

1. Hoje, como vocês [AÇÃO RELACIONADA AO PROBLEMA]?
2. Qual o maior desafio que você enfrenta com isso?
3. Se pudesse resolver isso, qual seria o impacto no seu negócio?
4. Vocês já tentaram alguma solução antes? O que aconteceu?
5. Qual o orçamento que você teria para resolver isso?

[BASEADO NAS RESPOSTAS, QUALIFIQUE OU DESQUALIFIQUE]`,
    tips: [
      'Ouça mais do que fala',
      'Faça perguntas abertas',
      'Identifique dor e urgência'
    ]
  },
  {
    id: 'qualificacao-decisor',
    title: 'Identificar Decisor',
    category: 'qualificacao',
    context: 'Verificar se fala com quem decide',
    script: `Antes de continuarmos, só para eu direcionar melhor nossa conversa:

Além de você, mais alguém precisa estar envolvido nessa decisão?

[SE SIM]
Perfeito, faz todo sentido. Quem mais participaria? 
Seria possível incluir essa pessoa em nossa próxima conversa?

[SE NÃO]
Ótimo, então você decide sozinho(a) sobre investimentos nessa área?`,
    tips: [
      'Pergunte de forma natural',
      'Não assuma que ele é o decisor',
      'Tente incluir todos na reunião'
    ]
  },
  // APRESENTAÇÃO
  {
    id: 'apresentacao-problema',
    title: 'Estrutura Problema-Solução',
    category: 'apresentacao',
    context: 'Apresentando sua solução',
    script: `Deixa eu resumir o que entendi:

PROBLEMA: Hoje você [PROBLEMA IDENTIFICADO], e isso causa [CONSEQUÊNCIA].

CUSTO: Isso significa que você está [PERDENDO/GASTANDO] aproximadamente [VALOR] por [PERÍODO].

SOLUÇÃO: O que fazemos é [SOLUÇÃO SIMPLES]. Nossos clientes conseguem [RESULTADO ESPECÍFICO].

PROVA: O [CLIENTE SIMILAR] tinha o mesmo problema e em [TEMPO] conseguiu [RESULTADO COM NÚMEROS].

PRÓXIMO PASSO: Faz sentido eu te mostrar como funcionaria na prática?`,
    tips: [
      'Conecte problema ao custo',
      'Use números sempre que possível',
      'Termine com próximo passo claro'
    ]
  },
  {
    id: 'apresentacao-demo',
    title: 'Conduzindo uma Demo',
    category: 'apresentacao',
    context: 'Mostrando o produto/serviço',
    script: `Antes de começar a mostrar, deixa eu confirmar:

Sua maior prioridade hoje é [PRIORIDADE 1] ou [PRIORIDADE 2]?

[RESPOSTA]

Perfeito, vou focar exatamente nisso então.

[DURANTE A DEMO]
- "Aqui é onde você resolveria [PROBLEMA X]..."
- "Viu como isso é diferente do que você faz hoje?"
- "O [CLIENTE] usa muito essa parte..."

[APÓS MOSTRAR]
O que você achou? Consegue ver isso funcionando para você?`,
    tips: [
      'Pergunte prioridades antes',
      'Foque no que importa para ELE',
      'Faça pausas para perguntas'
    ]
  },
  // OBJEÇÕES
  {
    id: 'objecao-preco',
    title: 'Quebrando Objeção de Preço',
    category: 'objecao',
    context: 'Cliente acha caro',
    script: `Entendo sua preocupação com o investimento. Me ajuda a entender:

Caro comparado a quê? [ESPERA RESPOSTA]

Olha, quando você pensa em [VALOR], pense também no que você está [PERDENDO/GASTANDO] hoje sem a solução.

Se você [PROBLEMA ATUAL], quanto isso te custa por mês?

Nossos clientes geralmente recuperam o investimento em [X] meses porque [RAZÃO].

Faz sentido olhar dessa forma?`,
    tips: [
      'Nunca justifique o preço diretamente',
      'Compare com o custo da inação',
      'Use ROI e payback'
    ]
  },
  {
    id: 'objecao-pensar',
    title: 'Quebrando "Preciso Pensar"',
    category: 'objecao',
    context: 'Cliente quer adiar decisão',
    script: `Claro, decisões importantes merecem reflexão.

Para eu te ajudar a pensar melhor, o que exatamente você precisa considerar?

[ESPERA - GERALMENTE REVELA OBJEÇÃO REAL]

[SE FOR PREÇO] "Entendo, vamos falar sobre o investimento então..."
[SE FOR TIMING] "Qual seria o momento ideal para você?"
[SE FOR TERCEIROS] "Quem mais precisa estar envolvido?"

Posso te ligar [DIA] para saber sua decisão?`,
    tips: [
      'Descubra a objeção real por trás',
      '"Pensar" geralmente esconde outra coisa',
      'Agende follow-up específico'
    ]
  },
  // FECHAMENTO
  {
    id: 'fechamento-assumido',
    title: 'Fechamento Assumido',
    category: 'fechamento',
    context: 'Lead claramente interessado',
    script: `Então, pelo que conversamos, parece que faz sentido para você.

Vamos fazer o seguinte: [PRÓXIMO PASSO CONCRETO]

Você prefere [OPÇÃO A] ou [OPÇÃO B]?

[ESPERA ESCOLHA - NÃO PERGUNTA SE QUER]`,
    tips: [
      'Assuma que ele vai comprar',
      'Dê opções, não sim/não',
      'Silêncio após a pergunta'
    ]
  },
  {
    id: 'fechamento-urgencia',
    title: 'Criando Urgência Real',
    category: 'fechamento',
    context: 'Lead precisa de um empurrão',
    script: `Olha, vou ser transparente com você:

[URGÊNCIA REAL - ESCOLHA UMA]
- "Esse valor promocional é válido até [DATA]"
- "Nosso time de implantação está com fila de [X] semanas"
- "Estamos fechando vagas para novos clientes esse mês"

Se você fechar hoje, consigo [BENEFÍCIO EXTRA].

Faz sentido garantir agora ou você prefere correr o risco de [CONSEQUÊNCIA]?`,
    tips: [
      'Urgência precisa ser REAL',
      'Mentir destrói confiança',
      'Ofereça benefício por decisão rápida'
    ]
  }
];

const categoryConfig = {
  abertura: { label: 'Abertura', color: 'bg-blue-500/20 text-blue-400', icon: MessageSquare },
  qualificacao: { label: 'Qualificação', color: 'bg-purple-500/20 text-purple-400', icon: Target },
  apresentacao: { label: 'Apresentação', color: 'bg-emerald-500/20 text-emerald-400', icon: TrendingUp },
  objecao: { label: 'Objeções', color: 'bg-amber-500/20 text-amber-400', icon: Shield },
  fechamento: { label: 'Fechamento', color: 'bg-red-500/20 text-red-400', icon: DollarSign }
};

export const ConversionScripts = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [expandedScript, setExpandedScript] = useState<string | null>(null);

  const categories = ['todos', ...Object.keys(categoryConfig)];

  const filteredScripts = activeCategory === 'todos' 
    ? scripts 
    : scripts.filter(s => s.category === activeCategory);

  const copyScript = (script: Script) => {
    navigator.clipboard.writeText(script.script);
    setCopiedId(script.id);
    toast.success('Script copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm sm:text-base">Scripts de Conversão</h3>
          <p className="text-[10px] sm:text-xs text-white/50">Roteiros prontos para cada etapa da venda</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const config = cat === 'todos' ? null : categoryConfig[cat as keyof typeof categoryConfig];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {config && <config.icon className="w-3 h-3" />}
              {cat === 'todos' ? 'Todos' : config?.label}
            </button>
          );
        })}
      </div>

      {/* Scripts List */}
      <div className="space-y-2 sm:space-y-3">
        {filteredScripts.map((script, index) => {
          const config = categoryConfig[script.category];
          const isExpanded = expandedScript === script.id;
          
          return (
            <motion.div
              key={script.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white/5 border border-white/10 overflow-hidden"
              style={{ borderRadius: '12px' }}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedScript(isExpanded ? null : script.id)}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <h4 className="font-medium text-white text-xs sm:text-sm truncate">{script.title}</h4>
                    <p className="text-[10px] sm:text-xs text-white/40 truncate">{script.context}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-3 sm:p-4 space-y-3">
                      {/* Script */}
                      <div className="bg-white/5 rounded-lg p-3 relative group">
                        <pre className="text-xs text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                          {script.script}
                        </pre>
                        <Button
                          size="sm"
                          onClick={() => copyScript(script)}
                          className="absolute top-2 right-2 h-7 px-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
                        >
                          {copiedId === script.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      {/* Tips */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Dicas
                        </h5>
                        {script.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-[10px] sm:text-xs text-white/50">
                            <span className="text-amber-400">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
