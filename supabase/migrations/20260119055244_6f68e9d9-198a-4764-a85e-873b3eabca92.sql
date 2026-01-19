-- =============================================
-- MÓDULO DE CONTRATOS JURÍDICOS - GENESIS
-- =============================================

-- Tabela principal de contratos
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'partially_signed', 'signed', 'cancelled', 'expired')),
  
  -- Dados do Contratante
  contractor_name TEXT NOT NULL,
  contractor_document TEXT NOT NULL,
  contractor_document_type TEXT NOT NULL DEFAULT 'cpf' CHECK (contractor_document_type IN ('cpf', 'cnpj')),
  contractor_address TEXT NOT NULL,
  contractor_email TEXT,
  contractor_phone TEXT,
  
  -- Dados do Contratado
  contracted_name TEXT NOT NULL,
  contracted_document TEXT NOT NULL,
  contracted_document_type TEXT NOT NULL DEFAULT 'cpf' CHECK (contracted_document_type IN ('cpf', 'cnpj')),
  contracted_address TEXT NOT NULL,
  contracted_email TEXT,
  contracted_phone TEXT,
  
  -- Objeto do Contrato
  service_type TEXT NOT NULL,
  service_description TEXT NOT NULL,
  service_modality TEXT NOT NULL DEFAULT 'pontual' CHECK (service_modality IN ('pontual', 'recorrente', 'demanda')),
  delivery_type TEXT DEFAULT 'digital' CHECK (delivery_type IN ('digital', 'fisico', 'ambos')),
  
  -- Prazo
  start_date DATE NOT NULL,
  end_date DATE,
  delivery_in_stages BOOLEAN DEFAULT false,
  allows_extension BOOLEAN DEFAULT false,
  
  -- Valores e Pagamento
  total_value DECIMAL(15,2) NOT NULL,
  payment_method TEXT NOT NULL,
  installments INTEGER DEFAULT 1,
  late_fee_percentage DECIMAL(5,2),
  
  -- Garantias e Responsabilidades
  has_warranty BOOLEAN DEFAULT false,
  warranty_period TEXT,
  liability_limit TEXT,
  not_included TEXT,
  
  -- Rescisão
  allows_early_termination BOOLEAN DEFAULT true,
  termination_penalty_percentage DECIMAL(5,2),
  notice_period_days INTEGER DEFAULT 30,
  
  -- Foro
  jurisdiction_city TEXT NOT NULL,
  jurisdiction_state TEXT NOT NULL,
  
  -- Conteúdo do contrato gerado
  generated_content TEXT,
  pdf_url TEXT,
  
  -- Hash único para assinatura
  signature_hash TEXT NOT NULL UNIQUE,
  signature_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  questionnaire_answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de assinaturas
CREATE TABLE public.contract_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  signer_type TEXT NOT NULL CHECK (signer_type IN ('contractor', 'contracted', 'witness')),
  signer_name TEXT NOT NULL,
  signer_document TEXT NOT NULL,
  signer_email TEXT,
  signer_phone TEXT,
  
  -- Dados da assinatura
  signature_image TEXT,
  signature_method TEXT DEFAULT 'manual' CHECK (signature_method IN ('manual', 'govbr', 'draw')),
  
  -- Status
  signed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  geolocation TEXT,
  
  -- Validação
  verification_code TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de logs de auditoria
CREATE TABLE public.contract_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_type TEXT CHECK (actor_type IN ('system', 'affiliate', 'contractor', 'contracted')),
  actor_id TEXT,
  actor_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Affiliates can view own contracts"
  ON public.contracts FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can create contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can update own contracts"
  ON public.contracts FOR UPDATE
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can delete draft contracts"
  ON public.contracts FOR DELETE
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
    AND status = 'draft'
  );

-- Public access for signature by hash
CREATE POLICY "Anyone can view contract by signature hash"
  ON public.contracts FOR SELECT
  USING (true);

-- RLS Policies for signatures
CREATE POLICY "Affiliates can view signatures of own contracts"
  ON public.contract_signatures FOR SELECT
  USING (
    contract_id IN (
      SELECT c.id FROM public.contracts c
      JOIN public.affiliates a ON c.affiliate_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can add signature to contract"
  ON public.contract_signatures FOR INSERT
  WITH CHECK (true);

-- RLS for audit logs
CREATE POLICY "Affiliates can view audit logs of own contracts"
  ON public.contract_audit_logs FOR SELECT
  USING (
    contract_id IN (
      SELECT c.id FROM public.contracts c
      JOIN public.affiliates a ON c.affiliate_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.contract_audit_logs FOR INSERT
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_contracts_affiliate_id ON public.contracts(affiliate_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_signature_hash ON public.contracts(signature_hash);
CREATE INDEX idx_contract_signatures_contract_id ON public.contract_signatures(contract_id);
CREATE INDEX idx_contract_audit_logs_contract_id ON public.contract_audit_logs(contract_id);