import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Phone, Send, Loader2, Check, X, AlertCircle,
  QrCode, RefreshCw, Plug, Unplug, Clock, ChevronDown, ChevronRight,
  Wifi, WifiOff, Plus, Settings, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppConnectorPanelProps {
  userId: string;
  sessionId?: string;
  onSendMessage?: (phone: string, message: string) => void;
}

interface Connector {
  id: string;
  name: string;
  provider: string;
  instance_id: string | null;
  token_hash: string | null;
  base_endpoint: string | null;
  status: string;
  last_connected_at: string | null;
  last_error: string | null;
}

type PanelView = 'list' | 'config' | 'send' | 'logs';

export const WhatsAppConnectorPanel = ({ userId, sessionId }: WhatsAppConnectorPanelProps) => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [activeConnector, setActiveConnector] = useState<Connector | null>(null);
  const [view, setView] = useState<PanelView>('list');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Config form
  const [configName, setConfigName] = useState('');
  const [configInstanceId, setConfigInstanceId] = useState('');
  const [configToken, setConfigToken] = useState('');
  const [configEndpoint, setConfigEndpoint] = useState('https://v5.chatpro.com.br');

  // Send form
  const [sendPhone, setSendPhone] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadConnectors = useCallback(async () => {
    const { data } = await supabase
      .from('engine_whatsapp_connectors')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setConnectors(data as any);
  }, [userId]);

  useEffect(() => { loadConnectors(); }, [loadConnectors]);

  const proxyCall = async (action: string, connectorId: string, extra: Record<string, any> = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatpro-proxy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action, connector_id: connectorId, ...extra }),
      }
    );
    return resp.json();
  };

  const handleCreateConnector = async () => {
    if (!configInstanceId.trim() || !configToken.trim()) {
      toast.error('Instance ID e Token são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('engine_whatsapp_connectors')
        .insert({
          user_id: userId,
          name: configName || 'Minha Conexão',
          provider: 'chatpro',
          instance_id: configInstanceId,
          token_hash: configToken,
          base_endpoint: configEndpoint || 'https://v5.chatpro.com.br',
        })
        .select()
        .single();
      if (error) throw error;
      toast.success('Conector criado!');
      setConfigName(''); setConfigInstanceId(''); setConfigToken('');
      await loadConnectors();
      setActiveConnector(data as any);
      setView('list');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar conector');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (conn: Connector) => {
    setLoading(true);
    try {
      const result = await proxyCall('test_connection', conn.id);
      if (result.connected) {
        toast.success('Conectado com sucesso!');
      } else {
        toast.error(result.error || 'Não conectado');
      }
      await loadConnectors();
    } catch {
      toast.error('Erro ao testar conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleGetQrCode = async (conn: Connector) => {
    setLoading(true);
    setQrCode(null);
    try {
      const result = await proxyCall('get_qrcode', conn.id);
      if (result.qrcode) {
        setQrCode(result.qrcode);
        toast.success('QR Code gerado! Escaneie com o WhatsApp.');
      } else {
        toast.error(result.error || 'Erro ao gerar QR Code');
      }
      await loadConnectors();
    } catch {
      toast.error('Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (conn: Connector) => {
    setLoading(true);
    try {
      await proxyCall('disconnect', conn.id);
      toast.success('Desconectado');
      setQrCode(null);
      await loadConnectors();
    } catch {
      toast.error('Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeConnector || !sendPhone.trim() || !sendMessage.trim()) {
      toast.error('Preencha telefone e mensagem');
      return;
    }
    setSending(true);
    try {
      const result = await proxyCall('send_message', activeConnector.id, {
        phone: sendPhone,
        message: sendMessage,
        session_id: sessionId,
      });
      if (result.success) {
        toast.success('Mensagem enviada!');
        setSendMessage('');
      } else {
        toast.error(result.error || 'Falha no envio');
      }
    } catch {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const loadLogs = async (connId: string) => {
    const { data } = await supabase
      .from('engine_message_logs')
      .select('*')
      .eq('connector_id', connId)
      .order('created_at', { ascending: false })
      .limit(20);
    setLogs(data || []);
  };

  const statusIcon = (status: string) => {
    if (status === 'connected') return <Wifi className="w-3 h-3 text-green-400" />;
    if (status === 'awaiting_qr') return <QrCode className="w-3 h-3 text-yellow-400" />;
    return <WifiOff className="w-3 h-3 text-red-400" />;
  };

  const statusLabel = (status: string) => {
    if (status === 'connected') return 'Conectado';
    if (status === 'awaiting_qr') return 'Aguardando QR';
    return 'Desconectado';
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[11px] font-semibold text-white/70">WhatsApp</span>
        </div>
        <div className="flex gap-1">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="text-[10px] text-white/30 hover:text-white/60">
              ← Voltar
            </button>
          )}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="space-y-1">
          {connectors.length === 0 ? (
            <div className="text-center py-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-white/10" />
              <p className="text-[10px] text-white/25 mb-2">Nenhum conector configurado</p>
              <Button size="sm" onClick={() => setView('config')} className="h-7 text-[10px] gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/20">
                <Plus className="w-3 h-3" /> Adicionar ChatPro
              </Button>
            </div>
          ) : (
            <>
              {connectors.map(conn => (
                <div key={conn.id} className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {statusIcon(conn.status)}
                      <span className="text-[11px] text-white/70 font-medium">{conn.name}</span>
                    </div>
                    <span className="text-[9px] text-white/25">{statusLabel(conn.status)}</span>
                  </div>
                  <div className="text-[9px] text-white/20 mb-2">
                    {conn.provider} • {conn.instance_id || 'Não configurado'}
                  </div>
                  {conn.last_error && (
                    <div className="text-[9px] text-red-400/60 mb-2 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{conn.last_error}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleTestConnection(conn)}
                      disabled={loading} className="h-6 text-[9px] text-white/40 hover:text-white/70 px-2 gap-1">
                      {loading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
                      Testar
                    </Button>
                    {conn.status !== 'connected' && (
                      <Button size="sm" variant="ghost" onClick={() => handleGetQrCode(conn)}
                        disabled={loading} className="h-6 text-[9px] text-white/40 hover:text-white/70 px-2 gap-1">
                        <QrCode className="w-2.5 h-2.5" /> QR Code
                      </Button>
                    )}
                    {conn.status === 'connected' && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => { setActiveConnector(conn); setView('send'); }}
                          className="h-6 text-[9px] text-green-400/70 hover:text-green-400 px-2 gap-1">
                          <Send className="w-2.5 h-2.5" /> Enviar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDisconnect(conn)}
                          disabled={loading} className="h-6 text-[9px] text-red-400/50 hover:text-red-400 px-2 gap-1">
                          <Unplug className="w-2.5 h-2.5" /> Desconectar
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { setActiveConnector(conn); loadLogs(conn.id); setView('logs'); }}
                      className="h-6 text-[9px] text-white/40 hover:text-white/70 px-2 gap-1">
                      <History className="w-2.5 h-2.5" /> Logs
                    </Button>
                  </div>
                </div>
              ))}

              {/* QR Code display */}
              {qrCode && (
                <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-center">
                  <p className="text-[10px] text-white/50 mb-2">Escaneie com o WhatsApp</p>
                  <div className="bg-white p-2 rounded-lg inline-block">
                    <img src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-[9px] text-white/25 mt-2">Abra WhatsApp → Aparelhos Conectados → Conectar</p>
                  <Button size="sm" onClick={() => setQrCode(null)} className="h-6 text-[9px] mt-2" variant="ghost">
                    Fechar
                  </Button>
                </div>
              )}

              <Button size="sm" onClick={() => setView('config')} variant="ghost"
                className="w-full h-7 text-[10px] text-white/25 hover:text-white/50 gap-1 border border-dashed border-white/[0.06]">
                <Plus className="w-3 h-3" /> Novo Conector
              </Button>
            </>
          )}
        </div>
      )}

      {/* CONFIG VIEW */}
      {view === 'config' && (
        <div className="space-y-2">
          <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg space-y-2">
            <p className="text-[10px] text-white/30 font-medium">Configurar ChatPro</p>
            <Input
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Nome da conexão"
              className="h-7 text-[11px] bg-white/[0.04] border-white/[0.08] text-white placeholder-white/20"
            />
            <Input
              value={configInstanceId}
              onChange={(e) => setConfigInstanceId(e.target.value)}
              placeholder="Instance ID (ex: chatpro-xxxxx)"
              className="h-7 text-[11px] bg-white/[0.04] border-white/[0.08] text-white placeholder-white/20"
            />
            <Input
              value={configToken}
              onChange={(e) => setConfigToken(e.target.value)}
              placeholder="Token de autenticação"
              type="password"
              className="h-7 text-[11px] bg-white/[0.04] border-white/[0.08] text-white placeholder-white/20"
            />
            <Input
              value={configEndpoint}
              onChange={(e) => setConfigEndpoint(e.target.value)}
              placeholder="Endpoint base"
              className="h-7 text-[11px] bg-white/[0.04] border-white/[0.08] text-white placeholder-white/20"
            />
            <div className="text-[9px] text-white/20 space-y-0.5">
              <p>• Obtenha o token em painel.chatpro.com.br</p>
              <p>• Instance ID aparece no painel da instância</p>
              <p>• Endpoint padrão: https://v5.chatpro.com.br</p>
            </div>
            <Button size="sm" onClick={handleCreateConnector} disabled={loading}
              className="w-full h-7 text-[10px] gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/20">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plug className="w-3 h-3" />}
              Salvar Conector
            </Button>
          </div>
        </div>
      )}

      {/* SEND VIEW */}
      {view === 'send' && activeConnector && (
        <div className="space-y-2">
          <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Send className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-white/50">Enviar via {activeConnector.name}</span>
            </div>
            <Input
              value={sendPhone}
              onChange={(e) => setSendPhone(e.target.value)}
              placeholder="Telefone (ex: 11999998888)"
              className="h-7 text-[11px] bg-white/[0.04] border-white/[0.08] text-white placeholder-white/20"
            />
            <textarea
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              placeholder="Mensagem..."
              rows={4}
              className="w-full text-[11px] bg-white/[0.04] border border-white/[0.08] rounded-md p-2 text-white/70 resize-none focus:outline-none focus:border-green-500/40 placeholder-white/20"
            />
            <Button size="sm" onClick={handleSendMessage} disabled={sending || !sendPhone.trim() || !sendMessage.trim()}
              className="w-full h-7 text-[10px] gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/20">
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Enviar Mensagem
            </Button>
          </div>
        </div>
      )}

      {/* LOGS VIEW */}
      {view === 'logs' && (
        <div className="space-y-1">
          {logs.length === 0 ? (
            <p className="text-[10px] text-white/20 text-center py-3">Nenhum log de envio</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-2 bg-white/[0.02] border border-white/[0.04] rounded-md">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-white/50">{log.phone}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${
                    log.status === 'sent' ? 'bg-green-500/10 text-green-400' :
                    log.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>{log.status}</span>
                </div>
                <p className="text-[9px] text-white/25 line-clamp-1">{log.message_preview}</p>
                <span className="text-[8px] text-white/15">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
