import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Users, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
}

interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group';
  lastMessage: string;
  unread: number;
  members: string[];
}

export function InternalChat() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Demo data
  const chats: Chat[] = [
    { id: '1', name: 'Equipe Vendas', type: 'group', lastMessage: 'Novo lead chegou!', unread: 3, members: ['Ana', 'Carlos'] },
    { id: '2', name: 'Carlos Silva', type: 'direct', lastMessage: 'Ok, vou verificar', unread: 0, members: ['Carlos'] },
    { id: '3', name: 'Suporte Técnico', type: 'group', lastMessage: 'Problema resolvido', unread: 1, members: ['Maria', 'João'] },
  ];

  const messages: ChatMessage[] = [
    { id: '1', sender: 'Carlos', content: 'Pessoal, chegou um lead novo do site!', time: '10:30' },
    { id: '2', sender: 'Ana', content: 'Qual o interesse dele?', time: '10:31' },
    { id: '3', sender: 'Carlos', content: 'Quer contratar o plano Pro', time: '10:32' },
    { id: '4', sender: 'Você', content: 'Vou entrar em contato agora', time: '10:33' },
  ];

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Chat Interno</h2>
          <p className="text-sm text-muted-foreground">Comunique-se com sua equipe</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        {/* Lista de Chats */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Conversas</CardTitle>
              <Button size="sm" variant="ghost">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              {filteredChats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 border-b ${
                    selectedChat === chat.id ? 'bg-muted' : ''
                  }`}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {chat.type === 'group' ? <Users className="w-4 h-4" /> : chat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{chat.name}</span>
                      {chat.unread > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Chat */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader className="border-b py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {chats.find(c => c.id === selectedChat)?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {chats.find(c => c.id === selectedChat)?.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {chats.find(c => c.id === selectedChat)?.members.join(', ')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'Você' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${
                          msg.sender === 'Você' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        } rounded-lg p-3`}>
                          {msg.sender !== 'Você' && (
                            <p className="text-xs font-medium mb-1">{msg.sender}</p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1 text-right">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyDown={(e) => e.key === 'Enter' && setMessage('')}
                  />
                  <Button>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
