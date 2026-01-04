# Memory: technical/genesis-vps-script-v7-enterprise

O Genesis VPS Script v7.0 Enterprise é a versão de produção para rodar instâncias WhatsApp 24/7 em VPS. Características principais:

## Features Enterprise
- **Multi-instância**: Suporte a nome customizado por instância (INSTANCE_NAME)
- **Rate Limiting**: 100 req/min com proteção automática (429 Too Many Requests)
- **Auto-restart**: Exceções não encerram o processo, apenas logam
- **Health Endpoint**: `/health` retorna métricas completas com token
- **Webhook de Status**: Notifica Supabase automaticamente em mudanças de conexão
- **Logs Customizados**: 3 níveis (minimal, operational, debug) via LOG_LEVEL

## Estabilidade `ready_to_send`
O script implementa um flag `ready_to_send` que só fica `true` após 3 segundos da conexão `open`, garantindo que o socket está estabilizado antes de aceitar envios. Isso resolve o problema de mensagens falhando imediatamente após conexão.

## Integração com Frontend
O hook `useGenesisWhatsAppConnection` aguarda `ready_to_send: true` do backend antes de tentar enviar a mensagem de teste automática, com polling de até 10 segundos para verificar a estabilização.

## Execução
```bash
# VPS com PM2 (recomendado)
pm2 start whatsapp-vps-v7.js --name genesis-whatsapp

# Variáveis de ambiente opcionais
LOG_LEVEL=operational  # minimal | operational | debug
PORT=3001
```

## Arquivos
- Script: `src/components/genesis/scripts/vps-script-v7.ts`
- Export: `src/components/genesis/scripts/index.ts`
- Download: InstancePanel > Informações Técnicas > Baixar Script
