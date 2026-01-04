// VPS Script v8.0 - MULTI-INSTANCE MANAGER
// Gerenciador dinâmico de múltiplas instâncias com menu interativo
export const getVPSScriptV8 = (
  masterToken: string
): string => {
  const token = masterToken || 'GNS_' + Math.random().toString(36).substring(2, 34);
  
  return `#!/usr/bin/env node
// ╔════════════════════════════════════════════════════════════════════════════════════════╗
// ║       GENESIS WHATSAPP MULTI-INSTANCE MANAGER - v8.0 ENTERPRISE                        ║
// ║              Dynamic Multi-Instance | Interactive Menu | PM2 Ready                     ║
// ║                   24/7 VPS Ready | Auto-Scaling | Zero Downtime                        ║
// ╚════════════════════════════════════════════════════════════════════════════════════════╝

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const os = require('os');
const crypto = require('crypto');
const readline = require('readline');

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                              CONFIGURAÇÃO GLOBAL                                         ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001'),
  MASTER_TOKEN: process.env.MASTER_TOKEN || '${token}',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://wvnszzrvrrueuycrpgyc.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bnN6enJ2cnJ1ZXV5Y3JwZ3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MTE4MjYsImV4cCI6MjA4MjM4NzgyNn0.mHs-vau3qsSRLqZ9AmWMsFB5ZLMmd1s003MxdLhBPw0',
  HEARTBEAT_INTERVAL: 20000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'operational',
  RATE_LIMIT_WINDOW: 60000,
  RATE_LIMIT_MAX: 100,
  DATA_DIR: process.env.DATA_DIR || path.join(__dirname, 'genesis_data'),
};

// Criar diretório de dados
if (!fs.existsSync(CONFIG.DATA_DIR)) {
  fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
}

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                         GERENCIADOR DE INSTÂNCIAS                                        ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
class InstanceManager {
  constructor() {
    this.instances = new Map(); // instanceId -> { sock, status, phoneNumber, qrCode, ... }
    this.heartbeatIntervals = new Map();
    this.configPath = path.join(CONFIG.DATA_DIR, 'instances.json');
    this.loadInstances();
  }

  loadInstances() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        Object.entries(data).forEach(([id, config]) => {
          this.instances.set(id, {
            ...config,
            sock: null,
            status: 'disconnected',
            qrCode: null,
            readyToSend: false,
          });
        });
        log('info', \`Carregadas \${this.instances.size} instâncias do disco\`);
      }
    } catch (err) {
      log('error', 'Erro ao carregar instâncias: ' + err.message);
    }
  }

  saveInstances() {
    try {
      const data = {};
      this.instances.forEach((inst, id) => {
        data[id] = {
          name: inst.name,
          phoneNumber: inst.phoneNumber,
          createdAt: inst.createdAt,
        };
      });
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    } catch (err) {
      log('error', 'Erro ao salvar instâncias: ' + err.message);
    }
  }

  async createInstance(instanceId, name) {
    if (this.instances.has(instanceId)) {
      return { success: false, error: 'Instância já existe' };
    }

    this.instances.set(instanceId, {
      name: name || \`instance-\${instanceId.slice(0, 8)}\`,
      sock: null,
      status: 'disconnected',
      phoneNumber: null,
      qrCode: null,
      readyToSend: false,
      createdAt: new Date().toISOString(),
    });

    this.saveInstances();
    log('success', \`Instância criada: \${name || instanceId}\`);
    return { success: true };
  }

  async connectInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return { success: false, error: 'Instância não encontrada' };
    }

    if (instance.status === 'connected') {
      return { success: true, message: 'Já conectado' };
    }

    try {
      const authDir = path.join(CONFIG.DATA_DIR, 'auth_' + instanceId);
      const { state, saveCreds } = await useMultiFileAuthState(authDir);

      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Genesis v8', 'Chrome', '120.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
        retryRequestDelayMs: 500,
        markOnlineOnConnect: true,
      });

      instance.sock = sock;
      instance.status = 'connecting';

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          instance.qrCode = qr;
          instance.status = 'waiting_qr';
          log('info', \`[\\x1b[33m\${instance.name}\\x1b[0m] QR Code disponível\`);
          this.sendHeartbeat(instanceId, 'waiting_qr');
        }

        if (connection === 'close') {
          const code = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = code !== DisconnectReason.loggedOut;
          
          instance.status = 'disconnected';
          instance.readyToSend = false;
          instance.qrCode = null;
          
          log('warn', \`[\\x1b[33m\${instance.name}\\x1b[0m] Desconectado - Código: \${code}\`);
          this.sendHeartbeat(instanceId, 'disconnected');

          if (shouldReconnect) {
            log('info', \`[\\x1b[33m\${instance.name}\\x1b[0m] Reconectando em 5s...\`);
            setTimeout(() => this.connectInstance(instanceId), 5000);
          }
        }

        if (connection === 'open') {
          instance.status = 'connected';
          instance.qrCode = null;
          
          const me = sock.user;
          if (me?.id) {
            instance.phoneNumber = me.id.split(':')[0].replace('@s.whatsapp.net', '');
          }

          log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] Conectado! Número: \${instance.phoneNumber}\`);
          
          // Espera 3 segundos para estabilizar antes de marcar como ready
          setTimeout(() => {
            instance.readyToSend = true;
            log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] Pronto para enviar mensagens!\`);
            this.sendHeartbeat(instanceId, 'connected');
          }, 3000);

          this.startHeartbeat(instanceId);
          this.saveInstances();
        }
      });

      sock.ev.on('messages.upsert', async ({ messages }) => {
        if (messages[0]?.key?.fromMe === false) {
          log('msg', \`[\\x1b[35m\${instance.name}\\x1b[0m] Mensagem recebida de \${messages[0].key.remoteJid}\`);
        }
      });

      return { success: true };
    } catch (err) {
      log('error', \`[\\x1b[31m\${instance.name}\\x1b[0m] Erro ao conectar: \${err.message}\`);
      return { success: false, error: err.message };
    }
  }

  async disconnectInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return { success: false, error: 'Instância não encontrada' };

    if (instance.sock) {
      try {
        await instance.sock.logout();
      } catch (e) {}
      instance.sock = null;
    }

    instance.status = 'disconnected';
    instance.readyToSend = false;
    instance.qrCode = null;

    this.stopHeartbeat(instanceId);
    this.sendHeartbeat(instanceId, 'disconnected');
    log('info', \`[\\x1b[33m\${instance.name}\\x1b[0m] Desconectado manualmente\`);

    return { success: true };
  }

  deleteInstance(instanceId) {
    this.disconnectInstance(instanceId);
    this.instances.delete(instanceId);
    
    const authDir = path.join(CONFIG.DATA_DIR, 'auth_' + instanceId);
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
    }

    this.saveInstances();
    log('info', \`Instância removida: \${instanceId}\`);
    return { success: true };
  }

  async sendMessage(instanceId, to, message) {
    const instance = this.instances.get(instanceId);
    if (!instance) return { success: false, error: 'Instância não encontrada' };
    if (!instance.sock || !instance.readyToSend) {
      return { success: false, error: 'Instância não está pronta para enviar' };
    }

    try {
      const jid = to.includes('@') ? to : to + '@s.whatsapp.net';
      await instance.sock.sendMessage(jid, { text: message });
      log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] Mensagem enviada para \${to}\`);
      return { success: true };
    } catch (err) {
      log('error', \`[\\x1b[31m\${instance.name}\\x1b[0m] Erro ao enviar: \${err.message}\`);
      return { success: false, error: err.message };
    }
  }

  getStatus(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return null;

    return {
      id: instanceId,
      name: instance.name,
      status: instance.status,
      phoneNumber: instance.phoneNumber,
      readyToSend: instance.readyToSend,
      qrCode: instance.qrCode,
    };
  }

  getAllInstances() {
    const result = [];
    this.instances.forEach((inst, id) => {
      result.push({
        id,
        name: inst.name,
        status: inst.status,
        phoneNumber: inst.phoneNumber,
        readyToSend: inst.readyToSend,
      });
    });
    return result;
  }

  startHeartbeat(instanceId) {
    this.stopHeartbeat(instanceId);
    
    const interval = setInterval(() => {
      const instance = this.instances.get(instanceId);
      if (instance && instance.status === 'connected') {
        this.sendHeartbeat(instanceId, 'connected');
      }
    }, CONFIG.HEARTBEAT_INTERVAL);

    this.heartbeatIntervals.set(instanceId, interval);
  }

  stopHeartbeat(instanceId) {
    const interval = this.heartbeatIntervals.get(instanceId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(instanceId);
    }
  }

  async sendHeartbeat(instanceId, status) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    try {
      const response = await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/genesis-heartbeat\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
          'x-instance-token': CONFIG.MASTER_TOKEN,
        },
        body: JSON.stringify({
          instanceId,
          status,
          phoneNumber: instance.phoneNumber,
          metrics: {
            uptime: Math.floor((Date.now() - startTime) / 1000),
            readyToSend: instance.readyToSend,
            version: '8.0',
          },
        }),
      });

      if (!response.ok) {
        log('warn', \`[\\x1b[33m\${instance.name}\\x1b[0m] Heartbeat falhou: \${response.status}\`);
      }
    } catch (err) {
      // Silencioso para não poluir logs
    }
  }

  async autoConnectAll() {
    for (const [id, inst] of this.instances) {
      if (inst.status === 'disconnected') {
        const authDir = path.join(CONFIG.DATA_DIR, 'auth_' + id);
        if (fs.existsSync(authDir)) {
          log('info', \`Auto-conectando: \${inst.name}\`);
          await this.connectInstance(id);
          await new Promise(r => setTimeout(r, 2000)); // Delay entre conexões
        }
      }
    }
  }
}

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                              SISTEMA DE LOGS                                             ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const startTime = Date.now();
const c = {
  reset: '\\x1b[0m',
  bold: '\\x1b[1m',
  green: '\\x1b[32m',
  cyan: '\\x1b[36m',
  yellow: '\\x1b[33m',
  red: '\\x1b[31m',
  magenta: '\\x1b[35m',
  blue: '\\x1b[34m',
  white: '\\x1b[37m',
  bgGreen: '\\x1b[42m',
  bgBlue: '\\x1b[44m',
  bgRed: '\\x1b[41m',
};

function log(type, message) {
  if (CONFIG.LOG_LEVEL === 'minimal' && !['error', 'success'].includes(type)) return;
  
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  const icons = {
    info: \`\${c.cyan}ℹ\${c.reset}\`,
    success: \`\${c.green}✓\${c.reset}\`,
    error: \`\${c.red}✗\${c.reset}\`,
    warn: \`\${c.yellow}⚠\${c.reset}\`,
    msg: \`\${c.magenta}📨\${c.reset}\`,
  };
  const icon = icons[type] || icons.info;
  console.log(\`\${c.cyan}[\${timestamp}]\${c.reset} \${icon} \${message}\`);
}

// ╔═════════════════════════════════════════════════════════════════════════════════════════╗
// ║                              SERVIDOR HTTP                                               ║
// ╚═════════════════════════════════════════════════════════════════════════════════════════╝
const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['*'] }));
app.use(express.json({ limit: '50mb' }));

const manager = new InstanceManager();

// Rate Limiter
const rateLimiter = {
  requests: new Map(),
  check(ip) {
    const now = Date.now();
    const windowStart = now - CONFIG.RATE_LIMIT_WINDOW;
    if (!this.requests.has(ip)) this.requests.set(ip, []);
    const reqs = this.requests.get(ip).filter(t => t > windowStart);
    this.requests.set(ip, reqs);
    if (reqs.length >= CONFIG.RATE_LIMIT_MAX) return false;
    reqs.push(now);
    return true;
  },
};

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization?.replace('Bearer ', '') || 
               req.headers['x-master-token'] ||
               req.query.token;
  
  if (auth !== CONFIG.MASTER_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Rate limit middleware
const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!rateLimiter.check(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  next();
};

app.use(rateLimitMiddleware);

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ROTAS DA API
// ═══════════════════════════════════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    version: '8.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    instances: manager.getAllInstances().length,
    connectedInstances: manager.getAllInstances().filter(i => i.status === 'connected').length,
  });
});

// Listar todas as instâncias
app.get('/api/instances', authMiddleware, (req, res) => {
  res.json({ success: true, instances: manager.getAllInstances() });
});

// Criar nova instância
app.post('/api/instances', authMiddleware, async (req, res) => {
  const { instanceId, name } = req.body;
  if (!instanceId) {
    return res.status(400).json({ error: 'instanceId é obrigatório' });
  }
  const result = await manager.createInstance(instanceId, name);
  res.json(result);
});

// Status de uma instância
app.get('/api/instance/:id/status', authMiddleware, (req, res) => {
  const status = manager.getStatus(req.params.id);
  if (!status) {
    return res.status(404).json({ error: 'Instância não encontrada' });
  }
  res.json(status);
});

// Conectar instância
app.post('/api/instance/:id/connect', authMiddleware, async (req, res) => {
  const result = await manager.connectInstance(req.params.id);
  res.json(result);
});

// Desconectar instância
app.post('/api/instance/:id/disconnect', authMiddleware, async (req, res) => {
  const result = await manager.disconnectInstance(req.params.id);
  res.json(result);
});

// Deletar instância
app.delete('/api/instance/:id', authMiddleware, async (req, res) => {
  const result = manager.deleteInstance(req.params.id);
  res.json(result);
});

// Obter QR Code
app.get('/api/instance/:id/qrcode', authMiddleware, async (req, res) => {
  const status = manager.getStatus(req.params.id);
  if (!status) {
    return res.status(404).json({ error: 'Instância não encontrada' });
  }
  
  if (status.qrCode) {
    try {
      const QRCode = require('qrcode');
      const qrImage = await QRCode.toDataURL(status.qrCode);
      res.json({ success: true, qrcode: qrImage, status: status.status });
    } catch (err) {
      res.json({ success: true, qrcode: status.qrCode, status: status.status });
    }
  } else {
    res.json({ success: true, qrcode: null, status: status.status });
  }
});

// Enviar mensagem
app.post('/api/instance/:id/send', authMiddleware, async (req, res) => {
  const { to, message, text, number } = req.body;
  const recipient = to || number;
  const content = message || text;
  
  if (!recipient || !content) {
    return res.status(400).json({ error: 'to/number e message/text são obrigatórios' });
  }

  const result = await manager.sendMessage(req.params.id, recipient, content);
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// MENU INTERATIVO
// ═══════════════════════════════════════════════════════════════════════════════════════════
let menuMode = process.argv.includes('--menu') || process.argv.includes('-m');

function showBanner() {
  console.clear();
  console.log(\`
\${c.cyan}╔════════════════════════════════════════════════════════════════════════════════╗\${c.reset}
\${c.cyan}║\${c.reset}  \${c.green}\${c.bold}██████╗ ███████╗███╗   ██╗███████╗███████╗██╗███████╗\${c.reset}                      \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.green}\${c.bold}██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔════╝██║██╔════╝\${c.reset}                      \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.green}\${c.bold}██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████╗██║███████╗\${c.reset}                      \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.green}\${c.bold}██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ╚════██║██║╚════██║\${c.reset}                      \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.green}\${c.bold}╚██████╔╝███████╗██║ ╚████║███████╗███████║██║███████║\${c.reset}                      \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.green}\${c.bold}╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝\${c.reset}                      \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}                                                                                \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}       \${c.white}\${c.bold}WhatsApp Multi-Instance Manager v8.0 Enterprise\${c.reset}                       \${c.cyan}║\${c.reset}
\${c.cyan}╠════════════════════════════════════════════════════════════════════════════════╣\${c.reset}
\${c.cyan}║\${c.reset}  \${c.yellow}🌐 API:\${c.reset} http://0.0.0.0:\${CONFIG.PORT}                                            \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.yellow}🔐 Token:\${c.reset} \${CONFIG.MASTER_TOKEN.slice(0, 20)}...                                  \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.yellow}📦 Instâncias:\${c.reset} \${manager.getAllInstances().length} cadastradas                                        \${c.cyan}║\${c.reset}
\${c.cyan}╚════════════════════════════════════════════════════════════════════════════════╝\${c.reset}
\`);
}

function showMenu() {
  const instances = manager.getAllInstances();
  const connected = instances.filter(i => i.status === 'connected').length;

  console.log(\`
\${c.cyan}┌─────────────────────────────────────────────────────────────────────────────────┐\${c.reset}
\${c.cyan}│\${c.reset}  \${c.bold}MENU PRINCIPAL\${c.reset}                    Conectadas: \${c.green}\${connected}\${c.reset}/\${instances.length}                       \${c.cyan}│\${c.reset}
\${c.cyan}├─────────────────────────────────────────────────────────────────────────────────┤\${c.reset}
\${c.cyan}│\${c.reset}                                                                                 \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}[1]\${c.reset} 📋 Listar Instâncias           \${c.green}[5]\${c.reset} 🔌 Desconectar Instância         \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}[2]\${c.reset} ➕ Criar Nova Instância        \${c.green}[6]\${c.reset} 🗑️  Deletar Instância            \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}[3]\${c.reset} 🔗 Conectar Instância          \${c.green}[7]\${c.reset} 📨 Enviar Mensagem de Teste      \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}[4]\${c.reset} 📱 Ver QR Code                 \${c.green}[8]\${c.reset} 🔄 Auto-Conectar Todas           \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}                                                                                 \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.yellow}[9]\${c.reset} 📊 Status do Servidor         \${c.red}[0]\${c.reset} 🚪 Sair do Menu                  \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}                                                                                 \${c.cyan}│\${c.reset}
\${c.cyan}└─────────────────────────────────────────────────────────────────────────────────┘\${c.reset}
\`);
}

async function handleMenuInput(input) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise(r => rl.question(q, r));

  switch (input.trim()) {
    case '1':
      console.log('\\n' + c.cyan + '📋 INSTÂNCIAS CADASTRADAS:' + c.reset);
      const instances = manager.getAllInstances();
      if (instances.length === 0) {
        console.log(c.yellow + '   Nenhuma instância cadastrada.' + c.reset);
      } else {
        instances.forEach((inst, i) => {
          const statusColor = inst.status === 'connected' ? c.green : (inst.status === 'connecting' ? c.yellow : c.red);
          console.log(\`   \${i + 1}. \${c.bold}\${inst.name}\${c.reset} (\${inst.id.slice(0, 8)}...)\`);
          console.log(\`      Status: \${statusColor}\${inst.status}\${c.reset} | Tel: \${inst.phoneNumber || 'N/A'} | Ready: \${inst.readyToSend ? c.green + '✓' : c.red + '✗'}\${c.reset}\`);
        });
      }
      break;

    case '2':
      const newId = await question(c.yellow + '   ID da instância (UUID): ' + c.reset);
      const newName = await question(c.yellow + '   Nome da instância: ' + c.reset);
      if (newId) {
        const result = await manager.createInstance(newId, newName);
        console.log(result.success ? c.green + '   ✓ Instância criada!' + c.reset : c.red + '   ✗ ' + result.error + c.reset);
      }
      break;

    case '3':
      const connectId = await question(c.yellow + '   ID da instância para conectar: ' + c.reset);
      if (connectId) {
        console.log(c.cyan + '   Conectando...' + c.reset);
        const result = await manager.connectInstance(connectId);
        console.log(result.success ? c.green + '   ✓ Conexão iniciada! Aguarde o QR Code.' + c.reset : c.red + '   ✗ ' + result.error + c.reset);
      }
      break;

    case '4':
      const qrId = await question(c.yellow + '   ID da instância: ' + c.reset);
      const status = manager.getStatus(qrId);
      if (status?.qrCode) {
        console.log(c.green + '   QR Code disponível! Escaneie via API ou painel.' + c.reset);
        console.log(c.cyan + \`   GET /api/instance/\${qrId}/qrcode\` + c.reset);
      } else {
        console.log(c.yellow + '   QR Code não disponível. Status: ' + (status?.status || 'não encontrada') + c.reset);
      }
      break;

    case '5':
      const disconnectId = await question(c.yellow + '   ID da instância para desconectar: ' + c.reset);
      if (disconnectId) {
        const result = await manager.disconnectInstance(disconnectId);
        console.log(result.success ? c.green + '   ✓ Desconectado!' + c.reset : c.red + '   ✗ ' + result.error + c.reset);
      }
      break;

    case '6':
      const deleteId = await question(c.yellow + '   ID da instância para DELETAR: ' + c.reset);
      const confirm = await question(c.red + '   Confirmar exclusão? (sim/não): ' + c.reset);
      if (deleteId && confirm.toLowerCase() === 'sim') {
        const result = manager.deleteInstance(deleteId);
        console.log(result.success ? c.green + '   ✓ Deletado!' + c.reset : c.red + '   ✗ ' + result.error + c.reset);
      }
      break;

    case '7':
      const sendId = await question(c.yellow + '   ID da instância: ' + c.reset);
      const sendTo = await question(c.yellow + '   Número destino (com DDI): ' + c.reset);
      const sendMsg = await question(c.yellow + '   Mensagem: ' + c.reset);
      if (sendId && sendTo && sendMsg) {
        const result = await manager.sendMessage(sendId, sendTo, sendMsg);
        console.log(result.success ? c.green + '   ✓ Mensagem enviada!' + c.reset : c.red + '   ✗ ' + result.error + c.reset);
      }
      break;

    case '8':
      console.log(c.cyan + '   Auto-conectando todas as instâncias...' + c.reset);
      await manager.autoConnectAll();
      console.log(c.green + '   ✓ Processo concluído!' + c.reset);
      break;

    case '9':
      console.log('\\n' + c.cyan + '📊 STATUS DO SERVIDOR:' + c.reset);
      console.log(\`   Uptime: \${Math.floor((Date.now() - startTime) / 1000)}s\`);
      console.log(\`   RAM: \${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\`);
      console.log(\`   CPU: \${os.loadavg()[0].toFixed(2)}\`);
      console.log(\`   Instâncias: \${manager.getAllInstances().length}\`);
      break;

    case '0':
      menuMode = false;
      console.log(c.yellow + '\\n   Menu fechado. Servidor continua rodando.' + c.reset);
      console.log(c.cyan + '   Execute: node genesis-v8.js --menu para reabrir.' + c.reset);
      break;

    default:
      console.log(c.red + '   Opção inválida!' + c.reset);
  }

  rl.close();
  
  if (menuMode) {
    setTimeout(() => {
      showMenu();
      startMenuListener();
    }, 2000);
  }
}

function startMenuListener() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(c.green + '\\n   Escolha uma opção: ' + c.reset, (answer) => {
    rl.close();
    handleMenuInput(answer);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════════════════
app.listen(CONFIG.PORT, '0.0.0.0', async () => {
  showBanner();
  
  log('success', \`Servidor iniciado na porta \${CONFIG.PORT}\`);
  log('info', 'PM2: pm2 start genesis-v8.js --name genesis');
  log('info', 'Menu: node genesis-v8.js --menu');

  // Auto-conectar instâncias existentes
  setTimeout(() => {
    manager.autoConnectAll();
  }, 3000);

  if (menuMode) {
    showMenu();
    startMenuListener();
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('warn', 'Encerrando servidor...');
  manager.saveInstances();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('warn', 'Encerrando servidor (SIGTERM)...');
  manager.saveInstances();
  process.exit(0);
});
`;
};
