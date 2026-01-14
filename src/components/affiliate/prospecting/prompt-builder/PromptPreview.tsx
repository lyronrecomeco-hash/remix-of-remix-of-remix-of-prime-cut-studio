import { 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Sparkles,
  Rocket,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AI_PLATFORMS } from './types';

interface PromptPreviewProps {
  prompt: string;
  platform: string;
  onCopy: () => void;
  copied: boolean;
  onRegenerate: () => void;
}

const PLATFORM_URLS: Record<string, string> = {
  lovable: 'https://lovable.dev',
  bolt: 'https://bolt.new',
  v0: 'https://v0.dev',
  cursor: 'https://cursor.sh',
  replit: 'https://replit.com',
  webflow: 'https://webflow.com',
  framer: 'https://framer.com',
  durable: 'https://durable.co',
  wix: 'https://wix.com',
  hostinger: 'https://hostinger.com',
  mobirise: 'https://mobirise.com',
  gamma: 'https://gamma.app',
};

export const PromptPreview = ({ 
  prompt, 
  platform, 
  onCopy, 
  copied, 
  onRegenerate 
}: PromptPreviewProps) => {
  const platformInfo = AI_PLATFORMS.find(p => p.id === platform);
  const platformUrl = PLATFORM_URLS[platform] || '#';

  const handleOpenPlatform = () => {
    window.open(platformUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
          <Rocket className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Prompt Gerado com Sucesso! 🎉
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Seu prompt profissional está pronto. Copie e cole na plataforma escolhida para criar seu projeto.
        </p>
      </div>

      {/* Platform Badge */}
      <div className="flex items-center justify-center gap-2">
        <Badge variant="outline" className="gap-2 px-4 py-2 text-base">
          <Sparkles className="w-4 h-4 text-primary" />
          Otimizado para {platformInfo?.name || platform}
        </Badge>
      </div>

      {/* Prompt Card */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Prompt Final
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Editar
            </Button>
            <Button
              variant={copied ? "default" : "outline"}
              size="sm"
              onClick={onCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="p-4 rounded-lg bg-muted/50 border border-border text-sm whitespace-pre-wrap font-mono max-h-[400px] overflow-y-auto">
              {prompt}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          size="lg"
          onClick={onCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Prompt Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copiar Prompt
            </>
          )}
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={handleOpenPlatform}
          className="gap-2"
        >
          <ExternalLink className="w-5 h-5" />
          Abrir {platformInfo?.name || platform}
        </Button>
      </div>

      {/* Tips */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Dicas para melhores resultados
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Cole o prompt completo na plataforma escolhida</li>
            <li>• Aguarde a IA processar e gerar a estrutura base</li>
            <li>• Refine iterativamente com comandos adicionais</li>
            <li>• Use imagens de referência quando possível</li>
            <li>• Teste em diferentes dispositivos antes de publicar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
