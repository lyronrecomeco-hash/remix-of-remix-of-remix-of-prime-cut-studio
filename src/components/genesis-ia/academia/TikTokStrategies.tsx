import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Zap, 
  Eye, 
  MessageCircle, 
  TrendingUp,
  Copy,
  Check,
  Play,
  Target,
  Sparkles,
  Volume2,
  PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TikTokScriptGenerator } from './TikTokScriptGenerator';

interface Strategy {
  id: string;
  category: string;
  title: string;
  content: string;
  icon: React.ElementType;
}

export const TikTokStrategies = () => {
  const [activeCategory, setActiveCategory] = useState('generator');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'generator', label: 'Gerar Roteiro', icon: PenTool },
    { id: 'hooks', label: 'Ganchos', icon: Zap },
    { id: 'retention', label: 'Retenção', icon: Eye },
    { id: 'styles', label: 'Estilos', icon: Video },
    { id: 'phrases', label: 'Frases', icon: MessageCircle },
    { id: 'ctas', label: 'CTAs', icon: Target },
  ];

  const strategies: Strategy[] = [
    // GANCHOS
    { id: 'hook1', category: 'hooks', title: 'Gancho de Curiosidade', icon: Zap, 
      content: '"Ninguém te conta isso sobre [nicho]..." - Crie mistério nos primeiros 0.5s para prender atenção' },
    { id: 'hook2', category: 'hooks', title: 'Gancho de Polêmica', icon: Zap, 
      content: '"Pare de fazer isso AGORA..." - Comece com algo controverso mas verdadeiro' },
    { id: 'hook3', category: 'hooks', title: 'Gancho de Resultado', icon: Zap, 
      content: '"Fiz R$ X em Y dias fazendo isso..." - Mostre prova social no início' },
    { id: 'hook4', category: 'hooks', title: 'Gancho de Dor', icon: Zap, 
      content: '"Se você está cansado de [problema]..." - Identifique a dor imediatamente' },
    { id: 'hook5', category: 'hooks', title: 'Gancho Visual', icon: Zap, 
      content: 'Comece com movimento brusco, close no rosto ou ação inesperada - 1º frame é tudo!' },
    { id: 'hook6', category: 'hooks', title: 'Gancho de Pergunta', icon: Zap, 
      content: '"Você sabia que 90% das pessoas erram nisso?" - Perguntas geram engajamento mental' },

    // RETENÇÃO
    { id: 'ret1', category: 'retention', title: 'Pattern Interrupts', icon: Eye, 
      content: 'A cada 2-3 segundos mude algo: ângulo, zoom, texto na tela, corte seco. Cérebro precisa de novidade.' },
    { id: 'ret2', category: 'retention', title: 'Loop Infinito', icon: Eye, 
      content: 'Termine o vídeo onde começou - cria replay automático e aumenta watch time' },
    { id: 'ret3', category: 'retention', title: 'Open Loops', icon: Eye, 
      content: '"No final eu mostro o resultado..." - Prometa algo e entregue só no final' },
    { id: 'ret4', category: 'retention', title: 'Texto Dinâmico', icon: Eye, 
      content: 'Use legendas animadas (CapCut) - 85% assistem sem som, texto prende atenção' },
    { id: 'ret5', category: 'retention', title: 'Storytelling Rápido', icon: Eye, 
      content: 'Problema → Tentativa → Solução → Resultado em menos de 30 segundos' },
    { id: 'ret6', category: 'retention', title: 'Cliffhangers', icon: Eye, 
      content: '"Mas o que aconteceu depois foi..." - Mantenha suspense entre as cenas' },

    // ESTILOS DE VÍDEO
    { id: 'style1', category: 'styles', title: 'Talking Head', icon: Video, 
      content: 'Rosto centralizado falando direto pra câmera - autenticidade e conexão. Ideal para autoridade.' },
    { id: 'style2', category: 'styles', title: 'POV (Point of View)', icon: Video, 
      content: '"POV: Você descobriu que..." - Coloca o espectador na história, gera identificação' },
    { id: 'style3', category: 'styles', title: 'Tutorial Rápido', icon: Video, 
      content: 'Passo 1, Passo 2, Passo 3... com texto na tela - Conteúdo de valor = salvamentos' },
    { id: 'style4', category: 'styles', title: 'Antes e Depois', icon: Video, 
      content: 'Transformações visuais são hipnóticas - funciona pra qualquer nicho' },
    { id: 'style5', category: 'styles', title: 'React/Dueto', icon: Video, 
      content: 'Reaja a conteúdo viral do seu nicho - algoritmo favorece duetos' },
    { id: 'style6', category: 'styles', title: 'B-Roll + Narração', icon: Video, 
      content: 'Imagens de apoio com voz narrando - profissional e fácil de editar' },

    // FRASES VIRAIS
    { id: 'phrase1', category: 'phrases', title: 'Abertura Impactante', icon: MessageCircle, 
      content: '"Isso vai mudar sua vida" | "Presta atenção nisso" | "Você precisa saber disso"' },
    { id: 'phrase2', category: 'phrases', title: 'Criando Urgência', icon: MessageCircle, 
      content: '"Antes que seja tarde" | "Enquanto ainda dá tempo" | "Poucos sabem disso"' },
    { id: 'phrase3', category: 'phrases', title: 'Prova Social', icon: MessageCircle, 
      content: '"Milhares já fizeram" | "Testado e aprovado" | "Veja o que consegui"' },
    { id: 'phrase4', category: 'phrases', title: 'Gatilho de Exclusividade', icon: MessageCircle, 
      content: '"Só para quem assistir até o final" | "Segredo que ninguém conta"' },
    { id: 'phrase5', category: 'phrases', title: 'Conexão Emocional', icon: MessageCircle, 
      content: '"Eu sei como você se sente" | "Já passei por isso" | "Te entendo perfeitamente"' },
    { id: 'phrase6', category: 'phrases', title: 'Autoridade Sutil', icon: MessageCircle, 
      content: '"Depois de X anos fazendo isso" | "Na minha experiência com +Y clientes"' },

    // CTAs
    { id: 'cta1', category: 'ctas', title: 'CTA de Comentário', icon: Target, 
      content: '"Comenta EU QUERO que eu te mando" - Gera engajamento e leads ao mesmo tempo' },
    { id: 'cta2', category: 'ctas', title: 'CTA de Follow', icon: Target, 
      content: '"Me segue pra parte 2" | "Segue pra não perder o próximo" - Aumenta seguidores' },
    { id: 'cta3', category: 'ctas', title: 'CTA de Save', icon: Target, 
      content: '"Salva esse vídeo pra consultar depois" - Salvamentos = viralização' },
    { id: 'cta4', category: 'ctas', title: 'CTA de DM', icon: Target, 
      content: '"Me chama no direct que eu te ajudo" - Converte em conversa privada' },
    { id: 'cta5', category: 'ctas', title: 'CTA de Link', icon: Target, 
      content: '"Link na bio pra você acessar agora" - Direciona pro funil de vendas' },
    { id: 'cta6', category: 'ctas', title: 'CTA Suave', icon: Target, 
      content: '"Se fez sentido, deixa um ❤️" - Menos agressivo, mais orgânico' },
  ];

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStrategies = strategies.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white/5 border border-white/10 p-4" style={{ borderRadius: '14px' }}>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white mb-1">Estratégias TikTok para Vendas</h3>
            <p className="text-xs text-white/60">
              Domine os ganchos, retenção e CTAs que transformam visualizações em clientes. 
              Aplicável também para Reels e Shorts.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <Play className="w-3.5 h-3.5" />
            <span>30+ Estratégias</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Viralização</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Conversão</span>
          </div>
        </div>
      </div>

      {/* Categories - Scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 border transition-all flex-shrink-0 ${
                isActive 
                  ? 'bg-primary/20 border-primary/40 text-white' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
              style={{ borderRadius: '10px' }}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeCategory === 'generator' ? (
        <TikTokScriptGenerator />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {filteredStrategies.map((strategy, index) => {
              const Icon = strategy.icon;
              const isCopied = copiedId === strategy.id;
              return (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 p-4 hover:bg-white/10 hover:border-primary/30 transition-all group"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">{strategy.title}</h4>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(strategy.id, strategy.content)}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-white/60" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{strategy.content}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pro Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-primary/10 border border-primary/20 p-3 flex items-start gap-3"
        style={{ borderRadius: '12px' }}
      >
        <Volume2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-primary mb-1">Dica de Ouro</p>
          <p className="text-[11px] text-white/60">
            Poste consistentemente (1-3x por dia), use músicas trending, e responda TODOS os comentários 
            na primeira hora. O algoritmo recompensa engajamento rápido!
          </p>
        </div>
      </motion.div>
    </div>
  );
};
