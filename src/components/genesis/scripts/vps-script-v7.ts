// VPS Script v7.0 - ENTERPRISE EDITION
// Multi-instância, Rate Limiting, Webhook Status, Auto-restart, Health Endpoint
export const getVPSScriptV7 = (
  masterToken: string, 
  instanceId: string,
  instanceName?: string
): string => {
  const token = masterToken || 'GNS_' + Math.random().toString(36).substring(2, 34);
  const name = instanceName || 'genesis-' + instanceId.slice(0, 8);
  
  if (!instanceId || instanceId === 'default') {
    throw new Error('INSTANCE_ID obrigatório');
  }
  
  return `#!/usr/bin/env node
// ╔════════════════════════════════════════════════════════════════════════════════════════╗
// ║         GENESIS WHATSAPP BACKEND - v7.0 ENTERPRISE                                      ║
// ║                Multi-Instance | Rate Limiting | Webhook Status                          ║
// ║                   24/7 VPS Ready | PM2 Optimized | Zero Downtime                        ║
// ╚════════════════════════════════════════════════════════════════════════════════════════╝

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const os = require('os');
const crypto = require('crypto');

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                              CONFIGURAÇÃO                                                ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001'),
  MASTER_TOKEN: process.env.MASTER_TOKEN || '${token}',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://xeloigymjjeejvicadar.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbG9pZ3ltamplZWp2aWNhZGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzQ4OTYsImV4cCI6MjA4MzMxMDg5Nn0.OtCuFQNaYs5QLu3sq1ZRnHlEA1fH2VLje0h959jaAek',
  INSTANCE_ID: process.env.INSTANCE_ID || '${instanceId}',
  INSTANCE_NAME: process.env.INSTANCE_NAME || '${name}',
  HEARTBEAT_INTERVAL: 20000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'operational', // minimal | operational | debug
  RATE_LIMIT_WINDOW: 60000, // 1 minuto
  RATE_LIMIT_MAX: 100, // 100 requests/min
};

if (!CONFIG.INSTANCE_ID || CONFIG.INSTANCE_ID === 'default') {
  console.error('\\x1b[31m[FATAL] INSTANCE_ID obrigatório. Gere o script pelo painel ou defina no ambiente.\\x1b[0m');
  process.exit(1);
}

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                            INICIALIZAÇÃO                                                 ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['*'] }));
app.use(express.json({ limit: '50mb' }));

const pinoLogger = pino({ level: 'silent' });

// Estado Global - Thread-safe
const STATE = {
  sock: null,
  qrCode: null,
  connectionStatus: 'disconnected',
  phoneNumber: null,
  startTime: Date.now(),
  serverIP: 'localhost',
  heartbeatCount: 0,
  lastHeartbeatSuccess: null,
  reconnectAttempts: 0,
  isConnecting: false,
  isShuttingDown: false,
  messagesSent: 0,
  messagesReceived: 0,
  lastActivity: Date.now(),
  readyToSend: false, // Flag para indicar que o socket está estável
};

// Rate Limiter
const rateLimiter = {
  requests: new Map(),
  check(ip) {
    const now = Date.now();
    const windowStart = now - CONFIG.RATE_LIMIT_WINDOW;
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }
    
    const reqs = this.requests.get(ip).filter(t => t > windowStart);
    this.requests.set(ip, reqs);
    
    if (reqs.length >= CONFIG.RATE_LIMIT_MAX) {
      return false;
    }
    
    reqs.push(now);
    return true;
  },
  cleanup() {
    const now = Date.now();
    const windowStart = now - CONFIG.RATE_LIMIT_WINDOW;
    for (const [ip, reqs] of this.requests) {
      const filtered = reqs.filter(t => t > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, filtered);
      }
    }
  }
};

// Cleanup rate limiter a cada minuto
setInterval(() => rateLimiter.cleanup(), 60000);

// Constantes
const BACKOFF_DELAYS = [3000, 5000, 10000, 30000, 60000, 120000];
const AUTH_FOLDER = path.join(__dirname, 'auth_' + CONFIG.INSTANCE_ID);
const STATE_FILE = path.join(__dirname, '.state_' + CONFIG.INSTANCE_ID + '.json');

// Cores do terminal
const c = {
  reset: '\\x1b[0m', bold: '\\x1b[1m', green: '\\x1b[32m', cyan: '\\x1b[36m',
  yellow: '\\x1b[33m', red: '\\x1b[31m', magenta: '\\x1b[35m', blue: '\\x1b[34m',
  white: '\\x1b[37m', gray: '\\x1b[90m', bgGreen: '\\x1b[42m', bgRed: '\\x1b[41m',
  bgBlue: '\\x1b[44m'
};

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                            LOGGING CUSTOMIZADO                                           ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const shouldLog = (level) => {
  const levels = { minimal: 0, operational: 1, debug: 2 };
  const current = levels[CONFIG.LOG_LEVEL] || 1;
  return levels[level] <= current;
};

const log = {
  info: (msg) => shouldLog('operational') && console.log(c.cyan + '[INFO]' + c.reset + ' ' + msg),
  success: (msg) => shouldLog('operational') && console.log(c.green + '[OK]' + c.reset + ' ' + msg),
  warn: (msg) => shouldLog('minimal') && console.log(c.yellow + '[WARN]' + c.reset + ' ' + msg),
  error: (msg) => console.log(c.red + '[ERROR]' + c.reset + ' ' + msg), // Sempre loga erros
  heartbeat: (msg) => shouldLog('debug') && console.log(c.blue + '[♥]' + c.reset + ' ' + msg),
  wa: (msg) => shouldLog('operational') && console.log(c.magenta + '[WA]' + c.reset + ' ' + msg),
  send: (msg) => shouldLog('operational') && console.log(c.green + '[📤]' + c.reset + ' ' + msg),
  receive: (msg) => shouldLog('debug') && console.log(c.cyan + '[📥]' + c.reset + ' ' + msg),
  debug: (msg) => shouldLog('debug') && console.log(c.gray + '[DEBUG]' + c.reset + ' ' + msg),
};

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                            PERSISTÊNCIA DE ESTADO                                        ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const saveState = () => {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      connectionStatus: STATE.connectionStatus,
      phoneNumber: STATE.phoneNumber,
      lastHeartbeatSuccess: STATE.lastHeartbeatSuccess,
      heartbeatCount: STATE.heartbeatCount,
      messagesSent: STATE.messagesSent,
      messagesReceived: STATE.messagesReceived,
      readyToSend: STATE.readyToSend,
      savedAt: new Date().toISOString()
    }, null, 2));
  } catch (e) {}
};

const loadState = () => {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {}
  return null;
};

// IP público
const getPublicIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { timeout: 5000 });
    return (await response.json()).ip;
  } catch {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) return iface.address;
      }
    }
    return 'localhost';
  }
};

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                 BANNER                                                   ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const showBanner = async () => {
  STATE.serverIP = await getPublicIP();
  console.clear();
  console.log('');
  console.log(c.cyan + '  ╔═══════════════════════════════════════════════════════════════════════════════╗' + c.reset);
  console.log(c.cyan + '  ║' + c.green + c.bold + '         GENESIS WHATSAPP BACKEND v7.0 - ENTERPRISE                           ' + c.reset + c.cyan + '║' + c.reset);
  console.log(c.cyan + '  ╠═══════════════════════════════════════════════════════════════════════════════╣' + c.reset);
  console.log(c.cyan + '  ║' + c.reset + '  🌐 URL: ' + c.yellow + c.bold + 'http://' + STATE.serverIP + ':' + CONFIG.PORT + c.reset + '                                          ');
  console.log(c.cyan + '  ║' + c.reset + '  🔐 Token: ' + c.yellow + c.bold + CONFIG.MASTER_TOKEN.substring(0, 24) + '...' + c.reset + '                               ');
  console.log(c.cyan + '  ║' + c.reset + '  🏷️  Instância: ' + c.magenta + c.bold + CONFIG.INSTANCE_NAME + c.reset + ' (' + CONFIG.INSTANCE_ID.substring(0, 8) + '...)        ');
  console.log(c.cyan + '  ║' + c.reset + '  📊 RAM: ' + Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB | CPUs: ' + os.cpus().length + ' | Log: ' + CONFIG.LOG_LEVEL + '                           ');
  console.log(c.cyan + '  ╠═══════════════════════════════════════════════════════════════════════════════╣' + c.reset);
  console.log(c.cyan + '  ║' + c.reset + '  ✅ Rate Limiting: ' + CONFIG.RATE_LIMIT_MAX + ' req/min                                          ');
  console.log(c.cyan + '  ║' + c.reset + '  ✅ Heartbeat: ' + (CONFIG.HEARTBEAT_INTERVAL/1000) + 's | Auto-restart: ✓ | Webhook: ✓                   ');
  console.log(c.cyan + '  ╚═══════════════════════════════════════════════════════════════════════════════╝' + c.reset);
  console.log('');
};

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                            AUTH MIDDLEWARE                                               ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-instance-token'];
  if (!token || token !== CONFIG.MASTER_TOKEN) {
    log.warn('Auth failed from ' + (req.ip || 'unknown'));
    return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN' });
  }
  next();
};

const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (!rateLimiter.check(ip)) {
    log.warn('Rate limit exceeded for ' + ip);
    return res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' });
  }
  next();
};

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                    WEBHOOK DE STATUS (NOTIFICA SUPABASE)                                 ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const sendStatusWebhook = async (eventType, data = {}) => {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY || STATE.isShuttingDown) return;
  
  try {
    const payload = {
      instanceId: CONFIG.INSTANCE_ID,
      status: STATE.connectionStatus,
      phone_number: STATE.phoneNumber,
      event: eventType,
      ready_to_send: STATE.readyToSend,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    await fetch(CONFIG.SUPABASE_URL + '/functions/v1/genesis-heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-instance-token': CONFIG.MASTER_TOKEN,
        'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY
      },
      body: JSON.stringify(payload),
    });
    
    log.debug('Webhook enviado: ' + eventType);
  } catch (err) {
    log.debug('Webhook falhou: ' + err.message);
  }
};

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                    HEARTBEAT ULTRA-ROBUSTO                                               ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const sendHeartbeat = async () => {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY || STATE.isShuttingDown) return;
  
  STATE.heartbeatCount++;
  const uptimeSeconds = Math.floor((Date.now() - STATE.startTime) / 1000);
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(CONFIG.SUPABASE_URL + '/functions/v1/genesis-heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-instance-token': CONFIG.MASTER_TOKEN,
        'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY
      },
      body: JSON.stringify({
        instanceId: CONFIG.INSTANCE_ID,
        status: STATE.connectionStatus,
        phone_number: STATE.phoneNumber,
        uptime_seconds: uptimeSeconds,
        heartbeat_count: STATE.heartbeatCount,
        version: '7.0',
        ready_to_send: STATE.readyToSend,
        metrics: {
          sent: STATE.messagesSent,
          received: STATE.messagesReceived,
          memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      STATE.lastHeartbeatSuccess = new Date().toISOString();
      log.heartbeat('Status: ' + c.bold + STATE.connectionStatus + c.reset + ' | Uptime: ' + uptimeSeconds + 's | #' + STATE.heartbeatCount);
      saveState();
    }
  } catch (err) {
    log.debug('Heartbeat: ' + (err.name === 'AbortError' ? 'timeout' : err.message));
  }
};

// Heartbeat inicial após 2s, depois a cada HEARTBEAT_INTERVAL
setTimeout(sendHeartbeat, 2000);
setInterval(sendHeartbeat, CONFIG.HEARTBEAT_INTERVAL);

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                     CONEXÃO WHATSAPP - ULTRA ESTÁVEL                                     ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const connectWhatsApp = async () => {
  if (STATE.isConnecting || STATE.isShuttingDown) return;
  STATE.isConnecting = true;
  STATE.readyToSend = false;
  
  try {
    log.wa('Iniciando conexão...');
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    
    STATE.sock = makeWASocket({
      auth: state,
      logger: pinoLogger,
      browser: ['Genesis VPS v7', 'Chrome', '121.0.0'],
      syncFullHistory: false,
      generateHighQualityLinkPreview: false, // Reduz uso de CPU
      markOnlineOnConnect: true,
      keepAliveIntervalMs: 25000,
      retryRequestDelayMs: 2000,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      emitOwnEvents: false, // Não loga eventos próprios
    });
    
    STATE.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        STATE.qrCode = qr;
        STATE.connectionStatus = 'qr_pending';
        STATE.readyToSend = false;
        log.wa('QR Code gerado!');
        await sendStatusWebhook('qr_generated');
      }
      
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.output?.payload?.message || 'unknown';
        log.error('Desconectado - Código: ' + statusCode + ' - ' + reason);
        
        STATE.connectionStatus = 'disconnected';
        STATE.qrCode = null;
        STATE.sock = null;
        STATE.isConnecting = false;
        STATE.readyToSend = false;
        
        await sendStatusWebhook('disconnected', { statusCode, reason });
        
        if (statusCode === 401 || statusCode === DisconnectReason.loggedOut) {
          log.warn('Sessão inválida - limpando credenciais...');
          try { if (fs.existsSync(AUTH_FOLDER)) fs.rmSync(AUTH_FOLDER, { recursive: true, force: true }); } catch (e) {}
          STATE.reconnectAttempts = 0;
          setTimeout(connectWhatsApp, 3000);
        } else if (statusCode === 440 || statusCode === DisconnectReason.connectionReplaced) {
          log.error('Conexão substituída por outra sessão - não reconectando');
        } else if (!STATE.isShuttingDown) {
          const delay = BACKOFF_DELAYS[Math.min(STATE.reconnectAttempts, BACKOFF_DELAYS.length - 1)];
          STATE.reconnectAttempts++;
          log.info('Reconectando em ' + (delay/1000) + 's (tentativa ' + STATE.reconnectAttempts + ')...');
          setTimeout(connectWhatsApp, delay);
        }
      } else if (connection === 'open') {
        console.log('');
        console.log(c.bgGreen + c.bold + c.white + '  ✅ WHATSAPP CONECTADO!  ' + c.reset);
        console.log('');
        
        STATE.connectionStatus = 'connected';
        STATE.qrCode = null;
        STATE.phoneNumber = STATE.sock.user?.id?.split(':')[0] || null;
        STATE.reconnectAttempts = 0;
        STATE.isConnecting = false;
        STATE.lastActivity = Date.now();
        
        log.success('Número: ' + (STATE.phoneNumber || 'N/A'));
        
        // Aguarda socket estabilizar antes de marcar como ready
        setTimeout(async () => {
          STATE.readyToSend = true;
          log.success('Socket estável - pronto para enviar mensagens!');
          saveState();
          await sendStatusWebhook('connected', { phone: STATE.phoneNumber });
          sendHeartbeat();
        }, 3000);
      }
    });
    
    STATE.sock.ev.on('creds.update', saveCreds);
    
    // Log de mensagens recebidas (sem dados sensíveis)
    STATE.sock.ev.on('messages.upsert', ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (msg.key.fromMe) continue;
        STATE.messagesReceived++;
        STATE.lastActivity = Date.now();
        const from = msg.key.remoteJid?.split('@')[0] || 'unknown';
        log.receive('De: ' + from.substring(0, 4) + '***' + from.substring(from.length - 4));
      }
    });
    
  } catch (err) {
    log.error('Erro ao conectar: ' + err.message);
    STATE.isConnecting = false;
    STATE.connectionStatus = 'error';
    STATE.readyToSend = false;
    const delay = BACKOFF_DELAYS[Math.min(STATE.reconnectAttempts, BACKOFF_DELAYS.length - 1)];
    STATE.reconnectAttempts++;
    setTimeout(connectWhatsApp, delay);
  }
};

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                              ROTAS API                                                   ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝

// Health Check (público, mas com info limitada)
app.get('/health', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-instance-token'];
  const uptime = Math.floor((Date.now() - STATE.startTime) / 1000);
  
  if (token && token === CONFIG.MASTER_TOKEN) {
    res.json({
      status: 'ok',
      whatsapp: STATE.connectionStatus,
      phone: STATE.phoneNumber,
      uptime,
      heartbeats: STATE.heartbeatCount,
      lastHeartbeat: STATE.lastHeartbeatSuccess,
      version: '7.0',
      enterprise: true,
      stable: true,
      ready_to_send: STATE.readyToSend,
      metrics: {
        sent: STATE.messagesSent,
        received: STATE.messagesReceived,
        memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      }
    });
  } else {
    res.json({ status: 'ok', version: '7.0', enterprise: true });
  }
});

// Status
app.get('/status', authMiddleware, (req, res) => {
  res.json({
    connected: STATE.connectionStatus === 'connected',
    status: STATE.connectionStatus,
    phone: STATE.phoneNumber,
    qr: !!STATE.qrCode,
    ready_to_send: STATE.readyToSend,
    uptime: Math.floor((Date.now() - STATE.startTime) / 1000)
  });
});

// QR Code
app.get('/qrcode', authMiddleware, (req, res) => {
  if (STATE.connectionStatus === 'connected') {
    return res.json({ connected: true, status: 'connected', phone: STATE.phoneNumber, ready_to_send: STATE.readyToSend });
  }
  if (!STATE.qrCode && STATE.connectionStatus === 'disconnected' && !STATE.isConnecting) {
    connectWhatsApp();
    return res.json({ connected: false, qr: null, message: 'Iniciando...' });
  }
  res.json({ connected: false, qr: STATE.qrCode || null, qrcode: STATE.qrCode || null });
});

// Connect
app.post('/connect', authMiddleware, (req, res) => {
  if (STATE.connectionStatus === 'connected') {
    return res.json({ success: true, message: 'Já conectado', phone: STATE.phoneNumber, ready_to_send: STATE.readyToSend });
  }
  if (!STATE.isConnecting) connectWhatsApp();
  res.json({ success: true, message: 'Iniciando conexão...' });
});

// Disconnect
app.post('/disconnect', authMiddleware, async (req, res) => {
  try {
    if (STATE.sock) { await STATE.sock.logout(); STATE.sock = null; }
    if (fs.existsSync(AUTH_FOLDER)) fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    STATE.connectionStatus = 'disconnected';
    STATE.qrCode = null;
    STATE.phoneNumber = null;
    STATE.readyToSend = false;
    await sendStatusWebhook('manual_disconnect');
    res.json({ success: true, message: 'Desconectado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                           ROTAS /api/instance/:id                                        ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
app.get('/api/instance/:id/qrcode', authMiddleware, (req, res) => {
  if (STATE.connectionStatus === 'connected') {
    return res.json({ connected: true, status: 'connected', phone: STATE.phoneNumber, ready_to_send: STATE.readyToSend });
  }
  if (!STATE.qrCode && STATE.connectionStatus === 'disconnected' && !STATE.isConnecting) {
    connectWhatsApp();
    return res.json({ connected: false, qr: null, message: 'Iniciando...' });
  }
  res.json({ connected: false, qr: STATE.qrCode || null, qrcode: STATE.qrCode || null });
});

app.post('/api/instance/:id/qrcode', authMiddleware, (req, res) => {
  if (STATE.connectionStatus === 'connected') {
    return res.json({ connected: true, status: 'connected', phone: STATE.phoneNumber, ready_to_send: STATE.readyToSend });
  }
  if (!STATE.qrCode && STATE.connectionStatus === 'disconnected' && !STATE.isConnecting) {
    connectWhatsApp();
    return res.json({ connected: false, qr: null, message: 'Iniciando...' });
  }
  res.json({ connected: false, qr: STATE.qrCode || null, qrcode: STATE.qrCode || null });
});

app.get('/api/instance/:id/status', authMiddleware, (req, res) => {
  res.json({
    connected: STATE.connectionStatus === 'connected',
    status: STATE.connectionStatus,
    state: STATE.connectionStatus === 'connected' ? 'open' : 'close',
    phone: STATE.phoneNumber,
    phoneNumber: STATE.phoneNumber,
    jid: STATE.phoneNumber ? STATE.phoneNumber + '@s.whatsapp.net' : null,
    ready_to_send: STATE.readyToSend,
    uptime: Math.floor((Date.now() - STATE.startTime) / 1000)
  });
});

app.post('/api/instance/:id/connect', authMiddleware, (req, res) => {
  if (STATE.connectionStatus === 'connected') {
    return res.json({ success: true, message: 'Já conectado', phone: STATE.phoneNumber, ready_to_send: STATE.readyToSend });
  }
  if (!STATE.isConnecting) connectWhatsApp();
  res.json({ success: true, message: 'Iniciando conexão...' });
});

app.post('/api/instance/:id/disconnect', authMiddleware, async (req, res) => {
  try {
    if (STATE.sock) await STATE.sock.logout();
    if (fs.existsSync(AUTH_FOLDER)) fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    STATE.connectionStatus = 'disconnected';
    STATE.qrCode = null;
    STATE.phoneNumber = null;
    STATE.sock = null;
    STATE.readyToSend = false;
    await sendStatusWebhook('manual_disconnect');
    res.json({ success: true, message: 'Desconectado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                           ENVIO DE MENSAGENS                                             ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const sendMessageHandler = async (req, res) => {
  const { phone, message } = req.body;
  
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone e message obrigatórios', code: 'MISSING_PARAMS' });
  }
  
  if (STATE.connectionStatus !== 'connected' || !STATE.sock) {
    return res.status(503).json({ error: 'WhatsApp não conectado', code: 'NOT_CONNECTED', status: STATE.connectionStatus });
  }
  
  if (!STATE.readyToSend) {
    return res.status(503).json({ error: 'Socket estabilizando, aguarde', code: 'NOT_READY', status: 'stabilizing' });
  }
  
  try {
    const jid = phone.includes('@') ? phone : phone.replace(/\\D/g, '') + '@s.whatsapp.net';
    await STATE.sock.sendMessage(jid, { text: message });
    STATE.messagesSent++;
    STATE.lastActivity = Date.now();
    log.send('Enviado para ' + phone.substring(0, 4) + '***');
    res.json({ success: true, to: phone, timestamp: new Date().toISOString() });
  } catch (err) {
    log.error('Falha ao enviar: ' + err.message);
    res.status(500).json({ error: err.message, code: 'SEND_FAILED' });
  }
};

app.post('/api/instance/:id/send', authMiddleware, rateLimitMiddleware, sendMessageHandler);
app.post('/send', authMiddleware, rateLimitMiddleware, sendMessageHandler);

// Envio de botões
app.post('/api/instance/:id/send-buttons', authMiddleware, rateLimitMiddleware, async (req, res) => {
  const { phone, text, buttons, footer } = req.body;
  if (!phone || !text || !buttons) return res.status(400).json({ error: 'Campos obrigatórios' });
  if (STATE.connectionStatus !== 'connected' || !STATE.sock) return res.status(503).json({ error: 'WhatsApp não conectado' });
  if (!STATE.readyToSend) return res.status(503).json({ error: 'Socket estabilizando', code: 'NOT_READY' });
  
  try {
    const jid = phone.includes('@') ? phone : phone.replace(/\\D/g, '') + '@s.whatsapp.net';
    await STATE.sock.sendMessage(jid, {
      text,
      footer: footer || '',
      buttons: buttons.map((b, i) => ({ buttonId: b.id || 'btn_' + i, buttonText: { displayText: b.text }, type: 1 })),
      headerType: 1
    });
    STATE.messagesSent++;
    log.send('Botões enviados para ' + phone.substring(0, 4) + '***');
    res.json({ success: true, to: phone });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Envio de lista
app.post('/api/instance/:id/send-list', authMiddleware, rateLimitMiddleware, async (req, res) => {
  const { phone, text, buttonText, sections, footer, title } = req.body;
  if (!phone || !text || !buttonText || !sections) return res.status(400).json({ error: 'Campos obrigatórios' });
  if (STATE.connectionStatus !== 'connected' || !STATE.sock) return res.status(503).json({ error: 'WhatsApp não conectado' });
  if (!STATE.readyToSend) return res.status(503).json({ error: 'Socket estabilizando', code: 'NOT_READY' });
  
  try {
    const jid = phone.includes('@') ? phone : phone.replace(/\\D/g, '') + '@s.whatsapp.net';
    await STATE.sock.sendMessage(jid, { text, footer: footer || '', title: title || '', buttonText, sections });
    STATE.messagesSent++;
    log.send('Lista enviada para ' + phone.substring(0, 4) + '***');
    res.json({ success: true, to: phone });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Envio de mídia
app.post('/send-media', authMiddleware, rateLimitMiddleware, async (req, res) => {
  const { phone, mediaUrl, caption, type } = req.body;
  if (!phone || !mediaUrl) return res.status(400).json({ error: 'phone e mediaUrl obrigatórios' });
  if (STATE.connectionStatus !== 'connected' || !STATE.sock) return res.status(503).json({ error: 'WhatsApp não conectado' });
  if (!STATE.readyToSend) return res.status(503).json({ error: 'Socket estabilizando', code: 'NOT_READY' });
  
  try {
    const jid = phone.includes('@') ? phone : phone.replace(/\\D/g, '') + '@s.whatsapp.net';
    let msg = {}; const mt = type || 'image';
    if (mt === 'image') msg = { image: { url: mediaUrl }, caption: caption || '' };
    else if (mt === 'video') msg = { video: { url: mediaUrl }, caption: caption || '' };
    else if (mt === 'audio') msg = { audio: { url: mediaUrl }, mimetype: 'audio/mp4' };
    else if (mt === 'document') msg = { document: { url: mediaUrl }, fileName: caption || 'file' };
    await STATE.sock.sendMessage(jid, msg);
    STATE.messagesSent++;
    log.send('Mídia enviada para ' + phone.substring(0, 4) + '***');
    res.json({ success: true, to: phone });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                           GRACEFUL SHUTDOWN                                              ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const shutdown = async (signal) => {
  log.warn('Recebido ' + signal + ' - Desligando gracefully...');
  STATE.isShuttingDown = true;
  STATE.connectionStatus = 'disconnected';
  STATE.readyToSend = false;
  
  await sendStatusWebhook('shutdown', { signal });
  await sendHeartbeat();
  saveState();
  
  if (STATE.sock) {
    try { await STATE.sock.end(); } catch (e) {}
  }
  
  log.success('Encerrado com sucesso.');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => { 
  log.error('Exceção não tratada: ' + err.message); 
  // Não encerra - permite continuar rodando
});
process.on('unhandledRejection', (reason) => { 
  log.error('Promise rejeitada: ' + reason); 
  // Não encerra - permite continuar rodando
});

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                 INICIAR                                                  ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
app.listen(CONFIG.PORT, '0.0.0.0', async () => {
  await showBanner();
  
  const prevState = loadState();
  if (prevState?.phoneNumber) {
    log.info('Restaurando sessão anterior...');
  }
  
  log.info('Servidor pronto em http://0.0.0.0:' + CONFIG.PORT);
  log.info('Use PM2 para manter rodando: pm2 start whatsapp-vps.js --name genesis-whatsapp');
  console.log('');
  
  connectWhatsApp();
});
`;
};
