# Memory: technical/genesis-session-reset-definitive-v24
Updated: just now

## Correção Definitiva: Loop de Conexão WhatsApp (401/Sessão Invalidada)

### Problema Identificado
Quando o WhatsApp desloga a sessão (código 401 do Baileys), o VPS fica em estado `disconnected` sem gerar QR Code, causando loop infinito na UI ("Conectando..." eterno).

### Causa Raiz
1. VPS responde `/qrcode` com `{ qrcode: null, status: "disconnected" }`
2. Banco fica dessincronizado: `status=qr_pending` vs `orchestrated_status=disconnected`
3. UI oscila sem ação clara para o usuário

### Solução Implementada (3 Camadas)

#### Camada 1: Diagnóstico Determinístico
- Função `resetSession` captura cada etapa em `diagnostic` object
- Salva diagnóstico em `genesis_event_logs` para suporte
- Persiste `last_reset_diagnostic` em `session_data`

#### Camada 2: Reset One-Click
Botão "Resetar Sessão" executa fluxo atômico:
1. `POST /disconnect` (best-effort)
2. `DELETE /api/instance/<uuid>` (remove credenciais/sessão no VPS)
3. `POST /api/instances` (recria instância)
4. `POST /api/instance/<uuid>/connect` (inicia geração QR)
5. Transição orquestrada para `qr_pending`
6. Polling até obter QR ou conectar

#### Camada 3: Anti-Loop
- Após 20 tentativas (~30s) sem QR: para e mostra erro acionável
- Cooldown detectado: mostra botão "Resetar Sessão" ao invés de "Conectar"
- Erro exibido com contexto claro ("Sessão expirada", não genérico)

### Alterações Técnicas
- `genesis-backend-proxy`: Aceita método DELETE
- `useGenesisWhatsAppConnection`: Nova função `resetSession()`
- `GenesisWhatsAppConnect`: Botão "Resetar Sessão" aparece em erro/cooldown

### Fluxo de Uso
1. Usuário vê erro "Sessão expirada"
2. Clica em "Resetar Sessão"
3. Sistema apaga e recria instância no VPS
4. Novo QR Code aparece em ~30s
5. Escaneamento conecta normalmente
