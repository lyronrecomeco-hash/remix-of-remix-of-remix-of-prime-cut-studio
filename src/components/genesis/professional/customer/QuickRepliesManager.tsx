import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Search, Image, FileText, Mic, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickReply {
  id: string;
  shortcut: string;
  title: string;
  messages: { type: string; content: string }[];
  category: string;
  use_count: number;
}

export function QuickRepliesManager() {
  const [searchTerm, setSearchTerm] = useState('');

  // Demo data
  const quickReplies: QuickReply[] = [
    { 
      id: '1', 
      shortcut: '/ola', 
      title: 'Saudação', 
      messages: [{ type: 'text', content: 'Olá! Bem-vindo à nossa empresa. Como posso ajudar?' }],
      category: 'geral',
      use_count: 245
    },
    { 
      id: '2', 
      shortcut: '/preco', 
      title: 'Tabela de Preços', 
      messages: [
        { type: 'text', content: 'Segue nossa tabela de preços atualizada:' },
        { type: 'image', content: 'tabela_precos.jpg' }
      ],
      category: 'vendas',
      use_count: 189
    },
    { 
      id: '3', 
      shortcut: '/pix', 
      title: 'Dados PIX', 
      messages: [
        { type: 'text', content: 'Nossos dados para pagamento via PIX:' },
        { type: 'text', content: 'Chave: contato@empresa.com' }
      ],
      category: 'financeiro',
      use_count: 156
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-3 h-3" />;
      case 'audio': return <Mic className="w-3 h-3" />;
      case 'document': return <FileText className="w-3 h-3" />;
      default: return <MessageSquare className="w-3 h-3" />;
    }
  };

  const filteredReplies = quickReplies.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.shortcut.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Respostas Rápidas</h2>
            <p className="text-sm text-muted-foreground">Mensagens com múltiplas mídias</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Resposta
        </Button>
      </motion.div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título ou atalho..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReplies.map((reply, i) => (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{reply.title}</CardTitle>
                    <code className="text-sm text-primary">{reply.shortcut}</code>
                  </div>
                  <Badge variant="outline">{reply.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-3">
                  {reply.messages.map((msg, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getTypeIcon(msg.type)}
                      <span className="truncate">
                        {msg.type === 'text' ? msg.content : msg.content}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{reply.messages.length} mensagem(ns)</span>
                  <span>{reply.use_count} usos</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
