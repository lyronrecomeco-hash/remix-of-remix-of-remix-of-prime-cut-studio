# Memory: technical/whatsapp-vps-v8-enterprise-script-final
Updated: 2026-01-07

A infraestrutura de WhatsApp utiliza o script VPS Enterprise (v8.1) com integração completa ao Chatbot Engine e Flow Builder.

## Características v8.1:
- **Multi-instância dinâmica**: Instâncias são criadas sob demanda via `POST /api/instances` com `instanceId` e `name`
- **Integração Chatbot Engine**: Mensagens recebidas são encaminhadas automaticamente para o `chatbot-engine` Edge Function
- **Integração Flow Builder**: Se chatbot não tratar a mensagem, é encaminhada para `whatsapp-automation-worker`
- **Menu interativo**: Executar com `node genesis-v8.js --menu` para gerenciamento via terminal
- **PM2 Ready**: Rodar 24h via `pm2 start genesis-v8.js --name genesis && pm2 save`
- **Auto-connect**: Restaura conexões automaticamente ao iniciar
- **Ready-to-send**: Valida estabilidade do socket por 3s antes de marcar como pronto
- **Auth flexível**: Aceita MASTER_TOKEN do script OU backend_token da instância

## Fluxo de Mensagens (v8.1):
```
[WhatsApp] → [VPS Script] → [forwardToEngines()]
                              ↓
                    [chatbot-engine] (prioridade 1)
                              ↓ (se não tratou)
                    [whatsapp-automation-worker] (flow builder)
```

## Método forwardToEngines() (NOVO):
```javascript
async forwardToEngines(instanceId, from, message, messageId) {
  // 1. Tenta chatbot-engine primeiro
  const chatbotResult = await fetch(`${SUPABASE_URL}/functions/v1/chatbot-engine`, {
    body: JSON.stringify({
      action: 'process_message',
      from, message, instanceId, messageId
    })
  });
  
  if (chatbotResult.success && chatbotResult.chatbotId) {
    // Chatbot tratou - parar aqui
    return;
  }
  
  // 2. Se não tratou, tenta flow builder
  await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-automation-worker`, {
    body: JSON.stringify({
      source: 'vps_message',
      event_type: 'message_received',
      event_data: { from, message, instanceId, phone: from, text: message }
    })
  });
}
```

## Endpoints da API v8:
- `GET /health` - Health check sem auth
- `GET /api/instances` - Lista todas instâncias
- `POST /api/instances` - Cria nova instância `{ instanceId, name }`
- `GET /api/instance/:id/status` - Status da instância
- `POST /api/instance/:id/connect` - Inicia conexão (gera QR se necessário)
- `POST /api/instance/:id/disconnect` - Desconecta
- `DELETE /api/instance/:id` - Remove instância
- `GET /api/instance/:id/qrcode` - Obtém QR code atual
- `POST /api/instance/:id/send` - Envia mensagem `{ to/phone, message }`

## Atualizar Script no VPS:
1. Copiar novo código do painel (Configurações → Script VPS)
2. Parar PM2: `pm2 stop genesis`
3. Substituir arquivo: `nano genesis-v8.js`
4. Reiniciar: `pm2 start genesis && pm2 save`

## Edge Functions Relacionadas:
- `chatbot-engine` - Processa chatbots configurados (palavras-chave, IA Luna)
- `whatsapp-automation-worker` - Executa flows do Flow Builder
- `genesis-backend-proxy` - Proxy para envio de mensagens
- `genesis-heartbeat` - Recebe heartbeats do VPS
