/**
 * LUNA VARIATIONS PREVIEW - Preview de variações geradas pela Luna AI
 * Exibe prévia das variações humanizadas anti-spam
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Eye,
  MessageSquare,
  Shuffle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { LunaSimilarityLevel } from './types';

interface LunaVariationsPreviewProps {
  messageTemplate: string;
  variationsCount: number;
  similarityLevel: LunaSimilarityLevel;
  onVariationsGenerated: (variations: string[]) => void;
  triggerPreview: boolean;
}

export function LunaVariationsPreview({
  messageTemplate,
  variationsCount,
  similarityLevel,
  onVariationsGenerated,
  triggerPreview,
}: LunaVariationsPreviewProps) {
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Gerar variações quando solicitado
  useEffect(() => {
    if (triggerPreview && messageTemplate.trim()) {
      generateVariations();
    }
  }, [triggerPreview]);

  const generateVariations = async () => {
    if (!messageTemplate.trim() || loading) return;
    
    setLoading(true);
    setVariations([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('luna-variations', {
        body: {
          message: messageTemplate,
          count: variationsCount,
          similarity: similarityLevel,
        },
      });

      if (error) throw error;

      if (data?.variations && Array.isArray(data.variations)) {
        setVariations(data.variations);
        onVariationsGenerated(data.variations);
        toast.success(`${data.variations.length} variações geradas!`);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('[LunaPreview] Error:', err);
      toast.error('Erro ao gerar variações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyVariation = (index: number) => {
    navigator.clipboard.writeText(variations[index]);
    setCopied(index);
    toast.success('Variação copiada!');
    setTimeout(() => setCopied(null), 2000);
  };

  const displayedVariations = showAll ? variations : variations.slice(0, 3);

  if (!messageTemplate.trim()) {
    return (
      <Card className="border-dashed border-purple-500/30">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-8 h-8 mx-auto text-purple-500/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Escreva sua mensagem para ver as variações Luna AI
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="font-medium">Preview de Variações</span>
          <Badge variant="secondary" className="text-xs">
            {variationsCount} variações
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateVariations}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4" />
          )}
          {variations.length > 0 ? 'Regenerar' : 'Gerar Preview'}
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Variations list */}
      {!loading && variations.length > 0 && (
        <ScrollArea className={cn("rounded-lg", showAll ? "h-80" : "h-auto")}>
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {displayedVariations.map((variation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Badge 
                            variant="secondary" 
                            className="mb-2 bg-purple-500/10 text-purple-600"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Variação {index + 1}
                          </Badge>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {variation}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8"
                          onClick={() => copyVariation(index)}
                        >
                          {copied === index ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </ScrollArea>
      )}

      {/* Show more button */}
      {!loading && variations.length > 3 && (
        <Button
          variant="ghost"
          className="w-full gap-2"
          onClick={() => setShowAll(!showAll)}
        >
          <Eye className="w-4 h-4" />
          {showAll ? 'Mostrar menos' : `Ver todas (${variations.length})`}
        </Button>
      )}

      {/* Info */}
      {!loading && variations.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          <span>
            Variações humanizadas prontas para evitar bloqueios do WhatsApp
          </span>
        </div>
      )}
    </div>
  );
}
