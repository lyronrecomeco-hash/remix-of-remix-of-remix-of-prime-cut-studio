
# 🔧 PLANO DE IMPLEMENTAÇÃO COMPLETO

---

## 1. 🃏 CARDS PROPOSTAS ACEITAS — Alinhamento Visual
**Problema:** Cards desalinhados no layout de Propostas Aceitas.
**Ação:**
- Padronizar altura mínima dos cards com `min-h` uniforme
- Alinhar badges de nicho, estrelas, endereço, telefone e botões (WhatsApp, Engine, link externo) em posições fixas
- Garantir que cards com mais/menos dados mantenham a mesma estrutura visual
- Grid responsivo: 1 col mobile, 2 col tablet, 3 col desktop

---

## 2. ❓ ENGINE — Modal "Como Funciona"
**Ação:**
- Adicionar ícone `HelpCircle` (?) no topo do Engine
- Ao clicar, abre modal com:
  - Título: "Como funciona o Genesis Engine"
  - Badge: "Em fase de testes"
  - Explicação detalhada: o que é, como usar os blocos, categorias (CONTEXTO, DECISÃO, AÇÃO, CONTROLE, SAÍDA), como executar workflows
  - Dicas de uso e limitações atuais
  - Design consistente com o sistema (glassmorphism, tokens do design system)

---

## 3. 🚀 OTIMIZAÇÃO DO PROMPT DE GERAÇÃO DE SITES
**Ação:**
- Refinar `generateAdvancedPrompt.ts` para:
  - Melhorar estrutura de Design System (paletas HSL mais sofisticadas, tipografia avançada)
  - Enriquecer seção de Backend com exemplos de endpoints, middlewares e validações
  - Adicionar seção de Performance (lazy loading, code splitting, cache strategies)
  - Melhorar seção de SEO (JSON-LD, Open Graph, sitemap)
  - Incluir seção de Acessibilidade (ARIA, contraste, navegação por teclado)
  - Manter compatibilidade com todas as plataformas (Lovable, v0, Cursor, etc.)

---

## 4. 💳 CORREÇÃO CAKTO — Estorno Santiago
**Problema:** Santiago dos Santos Canossa fez estorno mas aparece como "pago" no sistema.
**Ação:**
- Consultar `checkout_payments` e `genesis_subscriptions` para identificar o registro
- Atualizar status do pagamento para `refunded`
- Desativar assinatura (`is_active: false`, status `cancelled`)
- Verificar que o webhook de estorno está processando corretamente futuros casos
- NÃO alterar nenhuma outra lógica existente

---

## 5. 🔒 SEGURANÇA E SUPORTE MULTI-USUÁRIO
**Ação:**
- Implementar rate limiting por IP/user nas Edge Functions críticas
- Adicionar headers de segurança (X-Frame-Options, X-Content-Type-Options, CSP)
- Connection pooling — verificar que queries usam `.maybeSingle()` onde necessário
- Validação de input em todas as Edge Functions
- Proteção contra SQL injection em queries dinâmicas
- Garantir que RLS está ativo em todas as tabelas sensíveis

---

## 6. 🧠 IA AUTÔNOMA — Aprendizado por Prompt
**Ação:**
- Criar tabela `prompt_learning_history` para armazenar prompts gerados e seus contextos
- Implementar sistema de feedback implícito (prompts que geram projetos = sucesso)
- Na geração de novos prompts, consultar histórico para enriquecer com padrões que funcionaram
- Edge Function `prompt-intelligence` que analisa padrões e sugere melhorias automaticamente
- Integração transparente no fluxo de criação (não muda UX, apenas melhora qualidade)

---

## 7. 📡 RADAR GLOBAL — Botão Salvar
**Ação:**
- Adicionar botão "Salvar" (ícone BookmarkPlus) ao lado de "Ver Perfil" nos resultados do Radar
- Ao clicar, salva empresa em `affiliate_proposals` com source = 'radar'
- Feedback visual com toast de confirmação
- Prevenir duplicatas (verificar se já existe por nome + cidade)

---

## 8. 🔑 SERPER — Nova Key em Rotação
**Nova chave:** `398d08db92a3bdc6ab271b25f4f15619228f0cd5`
**Ação:**
- Adicionar como secret `SERPER_API_KEY_2`
- Atualizar Edge Functions de busca para rotacionar entre `SERPER_API_KEY` e `SERPER_API_KEY_2`
- No gerenciador de keys do admin, exibir ambas as chaves com:
  - Nome/label
  - Status (ativa/inativa)
  - Último uso
  - Contador de requisições
- Corrigir dados exibidos para serem precisos

---

## 9. 💬 SUPORTE LIVE CHAT VIA TELEGRAM
**Arquitetura completa:**

### 9a. Frontend — Chat de Suporte Redesenhado
- Quando usuário digita "suporte" ou similar:
  - Botão WhatsApp (existente)
  - **NOVO:** Botão "Chat com Equipe"
- Ao escolher "Chat com Equipe":
  - Mensagem: "Conectando à equipe Genesis..."
  - Cria sessão de suporte na tabela `support_chat_sessions`
  - Header muda para: Avatar + "Equipe Genesis" + badge "Online agora" (quando admin aceita)
  - Chat em tempo real via Supabase Realtime na tabela `support_chat_messages`

### 9b. Telegram Bot — Notificação de Reports
- Bot token: `8682592618:AAFtm4eyffbspScQ0LRm9miKGKiY7ltbR94`
- Quando nova sessão é criada:
  - Edge Function envia mensagem ao Telegram com:
    - "🆕 Novo Report de Suporte"
    - Nome, email do usuário
    - Descrição/primeira mensagem
    - Botão inline: "✅ Aceitar Report"
- Ao clicar "Aceitar":
  - Sessão status → `active`
  - No chat do site: aparece "Online agora" com avatar de atendente
  - Todas as mensagens do admin via Telegram são sincronizadas em tempo real no chat do site

### 9c. Sincronização Bidirecional
- **Admin responde no Telegram** → Edge Function recebe via polling → insere em `support_chat_messages` → Realtime atualiza chat do site
- **Usuário responde no site** → Insert em `support_chat_messages` → Edge Function notifica Telegram
- **Admin fecha** → Comando `/fechar` ou botão no Telegram → Status `closed` → IA Genesis envia mensagem automática de encerramento

### 9d. Tabelas necessárias:
```
support_chat_sessions: id, user_id, user_name, user_email, status (waiting/active/closed), admin_telegram_chat_id, created_at, closed_at
support_chat_messages: id, session_id, sender_type (user/admin/system), message, created_at
```

### 9e. Painel Admin — Configuração Bot
- Em Configurações (apenas conta master):
  - Toggle: Ativar/Desativar bot de suporte
  - Chat ID do Telegram configurável
  - Status da conexão do bot
  - Histórico de sessões recentes

---

## 10. 🎨 DESIGN DO CHAT DE SUPORTE — Alto Nível
**Ação:**
- Redesign profissional do widget de chat:
  - Header com gradiente sutil, avatar do atendente, status online/offline
  - Bolhas de mensagem com timestamp, diferentes cores para user vs admin
  - Indicador de "digitando..."
  - Transição suave entre IA e atendente humano
  - Animações de entrada/saída de mensagens
  - Scroll automático suave
  - Responsivo e acessível

---

## ORDEM DE EXECUÇÃO:
1. Correção Cakto (dados) — item 4
2. Secret Serper — item 8
3. Migration tabelas suporte — item 9d
4. Cards Propostas Aceitas — item 1
5. Engine Help Modal — item 2
6. Radar Save — item 7
7. Gerenciador de Keys — item 8
8. Prompt otimização — item 3
9. IA Autônoma — item 6
10. Segurança — item 5
11. Suporte Telegram + Chat redesign — itens 9 e 10

**Estimativa:** Implementação completa em uma única sessão.
**Risco:** Zero alterações em lógicas existentes que funcionam.
