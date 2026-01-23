import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Download, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFromScratch } from '../FromScratchContext';
import { toast } from 'sonner';

interface StepPreviewProps {
  onComplete: () => void;
}

export function StepPreview({ onComplete }: StepPreviewProps) {
  const { generatedPrompt, resetWizard, formData, selectedNiche } = useFromScratch();
  const [copied, setCopied] = useState(false);

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
    const blob = new Blob([generatedPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${formData.projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prompt exportado com sucesso!');
  };

  const handleReset = () => {
    resetWizard();
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 mb-4">
          <Sparkles className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Prompt Gerado com Sucesso! 🎉
        </h3>
        <p className="text-muted-foreground">
          Seu prompt ultra-completo está pronto para usar
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-foreground">{formData.selectedPages.length + formData.customPages.length}</div>
          <div className="text-xs text-muted-foreground">Páginas</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-foreground">{formData.selectedFeatures.length}</div>
          <div className="text-xs text-muted-foreground">Features</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-foreground">{formData.integrations.length}</div>
          <div className="text-xs text-muted-foreground">Integrações</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-foreground">{(generatedPrompt.length / 1000).toFixed(1)}k</div>
          <div className="text-xs text-muted-foreground">Caracteres</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={handleCopy}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copiado!' : 'Copiar Prompt'}
        </Button>
        <Button onClick={handleExport} variant="outline" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Exportar .md
        </Button>
        <Button onClick={handleReset} variant="ghost" size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Prompt Preview */}
      <div className="mt-6 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Preview do Prompt</span>
          <span className="text-xs text-muted-foreground">
            {generatedPrompt.split('\n').length} linhas
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-4">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
            {generatedPrompt}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 max-w-2xl mx-auto">
        <p className="text-sm text-blue-300 text-center">
          <strong>Próximo passo:</strong> Cole este prompt na IA selecionada ({formData.targetAI === 'other' ? formData.otherAI : formData.targetAI}) 
          e ela criará seu projeto completo automaticamente.
        </p>
      </div>

      {/* Complete Button */}
      <div className="text-center">
        <Button onClick={onComplete} variant="outline">
          Voltar para Biblioteca
        </Button>
      </div>
    </div>
  );
}
