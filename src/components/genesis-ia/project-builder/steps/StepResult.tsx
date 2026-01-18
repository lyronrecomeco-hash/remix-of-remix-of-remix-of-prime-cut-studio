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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Prompt Gerado com Sucesso!
        </h3>
        <p className="text-muted-foreground">
          Seu prompt para {selectedTemplate?.name} está pronto
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <Button
            onClick={handleCopy}
            size="lg"
            className="gap-2"
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
            className="gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar TXT
          </Button>

          <Button
            onClick={resetBuilder}
            variant="ghost"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Criar Novo Projeto
          </Button>
        </div>

        {/* Prompt Preview */}
        <div className="relative">
          <div className="absolute top-3 right-3 z-10">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-muted/50 p-6 max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
              {generatedPrompt}
            </pre>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            📋 Cole este prompt na IA escolhida ({formData.targetAI === 'other' ? formData.otherAI : formData.targetAI}) 
            para gerar seu projeto completo
          </p>
        </div>
      </div>
    </div>
  );
};
