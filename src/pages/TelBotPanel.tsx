import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot, Users, Search, Activity, Settings, Shield,
  RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle,
  BarChart3, Eye, MessageSquare, Bell, Loader2
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────
interface BotInfo {
  webhook: { url: string; has_custom_certificate: boolean; pending_update_count: number; last_error_date?: number; last_error_message?: string };
  bot: { id: number; first_name: string; username: string; is_bot: boolean };
}

// ─── Dashboard Tab ───────────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState({ users: 0, queries: 0, monitors: 0, alerts: 0, todayQueries: 0 });
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const [usersRes, queriesRes, monitorsRes, alertsRes, todayRes, recentRes] = await Promise.all([
      supabase.from("telbot_users").select("id", { count: "exact", head: true }),
      supabase.from("telbot_queries").select("id", { count: "exact", head: true }),
      supabase.from("telbot_monitoring").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("telbot_alerts").select("id", { count: "exact", head: true }),
      supabase.from("telbot_queries").select("id", { count: "exact", head: true }).gte("created_at", today),
      supabase.from("telbot_queries").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    setStats({
      users: usersRes.count || 0,
      queries: queriesRes.count || 0,
      monitors: monitorsRes.count || 0,
      alerts: alertsRes.count || 0,
      todayQueries: todayRes.count || 0,
    });
    setRecentQueries(recentRes.data || []);
    setLoading(false);
  }

  const riskColors: Record<string, string> = {
    baixo: "bg-green-500/20 text-green-400 border-green-500/30",
    medio: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    alto: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    critico: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Usuários", value: stats.users, icon: Users, color: "text-blue-400" },
          { label: "Consultas Total", value: stats.queries, icon: Search, color: "text-cyan-400" },
          { label: "Consultas Hoje", value: stats.todayQueries, icon: BarChart3, color: "text-green-400" },
          { label: "Monitoramentos", value: stats.monitors, icon: Eye, color: "text-purple-400" },
          { label: "Alertas", value: stats.alerts, icon: Bell, color: "text-orange-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/60 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Últimas Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentQueries.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">Nenhuma consulta ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentQueries.map((q) => (
                <div key={q.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                        {q.query_type?.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-slate-300 truncate">{q.query_input?.substring(0, 30)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(q.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Badge className={`${riskColors[q.risk_level] || "bg-slate-500/20 text-slate-400"} border text-xs`}>
                    {q.risk_level || "N/A"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase
      .from("telbot_users")
      .select("*")
      .order("last_activity_at", { ascending: false })
      .limit(50);
    setUsers(data || []);
    setLoading(false);
  }

  const filtered = users.filter(
    (u) =>
      (u.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.telegram_username || "").toLowerCase().includes(search.toLowerCase()) ||
      String(u.telegram_id).includes(search),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar usuários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800/50 border-slate-700 text-white"
        />
        <Button variant="outline" size="icon" onClick={loadUsers} className="border-slate-700">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {filtered.map((u) => (
              <Card key={u.id} className="bg-slate-900/60 border-slate-700/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {u.first_name} {u.last_name || ""}
                    </p>
                    <p className="text-xs text-slate-400">
                      @{u.telegram_username || "sem_username"} · ID: {u.telegram_id}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Última atividade: {u.last_activity_at ? new Date(u.last_activity_at).toLocaleString("pt-BR") : "Nunca"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cyan-400">{u.total_queries || 0}</p>
                    <p className="text-xs text-slate-500">consultas</p>
                    <Badge variant="outline" className={u.is_blocked ? "border-red-500 text-red-400 mt-1" : "border-green-500 text-green-400 mt-1"}>
                      {u.is_blocked ? "Bloqueado" : "Ativo"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── Queries Tab ─────────────────────────────────────────────────────
function QueriesTab() {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { loadQueries(); }, [typeFilter]);

  async function loadQueries() {
    setLoading(true);
    let query = supabase.from("telbot_queries").select("*").order("created_at", { ascending: false }).limit(100);
    if (typeFilter !== "all") query = query.eq("query_type", typeFilter);
    const { data } = await query;
    setQueries(data || []);
    setLoading(false);
  }

  const riskColors: Record<string, string> = {
    baixo: "bg-green-500/20 text-green-400",
    medio: "bg-yellow-500/20 text-yellow-400",
    alto: "bg-orange-500/20 text-orange-400",
    critico: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "cpf", "cnpj", "nome", "telefone", "link", "message"].map((t) => (
          <Button
            key={t}
            variant={typeFilter === t ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(t)}
            className={typeFilter === t ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-400"}
          >
            {t === "all" ? "Todos" : t.toUpperCase()}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {queries.map((q) => (
              <Card key={q.id} className="bg-slate-900/60 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
                        {q.query_type?.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        User ID: {q.telegram_user_id}
                      </span>
                    </div>
                    <Badge className={`${riskColors[q.risk_level] || "bg-slate-500/20 text-slate-400"} text-xs`}>
                      {q.risk_level || "N/A"}
                    </Badge>
                  </div>
                  <p className="text-sm text-white mb-1">
                    <b>Input:</b> {q.query_input}
                  </p>
                  {q.fraud_type && (
                    <p className="text-xs text-orange-400">
                      <b>Tipo:</b> {q.fraud_type}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(q.created_at).toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── Logs Tab ────────────────────────────────────────────────────────
function LogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    setLoading(true);
    const { data } = await supabase
      .from("telbot_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setLogs(data || []);
    setLoading(false);
  }

  const typeColors: Record<string, string> = {
    info: "text-blue-400",
    warning: "text-yellow-400",
    error: "text-red-400",
    command: "text-green-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Logs do Bot</h3>
        <Button variant="outline" size="sm" onClick={loadLogs} className="border-slate-700">
          <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 font-mono text-xs">
            {logs.map((l) => (
              <div key={l.id} className="flex items-start gap-2 bg-slate-900/80 rounded p-2 hover:bg-slate-800/60">
                <span className="text-slate-600 whitespace-nowrap">
                  {new Date(l.created_at).toLocaleTimeString("pt-BR")}
                </span>
                <span className={`uppercase font-bold ${typeColors[l.log_type] || "text-slate-400"} min-w-[60px]`}>
                  [{l.log_type}]
                </span>
                <span className="text-slate-300 flex-1">{l.message}</span>
                {l.telegram_user_id && (
                  <span className="text-slate-600">uid:{l.telegram_user_id}</span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────
function SettingsTab() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingUp, setSettingUp] = useState(false);

  async function loadBotInfo() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "info" },
      });
      if (error) throw error;
      setBotInfo(data);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar info do bot");
    }
    setLoading(false);
  }

  async function setupWebhook() {
    setSettingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "set" },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success("Webhook registrado com sucesso!");
        loadBotInfo();
      } else {
        toast.error("Erro ao registrar webhook");
      }
    } catch (e) {
      console.error(e);
      toast.error("Falha ao configurar webhook");
    }
    setSettingUp(false);
  }

  async function removeWebhook() {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot-setup", {
        body: { action: "delete" },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success("Webhook removido");
        loadBotInfo();
      }
    } catch (e) {
      toast.error("Erro ao remover webhook");
    }
  }

  useEffect(() => { loadBotInfo(); }, []);

  const webhookActive = botInfo?.webhook?.url && botInfo.webhook.url.length > 0;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/60 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            Status do Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
          ) : botInfo ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Bot Name</p>
                  <p className="text-white font-medium">{botInfo.bot?.first_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Username</p>
                  <p className="text-cyan-400">@{botInfo.bot?.username || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Webhook Status</p>
                  <div className="flex items-center gap-1">
                    {webhookActive ? (
                      <><Wifi className="w-4 h-4 text-green-400" /><span className="text-green-400 text-sm">Ativo</span></>
                    ) : (
                      <><WifiOff className="w-4 h-4 text-red-400" /><span className="text-red-400 text-sm">Inativo</span></>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Pending Updates</p>
                  <p className="text-white">{botInfo.webhook?.pending_update_count || 0}</p>
                </div>
              </div>

              {botInfo.webhook?.last_error_message && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">Último Erro</span>
                  </div>
                  <p className="text-xs text-red-300">{botInfo.webhook.last_error_message}</p>
                </div>
              )}

              {webhookActive && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Webhook URL</p>
                  <p className="text-xs text-slate-300 break-all">{botInfo.webhook.url}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-center py-4">Clique em "Carregar Info" para verificar o status</p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={setupWebhook} disabled={settingUp} className="bg-cyan-600 hover:bg-cyan-700">
              {settingUp ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Wifi className="w-4 h-4 mr-1" />}
              {webhookActive ? "Reconectar Webhook" : "Ativar Webhook"}
            </Button>
            {webhookActive && (
              <Button variant="outline" onClick={removeWebhook} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                <WifiOff className="w-4 h-4 mr-1" /> Desativar
              </Button>
            )}
            <Button variant="outline" onClick={loadBotInfo} className="border-slate-700">
              <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────
export default function TelBotPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">TelBot Anti-Fraude</h1>
              <p className="text-xs text-slate-400">Painel de Controle</p>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Bot className="w-3 h-3 mr-1" /> Bot Telegram
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-slate-900/60 border border-slate-700/50 p-1 w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 gap-1.5">
              <BarChart3 className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 gap-1.5">
              <Users className="w-4 h-4" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="queries" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 gap-1.5">
              <Search className="w-4 h-4" /> Consultas
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 gap-1.5">
              <MessageSquare className="w-4 h-4" /> Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 gap-1.5">
              <Settings className="w-4 h-4" /> Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="queries"><QueriesTab /></TabsContent>
          <TabsContent value="logs"><LogsTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
