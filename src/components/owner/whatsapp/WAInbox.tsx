import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Check,
  CheckCheck,
  Image,
  File,
  Mic,
  Video,
  MapPin,
  Star,
  StarOff,
  Archive,
  ArchiveX,
  RefreshCw,
  MoreVertical,
  Loader2,
  Wifi,
  WifiOff,
  Clock,
  Paperclip,
  Smile,
  User,
  MessageCircle,
  Filter,
  Bell,
  BellOff
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { Conversation, InboxMessage } from './types';

interface WAInboxProps {
  instances: Array<{ id: string; name: string; status: string }>;
}

export const WAInbox = ({ instances }: WAInboxProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Check connection status
  useEffect(() => {
    const connected = instances.some(i => i.status === 'connected');
    setIsConnected(connected);
  }, [instances]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      let query = supabase
        .from('whatsapp_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (activeTab === 'unread') {
        query = query.gt('unread_count', 0);
      } else if (activeTab === 'archived') {
        query = query.eq('is_archived', true);
      } else {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setConversations((data || []) as Conversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (phone: string, instanceId: string) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_inbox')
        .select('*')
        .eq('instance_id', instanceId)
        .or(`phone_from.eq.${phone},phone_to.eq.${phone}`)
        .order('received_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data || []) as InboxMessage[]);

      // Mark as read
      await supabase
        .from('whatsapp_inbox')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('phone_from', phone)
        .eq('instance_id', instanceId)
        .eq('is_read', false);

      // Update unread count
      await supabase
        .from('whatsapp_conversations')
        .update({ unread_count: 0 })
        .eq('phone', phone)
        .eq('instance_id', instanceId);

      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchConversations();

    // Setup polling for real-time updates
    pollingRef.current = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation.phone, selectedConversation.instance_id);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchConversations, fetchMessages, selectedConversation]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('inbox-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_inbox' },
        () => {
          fetchConversations();
          if (selectedConversation) {
            fetchMessages(selectedConversation.phone, selectedConversation.instance_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations, fetchMessages, selectedConversation]);

  // Select conversation
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    fetchMessages(conv.phone, conv.instance_id);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      // Add to send queue
      const { error: queueError } = await supabase
        .from('whatsapp_send_queue')
        .insert({
          instance_id: selectedConversation.instance_id,
          phone_to: selectedConversation.phone,
          message_type: 'text',
          message_content: newMessage,
          status: 'pending',
        });

      if (queueError) throw queueError;

      // Add to inbox for immediate display
      const { error } = await supabase.from('whatsapp_inbox').insert({
        instance_id: selectedConversation.instance_id,
        phone_from: 'me',
        phone_to: selectedConversation.phone,
        message_type: 'text',
        message_content: newMessage,
        is_from_me: true,
        is_read: true,
      });

      if (error) throw error;

      // Update conversation
      await supabase
        .from('whatsapp_conversations')
        .update({
          last_message: newMessage,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      await fetchMessages(selectedConversation.phone, selectedConversation.instance_id);
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  // Toggle archive
  const toggleArchive = async (conv: Conversation) => {
    try {
      const { error } = await supabase
        .from('whatsapp_conversations')
        .update({ is_archived: !conv.is_archived })
        .eq('id', conv.id);

      if (error) throw error;
      toast.success(conv.is_archived ? 'Conversa desarquivada' : 'Conversa arquivada');
      fetchConversations();
    } catch (error) {
      toast.error('Erro ao arquivar');
    }
  };

  // Toggle pin
  const togglePin = async (conv: Conversation) => {
    try {
      const { error } = await supabase
        .from('whatsapp_conversations')
        .update({ is_pinned: !conv.is_pinned })
        .eq('id', conv.id);

      if (error) throw error;
      toast.success(conv.is_pinned ? 'Conversa desafixada' : 'Conversa fixada');
      fetchConversations();
    } catch (error) {
      toast.error('Erro ao fixar');
    }
  };

  // Filter and sort conversations
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.phone.includes(searchQuery) ||
      (conv.contact_name?.toLowerCase().includes(searchLower))
    );
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime();
  });

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'document': return <File className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Stats
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const archivedCount = conversations.filter(c => c.is_archived).length;

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-200px)] min-h-[600px] gap-4 rounded-2xl overflow-hidden">
        {/* Sidebar - Conversations List */}
        <Card className="w-[380px] flex flex-col border-r-0 rounded-r-none">
          <CardHeader className="pb-3 space-y-3">
            {/* Header with stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Inbox</CardTitle>
                {totalUnread > 0 && (
                  <Badge variant="default" className="h-5 px-1.5">{totalUnread}</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  </TooltipTrigger>
                  <TooltipContent>{isConnected ? 'Conectado' : 'Desconectado'}</TooltipContent>
                </Tooltip>
                <Button variant="ghost" size="icon" onClick={fetchConversations} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all" className="text-xs">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Não lidas
                  {totalUnread > 0 && <span className="ml-1">({totalUnread})</span>}
                </TabsTrigger>
                <TabsTrigger value="archived" className="text-xs">
                  Arquivadas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : sortedConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Nenhuma conversa</p>
                  <p className="text-sm mt-1">
                    {activeTab === 'unread' 
                      ? 'Todas as mensagens foram lidas' 
                      : activeTab === 'archived'
                      ? 'Nenhuma conversa arquivada'
                      : 'Aguardando mensagens do WhatsApp'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  <AnimatePresence>
                    {sortedConversations.map((conv) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-3 cursor-pointer transition-all hover:bg-muted/50 ${
                          selectedConversation?.id === conv.id ? 'bg-muted' : ''
                        } ${conv.is_pinned ? 'border-l-2 border-l-primary' : ''}`}
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conv.profile_picture_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {conv.contact_name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                              </AvatarFallback>
                            </Avatar>
                            {conv.is_pinned && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <Star className="w-2.5 h-2.5 text-primary-foreground fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {conv.contact_name || conv.phone}
                              </p>
                              <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                                {conv.last_message_at && formatTime(conv.last_message_at)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {conv.last_message || 'Sem mensagens'}
                              </p>
                              {conv.unread_count > 0 && (
                                <Badge className="h-5 px-1.5 ml-2 shrink-0">
                                  {conv.unread_count}
                                </Badge>
                              )}
                            </div>
                            {/* Tags */}
                            {conv.tags && conv.tags.length > 0 && (
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                {conv.tags.slice(0, 2).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                    {tag}
                                  </Badge>
                                ))}
                                {conv.tags.length > 2 && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                    +{conv.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col rounded-l-none border-l">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.profile_picture_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedConversation.contact_name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {selectedConversation.contact_name || selectedConversation.phone}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3 h-3" />
                        {selectedConversation.phone}
                        <span className="text-muted-foreground">•</span>
                        <span className="text-green-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Online
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => togglePin(selectedConversation)}>
                          {selectedConversation.is_pinned 
                            ? <StarOff className="w-4 h-4" /> 
                            : <Star className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {selectedConversation.is_pinned ? 'Desafixar' : 'Fixar'}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => toggleArchive(selectedConversation)}>
                          {selectedConversation.is_archived 
                            ? <ArchiveX className="w-4 h-4" /> 
                            : <Archive className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {selectedConversation.is_archived ? 'Desarquivar' : 'Arquivar'}
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <User className="w-4 h-4" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <BellOff className="w-4 h-4" />
                          Silenciar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive">
                          Bloquear contato
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 p-0 overflow-hidden bg-muted/20">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma mensagem nesta conversa</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, index) => {
                          const showDate = index === 0 || 
                            new Date(msg.received_at).toDateString() !== 
                            new Date(messages[index - 1].received_at).toDateString();

                          return (
                            <div key={msg.id}>
                              {showDate && (
                                <div className="flex justify-center my-4">
                                  <Badge variant="secondary" className="text-xs font-normal">
                                    {new Date(msg.received_at).toLocaleDateString('pt-BR', { 
                                      weekday: 'long', 
                                      day: 'numeric', 
                                      month: 'long' 
                                    })}
                                  </Badge>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                    msg.is_from_me
                                      ? 'bg-primary text-primary-foreground rounded-br-md'
                                      : 'bg-card border rounded-bl-md'
                                  }`}
                                >
                                  {msg.message_type !== 'text' && (
                                    <div className={`flex items-center gap-2 mb-1.5 text-xs ${
                                      msg.is_from_me ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}>
                                      {getMessageIcon(msg.message_type)}
                                      <span className="capitalize">{msg.message_type}</span>
                                    </div>
                                  )}
                                  {msg.media_url && (
                                    <div className="mb-2 rounded-lg overflow-hidden">
                                      {msg.message_type === 'image' ? (
                                        <img src={msg.media_url} alt="Media" className="max-w-full rounded-lg" />
                                      ) : msg.message_type === 'video' ? (
                                        <video src={msg.media_url} controls className="max-w-full rounded-lg" />
                                      ) : (
                                        <a 
                                          href={msg.media_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className={`text-xs underline flex items-center gap-1 ${
                                            msg.is_from_me ? 'text-primary-foreground' : 'text-primary'
                                          }`}
                                        >
                                          <File className="w-4 h-4" />
                                          Ver arquivo
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message_content}</p>
                                  <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${
                                    msg.is_from_me ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                  }`}>
                                    <span className="text-[10px]">
                                      {new Date(msg.received_at).toLocaleTimeString('pt-BR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                    {msg.is_from_me && (
                                      msg.is_read 
                                        ? <CheckCheck className="w-3.5 h-3.5 text-blue-400" /> 
                                        : <Check className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <div className="flex gap-2 items-end">
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Anexar arquivo</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <Smile className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Emojis</TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[44px] max-h-[120px] resize-none flex-1"
                    rows={1}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isSending || !newMessage.trim()}
                    size="icon"
                    className="shrink-0 h-11 w-11 rounded-full"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Selecione uma conversa</h3>
                <p className="text-sm max-w-md">
                  Escolha uma conversa na lista ao lado para visualizar as mensagens e responder
                </p>
                {!isConnected && (
                  <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20 max-w-sm">
                    <div className="flex items-center gap-2 text-destructive">
                      <WifiOff className="w-4 h-4" />
                      <span className="text-sm font-medium">WhatsApp desconectado</span>
                    </div>
                    <p className="text-xs mt-1 text-destructive/80">
                      Conecte uma instância para receber mensagens
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};
