import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye, EyeOff, Sparkles, FileText, Code, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useWizard } from './WizardContext';
import { cn } from '@/lib/utils';

interface PromptPreviewProps {
  className?: string;
  compact?: boolean;
  onGenerate?: () => void;
}

// Syntax highlighting for the prompt
const highlightPrompt = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    // Headers (# ## ###)
    if (line.startsWith('# ')) {
      return (
        <div key={index} className="text-primary font-bold text-sm mt-2">
          {line}
        </div>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <div key={index} className="text-primary/90 font-semibold text-xs mt-3 mb-1">
          {line.replace('## ', '')}
        </div>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <div key={index} className="text-primary/80 font-medium text-xs mt-2">
          {line.replace('### ', '')}
        </div>
      );
    }
    
    // Bold text (**text**)
    if (line.includes('**')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={index} className="text-xs">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <span key={i} className="font-semibold text-foreground">
                  {part.slice(2, -2)}
                </span>
              );
            }
            return <span key={i} className="text-muted-foreground">{part}</span>;
          })}
        </div>
      );
    }
    
    // List items (- item)
    if (line.startsWith('- ')) {
      return (
        <div key={index} className="text-xs text-muted-foreground pl-2 flex items-start gap-1">
          <span className="text-primary">•</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    
    // Numbered list (1. item)
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        return (
          <div key={index} className="text-xs text-muted-foreground pl-2 flex items-start gap-1">
            <span className="text-primary font-medium">{match[1]}.</span>
            <span>{match[2]}</span>
          </div>
        );
      }
    }
    
    // Separator (---)
    if (line.startsWith('---')) {
      return <hr key={index} className="border-border/50 my-3" />;
    }
    
    // Empty line
    if (line.trim() === '') {
      return <div key={index} className="h-2" />;
    }
    
    // Regular text
    return (
      <div key={index} className="text-xs text-muted-foreground">
        {line}
      </div>
    );
  });
};

export const PromptPreview: React.FC<PromptPreviewProps> = ({ 
  className, 
  compact = false,
  onGenerate 
}) => {
  const { generatedPrompt, formData, isStepValid, totalSteps } = useWizard();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast({
        title: "✅ Prompt copiado!",
        description: "Cole no Lovable ou outra IA para criar seu site.",
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
  const completionItems = useMemo(() => [
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
  ], [formData]);
  
  const completionPercentage = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);
  const isComplete = completionPercentage === 100;

  // Check if all steps are valid
  const allStepsValid = useMemo(() => {
    for (let i = 1; i <= totalSteps; i++) {
      if (!isStepValid(i)) return false;
    }
    return true;
  }, [isStepValid, totalSteps]);

  const highlightedContent = useMemo(() => highlightPrompt(generatedPrompt), [generatedPrompt]);

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
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              isComplete ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
            )}>
              {completionPercentage}%
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
            <h3 className="font-semibold text-sm">Prompt para IA</h3>
            <p className="text-xs text-muted-foreground">
              {isComplete ? (
                <span className="text-green-500 font-medium">✓ Completo</span>
              ) : (
                <span>{completionPercentage}% • {generatedPrompt.length} caracteres</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('formatted')}
              className={cn(
                "h-7 px-2 text-xs",
                viewMode === 'formatted' && "bg-background shadow-sm"
              )}
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Visual
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('raw')}
              className={cn(
                "h-7 px-2 text-xs",
                viewMode === 'raw' && "bg-background shadow-sm"
              )}
            >
              <Code className="w-3 h-3 mr-1" />
              Raw
            </Button>
          </div>
          
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
      <ScrollArea className="h-[320px]">
        <div className="p-4">
          <AnimatePresence mode="wait">
            {viewMode === 'formatted' ? (
              <motion.div
                key="formatted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-0.5"
              >
                {highlightedContent}
              </motion.div>
            ) : (
              <motion.pre
                key="raw"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed"
              >
                {generatedPrompt}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer with Generate Button */}
      <div className="p-4 border-t border-border/50 bg-muted/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>📝 {formData.businessName || 'Sem nome'}</span>
            <span>🎨 {formData.visualStyle || 'Sem estilo'}</span>
            <span>⚡ {formData.features.length} recursos</span>
          </div>
          
          {onGenerate && (
            <Button
              onClick={onGenerate}
              disabled={!allStepsValid}
              className="gap-2"
              size="sm"
            >
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PromptPreview;