import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Sparkles, Send, RefreshCw, FileText, Mic, 
  MessageSquare, Wand2, Bot, Loader2, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';

type AIAction = 'suggestion' | 'rewrite' | 'summary' | 'transcription';
type RewriteStyle = 'conciso' | 'profissional' | 'amigavel' | 'revisar';

export function AIAssistant() {
  const { genesisUser } = useGenesisAuth();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<AIAction>('suggestion');
  const [rewriteStyle, setRewriteStyle] = useState<RewriteStyle>('profissional');

  const rewriteStyles: { value: RewriteStyle; label: string; icon: string }[] = [
    { value: 'conciso', label: 'Conciso', icon: '⚡' },
    { value: 'profissional', label: 'Profissional', icon: '👔' },
    { value: 'amigavel', label: 'Amigável', icon: '😊' },
    { value: 'revisar', label: 'Apenas Revisar', icon: '✏️' },
  ];

  const processAI = async () => {
    if (!input.trim()) {
      toast.error('Digite algo primeiro');
      return;
    }

    setLoading(true);
    setOutput('');

    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: activeTab,
          input: input,
          style: activeTab === 'rewrite' ? rewriteStyle : undefined,
        }
      });

      if (error) throw error;

      setOutput(data.output || 'Sem resposta');

      // Log usage
      if (genesisUser) {
        await supabase.from('genesis_ai_assistant_logs').insert({
          user_id: genesisUser.id,
          action_type: activeTab,
          input_text: input.substring(0, 500),
          output_text: (data.output || '').substring(0, 1000),
          rewrite_style: activeTab === 'rewrite' ? rewriteStyle : null,
          tokens_used: data.tokens || 0,
          latency_ms: Date.now() - startTime,
          success: true,
        });
      }

    } catch (err: any) {
      toast.error('Erro ao processar IA');
      console.error(err);

      if (genesisUser) {
        await supabase.from('genesis_ai_assistant_logs').insert({
          user_id: genesisUser.id,
          action_type: activeTab,
          input_text: input.substring(0, 500),
          success: false,
          error_message: err.message,
          latency_ms: Date.now() - startTime,
        });
      }
    }

    setLoading(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionInfo = () => {
    switch (activeTab) {
      case 'suggestion':
        return { title: 'Sugestão de Resposta', desc: 'IA sugere uma resposta baseada no contexto', icon: MessageSquare };
      case 'rewrite':
        return { title: 'Reescrever Mensagem', desc: 'Melhore o tom e clareza da sua mensagem', icon: Wand2 };
      case 'summary':
        return { title: 'Resumir Atendimento', desc: 'Gere um resumo da conversa', icon: FileText };
      case 'transcription':
        return { title: 'Transcrever Áudio', desc: 'Converta áudio em texto', icon: Mic };
    }
  };

  const info = getActionInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Assistente IA</h2>
          <p className="text-sm text-muted-foreground">Sugestões, reescrita e resumos inteligentes</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AIAction)}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="suggestion" className="gap-1">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Sugestão</span>
          </TabsTrigger>
          <TabsTrigger value="rewrite" className="gap-1">
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reescrever</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Resumo</span>
          </TabsTrigger>
          <TabsTrigger value="transcription" className="gap-1">
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Transcrição</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <info.icon className="w-5 h-5 text-primary" />
                {info.title}
              </CardTitle>
              <CardDescription>{info.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rewrite Styles */}
              {activeTab === 'rewrite' && (
                <div className="flex gap-2 flex-wrap">
                  {rewriteStyles.map(style => (
                    <Button
                      key={style.value}
                      variant={rewriteStyle === style.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRewriteStyle(style.value)}
                    >
                      {style.icon} {style.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Input */}
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeTab === 'suggestion' 
                    ? 'Cole a conversa ou contexto aqui...'
                    : activeTab === 'rewrite'
                    ? 'Cole a mensagem que deseja melhorar...'
                    : activeTab === 'summary'
                    ? 'Cole a conversa completa para resumir...'
                    : 'Cole a transcrição do áudio...'
                }
                className="min-h-[150px]"
              />

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={processAI} disabled={loading || !input.trim()}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Processar
                </Button>
                <Button variant="outline" onClick={() => { setInput(''); setOutput(''); }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>

              {/* Output */}
              <AnimatePresence>
                {output && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="gap-1">
                        <Bot className="w-3 h-3" />
                        Resultado
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={copyOutput}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border whitespace-pre-wrap">
                      {output}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
