export const VPS_SCRIPT_VERSION = "8.4.1";

// VPS Script v8.3 - MULTI-INSTANCE MANAGER WITH PROFESSIONAL CLI
// Gerenciador dinâmico com menu interativo profissional e logs personalizados
// v8.3: Otimizações de estabilidade, anti-ban melhorado, heartbeat inteligente
export const getVPSScriptV8 = (masterToken: string): string => {
  // IMPORTANTE: default precisa bater com o token nativo usado pelo backend/proxy,
  // senão o Heartbeat pode falhar com 401 quando o usuário deixa o campo em branco.
  const DEFAULT_MASTER_TOKEN = "genesis-master-token-2024-secure";
  const token = masterToken?.trim() ? masterToken.trim() : DEFAULT_MASTER_TOKEN;

  return `#!/usr/bin/env node
// ╔════════════════════════════════════════════════════════════════════════════════════════╗
// ║       GENESIS WHATSAPP MULTI-INSTANCE MANAGER - v8.3 ENTERPRISE                        ║
// ║              Professional CLI | Interactive Menu | Beautiful Logs                       ║
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
  PORT: parseInt(process.env.PORT || '3000'),
  MASTER_TOKEN: process.env.MASTER_TOKEN || '${token}',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://xeloigymjjeejvicadar.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbG9pZ3ltamplZWp2aWNhZGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzQ4OTYsImV4cCI6MjA4MzMxMDg5Nn0.OtCuFQNaYs5QLu3sq1ZRnHlEA1fH2VLje0h959jaAek',
  LOG_LEVEL: process.env.LOG_LEVEL || 'operational',
  DATA_DIR: process.env.DATA_DIR || path.join(__dirname, 'genesis_data'),
  
  // FASE 9: Pool de VPS
  NODE_ID: process.env.NODE_ID || null,
  NODE_TOKEN: process.env.NODE_TOKEN || null,
  NODE_REGION: process.env.NODE_REGION || 'br-south',
  NODE_MAX_INSTANCES: parseInt(process.env.NODE_MAX_INSTANCES || '50'),
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // HARDENING: CONFIGURAÇÕES DE ESTABILIDADE E ANTI-BAN
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Heartbeat inteligente com variação humanizada (não robótico)
  HEARTBEAT_BASE_INTERVAL: 25000,      // Base: 25s
  HEARTBEAT_JITTER_MAX: 8000,          // Jitter: até +8s (total 25-33s)
  HEARTBEAT_DEGRADED_MULTIPLIER: 1.5,  // Em degradação, heartbeat mais lento
  
  // Anti-loop de reconexão
  RECONNECT_BASE_DELAY: 8000,          // Delay base: 8s
  RECONNECT_MAX_DELAY: 300000,         // Max: 5 minutos
  RECONNECT_MAX_ATTEMPTS: 5,           // Máximo tentativas antes de cooldown
  RECONNECT_COOLDOWN_TIME: 600000,     // Cooldown: 10 minutos após falhas consecutivas
  RECONNECT_BACKOFF_FACTOR: 2,         // Fator de backoff exponencial
  RECONNECT_JITTER_FACTOR: 0.3,        // 30% de jitter no backoff
  
  // Rate limiting inteligente
  RATE_LIMIT_WINDOW: 60000,            // Janela de 1 minuto
  RATE_LIMIT_MAX: 60,                  // Máximo 60 req/min (reduzido de 100)
  RATE_LIMIT_BURST: 10,                // Burst máximo simultâneo
  RATE_LIMIT_RECOVERY: 5000,           // Tempo para recuperar 1 slot
  
  // Limites de mensagens por instância (anti-ban)
  MSG_LIMIT_PER_MINUTE: 20,            // Max 20 msgs/min por instância
  MSG_LIMIT_PER_HOUR: 200,             // Max 200 msgs/hora por instância
  MSG_LIMIT_PER_DAY: 1000,             // Max 1000 msgs/dia por instância
  MSG_COOLDOWN_AFTER_BURST: 30000,     // Cooldown 30s após burst
  MSG_MIN_INTERVAL: 1500,              // Mínimo 1.5s entre mensagens
  
  // Detecção de degradação e proteção de sessão
  DEGRADATION_THRESHOLD_FAILURES: 3,   // 3 falhas = degradação detectada
  DEGRADATION_SLOW_MODE_FACTOR: 3,     // Modo lento: 3x mais devagar
  DEGRADATION_RECOVERY_TIME: 120000,   // 2 minutos para tentar normalizar
  SESSION_HEALTH_CHECK_INTERVAL: 60000, // Verificar saúde da sessão a cada 1min
  
  // Estabilização pós-conexão
  STABILIZATION_DELAY: 5000,           // 5s para marcar como ready (aumentado de 3s)
  SOCKET_WARMUP_DELAY: 2000,           // 2s warmup antes de operações
  QR_CYCLE_NORMAL: true,               // Aceitar QR como ciclo normal
  
  // Desconexões controladas
  IDLE_DISCONNECT_THRESHOLD: 3600000,  // 1 hora sem atividade = idle prolongado
  SILENT_PAUSE_ENABLED: true,          // Pausas silenciosas habilitadas
  SILENT_PAUSE_DURATION: 30000,        // 30s de pausa silenciosa
  
  // Node heartbeat
  NODE_HEARTBEAT_INTERVAL: 30000,
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

    // Anti-duplicidade local (protege contra upserts duplicados do Baileys / retries)
    // instanceId -> Map<dedupKey, lastSeenAtMs>
    this.inboundDedup = new Map();
    this.INBOUND_DEDUP_TTL_MS = 10 * 60 * 1000; // 10min
    this.INBOUND_DEDUP_MAX = 5000;

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
      // === HARDENING: Estado de proteção por instância ===
      reconnectAttempts: 0,
      lastReconnectAt: 0,
      inCooldown: false,
      cooldownUntil: 0,
      degraded: false,
      degradationDetectedAt: 0,
      consecutiveFailures: 0,
      lastMessageAt: 0,
      messagesThisMinute: 0,
      messagesThisHour: 0,
      messagesToday: 0,
      messageRateLimitUntil: 0,
      lastActivityAt: Date.now(),
      silentPauseUntil: 0,
      sessionHealthy: true,
      lastHealthCheck: Date.now(),
    });

    this.saveInstances();
    log('success', \`Instância criada: \${name || instanceId}\`);
    return { success: true };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HARDENING: CÁLCULO DE BACKOFF COM JITTER
  // ════════════════════════════════════════════════════════════════════════════
  calculateBackoffDelay(attempts) {
    const base = CONFIG.RECONNECT_BASE_DELAY;
    const factor = CONFIG.RECONNECT_BACKOFF_FACTOR;
    const max = CONFIG.RECONNECT_MAX_DELAY;
    const jitter = CONFIG.RECONNECT_JITTER_FACTOR;
    
    // Exponential backoff: base * (factor ^ attempts)
    let delay = base * Math.pow(factor, Math.min(attempts, 8));
    delay = Math.min(delay, max);
    
    // Add jitter: ±30% randomization
    const jitterRange = delay * jitter;
    delay += (Math.random() * 2 - 1) * jitterRange;
    
    return Math.floor(Math.max(delay, base));
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HARDENING: VERIFICAÇÃO DE COOLDOWN
  // ════════════════════════════════════════════════════════════════════════════
  isInCooldown(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;
    
    if (instance.inCooldown && Date.now() < instance.cooldownUntil) {
      const remaining = Math.ceil((instance.cooldownUntil - Date.now()) / 1000);
      log('warn', \`[\${instance.name}] Em cooldown por mais \${remaining}s - evitando reconexão\`);
      return true;
    }
    
    // Cooldown expirou, resetar
    if (instance.inCooldown) {
      instance.inCooldown = false;
      instance.cooldownUntil = 0;
      instance.reconnectAttempts = 0;
      log('info', \`[\${instance.name}] Cooldown expirado - pronto para reconectar\`);
    }
    
    return false;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HARDENING: DETECTAR DEGRADAÇÃO DE SESSÃO
  // ════════════════════════════════════════════════════════════════════════════
  checkSessionDegradation(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;
    
    const failures = instance.consecutiveFailures || 0;
    const threshold = CONFIG.DEGRADATION_THRESHOLD_FAILURES;
    
    if (failures >= threshold && !instance.degraded) {
      instance.degraded = true;
      instance.degradationDetectedAt = Date.now();
      log('warn', \`[\${instance.name}] ⚠️ Degradação detectada após \${failures} falhas - entrando em modo lento\`);
      
      // Notificar backend sobre degradação
      this.sendHeartbeat(instanceId, 'degraded');
      return true;
    }
    
    // Tentar sair do modo degradado após tempo de recuperação
    if (instance.degraded) {
      const elapsed = Date.now() - instance.degradationDetectedAt;
      if (elapsed > CONFIG.DEGRADATION_RECOVERY_TIME) {
        instance.degraded = false;
        instance.consecutiveFailures = 0;
        log('info', \`[\${instance.name}] ✓ Saindo do modo degradado - tentando normalizar\`);
      }
    }
    
    return instance.degraded;
  }

  async connectInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return { success: false, error: 'Instância não encontrada' };
    }

    if (instance.status === 'connected') {
      return { success: true, message: 'Já conectado' };
    }

    // HARDENING: Verificar cooldown antes de tentar conectar
    if (this.isInCooldown(instanceId)) {
      const remaining = Math.ceil((instance.cooldownUntil - Date.now()) / 1000);
      return { 
        success: false, 
        error: \`Instância em cooldown. Tente novamente em \${remaining}s\`,
        cooldownRemaining: remaining
      };
    }

    try {
      const authDir = path.join(CONFIG.DATA_DIR, 'auth_' + instanceId);
      const { state, saveCreds } = await useMultiFileAuthState(authDir);

      // HARDENING: Socket com configurações otimizadas para estabilidade
      // v8.4: Patch para botões nativos via viewOnceMessageV2
      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Genesis v8', 'Chrome', '120.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000 + Math.floor(Math.random() * 5000), // Jitter no keepAlive
        retryRequestDelayMs: 500,
        markOnlineOnConnect: false, // Evitar marcação automática para parecer mais natural
        syncFullHistory: false,     // Não sincronizar histórico completo (menos suspeito)
        // ═══════════════════════════════════════════════════════════════════════════════
        // PATCH v8.4: Encapsular mensagens interativas em viewOnceMessageV2
        // Isso é necessário para que botões/listas apareçam em versões mais novas
        // ═══════════════════════════════════════════════════════════════════════════════
        patchMessageBeforeSending: (message) => {
          const requiresPatch = !!(
            message.buttonsMessage ||
            message.templateMessage ||
            message.listMessage ||
            message.interactiveMessage
          );
          if (requiresPatch) {
            message = {
              viewOnceMessageV2: {
                message: {
                  messageContextInfo: {
                    deviceListMetadataVersion: 2,
                    deviceListMetadata: {}
                  },
                  ...message
                }
              }
            };
          }
          return message;
        }
      });

      instance.sock = sock;
      instance.status = 'connecting';
      instance.lastActivityAt = Date.now();

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          instance.qrCode = qr;
          instance.status = 'waiting_qr';
          instance.reconnectAttempts = 0; // Reset em novo QR (ciclo normal)
          log('info', \`[\\x1b[33m\${instance.name}\\x1b[0m] QR Code disponível\`);
          this.sendHeartbeat(instanceId, 'waiting_qr');
        }

        if (connection === 'close') {
          const code = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = code !== DisconnectReason.loggedOut;
          
          instance.status = 'disconnected';
          instance.readyToSend = false;
          instance.qrCode = null;
          instance.consecutiveFailures++;
          
          // HARDENING: Track de desconexões
          this.trackDisconnection(instanceId);
          
          log('warn', \`[\\x1b[33m\${instance.name}\\x1b[0m] Desconectado - Código: \${code} | Falhas: \${instance.consecutiveFailures}\`);
          this.sendHeartbeat(instanceId, 'disconnected');

          if (shouldReconnect) {
            instance.reconnectAttempts++;
            
            // HARDENING: Verificar se deve entrar em cooldown
            if (instance.reconnectAttempts >= CONFIG.RECONNECT_MAX_ATTEMPTS) {
              instance.inCooldown = true;
              instance.cooldownUntil = Date.now() + CONFIG.RECONNECT_COOLDOWN_TIME;
              log('warn', \`[\\x1b[33m\${instance.name}\\x1b[0m] ⏸️ Entrando em cooldown de \${CONFIG.RECONNECT_COOLDOWN_TIME / 1000}s após \${instance.reconnectAttempts} tentativas\`);
              this.sendHeartbeat(instanceId, 'cooldown');
              return; // Não reconectar agora
            }
            
            // HARDENING: Backoff exponencial com jitter
            const delay = this.calculateBackoffDelay(instance.reconnectAttempts);
            log('info', \`[\\x1b[33m\${instance.name}\\x1b[0m] Reconectando em \${(delay/1000).toFixed(1)}s... (tentativa \${instance.reconnectAttempts})\`);
            
            setTimeout(() => this.connectInstance(instanceId), delay);
          } else {
            // LoggedOut - sessão invalidada, aceitar QR como ciclo normal
            log('warn', \`[\\x1b[33m\${instance.name}\\x1b[0m] Sessão invalidada - aguardando novo QR\`);
            instance.reconnectAttempts = 0; // Reset para novo ciclo
          }
        }

        if (connection === 'open') {
          instance.status = 'connected';
          instance.qrCode = null;
          instance.consecutiveFailures = 0; // Reset em sucesso
          instance.reconnectAttempts = 0;
          instance.degraded = false;
          instance.inCooldown = false;
          
          const me = sock.user;
          if (me?.id) {
            instance.phoneNumber = me.id.split(':')[0].replace('@s.whatsapp.net', '');
          }

          log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] Conectado! Número: \${instance.phoneNumber}\`);
          
          // HARDENING: Delay de estabilização aumentado e com warmup
          setTimeout(async () => {
            // Warmup: pequena operação para estabilizar socket
            try {
              await sock.fetchStatus(me.id);
            } catch (e) {
              // Ignorar erro de warmup
            }
            
            // Agora marcar como ready
            setTimeout(() => {
              instance.readyToSend = true;
              instance.sessionHealthy = true;
              instance.lastHealthCheck = Date.now();
              instance.lastActivityAt = Date.now();
              log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] ✓ Pronto para enviar mensagens (estabilizado)\`);
              this.sendHeartbeat(instanceId, 'connected');
            }, CONFIG.SOCKET_WARMUP_DELAY);
          }, CONFIG.STABILIZATION_DELAY);

          this.startHeartbeat(instanceId);
          this.startSessionHealthCheck(instanceId);
          this.saveInstances();
          
          // Track reconexão bem-sucedida
          this.trackReconnection(instanceId);
        }
      });

      sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg?.key?.fromMe === false && msg.message) {
          instance.lastActivityAt = Date.now();
          // IMPORTANTE: Manter JID completo para responder corretamente (@lid, @s.whatsapp.net, @g.us)
          const remoteJid = msg.key.remoteJid || '';
          const inboundMessageId = msg.key.id || null;
          
          // Extrair texto da mensagem
          const textContent = 
            msg.message.conversation || 
            msg.message.extendedTextMessage?.text ||
            msg.message.buttonsResponseMessage?.selectedButtonId ||
            msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
            msg.message.templateButtonReplyMessage?.selectedId ||
            '';
          
          log('msg', \`[\\x1b[35m\${instance.name}\\x1b[0m] Mensagem de \${remoteJid}: \${textContent.slice(0, 50)}...\`);
          this.trackMessageReceived(instanceId);
          
          // ═══════════════════════════════════════════════════════════════════════════
          // ENCAMINHAR PARA ENGINES (CHATBOT + FLOW BUILDER COM FALLBACK)
          // ═══════════════════════════════════════════════════════════════════════════
          if (textContent && !remoteJid.endsWith('@g.us')) {
            // Ignorar grupos, só processar mensagens privadas

            // Anti-duplicidade local: Baileys pode emitir upsert duplicado
            if (this.isDuplicateInbound(instanceId, inboundMessageId, remoteJid, textContent, msg.messageTimestamp)) {
              log('warn', '[DEDUP] Ignorando mensagem duplicada id=' + (inboundMessageId || 'n/a'));
              return;
            }

            this.forwardToEngines(instanceId, remoteJid, textContent, inboundMessageId);
          }
        }
      });

      return { success: true };
    } catch (err) {
      instance.consecutiveFailures++;
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

  // ════════════════════════════════════════════════════════════════════════════
  // HARDENING: RATE LIMITING DE MENSAGENS POR INSTÂNCIA
  // ════════════════════════════════════════════════════════════════════════════
  checkMessageRateLimit(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return { allowed: false, error: 'Instância não encontrada' };
    
    const now = Date.now();
    
    // Verificar se está em rate limit
    if (instance.messageRateLimitUntil > now) {
      const remaining = Math.ceil((instance.messageRateLimitUntil - now) / 1000);
      return { 
        allowed: false, 
        error: \`Rate limit ativo. Aguarde \${remaining}s\`,
        retryAfter: remaining
      };
    }
    
    // Resetar contadores de período
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    if (!instance.lastMessageMinuteReset || instance.lastMessageMinuteReset < oneMinuteAgo) {
      instance.messagesThisMinute = 0;
      instance.lastMessageMinuteReset = now;
    }
    
    if (!instance.lastMessageHourReset || instance.lastMessageHourReset < oneHourAgo) {
      instance.messagesThisHour = 0;
      instance.lastMessageHourReset = now;
    }
    
    if (!instance.lastMessageDayReset || instance.lastMessageDayReset < todayStart) {
      instance.messagesToday = 0;
      instance.lastMessageDayReset = todayStart;
    }
    
    // Verificar limites
    if (instance.messagesThisMinute >= CONFIG.MSG_LIMIT_PER_MINUTE) {
      instance.messageRateLimitUntil = now + CONFIG.MSG_COOLDOWN_AFTER_BURST;
      log('warn', \`[\${instance.name}] Rate limit atingido: \${instance.messagesThisMinute}/min\`);
      return { allowed: false, error: 'Limite por minuto atingido', retryAfter: 30 };
    }
    
    if (instance.messagesThisHour >= CONFIG.MSG_LIMIT_PER_HOUR) {
      log('warn', \`[\${instance.name}] Rate limit por hora atingido: \${instance.messagesThisHour}/h\`);
      return { allowed: false, error: 'Limite por hora atingido', retryAfter: 300 };
    }
    
    if (instance.messagesToday >= CONFIG.MSG_LIMIT_PER_DAY) {
      log('warn', \`[\${instance.name}] Rate limit diário atingido: \${instance.messagesToday}/dia\`);
      return { allowed: false, error: 'Limite diário atingido', retryAfter: 3600 };
    }
    
    // Verificar intervalo mínimo entre mensagens
    if (instance.lastMessageAt && (now - instance.lastMessageAt) < CONFIG.MSG_MIN_INTERVAL) {
      const wait = CONFIG.MSG_MIN_INTERVAL - (now - instance.lastMessageAt);
      return { allowed: false, error: \`Aguarde \${wait}ms entre mensagens\`, retryAfter: Math.ceil(wait / 1000) };
    }
    
    return { allowed: true };
  }

  async sendMessage(instanceId, to, message) {
    const instance = this.instances.get(instanceId);
    if (!instance) return { success: false, error: 'Instância não encontrada' };
    if (!instance.sock || !instance.readyToSend) {
      return { success: false, error: 'Instância não está pronta para enviar' };
    }
    
    // HARDENING: Verificar pausa silenciosa
    if (instance.silentPauseUntil > Date.now()) {
      const remaining = Math.ceil((instance.silentPauseUntil - Date.now()) / 1000);
      log('info', \`[\${instance.name}] Em pausa silenciosa por mais \${remaining}s\`);
      return { success: false, error: 'Instância em pausa temporária', retryAfter: remaining };
    }
    
    // HARDENING: Verificar rate limit de mensagens
    const rateCheck = this.checkMessageRateLimit(instanceId);
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.error, retryAfter: rateCheck.retryAfter };
    }
    
    // HARDENING: Se em modo degradado, aplicar delay adicional
    if (instance.degraded) {
      const extraDelay = CONFIG.MSG_MIN_INTERVAL * CONFIG.DEGRADATION_SLOW_MODE_FACTOR;
      log('info', \`[\${instance.name}] Modo degradado - delay extra de \${extraDelay}ms\`);
      await new Promise(r => setTimeout(r, extraDelay));
    }

    try {
      // IMPORTANTE: Usar JID exatamente como recebido (suporta @lid, @s.whatsapp.net, etc.)
      // Só adiciona @s.whatsapp.net se for número puro sem @
      const jid = to.includes('@') ? to : to + '@s.whatsapp.net';
      await instance.sock.sendMessage(jid, { text: message });
      
      // Atualizar contadores
      instance.lastMessageAt = Date.now();
      instance.messagesThisMinute++;
      instance.messagesThisHour++;
      instance.messagesToday++;
      instance.lastActivityAt = Date.now();
      instance.consecutiveFailures = 0; // Reset em sucesso
      
      // Sair do modo degradado após sucesso
      if (instance.degraded) {
        instance.degraded = false;
        log('info', \`[\${instance.name}] ✓ Saindo do modo degradado após envio bem-sucedido\`);
      }
      
      log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] Mensagem enviada para \${to} (\${instance.messagesThisMinute}/min)\`);
      this.trackMessageSent(instanceId, true);
      return { success: true };
    } catch (err) {
      instance.consecutiveFailures++;
      this.trackMessageSent(instanceId, false);
      
      // Detectar degradação
      this.checkSessionDegradation(instanceId);
      
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
      // HARDENING: Expor estado de proteção
      degraded: instance.degraded || false,
      inCooldown: instance.inCooldown || false,
      cooldownRemaining: instance.cooldownUntil > Date.now() ? Math.ceil((instance.cooldownUntil - Date.now()) / 1000) : 0,
      messagesThisMinute: instance.messagesThisMinute || 0,
      messagesThisHour: instance.messagesThisHour || 0,
      messagesToday: instance.messagesToday || 0,
      sessionHealthy: instance.sessionHealthy !== false,
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
        degraded: inst.degraded || false,
        inCooldown: inst.inCooldown || false,
      });
    });
    return result;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HARDENING: HEARTBEAT INTELIGENTE COM JITTER
  // ════════════════════════════════════════════════════════════════════════════
  getHeartbeatInterval(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return CONFIG.HEARTBEAT_BASE_INTERVAL;
    
    let interval = CONFIG.HEARTBEAT_BASE_INTERVAL;
    
    // Em modo degradado, heartbeat mais lento
    if (instance.degraded) {
      interval *= CONFIG.HEARTBEAT_DEGRADED_MULTIPLIER;
    }
    
    // Adicionar jitter humanizado (evita padrão robótico detectável)
    const jitter = Math.floor(Math.random() * CONFIG.HEARTBEAT_JITTER_MAX);
    
    return interval + jitter;
  }

  startHeartbeat(instanceId) {
    this.stopHeartbeat(instanceId);
    
    // HARDENING: Usar intervalo dinâmico com jitter que varia a cada heartbeat
    const scheduleNextHeartbeat = () => {
      const interval = this.getHeartbeatInterval(instanceId);
      
      const timeout = setTimeout(async () => {
        const instance = this.instances.get(instanceId);
        if (instance && instance.status === 'connected') {
          await this.sendHeartbeat(instanceId, instance.degraded ? 'degraded' : 'connected');
          
          // Agendar próximo heartbeat com novo intervalo aleatório
          scheduleNextHeartbeat();
        }
      }, interval);
      
      this.heartbeatIntervals.set(instanceId, timeout);
    };
    
    scheduleNextHeartbeat();
  }

  stopHeartbeat(instanceId) {
    const interval = this.heartbeatIntervals.get(instanceId);
    if (interval) {
      clearTimeout(interval);
      this.heartbeatIntervals.delete(instanceId);
    }
  }
  
  // ════════════════════════════════════════════════════════════════════════════
  // HARDENING: SESSION HEALTH CHECK
  // ════════════════════════════════════════════════════════════════════════════
  sessionHealthChecks = new Map();
  
  startSessionHealthCheck(instanceId) {
    this.stopSessionHealthCheck(instanceId);
    
    const interval = setInterval(async () => {
      const instance = this.instances.get(instanceId);
      if (!instance || instance.status !== 'connected') {
        this.stopSessionHealthCheck(instanceId);
        return;
      }
      
      // Verificar saúde da sessão tentando uma operação leve
      try {
        if (instance.sock) {
          await instance.sock.fetchStatus(instance.phoneNumber + '@s.whatsapp.net');
          instance.sessionHealthy = true;
          instance.lastHealthCheck = Date.now();
          instance.consecutiveFailures = 0;
        }
      } catch (err) {
        instance.consecutiveFailures++;
        
        // Detectar degradação
        if (instance.consecutiveFailures >= CONFIG.DEGRADATION_THRESHOLD_FAILURES) {
          if (!instance.degraded) {
            instance.degraded = true;
            instance.degradationDetectedAt = Date.now();
            log('warn', \`[\${instance.name}] ⚠️ Sessão degradada detectada no health check\`);
            
            // Entrar em pausa silenciosa
            if (CONFIG.SILENT_PAUSE_ENABLED) {
              instance.silentPauseUntil = Date.now() + CONFIG.SILENT_PAUSE_DURATION;
              log('info', \`[\${instance.name}] 🔇 Pausa silenciosa de \${CONFIG.SILENT_PAUSE_DURATION/1000}s\`);
            }
          }
        }
        
        instance.sessionHealthy = false;
        log('warn', \`[\${instance.name}] Health check falhou: \${err.message} (falhas: \${instance.consecutiveFailures})\`);
      }
      
      // Verificar idle prolongado
      if (CONFIG.IDLE_DISCONNECT_THRESHOLD > 0) {
        const idleTime = Date.now() - instance.lastActivityAt;
        if (idleTime > CONFIG.IDLE_DISCONNECT_THRESHOLD && instance.status === 'connected') {
          log('info', \`[\${instance.name}] 💤 Idle prolongado (\${Math.floor(idleTime/60000)}min) - mantendo conexão mas reduzindo atividade\`);
          // Não desconectar, apenas reduzir heartbeat (já feito via degraded mode)
        }
      }
    }, CONFIG.SESSION_HEALTH_CHECK_INTERVAL);
    
    this.sessionHealthChecks.set(instanceId, interval);
  }
  
  stopSessionHealthCheck(instanceId) {
    const interval = this.sessionHealthChecks.get(instanceId);
    if (interval) {
      clearInterval(interval);
      this.sessionHealthChecks.delete(instanceId);
    }
  }
  
  // ════════════════════════════════════════════════════════════════════════════
  // HARDENING: PAUSA SILENCIOSA (SILENT PAUSE)
  // ════════════════════════════════════════════════════════════════════════════
  triggerSilentPause(instanceId, durationMs = CONFIG.SILENT_PAUSE_DURATION) {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;
    
    instance.silentPauseUntil = Date.now() + durationMs;
    log('info', \`[\${instance.name}] 🔇 Pausa silenciosa ativada por \${durationMs/1000}s\`);
    return true;
  }
  
  // ════════════════════════════════════════════════════════════════════════════
  // ANTI-DUPLICIDADE (LOCAL): evitar processar a mesma mensagem 2x no VPS
  // ════════════════════════════════════════════════════════════════════════════
  getInboundDedupKey(messageId, remoteJid, message, messageTimestamp) {
    if (messageId) return String(messageId);
    const ts = messageTimestamp ? String(messageTimestamp) : '';
    return crypto.createHash('sha1').update(remoteJid + '|' + message + '|' + ts).digest('hex');
  }

  isDuplicateInbound(instanceId, messageId, remoteJid, message, messageTimestamp) {
    const now = Date.now();

    let map = this.inboundDedup.get(instanceId);
    if (!map) {
      map = new Map();
      this.inboundDedup.set(instanceId, map);
    }

    // Limpar entradas antigas (TTL)
    const ttl = this.INBOUND_DEDUP_TTL_MS || (10 * 60 * 1000);
    for (const [k, seenAt] of map.entries()) {
      if (now - seenAt > ttl) map.delete(k);
    }

    const key = this.getInboundDedupKey(messageId, remoteJid, message, messageTimestamp);
    if (map.has(key)) return true;

    map.set(key, now);

    // Limitar memória (LRU simples: remove os mais antigos)
    const max = this.INBOUND_DEDUP_MAX || 5000;
    while (map.size > max) {
      const oldestKey = map.keys().next().value;
      map.delete(oldestKey);
    }

    return false;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MOTOR DE INTEGRAÇÃO: ENCAMINHAR MENSAGENS PARA ENGINES (CHATBOT + FLOW BUILDER)
  // ════════════════════════════════════════════════════════════════════════════
  async forwardToEngines(instanceId, remoteJid, message, messageId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    log('info', \`[\\x1b[36m\${instance.name}\\x1b[0m] 🤖 Encaminhando para engines...\`);
    
    try {
      // ═══════════════════════════════════════════════════════════════════════════
      // PASSO 1: Tentar Chatbot Engine primeiro
      // ═══════════════════════════════════════════════════════════════════════════
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const chatbotResponse = await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/chatbot-engine\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
        },
        body: JSON.stringify({
          action: 'process_message',
          from: remoteJid,
          message,
          instanceId,
          messageId,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const chatbotResult = await chatbotResponse.json();

      const chatbotHandled =
        chatbotResult &&
        chatbotResult.success === true &&
        (chatbotResult.chatbotId || chatbotResult.handled === true || chatbotResult.dedup === true);

      if (chatbotHandled) {
        log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] ✓ Chatbot respondeu: \${chatbotResult.chatbotName || chatbotResult.chatbotId}\`);
        return; // Chatbot tratou (ou dedup), parar aqui
      }
      
      // ═══════════════════════════════════════════════════════════════════════════
      // PASSO 2: Fallback para Flow Builder (whatsapp-automation-worker)
      // ═══════════════════════════════════════════════════════════════════════════
      log('info', \`[\\x1b[33m\${instance.name}\\x1b[0m] Chatbot não tratou, tentando Flow Builder...\`);
      
      const flowController = new AbortController();
      const flowTimeoutId = setTimeout(() => flowController.abort(), 15000);
      
      const flowResponse = await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/whatsapp-automation-worker\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
        },
        body: JSON.stringify({
          source: 'vps_message',
          event_type: 'message_received',
          event_data: {
            from: remoteJid,
            message,
            instanceId,
            phone: remoteJid.split('@')[0],
            text: message,
            messageId,
          },
          project_id: instanceId,
        }),
        signal: flowController.signal,
      });
      
      clearTimeout(flowTimeoutId);
      
      const flowResult = await flowResponse.json();
      
      if (flowResult.success || flowResult.processed) {
        log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] ✓ Flow Builder processou a mensagem\`);
      } else {
        log('info', \`[\\x1b[33m\${instance.name}\\x1b[0m] Nenhum engine tratou: \${message.slice(0, 30)}...\`);
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        log('warn', \`[\\x1b[33m\${instance.name}\\x1b[0m] Timeout ao processar engines (15s)\`);
      } else {
        log('error', \`[\\x1b[31m\${instance.name}\\x1b[0m] Erro engines: \${err.message}\`);
      }
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
            version: '8.1-hardened',
            // HARDENING: Métricas de proteção
            degraded: instance.degraded || false,
            inCooldown: instance.inCooldown || false,
            consecutiveFailures: instance.consecutiveFailures || 0,
            messagesThisMinute: instance.messagesThisMinute || 0,
            messagesThisHour: instance.messagesThisHour || 0,
            messagesToday: instance.messagesToday || 0,
            sessionHealthy: instance.sessionHealthy !== false,
            reconnectAttempts: instance.reconnectAttempts || 0,
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

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 8: SISTEMA DE BACKUP DE SESSÃO
  // ════════════════════════════════════════════════════════════════════════════
  
  async backupSession(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return { success: false, error: 'Instância não encontrada' };

    const authDir = path.join(CONFIG.DATA_DIR, 'auth_' + instanceId);
    if (!fs.existsSync(authDir)) {
      return { success: false, error: 'Nenhuma sessão para backup' };
    }

    try {
      log('info', \`[\\x1b[34m\${instance.name}\\x1b[0m] Iniciando backup de sessão...\`);

      // 1. Criar arquivo ZIP da pasta de auth
      const archiver = require('archiver');
      const zipPath = path.join(CONFIG.DATA_DIR, \`backup_\${instanceId}.zip\`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.directory(authDir, false);
        archive.finalize();
      });

      // 2. Calcular checksum
      const fileBuffer = fs.readFileSync(zipPath);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const fileSize = fs.statSync(zipPath).size;

      // 3. Solicitar URL de upload do backend
      const createResponse = await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/genesis-session-backup\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
        },
        body: JSON.stringify({
          action: 'create_backup',
          instance_id: instanceId,
          checksum,
          file_size: fileSize,
          backup_type: 'automatic',
          metadata: {
            phone_number: instance.phoneNumber,
            vps_version: '8.0',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const createResult = await createResponse.json();
      if (!createResult.success) {
        fs.unlinkSync(zipPath);
        return { success: false, error: createResult.error };
      }

      // 4. Upload do arquivo para o Storage
      const uploadResponse = await fetch(createResult.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/zip' },
        body: fileBuffer,
      });

      if (!uploadResponse.ok) {
        fs.unlinkSync(zipPath);
        return { success: false, error: 'Falha no upload do backup' };
      }

      // 5. Confirmar upload
      await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/genesis-session-backup\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
        },
        body: JSON.stringify({
          action: 'upload_complete',
          instance_id: instanceId,
          backup_id: createResult.backup_id,
        }),
      });

      // Limpar arquivo temporário
      fs.unlinkSync(zipPath);

      log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] Backup concluído! v\${createResult.version} (\${(fileSize / 1024).toFixed(1)}KB)\`);
      return { 
        success: true, 
        backup_id: createResult.backup_id,
        version: createResult.version,
        checksum,
        size: fileSize,
      };
    } catch (err) {
      log('error', \`[\\x1b[31m\${instance.name}\\x1b[0m] Erro no backup: \${err.message}\`);
      return { success: false, error: err.message };
    }
  }

  async restoreSession(instanceId, backupId = null) {
    const instance = this.instances.get(instanceId);
    if (!instance) return { success: false, error: 'Instância não encontrada' };

    try {
      log('info', \`[\\x1b[34m\${instance.name}\\x1b[0m] Iniciando restore de sessão...\`);

      // 1. Buscar backup (último válido se não especificado)
      const action = backupId ? 'restore' : 'get_latest';
      const response = await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/genesis-session-backup\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
        },
        body: JSON.stringify({
          action,
          instance_id: instanceId,
          backup_id: backupId,
        }),
      });

      const result = await response.json();
      if (!result.success || !result.backup) {
        return { success: false, error: result.error || 'Nenhum backup encontrado' };
      }

      const backup = result.backup;

      // 2. Baixar arquivo do Storage
      const downloadResponse = await fetch(backup.download_url);
      if (!downloadResponse.ok) {
        return { success: false, error: 'Falha no download do backup' };
      }

      const zipBuffer = Buffer.from(await downloadResponse.arrayBuffer());
      
      // 3. Verificar checksum
      if (backup.checksum) {
        const downloadChecksum = crypto.createHash('sha256').update(zipBuffer).digest('hex');
        if (downloadChecksum !== backup.checksum) {
          return { success: false, error: 'Checksum inválido - backup corrompido' };
        }
      }

      // 4. Descompactar para pasta de auth
      const unzipper = require('unzipper');
      const authDir = path.join(CONFIG.DATA_DIR, 'auth_' + instanceId);
      
      // Backup da sessão atual (se existir)
      if (fs.existsSync(authDir)) {
        const oldBackupDir = authDir + '_old_' + Date.now();
        fs.renameSync(authDir, oldBackupDir);
        log('info', \`[\\x1b[33m\${instance.name}\\x1b[0m] Sessão anterior movida para backup\`);
      }

      fs.mkdirSync(authDir, { recursive: true });
      
      const zipPath = path.join(CONFIG.DATA_DIR, \`restore_\${instanceId}.zip\`);
      fs.writeFileSync(zipPath, zipBuffer);

      await new Promise((resolve, reject) => {
        fs.createReadStream(zipPath)
          .pipe(unzipper.Extract({ path: authDir }))
          .on('close', resolve)
          .on('error', reject);
      });

      fs.unlinkSync(zipPath);

      // 5. Marcar como restaurado no backend
      if (backupId) {
        await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/genesis-session-backup\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
          },
          body: JSON.stringify({
            action: 'restore',
            instance_id: instanceId,
            backup_id: backup.backup_id || backupId,
          }),
        });
      }

      log('success', \`[\\x1b[32m\${instance.name}\\x1b[0m] Sessão restaurada! v\${backup.version}\`);
      return { 
        success: true, 
        version: backup.version,
        message: 'Sessão restaurada com sucesso. Use connect para iniciar.',
      };
    } catch (err) {
      log('error', \`[\\x1b[31m\${instance.name}\\x1b[0m] Erro no restore: \${err.message}\`);
      return { success: false, error: err.message };
    }
  }

  async listBackups(instanceId) {
    try {
      const response = await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/genesis-session-backup\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
        },
        body: JSON.stringify({
          action: 'list_backups',
          instance_id: instanceId,
        }),
      });

      return await response.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FASE 10: SISTEMA DE MÉTRICAS E ALERTAS
  // ════════════════════════════════════════════════════════════════════════════
  
  initMetricsCollector() {
    // Coletar métricas a cada 5 minutos
    setInterval(() => this.collectAndSendMetrics(), 5 * 60 * 1000);
    log('info', 'Sistema de métricas inicializado');
  }

  async collectAndSendMetrics() {
    for (const [instanceId, instance] of this.instances) {
      if (!instance.metrics) {
        instance.metrics = this.createEmptyMetrics();
      }

      try {
        const cpuLoad = os.loadavg()[0] * 100 / os.cpus().length;
        const memTotal = os.totalmem();
        const memFree = os.freemem();
        const memoryUsage = ((memTotal - memFree) / memTotal) * 100;

        const metrics = {
          messages_sent: instance.metrics.messagesSent || 0,
          messages_received: instance.metrics.messagesReceived || 0,
          messages_failed: instance.metrics.messagesFailed || 0,
          uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
          disconnections: instance.metrics.disconnections || 0,
          reconnections: instance.metrics.reconnections || 0,
          avg_response_time: instance.metrics.avgResponseTime || 0,
          api_calls: instance.metrics.apiCalls || 0,
          webhook_deliveries: instance.metrics.webhookDeliveries || 0,
          webhook_failures: instance.metrics.webhookFailures || 0,
          cpu_usage: cpuLoad,
          memory_usage: memoryUsage,
          status: instance.status,
          messages_today: instance.metrics.messagesToday || 0,
          last_message_at: instance.metrics.lastMessageAt || null,
          health_score: this.calculateLocalHealthScore(instance),
        };

        await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/genesis-metrics\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
          },
          body: JSON.stringify({
            action: 'record_metrics',
            instance_id: instanceId,
            metrics,
          }),
        });

        // Reset contadores parciais após envio
        instance.metrics.messagesSent = 0;
        instance.metrics.messagesReceived = 0;
        instance.metrics.messagesFailed = 0;
        instance.metrics.disconnections = 0;
        instance.metrics.reconnections = 0;
        instance.metrics.apiCalls = 0;

        log('info', \`[\\x1b[34m\${instance.name}\\x1b[0m] Métricas enviadas\`);
      } catch (err) {
        // Silencioso
      }
    }
  }

  createEmptyMetrics() {
    return {
      messagesSent: 0,
      messagesReceived: 0,
      messagesFailed: 0,
      disconnections: 0,
      reconnections: 0,
      apiCalls: 0,
      webhookDeliveries: 0,
      webhookFailures: 0,
      avgResponseTime: 0,
      messagesToday: 0,
      lastMessageAt: null,
    };
  }

  calculateLocalHealthScore(instance) {
    let score = 100;
    
    // Status de conexão
    if (instance.status !== 'connected') score -= 30;
    if (!instance.readyToSend) score -= 10;
    
    // Taxa de falhas
    if (instance.metrics) {
      const total = instance.metrics.messagesSent + instance.metrics.messagesFailed;
      if (total > 0) {
        const failureRate = instance.metrics.messagesFailed / total;
        if (failureRate > 0.1) score -= 25;
        else if (failureRate > 0.05) score -= 10;
      }
      
      // Desconexões
      if (instance.metrics.disconnections > 3) score -= 20;
      else if (instance.metrics.disconnections > 0) score -= instance.metrics.disconnections * 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Track metrics on message events
  trackMessageSent(instanceId, success = true) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    if (!instance.metrics) instance.metrics = this.createEmptyMetrics();
    
    if (success) {
      instance.metrics.messagesSent++;
      instance.metrics.messagesToday++;
      instance.metrics.lastMessageAt = new Date().toISOString();
    } else {
      instance.metrics.messagesFailed++;
    }
  }

  trackMessageReceived(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    if (!instance.metrics) instance.metrics = this.createEmptyMetrics();
    instance.metrics.messagesReceived++;
  }

  trackDisconnection(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    if (!instance.metrics) instance.metrics = this.createEmptyMetrics();
    instance.metrics.disconnections++;
  }

  trackReconnection(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    if (!instance.metrics) instance.metrics = this.createEmptyMetrics();
    instance.metrics.reconnections++;
  }

  trackApiCall(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    if (!instance.metrics) instance.metrics = this.createEmptyMetrics();
    instance.metrics.apiCalls++;
  }

  async autoConnectAll() {
    for (const [id, inst] of this.instances) {
      if (inst.status === 'disconnected') {
        const authDir = path.join(CONFIG.DATA_DIR, 'auth_' + id);
        
        // Se não tem sessão local, tentar restaurar do backup
        if (!fs.existsSync(authDir)) {
          log('info', \`[\\x1b[34m\${inst.name}\\x1b[0m] Tentando restaurar sessão do backup...\`);
          const restoreResult = await this.restoreSession(id);
          if (!restoreResult.success) {
            log('warn', \`[\\x1b[33m\${inst.name}\\x1b[0m] Sem backup disponível\`);
            continue;
          }
        }
        
        log('info', \`Auto-conectando: \${inst.name}\`);
        await this.connectInstance(id);
        await new Promise(r => setTimeout(r, 2000)); // Delay entre conexões
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

// Log buffer para CLI interativo
let logsBuffer = [];
const MAX_LOGS = 100;

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
  
  // Adicionar ao buffer para visualização no menu
  logsBuffer.push({ type, message, timestamp });
  if (logsBuffer.length > MAX_LOGS) logsBuffer.shift();
  
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
// Aceita MASTER_TOKEN (hardcoded no script) OU qualquer token válido cadastrado em instâncias
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization?.replace('Bearer ', '') || 
               req.headers['x-master-token'] ||
               req.query.token;
  
  // Aceita MASTER_TOKEN do config
  if (auth === CONFIG.MASTER_TOKEN) {
    return next();
  }
  
  // Aceita qualquer token não vazio (validação real é feita pelo proxy do Supabase)
  // O proxy já validou ownership da instância antes de chegar aqui
  if (auth && auth.length >= 16) {
    return next();
  }
  
  return res.status(401).json({ error: 'Unauthorized' });
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
  const { to, phone, message, text, number } = req.body;
  const recipient = to || phone || number;
  const content = message || text;
  
  if (!recipient || !content) {
    return res.status(400).json({ error: 'to/phone/number e message/text são obrigatórios' });
  }

  const result = await manager.sendMessage(req.params.id, recipient, content);
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINTS DE MENSAGENS INTERATIVAS (BOTÕES & LISTAS)
// ═══════════════════════════════════════════════════════════════════════════════════════════

// Enviar mensagem com botões
app.post('/api/instance/:id/send-buttons', authMiddleware, async (req, res) => {
  const { phone, to, message, text, buttons, footer } = req.body;
  const recipient = phone || to;
  const content = message || text;
  
  if (!recipient || !content || !buttons || !Array.isArray(buttons)) {
    return res.status(400).json({ error: 'phone, message e buttons são obrigatórios' });
  }
  
  const instance = manager.instances.get(req.params.id);
  if (!instance || !instance.sock) {
    return res.status(404).json({ error: 'Instância não encontrada ou não conectada' });
  }
  
  if (instance.status !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não conectado', code: 'NOT_CONNECTED' });
  }
  
  if (!instance.readyToSend) {
    return res.status(503).json({ error: 'Socket estabilizando, aguarde', code: 'NOT_READY' });
  }
  
  try {
    const jid = recipient.includes('@') ? recipient : recipient.replace(/\\D/g, '') + '@s.whatsapp.net';
    
    let sentType = 'unknown';
    const hasUrlButton = buttons.some(b => b.url);
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // MÉTODO 1: BOTÕES NATIVOS VIA interactiveMessage (Evolution API style)
    // Patch viewOnceMessageV2 aplicado automaticamente pelo socket
    // ═══════════════════════════════════════════════════════════════════════════════
    if (!hasUrlButton && buttons.length >= 1 && buttons.length <= 3) {
      try {
        log('info', 'Tentando botões nativos via interactiveMessage...');
        
        // Formato interactiveMessage compatível com Evolution API
        const interactiveButtons = buttons.map((btn, idx) => ({
          buttonId: btn.id || \`btn_\${idx}\`,
          buttonText: { displayText: btn.text },
          type: 1 // 1 = QUICK_REPLY
        }));
        
        const buttonsMessage = {
          text: content,
          footer: footer || '',
          buttons: interactiveButtons,
          headerType: 1
        };
        
        await instance.sock.sendMessage(jid, { buttonsMessage });
        sentType = 'native_buttons';
        log('success', '✅ Botões nativos enviados com sucesso!');
      } catch (nativeErr) {
        log('warn', \`Botões nativos falharam: \${nativeErr.message}. Tentando interactiveMessage v2...\`);
        
        // MÉTODO 1.5: interactiveMessage com nativeFlowMessage (Evolution API v2.2+)
        try {
          const interactiveMsg = {
            interactiveMessage: {
              body: { text: content },
              footer: footer ? { text: footer } : undefined,
              header: undefined,
              nativeFlowMessage: {
                buttons: buttons.map((btn, idx) => ({
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: btn.text,
                    id: btn.id || \`qr_\${idx}\`
                  })
                }))
              }
            }
          };
          
          await instance.sock.relayMessage(jid, interactiveMsg, { messageId: crypto.randomBytes(8).toString('hex').toUpperCase() });
          sentType = 'native_interactive';
          log('success', '✅ InteractiveMessage enviado com sucesso!');
        } catch (interactiveErr) {
          log('warn', \`InteractiveMessage falhou: \${interactiveErr.message}. Fallback para enquete...\`);
          sentType = 'fallback';
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // MÉTODO 2: ENQUETE (POLL) - Fallback 100% funcional
    // ═══════════════════════════════════════════════════════════════════════════════
    if (sentType === 'fallback' || sentType === 'unknown') {
      if (!hasUrlButton && buttons.length >= 2 && buttons.length <= 12) {
        try {
          // Enviar mensagem de contexto primeiro
          await instance.sock.sendMessage(jid, { text: content + (footer ? '\\n\\n_' + footer + '_' : '') });
          
          // Enviar enquete com as opções
          const pollMessage = {
            poll: {
              name: '📋 Selecione uma opção:',
              values: buttons.map(b => b.text),
              selectableCount: 1
            }
          };
          
          await instance.sock.sendMessage(jid, pollMessage);
          sentType = 'poll';
          log('success', '✅ Enquete enviada com sucesso!');
        } catch (pollErr) {
          log('warn', \`Enquete falhou: \${pollErr.message}. Usando texto...\`);
          sentType = 'text_buttons';
        }
      } else {
        sentType = 'text_buttons';
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // MÉTODO 3: TEXTO FORMATADO (fallback final)
    // ═══════════════════════════════════════════════════════════════════════════════
    if (sentType === 'text_buttons') {
      let formattedMessage = content;
      
      if (footer) {
        formattedMessage += '\\n\\n_' + footer + '_';
      }
      
      if (buttons.length > 0) {
        formattedMessage += '\\n\\n';
        buttons.forEach((btn, i) => {
          if (btn.url) {
            formattedMessage += '🔗 *' + (btn.text || 'Link') + '*: ' + btn.url + '\\n';
          } else {
            formattedMessage += (i + 1) + '. ' + btn.text + '\\n';
          }
        });
        
        const hasReplyButtons = buttons.some(b => !b.url);
        if (hasReplyButtons) {
          formattedMessage += '\\n_Responda com o número da opção desejada_';
        }
      }
      
      await instance.sock.sendMessage(jid, { text: formattedMessage });
    }
    
    instance.messagesSent = (instance.messagesSent || 0) + 1;
    log('success', \`Botões (\${sentType}) enviados para \${recipient.substring(0, 4)}***\`);
    res.json({ success: true, to: recipient, type: sentType, buttonsCount: buttons.length });
  } catch (err) {
    log('error', \`Erro ao enviar botões: \${err.message}\`);
    res.status(500).json({ error: err.message });
  }
});

// Enviar mensagem com lista (menu)
app.post('/api/instance/:id/send-list', authMiddleware, async (req, res) => {
  const { phone, to, body, text, buttonText, sections, footer, title } = req.body;
  const recipient = phone || to;
  const content = body || text;
  
  if (!recipient || !content || !buttonText || !sections || !Array.isArray(sections)) {
    return res.status(400).json({ error: 'phone, body, buttonText e sections são obrigatórios' });
  }
  
  const instance = manager.instances.get(req.params.id);
  if (!instance || !instance.sock) {
    return res.status(404).json({ error: 'Instância não encontrada ou não conectada' });
  }
  
  if (instance.status !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não conectado', code: 'NOT_CONNECTED' });
  }
  
  if (!instance.readyToSend) {
    return res.status(503).json({ error: 'Socket estabilizando, aguarde', code: 'NOT_READY' });
  }
  
  try {
    const jid = recipient.includes('@') ? recipient : recipient.replace(/\\D/g, '') + '@s.whatsapp.net';
    
    let sentType = 'unknown';
    
    // Coletar todas as opções das seções
    const allOptions = [];
    const allRows = [];
    sections.forEach(section => {
      (section.rows || []).forEach(row => {
        allOptions.push(row.title);
        allRows.push({ id: row.id || row.title, title: row.title, description: row.description || '' });
      });
    });
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // MÉTODO 1: LISTA NATIVA VIA listMessage (com patch viewOnceMessageV2)
    // ═══════════════════════════════════════════════════════════════════════════════
    if (allOptions.length >= 1 && allOptions.length <= 10) {
      try {
        log('info', 'Tentando lista nativa via listMessage...');
        
        // Formato listMessage do Baileys
        const listSections = sections.map(section => ({
          title: section.title || '',
          rows: (section.rows || []).map((row, idx) => ({
            rowId: row.id || \`row_\${idx}\`,
            title: row.title,
            description: row.description || ''
          }))
        }));
        
        const listMessage = {
          text: content,
          footer: footer || '',
          title: title || '',
          buttonText: buttonText,
          sections: listSections
        };
        
        await instance.sock.sendMessage(jid, { listMessage });
        sentType = 'native_list';
        log('success', '✅ Lista nativa enviada com sucesso!');
      } catch (nativeErr) {
        log('warn', \`Lista nativa falhou: \${nativeErr.message}. Tentando interactiveMessage...\`);
        
        // MÉTODO 1.5: interactiveMessage com listMessage (Evolution API v2.2+)
        try {
          const interactiveList = {
            interactiveMessage: {
              body: { text: content },
              footer: footer ? { text: footer } : undefined,
              header: title ? { title: title, hasMediaAttachment: false } : undefined,
              nativeFlowMessage: {
                buttons: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: buttonText,
                    sections: sections.map(section => ({
                      title: section.title || '',
                      rows: (section.rows || []).map((row, idx) => ({
                        id: row.id || \`row_\${idx}\`,
                        title: row.title,
                        description: row.description || ''
                      }))
                    }))
                  })
                }]
              }
            }
          };
          
          await instance.sock.relayMessage(jid, interactiveList, { messageId: crypto.randomBytes(8).toString('hex').toUpperCase() });
          sentType = 'native_interactive_list';
          log('success', '✅ InteractiveMessage (lista) enviado com sucesso!');
        } catch (interactiveErr) {
          log('warn', \`InteractiveMessage falhou: \${interactiveErr.message}. Fallback para enquete...\`);
          sentType = 'fallback';
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // MÉTODO 2: ENQUETE (POLL) - Fallback 100% funcional
    // ═══════════════════════════════════════════════════════════════════════════════
    if (sentType === 'fallback' || sentType === 'unknown') {
      if (allOptions.length >= 2 && allOptions.length <= 12) {
        try {
          // Enviar mensagem de contexto primeiro
          let contextMsg = '';
          if (title) contextMsg += '*' + title + '*\\n\\n';
          contextMsg += content;
          if (footer) contextMsg += '\\n\\n_' + footer + '_';
          
          await instance.sock.sendMessage(jid, { text: contextMsg });
          
          // Enviar enquete com as opções
          const pollMessage = {
            poll: {
              name: buttonText || '📋 Selecione uma opção:',
              values: allOptions.slice(0, 12),
              selectableCount: 1
            }
          };
          
          await instance.sock.sendMessage(jid, pollMessage);
          sentType = 'poll';
          log('success', '✅ Enquete (lista) enviada com sucesso!');
        } catch (pollErr) {
          log('warn', \`Enquete falhou: \${pollErr.message}. Usando texto...\`);
          sentType = 'text_list';
        }
      } else {
        sentType = 'text_list';
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // MÉTODO 3: TEXTO FORMATADO (fallback final)
    // ═══════════════════════════════════════════════════════════════════════════════
    if (sentType === 'text_list') {
      let formattedMessage = '';
      
      if (title) {
        formattedMessage += '*' + title + '*\\n\\n';
      }
      
      formattedMessage += content + '\\n';
      
      let optionNumber = 1;
      sections.forEach(section => {
        if (section.title) {
          formattedMessage += '\\n*' + section.title + '*\\n';
        }
        (section.rows || []).forEach(row => {
          formattedMessage += optionNumber + '. ' + row.title;
          if (row.description) {
            formattedMessage += ' - _' + row.description + '_';
          }
          formattedMessage += '\\n';
          optionNumber++;
        });
      });
      
      if (footer) {
        formattedMessage += '\\n_' + footer + '_';
      }
      
      formattedMessage += '\\n\\n_Responda com o número da opção desejada_';
      
      await instance.sock.sendMessage(jid, { text: formattedMessage });
    }
    
    instance.messagesSent = (instance.messagesSent || 0) + 1;
    log('success', \`Lista (\${sentType}) enviada para \${recipient.substring(0, 4)}***\`);
    res.json({ success: true, to: recipient, type: sentType, sectionsCount: sections.length });
  } catch (err) {
    log('error', \`Erro ao enviar lista: \${err.message}\`);
    res.status(500).json({ error: err.message });
  }
});

// Enviar mídia
app.post('/api/instance/:id/send-media', authMiddleware, async (req, res) => {
  const { phone, to, mediaUrl, caption, type } = req.body;
  const recipient = phone || to;
  
  if (!recipient || !mediaUrl) {
    return res.status(400).json({ error: 'phone e mediaUrl são obrigatórios' });
  }
  
  const instance = manager.instances.get(req.params.id);
  if (!instance || !instance.sock) {
    return res.status(404).json({ error: 'Instância não encontrada ou não conectada' });
  }
  
  if (instance.status !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não conectado', code: 'NOT_CONNECTED' });
  }
  
  try {
    const jid = recipient.includes('@') ? recipient : recipient.replace(/\\D/g, '') + '@s.whatsapp.net';
    const mediaType = type || 'image';
    let msg = {};
    
    if (mediaType === 'image') {
      msg = { image: { url: mediaUrl }, caption: caption || '' };
    } else if (mediaType === 'video') {
      msg = { video: { url: mediaUrl }, caption: caption || '' };
    } else if (mediaType === 'audio') {
      msg = { audio: { url: mediaUrl }, mimetype: 'audio/mp4' };
    } else if (mediaType === 'document') {
      msg = { document: { url: mediaUrl }, fileName: caption || 'file' };
    }
    
    await instance.sock.sendMessage(jid, msg);
    
    instance.messagesSent = (instance.messagesSent || 0) + 1;
    log('success', \`Mídia (\${mediaType}) enviada para \${recipient.substring(0, 4)}***\`);
    res.json({ success: true, to: recipient, type: mediaType });
  } catch (err) {
    log('error', \`Erro ao enviar mídia: \${err.message}\`);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINTS DE BACKUP DE SESSÃO (FASE 8)
// ═══════════════════════════════════════════════════════════════════════════════════════════

// Criar backup de sessão
app.post('/api/instance/:id/backup', authMiddleware, async (req, res) => {
  const result = await manager.backupSession(req.params.id);
  res.json(result);
});

// Restaurar sessão de backup
app.post('/api/instance/:id/restore', authMiddleware, async (req, res) => {
  const { backup_id } = req.body;
  const result = await manager.restoreSession(req.params.id, backup_id);
  res.json(result);
});

// Listar backups disponíveis
app.get('/api/instance/:id/backups', authMiddleware, async (req, res) => {
  const result = await manager.listBackups(req.params.id);
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// PROFESSIONAL CLI - MENU INTERATIVO v2.0
// ═══════════════════════════════════════════════════════════════════════════════════════════
let menuMode = process.argv.includes('--menu') || process.argv.includes('-m');

function showBanner() {
  console.clear();
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const uptimeStr = uptime >= 3600 
    ? \`\${Math.floor(uptime/3600)}h \${Math.floor((uptime%3600)/60)}m\` 
    : \`\${Math.floor(uptime/60)}m \${uptime%60}s\`;
  const instances = manager.getAllInstances();
  const connected = instances.filter(i => i.status === 'connected').length;
  
  console.log(\`
\${c.cyan}╔══════════════════════════════════════════════════════════════════════════════════════════╗\${c.reset}
\${c.cyan}║\${c.reset}                                                                                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}    \${c.green}\${c.bold}   ██████╗ ███████╗███╗   ██╗███████╗███████╗██╗███████╗\${c.reset}                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}    \${c.green}\${c.bold}  ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔════╝██║██╔════╝\${c.reset}                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}    \${c.green}\${c.bold}  ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████╗██║███████╗\${c.reset}                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}    \${c.green}\${c.bold}  ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ╚════██║██║╚════██║\${c.reset}                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}    \${c.green}\${c.bold}  ╚██████╔╝███████╗██║ ╚████║███████╗███████║██║███████║\${c.reset}                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}    \${c.green}\${c.bold}   ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝\${c.reset}                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}                                                                                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}            \${c.white}\${c.bold}WhatsApp Multi-Instance Manager v8.2 Enterprise\${c.reset}                             \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}                                                                                          \${c.cyan}║\${c.reset}
\${c.cyan}╠══════════════════════════════════════════════════════════════════════════════════════════╣\${c.reset}
\${c.cyan}║\${c.reset}                                                                                          \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.yellow}🌐 API Endpoint:\${c.reset}  http://0.0.0.0:\${CONFIG.PORT}                                            \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.yellow}🔐 Auth Token:\${c.reset}    \${CONFIG.MASTER_TOKEN.slice(0, 20)}...                                    \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.yellow}📦 Instâncias:\${c.reset}    \${connected}/\${instances.length} conectadas                                              \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.yellow}⏱️  Uptime:\${c.reset}        \${uptimeStr}                                                            \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}  \${c.yellow}💾 RAM:\${c.reset}           \${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / \${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB                                                 \${c.cyan}║\${c.reset}
\${c.cyan}║\${c.reset}                                                                                          \${c.cyan}║\${c.reset}
\${c.cyan}╚══════════════════════════════════════════════════════════════════════════════════════════╝\${c.reset}
\`);
}

function showMenu() {
  const instances = manager.getAllInstances();
  const connected = instances.filter(i => i.status === 'connected').length;
  const waiting = instances.filter(i => i.status === 'waiting_qr').length;
  const degraded = instances.filter(i => i.degraded).length;

  console.log(\`
\${c.cyan}┌────────────────────────────────────────────────────────────────────────────────────────────┐\${c.reset}
\${c.cyan}│\${c.reset}  \${c.bold}\${c.white}📋 MENU GENESIS\${c.reset}           \${c.green}●\${c.reset} \${connected} online   \${c.yellow}●\${c.reset} \${waiting} QR   \${c.red}●\${c.reset} \${degraded} degraded             \${c.cyan}│\${c.reset}
\${c.cyan}├────────────────────────────────────────────────────────────────────────────────────────────┤\${c.reset}
\${c.cyan}│\${c.reset}                                                                                            \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}┌─────────────────────────────┐\${c.reset}   \${c.yellow}┌─────────────────────────────┐\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}│\${c.reset}  \${c.bold}INSTÂNCIAS\${c.reset}                \${c.green}│\${c.reset}   \${c.yellow}│\${c.reset}  \${c.bold}GERENCIAMENTO\${c.reset}             \${c.yellow}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}├─────────────────────────────┤\${c.reset}   \${c.yellow}├─────────────────────────────┤\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}│\${c.reset}  [1] 📋 Listar todas        \${c.green}│\${c.reset}   \${c.yellow}│\${c.reset}  [6] 📊 Status do servidor  \${c.yellow}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}│\${c.reset}  [2] ➕ Criar nova          \${c.green}│\${c.reset}   \${c.yellow}│\${c.reset}  [7] 📜 Ver logs recentes   \${c.yellow}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}│\${c.reset}  [3] 🔗 Conectar            \${c.green}│\${c.reset}   \${c.yellow}│\${c.reset}  [8] 🔄 Auto-conectar todas \${c.yellow}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}│\${c.reset}  [4] 📱 Obter QR Code       \${c.green}│\${c.reset}   \${c.yellow}│\${c.reset}  [9] 🧹 Limpar logs         \${c.yellow}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}│\${c.reset}  [5] 🔌 Desconectar         \${c.green}│\${c.reset}   \${c.yellow}│\${c.reset}  [0] 🚪 Sair do menu        \${c.yellow}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.green}└─────────────────────────────┘\${c.reset}   \${c.yellow}└─────────────────────────────┘\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}                                                                                            \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.magenta}┌─────────────────────────────┐\${c.reset}   \${c.red}┌─────────────────────────────┐\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.magenta}│\${c.reset}  \${c.bold}OPERAÇÕES\${c.reset}                 \${c.magenta}│\${c.reset}   \${c.red}│\${c.reset}  \${c.bold}DANGER ZONE\${c.reset}               \${c.red}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.magenta}├─────────────────────────────┤\${c.reset}   \${c.red}├─────────────────────────────┤\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.magenta}│\${c.reset}  [t] 📨 Teste de envio      \${c.magenta}│\${c.reset}   \${c.red}│\${c.reset}  [d] 🗑️  Deletar instância  \${c.red}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.magenta}│\${c.reset}  [h] ❤️  Health check       \${c.magenta}│\${c.reset}   \${c.red}│\${c.reset}  [r] 🔁 Restart servidor    \${c.red}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.magenta}│\${c.reset}  [b] 💾 Backup sessões      \${c.magenta}│\${c.reset}   \${c.red}│\${c.reset}  [x] ⛔ Forçar desconexão   \${c.red}│\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}  \${c.magenta}└─────────────────────────────┘\${c.reset}   \${c.red}└─────────────────────────────┘\${c.reset}              \${c.cyan}│\${c.reset}
\${c.cyan}│\${c.reset}                                                                                            \${c.cyan}│\${c.reset}
\${c.cyan}└────────────────────────────────────────────────────────────────────────────────────────────┘\${c.reset}
\`);
}

function showLogs() {
  console.log('\\n' + c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
  console.log(c.bold + c.white + '                              📜 LOGS RECENTES                                ' + c.reset);
  console.log(c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
  
  if (logsBuffer.length === 0) {
    console.log(c.yellow + '   Nenhum log registrado ainda.' + c.reset);
  } else {
    const last20 = logsBuffer.slice(-20);
    last20.forEach(log => {
      const typeColors = {
        'info': c.blue,
        'success': c.green,
        'warn': c.yellow,
        'error': c.red,
        'msg': c.magenta,
        'debug': c.dim,
      };
      const color = typeColors[log.type] || c.white;
      const icon = {
        'info': 'ℹ️ ',
        'success': '✅',
        'warn': '⚠️ ',
        'error': '❌',
        'msg': '💬',
        'debug': '🔍',
      }[log.type] || '  ';
      console.log(\`  \${c.dim}\${log.timestamp}\${c.reset} \${icon} \${color}\${log.message.slice(0, 70)}\${c.reset}\`);
    });
  }
  console.log(c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
}

function showInstanceList() {
  const instances = manager.getAllInstances();
  console.log('\\n' + c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
  console.log(c.bold + c.white + '                            📋 INSTÂNCIAS CADASTRADAS                         ' + c.reset);
  console.log(c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
  
  if (instances.length === 0) {
    console.log(c.yellow + '   Nenhuma instância cadastrada. Use [2] para criar uma nova.' + c.reset);
  } else {
    console.log('');
    instances.forEach((inst, i) => {
      const statusIcons = {
        'connected': \`\${c.green}● ONLINE\${c.reset}\`,
        'waiting_qr': \`\${c.yellow}◐ QR CODE\${c.reset}\`,
        'connecting': \`\${c.blue}◔ CONECTANDO\${c.reset}\`,
        'disconnected': \`\${c.red}○ OFFLINE\${c.reset}\`,
      };
      const status = statusIcons[inst.status] || \`\${c.dim}? \${inst.status}\${c.reset}\`;
      const degradedBadge = inst.degraded ? \` \${c.red}[DEGRADED]\${c.reset}\` : '';
      const cooldownBadge = inst.inCooldown ? \` \${c.yellow}[COOLDOWN]\${c.reset}\` : '';
      const phone = inst.phoneNumber ? \`📱 \${inst.phoneNumber}\` : \`\${c.dim}Sem número\${c.reset}\`;
      
      console.log(\`  \${c.cyan}[\${i + 1}]\${c.reset} \${c.bold}\${inst.name}\${c.reset}\`);
      console.log(\`      ID: \${c.dim}\${inst.id.slice(0, 12)}...\${c.reset}\`);
      console.log(\`      Status: \${status}\${degradedBadge}\${cooldownBadge}\`);
      console.log(\`      \${phone}\`);
      console.log('');
    });
  }
  console.log(c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
}

function showServerStatus() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const uptimeStr = uptime >= 3600 
    ? \`\${Math.floor(uptime/3600)}h \${Math.floor((uptime%3600)/60)}m \${uptime%60}s\` 
    : \`\${Math.floor(uptime/60)}m \${uptime%60}s\`;
  const instances = manager.getAllInstances();
  const memUsage = process.memoryUsage();
  
  console.log('\\n' + c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
  console.log(c.bold + c.white + '                            📊 STATUS DO SERVIDOR                             ' + c.reset);
  console.log(c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
  console.log('');
  console.log(\`  \${c.yellow}⏱️  Uptime:\${c.reset}           \${uptimeStr}\`);
  console.log(\`  \${c.yellow}🔌 Porta:\${c.reset}            \${CONFIG.PORT}\`);
  console.log(\`  \${c.yellow}📦 Instâncias:\${c.reset}       \${instances.filter(i => i.status === 'connected').length} online / \${instances.length} total\`);
  console.log('');
  console.log(\`  \${c.cyan}💾 Memória:\${c.reset}\`);
  console.log(\`     Heap usado:      \${Math.round(memUsage.heapUsed / 1024 / 1024)} MB\`);
  console.log(\`     Heap total:      \${Math.round(memUsage.heapTotal / 1024 / 1024)} MB\`);
  console.log(\`     RSS:             \${Math.round(memUsage.rss / 1024 / 1024)} MB\`);
  console.log('');
  console.log(\`  \${c.cyan}🖥️  Sistema:\${c.reset}\`);
  console.log(\`     CPU Load:        \${os.loadavg()[0].toFixed(2)}\`);
  console.log(\`     RAM Total:       \${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB\`);
  console.log(\`     RAM Livre:       \${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB\`);
  console.log(\`     Node.js:         \${process.version}\`);
  console.log('');
  console.log(c.cyan + '═══════════════════════════════════════════════════════════════════════════════' + c.reset);
}

async function handleMenuInput(input) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise(r => rl.question(q, r));

  switch (input.trim().toLowerCase()) {
    case '1':
      showInstanceList();
      break;

    case '2':
      const newId = await question(c.cyan + '   📝 ID da instância (UUID ou deixe vazio para gerar): ' + c.reset);
      const finalId = newId.trim() || crypto.randomUUID();
      const newName = await question(c.cyan + '   📝 Nome da instância: ' + c.reset);
      if (newName) {
        const result = await manager.createInstance(finalId, newName);
        console.log(result.success 
          ? c.green + \`   ✅ Instância "\${newName}" criada com ID: \${finalId.slice(0, 8)}...\` + c.reset 
          : c.red + '   ❌ ' + result.error + c.reset);
      }
      break;

    case '3':
      showInstanceList();
      const connectId = await question(c.cyan + '   🔗 ID ou número da instância para conectar: ' + c.reset);
      if (connectId) {
        const instances = manager.getAllInstances();
        const idx = parseInt(connectId) - 1;
        const targetId = (idx >= 0 && idx < instances.length) ? instances[idx].id : connectId;
        console.log(c.yellow + '   ⏳ Iniciando conexão...' + c.reset);
        const result = await manager.connectInstance(targetId);
        console.log(result.success 
          ? c.green + '   ✅ Conexão iniciada! Escaneie o QR Code.' + c.reset 
          : c.red + '   ❌ ' + result.error + c.reset);
      }
      break;

    case '4':
      showInstanceList();
      const qrId = await question(c.cyan + '   📱 ID ou número da instância: ' + c.reset);
      if (qrId) {
        const instances = manager.getAllInstances();
        const idx = parseInt(qrId) - 1;
        const targetId = (idx >= 0 && idx < instances.length) ? instances[idx].id : qrId;
        const status = manager.getStatus(targetId);
        if (status?.qrCode) {
          console.log('\\n' + c.green + '   ═══════════════════════════════════════' + c.reset);
          console.log(c.green + '   QR Code disponível para escaneamento!' + c.reset);
          console.log(c.green + '   ═══════════════════════════════════════' + c.reset);
          console.log(c.dim + \`   Use a API: GET /api/instance/\${targetId}/qrcode\` + c.reset);
          console.log(c.dim + '   Ou escaneie via painel web.' + c.reset);
        } else {
          console.log(c.yellow + \`   ⚠️  QR Code não disponível. Status: \${status?.status || 'não encontrada'}\` + c.reset);
        }
      }
      break;

    case '5':
      showInstanceList();
      const disconnectId = await question(c.cyan + '   🔌 ID ou número da instância para desconectar: ' + c.reset);
      if (disconnectId) {
        const instances = manager.getAllInstances();
        const idx = parseInt(disconnectId) - 1;
        const targetId = (idx >= 0 && idx < instances.length) ? instances[idx].id : disconnectId;
        const result = await manager.disconnectInstance(targetId);
        console.log(result.success ? c.green + '   ✅ Desconectado!' + c.reset : c.red + '   ❌ ' + result.error + c.reset);
      }
      break;

    case '6':
      showServerStatus();
      break;

    case '7':
      showLogs();
      break;

    case '8':
      console.log(c.yellow + '   ⏳ Auto-conectando todas as instâncias...' + c.reset);
      await manager.autoConnectAll();
      console.log(c.green + '   ✅ Processo de auto-conexão concluído!' + c.reset);
      break;

    case '9':
      logsBuffer = [];
      console.log(c.green + '   ✅ Logs limpos!' + c.reset);
      break;

    case '0':
      menuMode = false;
      console.log('\\n' + c.yellow + '   👋 Menu fechado. Servidor continua rodando em background.' + c.reset);
      console.log(c.dim + '   Execute: node genesis-v8.js --menu para reabrir.' + c.reset);
      console.log('');
      break;

    case 't':
      showInstanceList();
      const sendId = await question(c.cyan + '   📨 ID ou número da instância: ' + c.reset);
      const sendTo = await question(c.cyan + '   📱 Número destino (com DDI, ex: 5511999999999): ' + c.reset);
      const sendMsg = await question(c.cyan + '   💬 Mensagem: ' + c.reset);
      if (sendId && sendTo && sendMsg) {
        const instances = manager.getAllInstances();
        const idx = parseInt(sendId) - 1;
        const targetId = (idx >= 0 && idx < instances.length) ? instances[idx].id : sendId;
        console.log(c.yellow + '   ⏳ Enviando...' + c.reset);
        const result = await manager.sendMessage(targetId, sendTo, sendMsg);
        console.log(result.success ? c.green + '   ✅ Mensagem enviada!' + c.reset : c.red + '   ❌ ' + result.error + c.reset);
      }
      break;

    case 'h':
      console.log(c.yellow + '   ⏳ Executando health check...' + c.reset);
      const instances = manager.getAllInstances();
      for (const inst of instances) {
        const status = inst.status === 'connected' ? c.green + '✅ OK' : c.red + '❌ FAIL';
        console.log(\`   \${inst.name}: \${status}\${c.reset}\`);
      }
      break;

    case 'b':
      console.log(c.yellow + '   ⏳ Fazendo backup das sessões...' + c.reset);
      manager.saveInstances();
      console.log(c.green + '   ✅ Backup salvo em ' + CONFIG.DATA_DIR + c.reset);
      break;

    case 'd':
      showInstanceList();
      const deleteId = await question(c.red + '   🗑️  ID ou número da instância para DELETAR: ' + c.reset);
      const confirmDelete = await question(c.red + '   ⚠️  Confirmar exclusão? (sim/não): ' + c.reset);
      if (deleteId && confirmDelete.toLowerCase() === 'sim') {
        const instances = manager.getAllInstances();
        const idx = parseInt(deleteId) - 1;
        const targetId = (idx >= 0 && idx < instances.length) ? instances[idx].id : deleteId;
        const result = manager.deleteInstance(targetId);
        console.log(result.success ? c.green + '   ✅ Instância deletada!' + c.reset : c.red + '   ❌ ' + result.error + c.reset);
      }
      break;

    case 'r':
      const confirmRestart = await question(c.red + '   ⚠️  Reiniciar servidor? (sim/não): ' + c.reset);
      if (confirmRestart.toLowerCase() === 'sim') {
        console.log(c.yellow + '   🔄 Reiniciando...' + c.reset);
        manager.saveInstances();
        process.exit(0);
      }
      break;

    case 'x':
      showInstanceList();
      const forceId = await question(c.red + '   ⛔ ID ou número da instância para forçar desconexão: ' + c.reset);
      if (forceId) {
        const instances = manager.getAllInstances();
        const idx = parseInt(forceId) - 1;
        const targetId = (idx >= 0 && idx < instances.length) ? instances[idx].id : forceId;
        const inst = manager.instances.get(targetId);
        if (inst?.sock) {
          try { inst.sock.end(); } catch (e) {}
          inst.sock = null;
          inst.status = 'disconnected';
          inst.readyToSend = false;
          console.log(c.green + '   ✅ Conexão forçadamente encerrada!' + c.reset);
        } else {
          console.log(c.yellow + '   ⚠️  Instância não encontrada ou já desconectada.' + c.reset);
        }
      }
      break;

    default:
      console.log(c.red + '   ❌ Opção inválida! Use 0-9, t, h, b, d, r, x' + c.reset);
  }

  rl.close();
  
  if (menuMode) {
    setTimeout(() => {
      showBanner();
      showMenu();
      startMenuListener();
    }, 1500);
  }
}

function startMenuListener() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(c.white + '\\n   ➜ Escolha uma opção: ' + c.reset, (answer) => {
    rl.close();
    handleMenuInput(answer);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// FASE 9: POOL DE VPS - NODE HEARTBEAT
// ═══════════════════════════════════════════════════════════════════════════════════════════
let nodeHeartbeatInterval = null;

async function sendNodeHeartbeat() {
  if (!CONFIG.NODE_ID || !CONFIG.NODE_TOKEN) return;
  
  try {
    // Coletar métricas do sistema
    const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    const instanceCount = manager.getAllInstances().length;
    
    const response = await fetch(\`\${CONFIG.SUPABASE_URL}/functions/v1/genesis-vps-pool\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${CONFIG.SUPABASE_KEY}\`,
        'x-node-token': CONFIG.NODE_TOKEN,
      },
      body: JSON.stringify({
        action: 'node_heartbeat',
        node_id: CONFIG.NODE_ID,
        cpu_load: Math.min(100, cpuUsage.toFixed(2)),
        memory_load: memUsage.toFixed(2),
        instance_count: instanceCount,
        avg_latency: 0,
      }),
    });
    
    const result = await response.json();
    if (result.success) {
      log('info', \`[Pool] Node heartbeat OK - Score: \${result.health_score} | Status: \${result.status}\`);
    }
  } catch (err) {
    // Silencioso
  }
}

function startNodeHeartbeat() {
  if (!CONFIG.NODE_ID || !CONFIG.NODE_TOKEN) {
    log('info', '[Pool] Node não registrado no pool (NODE_ID/NODE_TOKEN não configurados)');
    return;
  }
  
  log('success', \`[Pool] Node registrado: \${CONFIG.NODE_ID}\`);
  log('info', \`[Pool] Região: \${CONFIG.NODE_REGION} | Max Instâncias: \${CONFIG.NODE_MAX_INSTANCES}\`);
  
  // Heartbeat imediato
  sendNodeHeartbeat();
  
  // Heartbeat periódico
  nodeHeartbeatInterval = setInterval(sendNodeHeartbeat, CONFIG.NODE_HEARTBEAT_INTERVAL);
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════════════════
app.listen(CONFIG.PORT, '0.0.0.0', async () => {
  showBanner();
  
  log('success', \`Servidor iniciado na porta \${CONFIG.PORT}\`);
  log('info', 'PM2: pm2 start genesis-v8.js --name genesis');
  log('info', 'Menu: node genesis-v8.js --menu');

  // Iniciar heartbeat do pool (se configurado)
  startNodeHeartbeat();

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
