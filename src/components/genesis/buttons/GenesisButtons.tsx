import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MousePointer2, 
  List, 
  Link, 
  Eye, 
  Send, 
  Info,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageEditor } from './MessageEditor';
import { ButtonsPreview } from './ButtonsPreview';
import { TestSender } from './TestSender';
import { InteractiveMessage, WHATSAPP_LIMITS } from './types';
import { useConnectedInstances } from './useConnectedInstances';

const defaultMessage: InteractiveMessage = {
  type: 'buttons',
  text: 'Olá! Como posso ajudá-lo hoje?',
  footer: '',
  buttons: [
    { id: 'btn_1', text: 'Atendimento', type: 'quick_reply' },
    { id: 'btn_2', text: 'Suporte', type: 'quick_reply' },
  ],
  listSections: [],
  buttonText: 'Ver opções',
};

export function GenesisButtons() {
  const { instances, loading: loadingInstances } = useConnectedInstances();
  const [message, setMessage] = useState<InteractiveMessage>(defaultMessage);
  const [activeTab, setActiveTab] = useState<'editor' | 'test'>('editor');

  const hasConnectedInstance = instances.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <MousePointer2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Botões & Listas</h1>
              <p className="text-muted-foreground">
                Crie mensagens interativas com botões nativos do WhatsApp
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasConnectedInstance ? (
            <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {instances.length} instância{instances.length !== 1 ? 's' : ''} conectada{instances.length !== 1 ? 's' : ''}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20">
              <AlertTriangle className="w-3 h-3" />
              Sem instância conectada
            </Badge>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          <strong>Importante:</strong> Botões e listas nativos do WhatsApp funcionam apenas em dispositivos compatíveis. 
          Em alguns casos, o WhatsApp pode exibir como mensagem de texto simples.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Editor & Test */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'editor' | 'test')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor" className="gap-2">
                <MousePointer2 className="w-4 h-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="test" className="gap-2">
                <Send className="w-4 h-4" />
                Enviar Teste
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {message.type === 'buttons' && <MousePointer2 className="w-4 h-4" />}
                    {message.type === 'list' && <List className="w-4 h-4" />}
                    {message.type === 'url' && <Link className="w-4 h-4" />}
                    Configurar Mensagem
                  </CardTitle>
                  <CardDescription>
                    Configure o conteúdo da mensagem interativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <MessageEditor message={message} onChange={setMessage} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="mt-4">
              <TestSender message={message} />
            </TabsContent>
          </Tabs>

          {/* Limits Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Limites</p>
                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                    <li>• Máx. {WHATSAPP_LIMITS.MAX_BUTTONS} botões</li>
                    <li>• Máx. {WHATSAPP_LIMITS.MAX_TOTAL_ROWS} itens na lista</li>
                    <li>• Mensagem até {WHATSAPP_LIMITS.MAX_MESSAGE_LENGTH} caracteres</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Tipos Disponíveis</p>
                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                    <li>• Botões de resposta rápida</li>
                    <li>• Lista com seções</li>
                    <li>• Botão com URL</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Preview */}
        <div className="lg:sticky lg:top-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview em Tempo Real
              </CardTitle>
              <CardDescription>
                Visualize como a mensagem aparecerá no WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <motion.div
                key={JSON.stringify(message)}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <ButtonsPreview message={message} />
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
