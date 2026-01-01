-- =====================================================
-- FASE 1: Sistema de Propostas Empresariais para Afiliados
-- =====================================================

-- Enum para status da proposta
CREATE TYPE proposal_status AS ENUM (
  'draft',      -- Em elaboração
  'sent',       -- Enviada
  'accepted',   -- Aceita
  'cancelled'   -- Cancelada
);

-- Tabela principal de propostas empresariais
CREATE TABLE public.affiliate_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  
  -- Dados da empresa
  company_name TEXT NOT NULL,
  company_email TEXT,
  company_phone TEXT,
  company_cnpj TEXT,
  contact_name TEXT,
  
  -- Status e controle
  status proposal_status NOT NULL DEFAULT 'draft',
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Notas e observações
  notes TEXT
);

-- Índices para performance
CREATE INDEX idx_affiliate_proposals_affiliate_id ON public.affiliate_proposals(affiliate_id);
CREATE INDEX idx_affiliate_proposals_status ON public.affiliate_proposals(status);
CREATE INDEX idx_affiliate_proposals_created_at ON public.affiliate_proposals(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.affiliate_proposals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Afiliados só podem ver/gerenciar suas próprias propostas
CREATE POLICY "Affiliates can view own proposals"
ON public.affiliate_proposals
FOR SELECT
USING (affiliate_id = get_affiliate_id(auth.uid()));

CREATE POLICY "Affiliates can create own proposals"
ON public.affiliate_proposals
FOR INSERT
WITH CHECK (affiliate_id = get_affiliate_id(auth.uid()));

CREATE POLICY "Affiliates can update own proposals"
ON public.affiliate_proposals
FOR UPDATE
USING (affiliate_id = get_affiliate_id(auth.uid()));

CREATE POLICY "Affiliates can delete own draft proposals"
ON public.affiliate_proposals
FOR DELETE
USING (affiliate_id = get_affiliate_id(auth.uid()) AND status = 'draft');

-- Owner pode gerenciar todas as propostas
CREATE POLICY "Owner can manage all proposals"
ON public.affiliate_proposals
FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_affiliate_proposals_updated_at
BEFORE UPDATE ON public.affiliate_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();