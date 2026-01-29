
# Plano de Implementação: Sistema de Alta Precisão para Busca de Leads + Análise de Anúncios

## Visão Geral

Este plano implementa um sistema completo de enriquecimento de leads que eleva a precisão de ~60% para 95%+, incluindo validação de contatos, health check de websites, scoring via IA e **detecção de anúncios ativos** (Meta Ads/Google Ads).

---

## Parte 1: Novas Tabelas no Database

### Tabelas a Criar

| Tabela | Descrição |
|--------|-----------|
| `enriched_leads` | Armazena dados enriquecidos de cada lead |
| `lead_validations` | Cache de validações de email/telefone |
| `website_health_checks` | Status de saúde dos websites |
| `lead_ads_analysis` | Dados de anúncios ativos detectados |
| `enrichment_cache` | Cache geral para economia de API calls |

### Campos Chave da `lead_ads_analysis`

- `has_meta_ads`: boolean (Facebook/Instagram)
- `has_google_ads`: boolean
- `ad_platforms`: array de plataformas
- `ad_status`: 'active' | 'paused_recently' | 'inactive' | 'unknown'
- `campaign_types`: array (branding, traffic, conversion, leads, ecommerce)
- `investment_indicator`: 'recurring' | 'sporadic' | 'none' | 'unknown'
- `last_ad_detected_at`: timestamp

---

## Parte 2: Novas Edge Functions

### 2.1 `enrich-lead-complete` (Pipeline Principal)

Orquestra todo o processo de enriquecimento:
1. Recebe dados básicos do lead
2. Chama as sub-funções em paralelo
3. Consolida resultados
4. Calcula score final via IA
5. Salva no banco

### 2.2 `validate-contact` (Email + Telefone)

- Valida sintaxe de email
- Verifica MX records do domínio
- Detecta emails temporários/catch-all
- Valida formato de telefone por país
- Detecta se é celular ou fixo

### 2.3 `check-website-health`

- Verifica HTTP status (200, 404, 500)
- Valida SSL (válido/expirado/ausente)
- Detecta tempo de carregamento
- Identifica tecnologias (WordPress, Wix, etc.)
- Determina se site está ativo ou abandonado

### 2.4 `detect-ads-activity` (NOVO - Análise de Anúncios)

Detecta investimento em tráfego pago:
- **Meta Ads Library API**: Busca anúncios ativos no Facebook/Instagram
- **Análise de Pixels**: Detecta Meta Pixel e Google Tag no website
- **Indícios de campanhas**: UTMs, landing pages típicas
- Retorna: plataformas, status, tipos de campanha

### 2.5 `score-lead-ai`

- Usa Lovable AI (Gemini) para análise contextual
- Inputs: todos os dados enriquecidos
- Outputs: score 0-100, pain points, recomendações

---

## Parte 3: Fluxo de Enriquecimento

```text
┌─────────────────────────────────────────────────────────────────┐
│                  BUSCA (Radar / Encontrar Cliente)              │
│                              ↓                                   │
│              Resultados básicos do Serper API                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              CLICK NO CARD → ABRE MODAL DETALHADO               │
│                              ↓                                   │
│              Dispara enrich-lead-complete em background         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE DE ENRIQUECIMENTO                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ validate-    │  │ check-       │  │ detect-ads-  │           │
│  │ contact      │  │ website      │  │ activity     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         ↓                 ↓                 ↓                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  score-lead-ai (Lovable AI)              │   │
│  │     Análise contextual + Score + Recomendações           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MODAL DE ANÁLISE COMPLETA                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ HEADER: Nome + Score + Nível de Oportunidade                ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ SEÇÃO 1: Contato Validado                                   ││
│  │   ✓ Email válido  ✓ WhatsApp detectado  ✗ Fixo             ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ SEÇÃO 2: Presença Digital                                   ││
│  │   Website: ✗ Inexistente | SSL: N/A | Tecnologia: N/A      ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ SEÇÃO 3: Anúncios Ativos (NOVO)                             ││
│  │   Meta Ads: ✓ Ativo | Google Ads: ✗ Não detectado          ││
│  │   Tipo: Tráfego | Investimento: Recorrente                 ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ SEÇÃO 4: Análise IA                                         ││
│  │   Pain Points + Serviços Recomendados + Pitch Sugerido     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ FOOTER: Botões WhatsApp/Email + Aceitar/Rejeitar/Salvar    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Parte 4: Alterações no Frontend

### 4.1 Modal de Análise Completa (`GenesisBusinessDetailModal.tsx`)

Reorganizar em seções expandidas:

1. **Header**: Nome, categoria, score badge, nível
2. **Seção Contato Validado**: Ícones de status para email/telefone/WhatsApp
3. **Seção Presença Digital**: Status do website, SSL, tecnologias
4. **Seção Anúncios** (NOVA): Cards para Meta Ads e Google Ads
5. **Seção Análise IA**: Description, pain points, serviços
6. **Seção Valor Estimado**: Min/Max + Recorrência
7. **Footer**: Botões de ação

### 4.2 Componente `LeadEnrichmentPanel` (Novo)

Componente reutilizável para exibir dados enriquecidos em ambos:
- `GenesisBusinessDetailModal.tsx`
- `GlobalRadarCard.tsx` (modal interno)

### 4.3 Loading State

Enquanto o enriquecimento processa:
- Skeleton loading nas seções
- Badge "Analisando..." no header
- Seções aparecem conforme dados chegam

---

## Parte 5: Detecção de Anúncios (Detalhamento)

### Fontes de Dados

| Fonte | O que detecta | Precisão |
|-------|---------------|----------|
| **Meta Ad Library API** | Anúncios ativos FB/IG | Alta |
| **Scraping de Pixels** | Meta Pixel no site | Média |
| **Google Tag Detection** | Google Ads Tag | Média |
| **UTM Analysis** | Padrões de campanha | Baixa |

### Lógica de Detecção

```text
1. Buscar no Meta Ad Library por nome da empresa
   → Se encontrar: has_meta_ads = true, extrair tipo de campanha

2. Se empresa tem website:
   → Fazer request HEAD e analisar scripts
   → Detectar: fbq(), gtag(), _gaq, etc.

3. Classificar tipo de campanha:
   → Branding: awareness, reach, video views
   → Tráfego: traffic, link clicks
   → Conversão: conversions, catalog sales
   → Leads: lead generation
   → E-commerce: catalog, dynamic ads

4. Determinar recorrência:
   → 3+ anúncios ativos = recurring
   → 1-2 anúncios = sporadic
   → Nenhum = none
```

### Status Retornados

| Status | Descrição |
|--------|-----------|
| `active` | Anúncios rodando agora |
| `paused_recently` | Teve anúncios nos últimos 30 dias |
| `inactive` | Sem anúncios detectados |
| `unknown` | Não foi possível verificar |

---

## Parte 6: Sistema de Cache

### Estratégia

| Dado | TTL | Motivo |
|------|-----|--------|
| Validação de email | 7 dias | Raramente muda |
| Validação de telefone | 7 dias | Raramente muda |
| Website health | 1 hora | Pode mudar |
| Detecção de anúncios | 24 horas | Muda com frequência |
| Score IA | 24 horas | Baseado em dados que mudam |

### Lógica

```text
1. Antes de enriquecer, verificar cache
2. Se cache válido, usar dados do cache
3. Se expirado ou inexistente, buscar novo
4. Salvar no cache com timestamp
```

---

## Parte 7: Arquivos a Criar/Modificar

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/enrich-lead-complete/index.ts` | Pipeline principal |
| `supabase/functions/validate-contact/index.ts` | Validação email/telefone |
| `supabase/functions/check-website-health/index.ts` | Health check |
| `supabase/functions/detect-ads-activity/index.ts` | Detecção de anúncios |
| `supabase/functions/score-lead-ai/index.ts` | Scoring via Lovable AI |
| `src/components/genesis-ia/LeadEnrichmentPanel.tsx` | Componente de exibição |
| `src/hooks/useLeadEnrichment.ts` | Hook para gerenciar estado |

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `GenesisBusinessDetailModal.tsx` | Integrar `LeadEnrichmentPanel` |
| `GlobalRadarCard.tsx` | Integrar `LeadEnrichmentPanel` no modal |
| `supabase/config.toml` | Adicionar novas funções |

---

## Parte 8: Ordem de Implementação

### Fase 1 - Database (Primeiro)
1. Criar tabelas de cache e enriquecimento
2. Criar índices para performance

### Fase 2 - Edge Functions Básicas
3. `validate-contact` - Validação de contatos
4. `check-website-health` - Health check

### Fase 3 - Edge Functions Avançadas
5. `detect-ads-activity` - Detecção de anúncios
6. `score-lead-ai` - Scoring com IA

### Fase 4 - Orquestração
7. `enrich-lead-complete` - Pipeline completo

### Fase 5 - Frontend
8. `LeadEnrichmentPanel` - Componente de exibição
9. `useLeadEnrichment` - Hook de estado
10. Integrar nos modais existentes

---

## Resultado Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Precisão de contatos | ~60% | ~95% |
| Detecção de WhatsApp | Não | Sim |
| Health check de sites | Não | Sim |
| Detecção de anúncios | Não | Sim |
| Score de oportunidade | Básico | IA-powered |
| Cache inteligente | Não | Sim |

### Novo Modal de Análise

O modal passará a exibir:
- Status de validação dos contatos (ícones visuais)
- Health check do website com detalhes
- Cards de Meta Ads e Google Ads
- Análise completa via IA
- Pain points identificados
- Pitch personalizado sugerido

Tudo organizado em seções colapsáveis, seguindo o padrão de design existente (glassmorphism, cores do tema).
