import { 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Sparkles,
  Rocket,
  FileCode,
  Zap,
  Star,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AI_PLATFORMS } from './types';

interface PromptPreviewV2Props {
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

export const PromptPreviewV2 = ({ 
  prompt, 
  platform, 
  onCopy, 
  copied, 
  onRegenerate 
}: PromptPreviewV2Props) => {
  const platformInfo = AI_PLATFORMS.find(p => p.id === platform);
  const platformUrl = PLATFORM_URLS[platform] || '#';
  const promptLines = prompt.split('\n').length;
  const promptChars = prompt.length;

  const handleOpenPlatform = () => {
    window.open(platformUrl, '_blank');
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${platform}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mx-auto shadow-2xl shadow-primary/40 animate-pulse">
            <Rocket className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
            <Check className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Badge className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 px-4 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            Nylus 1.0 IA Master de Prompts
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Prompt Gerado com Sucesso! 🚀
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Seu prompt profissional está pronto. Cole diretamente na plataforma escolhida para criar seu projeto completo.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{promptLines}</p>
          <p className="text-xs text-muted-foreground">Linhas</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{promptChars.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Caracteres</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex flex-col items-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Qualidade</p>
        </div>
      </div>

      {/* Platform Badge */}
      <div className="flex items-center justify-center gap-3">
        <Badge variant="outline" className="gap-2 px-5 py-2.5 text-base border-2">
          <Zap className="w-5 h-5 text-primary" />
          Otimizado para <span className="font-bold">{platformInfo?.name || platform}</span>
        </Badge>
      </div>

      {/* Prompt Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-b from-card to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            Prompt Master Final
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Download className="w-4 h-4" />
              Baixar
            </Button>
            <Button
              variant={copied ? "default" : "secondary"}
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
        <CardContent className="p-0">
          <div className="relative">
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 border-r border-border flex flex-col text-right pr-2 pt-4 text-xs text-muted-foreground/50 font-mono overflow-hidden">
              {Array.from({ length: Math.min(promptLines, 100) }, (_, i) => (
                <span key={i} className="h-5 leading-5">{i + 1}</span>
              ))}
            </div>
            
            {/* Code Content */}
            <pre className="pl-14 pr-4 py-4 text-sm whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto text-foreground/90 leading-5">
              {prompt}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Main Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={onCopy}
          className="gap-2 h-14 px-8 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Prompt Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copiar Prompt Completo
            </>
          )}
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={handleOpenPlatform}
          className="gap-2 h-14 px-8 text-lg border-2"
        >
          <ExternalLink className="w-5 h-5" />
          Abrir {platformInfo?.name || platform}
        </Button>
      </div>

      {/* Tips Card */}
      <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <h4 className="font-bold text-foreground mb-4 flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Próximos Passos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Cole o prompt na IA</p>
                <p className="text-muted-foreground text-xs">Acesse {platformInfo?.name} e cole o prompt completo</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Aguarde a geração</p>
                <p className="text-muted-foreground text-xs">A IA vai criar a estrutura base do seu projeto</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Refine iterativamente</p>
                <p className="text-muted-foreground text-xs">Use prompts adicionais para ajustes finos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">4</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Teste e publique</p>
                <p className="text-muted-foreground text-xs">Valide em diferentes dispositivos e publique</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
