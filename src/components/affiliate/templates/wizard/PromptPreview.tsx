import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye, EyeOff, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useWizard } from './WizardContext';
import { cn } from '@/lib/utils';

interface PromptPreviewProps {
  className?: string;
  compact?: boolean;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({ className, compact = false }) => {
  const { generatedPrompt, formData } = useWizard();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast({
        title: "Prompt copiado!",
        description: "O prompt foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o prompt.",
        variant: "destructive",
      });
    }
  };

  // Calculate completion percentage
  const completionItems = [
    !!formData.businessName,
    !!formData.projectType,
    !!formData.visualStyle,
    !!formData.primaryColor,
    !!formData.headingFont,
    !!formData.bodyFont,
    !!formData.layoutStyle,
    formData.features.length >= 2,
    !!formData.targetAudience,
    !!formData.businessDescription,
  ];
  const completionPercentage = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  if (compact && !expanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-muted/30 border border-border/50 rounded-lg p-3",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Prompt</span>
            <span className="text-xs text-muted-foreground">
              ({completionPercentage}% completo)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="h-7 px-2"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-primary/20 rounded-xl overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Prompt Gerado</h3>
            <p className="text-xs text-muted-foreground">
              {completionPercentage}% completo • {generatedPrompt.length} caracteres
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-xs">Copiar</span>
              </>
            )}
          </Button>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="h-8 px-2"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[300px]">
        <div className="p-4">
          <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/80 leading-relaxed">
            {generatedPrompt}
          </pre>
        </div>
      </ScrollArea>

      {/* Footer with stats */}
      <div className="p-3 border-t border-border/50 bg-muted/10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>📝 {formData.businessName || 'Sem nome'}</span>
            <span>🎨 {formData.visualStyle || 'Sem estilo'}</span>
            <span>⚡ {formData.features.length} recursos</span>
          </div>
          <span className="text-primary font-medium">
            Pronto para usar
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PromptPreview;
