import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Check, Sparkles, RotateCcw } from 'lucide-react';
import { useProjectBuilder } from '../ProjectBuilderContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const StepResult: React.FC = () => {
  const { generatedPrompt, resetBuilder, selectedTemplate, formData } = useProjectBuilder();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success('Prompt copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar prompt');
    }
  };

  const handleExport = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${formData.projectName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prompt exportado com sucesso!');
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 sm:mb-6"
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" />
        </motion.div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
          Prompt Gerado com Sucesso!
        </h3>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto px-2">
          Seu prompt para {selectedTemplate?.name} está pronto
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 justify-center">
          <Button
            onClick={handleCopy}
            size="lg"
            className="gap-2 sm:gap-3 h-11 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base w-full sm:w-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                Copiar Prompt
              </>
            )}
          </Button>

          <Button
            onClick={handleExport}
            variant="outline"
            size="lg"
            className="gap-2 sm:gap-3 h-11 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base w-full sm:w-auto"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            Exportar TXT
          </Button>

          <Button
            onClick={resetBuilder}
            variant="ghost"
            size="lg"
            className="gap-2 sm:gap-3 h-11 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Criar Novo Projeto
          </Button>
        </div>

        {/* Prompt Preview */}
        <div className="relative">
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
            >
              {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>

          <div className="rounded-xl sm:rounded-2xl border-2 border-border bg-muted/30 p-4 sm:p-6 lg:p-8 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs sm:text-sm lg:text-base text-foreground font-mono leading-relaxed">
              {generatedPrompt}
            </pre>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 lg:p-5 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground text-center">
            📋 Cole este prompt na IA escolhida ({formData.targetAI === 'other' ? formData.otherAI : formData.targetAI}) 
            para gerar seu projeto completo
          </p>
        </div>
      </div>
    </div>
  );
};
