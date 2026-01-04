# Memory: technical/whatsapp-vps-v8-enterprise-script-final
Updated: just now

A infraestrutura de WhatsApp utiliza o script VPS Enterprise (v8.0) que suporta múltiplas instâncias dinâmicas (não limitado à 'Principal') com nomes customizados, rate limiting, auto-restart, health endpoint e webhooks de status. 

## Características v8.0:
- **Multi-instância dinâmica**: Instâncias são criadas sob demanda via `POST /api/instances` com `instanceId` e `name`
- **Menu interativo**: Executar com `node genesis-v8.js --menu` para gerenciamento via terminal
- **PM2 Ready**: Rodar 24h via `pm2 start genesis-v8.js --name genesis && pm2 save`
- **Auto-connect**: Restaura conexões automaticamente ao iniciar
- **Ready-to-send**: Valida estabilidade do socket por 3s antes de marcar como pronto

## Endpoints da API v8:
- `GET /health` - Health check sem auth
- `GET /api/instances` - Lista todas instâncias
- `POST /api/instances` - Cria nova instância `{ instanceId, name }`
- `GET /api/instance/:id/status` - Status da instância
- `POST /api/instance/:id/connect` - Inicia conexão (gera QR se necessário)
- `POST /api/instance/:id/disconnect` - Desconecta
- `DELETE /api/instance/:id` - Remove instância
- `GET /api/instance/:id/qrcode` - Obtém QR code atual
- `POST /api/instance/:id/send` - Envia mensagem `{ phone, message }`

## Fluxo de conexão (frontend):
1. Verificar health do backend
2. **Criar instância** via `POST /api/instances` se não existir (hook `ensureInstanceExists`)
3. Chamar `POST /api/instance/:id/connect` para iniciar conexão
4. Polling em `GET /api/instance/:id/qrcode` para obter QR
5. Aguardar `readyToSend: true` no status antes de enviar mensagens

## Integração com Supabase:
- Heartbeats enviados para `genesis-heartbeat` edge function
- Instâncias sincronizadas com tabela `genesis_instances`
- Logs em `genesis_event_logs`
