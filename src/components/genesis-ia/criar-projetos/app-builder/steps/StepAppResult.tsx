import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Download, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Check,
  Loader2,
  FileCode,
  Database,
  Palette,
  Layout
} from 'lucide-react';
import { useAppBuilder } from '../AppBuilderContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LovableConnectButton } from '../../from-scratch/steps/LovableConnectButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StepAppResultProps {
  onComplete: () => void;
  affiliateId?: string;
}

const GENERATION_LOGS = [
  { text: 'Analisando configurações...', icon: '🔍' },
  { text: 'Processando estrutura de telas...', icon: '📱' },
  { text: 'Configurando design system...', icon: '🎨' },
  { text: 'Mapeando funcionalidades...', icon: '⚡' },
  { text: 'Gerando estrutura de banco...', icon: '🗃️' },
  { text: 'Otimizando para IA destino...', icon: '🤖' },
  { text: 'Finalizando prompt...', icon: '✨' },
];

export function StepAppResult({ onComplete, affiliateId }: StepAppResultProps) {
  const { formData, generatedPrompt, resetWizard, getCurrentAppType } = useAppBuilder();
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [displayedPrompt, setDisplayedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const appType = getCurrentAppType();

  // Generation animation
  useEffect(() => {
    if (!isGenerating) return;

    const logInterval = setInterval(() => {
      setCurrentLogIndex(prev => {
        if (prev >= GENERATION_LOGS.length - 1) {
          clearInterval(logInterval);
          setTimeout(() => {
            setIsGenerating(false);
            setDisplayedPrompt(generatedPrompt);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(logInterval);
  }, [isGenerating, generatedPrompt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayedPrompt);
      setCopied(true);
      toast.success('Prompt copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleExport = () => {
    const blob = new Blob([displayedPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-prompt-${formData.appName?.toLowerCase().replace(/\s+/g, '-') || 'projeto'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Prompt exportado!');
  };

  const handleReset = () => {
    resetWizard();
  };

  const confirmSave = async () => {
    if (!affiliateId) {
      toast.error('Erro: ID do afiliado não encontrado');
      return;
    }

    setIsSaving(true);
    try {
      const uniqueCode = `app-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      const { error } = await supabase
        .from('affiliate_template_configs')
        .insert([{
          affiliate_id: affiliateId,
          template_slug: 'app-builder',
          template_name: formData.appName || 'Meu App',
          unique_code: uniqueCode,
          config: formData as unknown as Record<string, unknown>,
          last_prompt: displayedPrompt,
          category: 'app',
          platform: formData.targetAI,
          is_active: true
        }]);

      if (error) throw error;

      toast.success('App salvo na biblioteca!');
      onComplete();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar na biblioteca');
    } finally {
      setIsSaving(false);
    }
  };

  // Summary cards
  const summaryItems = [
    { icon: Layout, label: 'Tipo', value: appType?.name || 'App' },
    { icon: Palette, label: 'Telas', value: `${formData.selectedScreens.length} telas` },
    { icon: FileCode, label: 'Features', value: `${formData.selectedFeatures.length} recursos` },
    { icon: Database, label: 'IA', value: formData.targetAI === 'other' ? formData.otherAI : formData.targetAI },
  ];

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-2">Gerando seu prompt...</h3>
        <p className="text-sm text-muted-foreground mb-8">
          Preparando instruções otimizadas para {formData.targetAI}
        </p>

        {/* Generation logs */}
        <div className="space-y-2 w-full max-w-sm">
          {GENERATION_LOGS.slice(0, currentLogIndex + 1).map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-sm"
            >
              <span className="text-lg">{log.icon}</span>
              <span className={index === currentLogIndex ? 'text-white' : 'text-white/50'}>
                {log.text}
              </span>
              {index === currentLogIndex && (
                <Loader2 className="w-4 h-4 text-primary animate-spin ml-auto" />
              )}
              {index < currentLogIndex && (
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm mt-8 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentLogIndex + 1) / GENERATION_LOGS.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/20 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Prompt Gerado com Sucesso! 🎉
        </h3>
        <p className="text-sm text-muted-foreground">
          {formData.appName || 'Seu app'} está pronto para ser criado
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {summaryItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
          >
            <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-xs font-semibold text-white capitalize truncate">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="flex-1 min-w-[120px]"
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="flex-1 min-w-[120px]"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar .md
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="flex-1 min-w-[120px]"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-zinc-900 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Salvar na Biblioteca?</AlertDialogTitle>
              <AlertDialogDescription>
                Seu app "{formData.appName || 'Projeto'}" será salvo e você poderá evoluí-lo depois.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave}>
                Salvar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Prompt preview */}
      <div className="rounded-xl bg-black/50 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
          <span className="text-xs text-muted-foreground">prompt.md</span>
          <span className="text-xs text-muted-foreground">
            {displayedPrompt.length.toLocaleString()} caracteres
          </span>
        </div>
        <ScrollArea className="h-[200px] p-4">
          <pre className="text-xs text-white/80 whitespace-pre-wrap font-mono">
            {displayedPrompt}
          </pre>
        </ScrollArea>
      </div>

      {/* Lovable integration */}
      {formData.targetAI === 'lovable' && (
        <LovableConnectButton 
          prompt={displayedPrompt} 
          projectName={formData.appName || 'Meu App'} 
        />
      )}

      {/* Non-Lovable instructions */}
      {formData.targetAI !== 'lovable' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <h4 className="text-sm font-semibold text-white mb-2">
            📋 Próximos passos
          </h4>
          <ol className="text-xs text-white/70 space-y-1">
            <li>1. Copie o prompt gerado acima</li>
            <li>2. Abra o {formData.targetAI === 'other' ? formData.otherAI : formData.targetAI}</li>
            <li>3. Cole o prompt e inicie a geração</li>
            <li>4. Ajuste conforme necessário</li>
          </ol>
        </motion.div>
      )}

      {/* Reset button */}
      <Button
        onClick={handleReset}
        variant="ghost"
        size="sm"
        className="w-full text-muted-foreground hover:text-white"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Criar outro app
      </Button>
    </div>
  );
}
