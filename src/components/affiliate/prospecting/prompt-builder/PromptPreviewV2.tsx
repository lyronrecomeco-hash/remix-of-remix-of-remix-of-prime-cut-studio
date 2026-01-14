import { Copy, Check, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PromptPreviewV2Props {
  prompt: string;
  platform: string;
  onCopy: () => void;
  copied: boolean;
  onBack: () => void;
}

export const PromptPreviewV2 = ({ prompt, onCopy, copied, onBack }: PromptPreviewV2Props) => {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Genesis Hub</h1>
        <p className="text-lg text-muted-foreground">Seu prompt está pronto para uso</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <Button
          variant={copied ? 'default' : 'secondary'}
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

      <Card className="border border-border">
        <CardContent className="p-0">
          <Textarea
            value={prompt}
            readOnly
            className="min-h-[480px] w-full resize-none rounded-none border-0 bg-transparent p-6 font-mono text-sm leading-6"
          />
        </CardContent>
      </Card>
    </div>
  );
};

