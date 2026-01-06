# Memory: technical/genesis/v8-welcome-message-logic-fix
Updated: just now

A lógica de envio de mensagens automáticas após a conexão do WhatsApp foi corrigida definitivamente para suportar o backend VPS V8. 

## Problema Anterior:
O endpoint `/status` do backend V8 retornava apenas `connected: true` sem o campo `readyToSend: true`. O frontend aguardava 10 tentativas (10s) esperando `readyToSend`, que nunca vinha, e então pulava o envio da mensagem de teste.

## Correção Implementada:
1. **Envio incondicional**: Ao detectar `connected: true`, o sistema agora envia a mensagem de teste IMEDIATAMENTE, independente do valor de `readyToSend`.
2. **Polling com timeout**: O polling de conexão após QR Code tem timeout de 60s e usa `pollingRef` corretamente.
3. **Tratamento correto de generateQRCode**: A função retorna `string | null` (QR code ou literal 'CONNECTED'), não um objeto.
4. **Resetar contadores após sucesso**: `connectAttemptsRef` e `cooldownUntilRef` são zerados após conexão bem-sucedida para evitar loops.

## Fluxo Atual:
1. Usuário clica "Conectar"
2. Sistema detecta flavor (V8/legacy) e cria instância se necessário
3. Verifica status real no backend
4. Se `connected: true`:
   - Atualiza banco com status 'connected'
   - Envia mensagem de teste (sem aguardar `readyToSend`)
   - Reseta contadores de tentativas
   - Mostra toast de sucesso
5. Se não conectado:
   - Gera QR Code
   - Inicia polling com timeout de 60s
   - Ao conectar, envia teste e reseta contadores
