import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Download, RotateCcw, Sparkles, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFromScratch } from '../FromScratchContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StepPreviewProps {
  onComplete: () => void;
}

const GENERATION_LOGS = [
  '🔍 Analisando contexto do nicho...',
  '📊 Processando objetivos do projeto...',
  '🎨 Definindo design system...',
  '📄 Estruturando páginas e seções...',
  '⚡ Configurando funcionalidades...',
  '🔧 Adicionando integrações...',
  '📱 Otimizando para mobile...',
  '🔒 Configurando segurança...',
  '🎯 Aplicando SEO avançado...',
  '✨ Finalizando prompt ultra-completo...',
  '🚀 Prompt gerado com sucesso!'
];

export function StepPreview({ onComplete }: StepPreviewProps) {
  const { generatedPrompt, resetWizard, formData, selectedNiche, generatePrompt } = useFromScratch();
  const [copied, setCopied] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [displayedPrompt, setDisplayedPrompt] = useState('');

  // Generation animation
  useEffect(() => {
    if (isGenerating) {
      const logInterval = setInterval(() => {
        setCurrentLogIndex(prev => {
          if (prev >= GENERATION_LOGS.length - 1) {
            clearInterval(logInterval);
            setIsGenerating(false);
            setDisplayedPrompt(generatedPrompt);
            return prev;
          }
          return prev + 1;
        });
      }, 2500); // ~27.5 seconds total (11 logs * 2.5s)

      return () => clearInterval(logInterval);
    }
  }, [isGenerating, generatedPrompt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayedPrompt);
      setCopied(true);
      toast.success('Prompt copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar prompt');
    }
  };

  const handleExport = () => {
    const blob = new Blob([displayedPrompt], { type: 'text/markdown' });
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

  const handleSaveToLibrary = () => {
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    // Here you would save to the library - for now just show success
    toast.success('Projeto salvo na biblioteca!');
    setShowSaveDialog(false);
    onComplete();
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
        {/* Animated Loader */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Gerando Prompt Ultra-Completo
          </h3>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto processamos suas configurações...
          </p>
        </div>

        {/* Logs */}
        <div className="w-full max-w-md bg-card/50 rounded-xl border border-border/50 p-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {GENERATION_LOGS.slice(0, currentLogIndex + 1).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 text-sm ${
                  index === currentLogIndex ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {index < currentLogIndex ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentLogIndex + 1) / GENERATION_LOGS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {Math.round(((currentLogIndex + 1) / GENERATION_LOGS.length) * 100)}% concluído
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Prompt Gerado com Sucesso! 🎉
        </h3>
        <p className="text-muted-foreground">
          Seu prompt ultra-completo está pronto para usar
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
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
          <div className="text-2xl font-bold text-foreground">{(displayedPrompt.length / 1000).toFixed(1)}k</div>
          <div className="text-xs text-muted-foreground">Caracteres</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={handleCopy}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copiado!' : 'Copiar Prompt'}
        </Button>
        <Button onClick={handleExport} variant="outline" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Exportar .md
        </Button>
        <Button onClick={handleSaveToLibrary} variant="outline" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Salvar na Biblioteca
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
            {displayedPrompt.split('\n').length} linhas
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-4">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
            {displayedPrompt}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Próximo passo:</strong> Cole este prompt na IA selecionada ({formData.targetAI === 'other' ? formData.otherAI : formData.targetAI}) 
          e ela criará seu projeto completo automaticamente.
        </p>
      </div>

      {/* Complete Button */}
      <div className="text-center">
        <Button onClick={onComplete} variant="outline">
          Voltar para Biblioteca
        </Button>
      </div>

      {/* Save Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar na Biblioteca?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar este projeto "{formData.projectName}" na sua biblioteca para acessar o prompt depois?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-primary hover:bg-primary/90">
              Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
