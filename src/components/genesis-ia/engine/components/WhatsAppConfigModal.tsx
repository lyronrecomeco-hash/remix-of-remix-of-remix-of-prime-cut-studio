import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare, Loader2, QrCode, RefreshCw, Plug, Unplug,
  Wifi, WifiOff, Plus, History, Send, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';

interface WhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  sessionId?: string;
  onConnectorReady?: () => void;
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

type ModalView = 'list' | 'create' | 'qrcode' | 'send' | 'logs';

export const WhatsAppConfigModal = ({ isOpen, onClose, userId, sessionId, onConnectorReady }: WhatsAppConfigModalProps) => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [activeConnector, setActiveConnector] = useState<Connector | null>(null);
  const [view, setView] = useState<ModalView>('list');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [configName, setConfigName] = useState('');
  const [configInstanceId, setConfigInstanceId] = useState('');
  const [configToken, setConfigToken] = useState('');
  const [configEndpoint, setConfigEndpoint] = useState('https://v5.chatpro.com.br');

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

  // Cleanup polling on unmount/close
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadConnectors();
      setView('list');
      setQrCode(null);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isOpen, loadConnectors, stopPolling]);

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
    const data = await resp.json();
    if (!resp.ok && data?.error) throw new Error(data.error);
    return data;
  };

  // Start polling for connection status (when QR is shown)
  const startStatusPolling = useCallback((connId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const result = await proxyCall('get_status', connId);
        if (result.connected) {
          stopPolling();
          toast.success('WhatsApp conectado com sucesso!');
          setQrCode(null);
          setView('list');
          await loadConnectors();
          onConnectorReady?.();
        }
      } catch {
        // Silent fail on polling
      }
    }, 4000);
  }, [stopPolling, loadConnectors, onConnectorReady]);

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
          name: configName || 'Minha Conexão ChatPro',
          provider: 'chatpro',
          instance_id: configInstanceId.trim(),
          token_hash: configToken.trim(),
          base_endpoint: configEndpoint.trim() || 'https://v5.chatpro.com.br',
        })
        .select()
        .single();
      if (error) throw error;
      toast.success('Conector criado!');
      setConfigName(''); setConfigInstanceId(''); setConfigToken('');
      setConfigEndpoint('https://v5.chatpro.com.br');
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
        toast.success('Conexão estabelecida!');
        onConnectorReady?.();
      } else {
        toast.error('Não conectado. Gere o QR Code e escaneie.');
      }
      await loadConnectors();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao testar');
    } finally {
      setLoading(false);
    }
  };

  const handleGetQrCode = async (conn: Connector) => {
    setLoading(true);
    setQrCode(null);
    try {
      const result = await proxyCall('get_qrcode', conn.id);
      if (result.connected) {
        toast.success('Já está conectado!');
        await loadConnectors();
        return;
      }
      if (result.qrcode) {
        setQrCode(result.qrcode);
        setActiveConnector(conn);
        setView('qrcode');
        toast.success('QR Code gerado! Escaneie com o WhatsApp.');
        // Start polling for auto-detect
        startStatusPolling(conn.id);
      } else {
        toast.error(result.error || 'Não foi possível gerar QR Code.');
      }
      await loadConnectors();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (conn: Connector) => {
    setLoading(true);
    stopPolling();
    try {
      const result = await proxyCall('disconnect', conn.id);
      if (result.success) {
        toast.success('Desconectado com sucesso');
      } else {
        toast.warning('Desconexão pode ter falhado. Verifique o status.');
      }
      setQrCode(null);
      await loadConnectors();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao desconectar');
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
        phone: sendPhone, message: sendMessage, session_id: sessionId,
      });
      if (result.success) {
        toast.success('Mensagem enviada!');
        setSendMessage('');
      } else {
        toast.error(result.error || 'Falha no envio');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar');
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

  const statusBadge = (status: string) => {
    if (status === 'connected') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
        <Wifi className="w-2.5 h-2.5" /> Online
      </span>
    );
    if (status === 'awaiting_qr') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        <QrCode className="w-2.5 h-2.5" /> Aguardando QR
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <WifiOff className="w-2.5 h-2.5" /> Offline
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WhatsApp — Configuração" size="lg">
      <ModalBody className="max-h-[70vh] overflow-y-auto">
        {/* LIST VIEW */}
        {view === 'list' && (
          <div className="space-y-3">
            {connectors.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-green-400/50" />
                </div>
                <h3 className="text-sm font-medium text-foreground/70 mb-1">Nenhum conector configurado</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure uma conexão ChatPro para enviar mensagens pelo WhatsApp.
                </p>
                <Button onClick={() => setView('create')} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4" /> Configurar ChatPro
                </Button>
              </div>
            ) : (
              <>
                {connectors.map(conn => (
                  <div key={conn.id} className="p-4 bg-secondary/30 border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">{conn.name}</span>
                          <p className="text-[10px] text-muted-foreground">{conn.provider} • {conn.instance_id || 'N/A'}</p>
                        </div>
                      </div>
                      {statusBadge(conn.status)}
                    </div>

                    {conn.last_error && (
                      <div className="text-[11px] text-red-400/80 mb-3 flex items-start gap-1.5 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{conn.last_error}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleTestConnection(conn)}
                        disabled={loading} className="h-8 text-xs gap-1.5">
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Testar
                      </Button>
                      {conn.status !== 'connected' && (
                        <Button size="sm" variant="outline" onClick={() => handleGetQrCode(conn)}
                          disabled={loading} className="h-8 text-xs gap-1.5">
                          <QrCode className="w-3.5 h-3.5" /> QR Code
                        </Button>
                      )}
                      {conn.status === 'connected' && (
                        <>
                          <Button size="sm" onClick={() => { setActiveConnector(conn); setView('send'); }}
                            className="h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                            <Send className="w-3.5 h-3.5" /> Enviar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDisconnect(conn)}
                            disabled={loading} className="h-8 text-xs gap-1.5 text-red-400 hover:text-red-500 border-red-500/20">
                            <Unplug className="w-3.5 h-3.5" /> Desconectar
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { setActiveConnector(conn); loadLogs(conn.id); setView('logs'); }}
                        className="h-8 text-xs gap-1.5">
                        <History className="w-3.5 h-3.5" /> Logs
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setView('create')} className="w-full gap-2 border-dashed">
                  <Plus className="w-4 h-4" /> Novo Conector
                </Button>
              </>
            )}
          </div>
        )}

        {/* CREATE VIEW */}
        {view === 'create' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
              <h4 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <Plug className="w-4 h-4 text-green-400" /> Configurar ChatPro
              </h4>
              <p className="text-xs text-muted-foreground">
                Obtenha seus dados no painel do ChatPro em <strong>painel.chatpro.com.br</strong>
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1 block">Nome da Conexão</label>
                <Input value={configName} onChange={(e) => setConfigName(e.target.value)} placeholder="Ex: WhatsApp Comercial" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1 block">Instance ID *</label>
                <Input value={configInstanceId} onChange={(e) => setConfigInstanceId(e.target.value)} placeholder="chatpro-xxxxxxxxxx" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1 block">Token *</label>
                <Input value={configToken} onChange={(e) => setConfigToken(e.target.value)} placeholder="Seu token de API" type="password" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1 block">Endpoint Base</label>
                <Input value={configEndpoint} onChange={(e) => setConfigEndpoint(e.target.value)} placeholder="https://v5.chatpro.com.br" />
              </div>
            </div>
          </div>
        )}

        {/* QR CODE VIEW */}
        {view === 'qrcode' && (
          <div className="text-center space-y-4 py-4">
            <h3 className="text-sm font-medium text-foreground">Escaneie o QR Code</h3>
            <p className="text-xs text-muted-foreground">WhatsApp → Aparelhos Conectados → Conectar</p>
            {qrCode && (
              <div className="inline-block bg-white p-4 rounded-xl shadow-lg">
                <img
                  src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code WhatsApp"
                  className="w-56 h-56"
                />
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-[11px] text-primary/70">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Detectando conexão automaticamente...</span>
            </div>
            {activeConnector && (
              <div className="flex justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleGetQrCode(activeConnector)} disabled={loading} className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Novo QR
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setView('list'); setQrCode(null); stopPolling(); }}>
                  Voltar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* SEND VIEW */}
        {view === 'send' && activeConnector && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Send className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Enviar Mensagem</span>
                <p className="text-[10px] text-muted-foreground">via {activeConnector.name}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1 block">Telefone</label>
              <Input value={sendPhone} onChange={(e) => setSendPhone(e.target.value)} placeholder="11999998888" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1 block">Mensagem</label>
              <textarea
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder="Escreva a mensagem..."
                rows={5}
                className="w-full text-sm bg-secondary/30 border border-border rounded-lg p-3 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder-muted-foreground"
              />
            </div>
          </div>
        )}

        {/* LOGS VIEW */}
        {view === 'logs' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground mb-3">Histórico de Envios</h4>
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum envio registrado</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-3 bg-secondary/20 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground/70">{log.phone}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      log.status === 'sent' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>{log.status}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{log.message_preview}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {view === 'create' && (
          <div className="flex gap-2 w-full">
            <Button variant="ghost" onClick={() => setView('list')} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreateConnector} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plug className="w-3.5 h-3.5" />}
              Criar Conector
            </Button>
          </div>
        )}
        {view === 'send' && (
          <div className="flex gap-2 w-full">
            <Button variant="ghost" onClick={() => setView('list')} className="flex-1">Voltar</Button>
            <Button onClick={handleSendMessage} disabled={sending} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Enviar
            </Button>
          </div>
        )}
        {view === 'logs' && (
          <Button variant="ghost" onClick={() => setView('list')} className="w-full">Voltar</Button>
        )}
        {view === 'list' && (
          <Button variant="ghost" onClick={onClose} className="w-full">Fechar</Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
