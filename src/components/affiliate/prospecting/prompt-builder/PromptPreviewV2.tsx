import { 
  Copy, 
  Check, 
  ArrowLeft,
  FileCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PromptPreviewV2Props {
  prompt: string;
  platform: string;
  onCopy: () => void;
  copied: boolean;
  onBack: () => void;
}

export const PromptPreviewV2 = ({ 
  prompt, 
  onCopy, 
  copied, 
  onBack 
}: PromptPreviewV2Props) => {
  const promptLines = prompt.split('\n').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Prompt Card */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            Prompt Master Final
          </CardTitle>
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
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-muted/30 border-r border-border flex flex-col text-right pr-2 pt-4 text-xs text-muted-foreground/40 font-mono overflow-hidden">
              {Array.from({ length: Math.min(promptLines, 150) }, (_, i) => (
                <span key={i} className="h-5 leading-5">{i + 1}</span>
              ))}
            </div>
            
            {/* Code Content */}
            <pre className="pl-12 pr-4 py-4 text-sm whitespace-pre-wrap font-mono max-h-[600px] overflow-y-auto text-foreground/90 leading-5">
              {prompt}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        
        <Button
          size="lg"
          onClick={onCopy}
          className="gap-2 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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
      </div>
    </div>
  );
};
