import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EvolutionPreviewProps {
  prompt: string;
  platform: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function EvolutionPreview({ prompt, platform, onSave, saving }: EvolutionPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success('Prompt copiado!', {
      description: 'Cole no Lovable ou sua ferramenta de IA preferida.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolution-prompt-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Prompt baixado!');
  };

  const handleOpenLovable = () => {
    window.open('https://lovable.dev', '_blank');
  };

  const getPlatformLink = () => {
    const links: Record<string, string> = {
      lovable: 'https://lovable.dev',
      'google-studio': 'https://aistudio.google.com',
      cursor: 'https://cursor.sh',
      v0: 'https://v0.dev',
      bolt: 'https://bolt.new',
    };
    return links[platform] || null;
  };

  const platformLink = getPlatformLink();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Prompt Gerado</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
          <Button
            variant={copied ? 'default' : 'outline'}
            size="sm"
            onClick={handleCopy}
            className={cn(
              "h-8 gap-1.5 transition-all",
              copied && "bg-green-600 hover:bg-green-600"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Prompt Preview */}
      <div className="relative rounded-xl border bg-card/50 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
        <div className="max-h-[400px] overflow-y-auto p-4 font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {prompt}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleCopy}
          className="flex-1 gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          <Copy className="w-4 h-4" />
          Copiar Prompt
        </Button>

        {platformLink && (
          <Button
            variant="outline"
            onClick={() => window.open(platformLink, '_blank')}
            className="flex-1 gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir {platform === 'lovable' ? 'Lovable' : 'Plataforma'}
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={onSave}
          disabled={saving}
          className="flex-1 gap-2"
        >
          {saving ? 'Salvando...' : 'Salvar no Histórico'}
        </Button>
      </div>

      {/* Tips */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> Cole este prompt na sua ferramenta de IA preferida
          (Lovable, Cursor, v0, etc.) para evoluir seu projeto. O prompt já contém
          todo o contexto necessário.
        </p>
      </div>
    </motion.div>
  );
}
