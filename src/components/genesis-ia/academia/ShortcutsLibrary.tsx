import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Check, 
  MessageSquare, 
  Phone, 
  Users, 
  Zap, 
  Star, 
  TrendingUp,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Category = 'all' | 'prospeccao' | 'fechamento' | 'suporte' | 'followup';

interface Shortcut {
  id: string;
  title: string;
  content: string;
  category: Category;
  icon: React.ElementType;
  tags: string[];
  popular?: boolean;
}

const shortcuts: Shortcut[] = [
  {
    id: '1',
    title: 'Primeiro Contato WhatsApp',
    content: 'Olá! Tudo bem? 👋\n\nVi que você tem um negócio incrível e percebi que posso ajudar a [BENEFÍCIO ESPECÍFICO].\n\nPosso te mostrar como em 2 minutos?',
    category: 'prospeccao',
    icon: MessageSquare,
    tags: ['whatsapp', 'primeiro contato'],
    popular: true
  },
  {
    id: '2',
    title: 'Resposta para "Está caro"',
    content: 'Entendo sua preocupação com o investimento! 💡\n\nMas deixa eu te perguntar: quanto você perde por mês sem [SOLUÇÃO]?\n\nNossos clientes recuperam o investimento em média em [X] dias.',
    category: 'fechamento',
    icon: TrendingUp,
    tags: ['objeção', 'preço'],
    popular: true
  },
  {
    id: '3',
    title: 'Follow-up Sem Resposta',
    content: 'Oi [NOME]! 😊\n\nSei que a rotina é corrida, então vou direto ao ponto:\n\n✅ [BENEFÍCIO 1]\n✅ [BENEFÍCIO 2]\n✅ [BENEFÍCIO 3]\n\nPosso te ligar em 5 minutos?',
    category: 'followup',
    icon: Phone,
    tags: ['follow-up', 'recuperação'],
    popular: true
  },
  {
    id: '4',
    title: 'Apresentação de Proposta',
    content: 'Baseado no que conversamos, preparei algo especial pra você:\n\n🎯 Problema: [DOR DO CLIENTE]\n💡 Solução: [SUA SOLUÇÃO]\n📈 Resultado: [BENEFÍCIO MENSURÁVEL]\n\nInvestimento: R$ [VALOR]\n\nFechamos?',
    category: 'fechamento',
    icon: Star,
    tags: ['proposta', 'apresentação']
  },
  {
    id: '5',
    title: 'Agendamento de Reunião',
    content: 'Perfeito! Para alinharmos melhor, que tal uma call rápida de 15 minutos?\n\n📅 Tenho disponibilidade:\n• Amanhã às [HORÁRIO]\n• [DIA] às [HORÁRIO]\n\nQual funciona melhor pra você?',
    category: 'prospeccao',
    icon: Users,
    tags: ['agendamento', 'reunião']
  },
  {
    id: '6',
    title: 'Suporte Pós-Venda',
    content: 'Oi [NOME]! 👋\n\nPassando pra saber como está sendo sua experiência com [PRODUTO/SERVIÇO].\n\nTem alguma dúvida ou sugestão? Estou aqui pra ajudar! 🚀',
    category: 'suporte',
    icon: Zap,
    tags: ['pós-venda', 'suporte']
  },
  {
    id: '7',
    title: 'Quebra de Objeção: Preciso Pensar',
    content: 'Claro, entendo! É uma decisão importante.\n\nPra te ajudar a decidir, me conta: qual é a principal dúvida que ainda ficou?\n\nMuitas vezes posso esclarecer na hora 😊',
    category: 'fechamento',
    icon: TrendingUp,
    tags: ['objeção', 'indecisão']
  },
  {
    id: '8',
    title: 'Reativação de Lead Frio',
    content: 'Oi [NOME]! Quanto tempo! 😊\n\nLembrei de você porque acabamos de lançar [NOVIDADE] que resolve exatamente aquele problema que você tinha com [DOR].\n\nQuer saber mais?',
    category: 'followup',
    icon: Sparkles,
    tags: ['reativação', 'lead frio']
  }
];

const categories = [
  { id: 'all' as Category, label: 'Todos' },
  { id: 'prospeccao' as Category, label: 'Prospecção' },
  { id: 'fechamento' as Category, label: 'Fechamento' },
  { id: 'suporte' as Category, label: 'Suporte' },
  { id: 'followup' as Category, label: 'Follow-up' },
];

export const ShortcutsLibrary = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredShortcuts = shortcuts.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                         s.content.toLowerCase().includes(search.toLowerCase()) ||
                         s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = async (shortcut: Shortcut) => {
    await navigator.clipboard.writeText(shortcut.content);
    setCopiedId(shortcut.id);
    toast.success('Copiado para área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Buscar atalhos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 h-7 sm:h-8 px-2.5 sm:px-3 text-[10px] sm:text-xs ${
                activeCategory === cat.id 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredShortcuts.map((shortcut, index) => {
          const Icon = shortcut.icon;
          const isCopied = copiedId === shortcut.id;
          
          return (
            <motion.div
              key={shortcut.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-200 p-3 sm:p-4"
              style={{ borderRadius: '12px' }}
            >
              {/* Popular Badge */}
              {shortcut.popular && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500/90 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2">
                  Popular
                </Badge>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white text-xs sm:text-sm truncate">{shortcut.title}</h4>
                    <div className="flex gap-1 mt-0.5 sm:mt-1">
                      {shortcut.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 border-white/10 text-white/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-2 sm:p-3 bg-white/5 rounded-lg border border-white/5 mb-2 sm:mb-3">
                <p className="text-[10px] sm:text-xs text-white/60 whitespace-pre-wrap line-clamp-3 sm:line-clamp-4 font-mono">
                  {shortcut.content}
                </p>
              </div>

              {/* Copy Button */}
              <Button
                onClick={() => handleCopy(shortcut)}
                size="sm"
                className={`w-full gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm ${
                  isCopied 
                    ? 'bg-emerald-500 hover:bg-emerald-600' 
                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Copiar
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {filteredShortcuts.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-white/20 mb-2 sm:mb-3" />
          <p className="text-white/50 text-xs sm:text-sm">Nenhum atalho encontrado</p>
        </div>
      )}
    </div>
  );
};
