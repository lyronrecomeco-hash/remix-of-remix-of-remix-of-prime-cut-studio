import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  User,
  Bot,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Session {
  id: string;
  chatbot_id: string;
  contact_id: string;
  current_step: string;
  awaiting_response: boolean;
  awaiting_type: string | null;
  context: Record<string, any>;
  history: Array<{ role: 'user' | 'bot'; message: string; timestamp: string }>;
  status: 'active' | 'completed' | 'timeout' | 'cancelled';
  started_at: string;
  last_interaction_at: string;
  ended_at: string | null;
  chatbot?: { name: string };
}

interface SessionLog {
  id: string;
  event_type: string;
  message_in: string | null;
  message_out: string | null;
  luna_reasoning: string | null;
  step_from: string | null;
  step_to: string | null;
  error_message: string | null;
  created_at: string;
}

interface ChatbotSessionViewerProps {
  chatbotId?: string;
}

const STATUS_CONFIG = {
  active: { label: 'Ativa', color: 'bg-green-500', icon: Activity },
  completed: { label: 'Concluída', color: 'bg-blue-500', icon: CheckCircle },
  timeout: { label: 'Timeout', color: 'bg-orange-500', icon: Timer },
  cancelled: { label: 'Cancelada', color: 'bg-red-500', icon: XCircle },
};

export function ChatbotSessionViewer({ chatbotId }: ChatbotSessionViewerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('chatbot_sessions')
        .select('*, chatbot:whatsapp_automations(name)')
        .order('last_interaction_at', { ascending: false })
        .limit(50);

      if (chatbotId) {
        query = query.eq('chatbot_id', chatbotId);
      }

      if (filter === 'active') {
        query = query.eq('status', 'active');
      } else if (filter === 'completed') {
        query = query.neq('status', 'active');
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions((data || []) as unknown as Session[]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionLogs = async (sessionId: string) => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('chatbot_session_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSessionLogs((data || []) as SessionLog[]);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [chatbotId, filter]);

  const handleViewSession = async (session: Session) => {
    setSelectedSession(session);
    await fetchSessionLogs(session.id);
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'session_start':
        return <Activity className="w-4 h-4 text-green-500" />;
      case 'message_sent':
        return <Bot className="w-4 h-4 text-blue-500" />;
      case 'message_received':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'luna_decision':
        return <Bot className="w-4 h-4 text-primary" />;
      case 'step_change':
        return <Activity className="w-4 h-4 text-orange-500" />;
      case 'timeout':
        return <Timer className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const activeCount = sessions.filter(s => s.status === 'active').length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Sessões de Chatbot
              </CardTitle>
              <CardDescription>
                {activeCount} sessões ativas • {sessions.length} total
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSessions} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="active" className="gap-2">
                Ativas
                {activeCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">{activeCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Finalizadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma sessão encontrada</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                <AnimatePresence>
                  {sessions.map((session, index) => {
                    const statusConfig = getStatusConfig(session.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleViewSession(session)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {session.contact_id.slice(-8)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {session.chatbot?.name || 'Chatbot'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(session.last_interaction_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                  <span>•</span>
                                  <span>{session.history?.length || 0} mensagens</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </Badge>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Detalhes da Sessão
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <Tabs defaultValue="conversation" className="flex-1 overflow-hidden flex flex-col">
              <TabsList>
                <TabsTrigger value="conversation">Conversa</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="context">Contexto</TabsTrigger>
              </TabsList>

              <TabsContent value="conversation" className="flex-1 overflow-hidden">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3 py-2">
                    {selectedSession.history?.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? '' : 'flex-row-reverse'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user' ? 'bg-muted' : 'bg-primary/10'
                        }`}>
                          {msg.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? '' : 'text-right'}`}>
                          <div className={`inline-block p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-muted text-foreground' 
                              : 'bg-primary/10 text-foreground'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(msg.timestamp), 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="logs" className="flex-1 overflow-hidden">
                {isLoadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2 py-2">
                      {sessionLogs.map((log) => (
                        <div key={log.id} className="p-3 border rounded-lg text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            {getEventIcon(log.event_type)}
                            <span className="font-medium capitalize">
                              {log.event_type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {format(new Date(log.created_at), 'HH:mm:ss', { locale: ptBR })}
                            </span>
                          </div>
                          {log.message_in && (
                            <p className="text-xs text-muted-foreground">
                              <strong>In:</strong> {log.message_in.slice(0, 100)}...
                            </p>
                          )}
                          {log.message_out && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Out:</strong> {log.message_out.slice(0, 100)}...
                            </p>
                          )}
                          {log.luna_reasoning && (
                            <p className="text-xs text-primary mt-1">
                              <strong>Luna:</strong> {log.luna_reasoning}
                            </p>
                          )}
                          {log.error_message && (
                            <p className="text-xs text-red-500 mt-1">
                              <strong>Erro:</strong> {log.error_message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="context" className="flex-1 overflow-hidden">
                <ScrollArea className="h-[400px]">
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify({
                      id: selectedSession.id,
                      status: selectedSession.status,
                      current_step: selectedSession.current_step,
                      awaiting_response: selectedSession.awaiting_response,
                      awaiting_type: selectedSession.awaiting_type,
                      context: selectedSession.context,
                      started_at: selectedSession.started_at,
                      last_interaction_at: selectedSession.last_interaction_at,
                      ended_at: selectedSession.ended_at,
                    }, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
