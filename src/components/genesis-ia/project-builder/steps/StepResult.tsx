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
    <div className="space-y-8">
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
          Prompt Gerado com Sucesso!
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
          Seu prompt para {selectedTemplate?.name} está pronto
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Button
            onClick={handleCopy}
            size="lg"
            className="gap-3 h-14 px-8 text-base"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar Prompt
              </>
            )}
          </Button>

          <Button
            onClick={handleExport}
            variant="outline"
            size="lg"
            className="gap-3 h-14 px-8 text-base"
          >
            <Download className="w-5 h-5" />
            Exportar TXT
          </Button>

          <Button
            onClick={resetBuilder}
            variant="ghost"
            size="lg"
            className="gap-3 h-14 px-8 text-base"
          >
            <RotateCcw className="w-5 h-5" />
            Criar Novo Projeto
          </Button>
        </div>

        {/* Prompt Preview */}
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>

          <div className="rounded-2xl border-2 border-border bg-muted/30 p-6 lg:p-8 max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm lg:text-base text-foreground font-mono leading-relaxed">
              {generatedPrompt}
            </pre>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-5 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-base text-muted-foreground text-center">
            📋 Cole este prompt na IA escolhida ({formData.targetAI === 'other' ? formData.otherAI : formData.targetAI}) 
            para gerar seu projeto completo
          </p>
        </div>
      </div>
    </div>
  );
};
