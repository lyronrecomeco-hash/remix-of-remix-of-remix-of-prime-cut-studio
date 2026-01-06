# Memory: technical/genesis/v8-welcome-message-logic-fix
Updated: just now

A lógica de envio de mensagens automáticas após a conexão do WhatsApp foi corrigida definitivamente para suportar o backend VPS V8 e evitar race conditions.

## Problema Anterior:
1. O endpoint `/status` do backend V8 retornava apenas `connected: true` sem o campo `readyToSend: true`. O frontend aguardava 10 tentativas esperando `readyToSend`, que nunca vinha, e então pulava o envio.
2. **Race condition crítica**: O `safeSetState()` era chamado ANTES do `sendWelcomeMessage()`, causando um re-render que podia cancelar a operação ou perder o contexto.

## Correção Implementada:
1. **Envio incondicional**: Ao detectar `connected: true`, o sistema agora envia a mensagem de teste IMEDIATAMENTE, independente do valor de `readyToSend`.
2. **Ordem de execução blindada**: 
   - `stopPolling()` primeiro (evitar race)
   - `updateInstanceInDB()` segundo (persistir status)
   - `sendWelcomeMessage()` TERCEIRO (com try/catch isolado)
   - `safeSetState()` por ÚLTIMO (após envio concluído)
3. **Try/catch isolado**: O envio da mensagem agora tem tratamento de erro isolado para não afetar o fluxo de conexão.
4. **Normalização BR automática**: Números de 10 ou 11 dígitos recebem prefixo `55` automaticamente.

## Fluxo Atual:
1. Polling detecta `connected: true`
2. Para polling imediatamente
3. Atualiza banco com status 'connected'
4. Envia mensagem de teste (com normalização BR)
5. Só DEPOIS atualiza o state React
6. Toast de sucesso baseado no resultado do envio
