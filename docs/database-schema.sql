-- ========================================
-- SCHEMA DO SISTEMA DE GESTÃO DE CONTRATOS
-- Execute este script no SQL Editor do Supabase
-- ========================================

-- 1. ENUMS
-- ========================================

CREATE TYPE public.contract_status AS ENUM (
  'draft',
  'pending_approval',
  'active',
  'expiring_soon',
  'closed',
  'renewed'
);

CREATE TYPE public.contract_type AS ENUM ('one_time', 'recurring');

CREATE TYPE public.recurrence_type AS ENUM ('monthly', 'quarterly', 'semiannual', 'annual');

CREATE TYPE public.client_type AS ENUM ('renewal', 'existing_upsell', 'new_sale');

CREATE TYPE public.renewal_type AS ENUM ('with_adjustment', 'new_values');

CREATE TYPE public.currency AS ENUM ('BRL', 'USD', 'ARS', 'EUR');

CREATE TYPE public.installment_type AS ENUM ('monthly', 'one_time');

CREATE TYPE public.commission_type AS ENUM ('sales', 'management', 'partner');

CREATE TYPE public.department AS ENUM (
  'finance',
  'accounting',
  'controlling',
  'tax',
  'audit',
  'ma'
);

CREATE TYPE public.monthly_closing_status AS ENUM ('open', 'closed');

CREATE TYPE public.audit_entity_type AS ENUM (
  'contract',
  'project',
  'installment',
  'commission',
  'monthly_closing',
  'leader_change'
);

CREATE TYPE public.audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'status_change',
  'leader_change',
  'value_change',
  'close_month',
  'reopen_month',
  'renewal'
);

-- 2. TABELAS PRINCIPAIS
-- ========================================

-- Grupos Econômicos
CREATE TABLE public.economic_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  economic_group_id UUID REFERENCES public.economic_groups(id) ON DELETE SET NULL,
  is_new BOOLEAN DEFAULT true NOT NULL,
  brand_representation TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Contratos
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  crm_sale_number TEXT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  client_type public.client_type NOT NULL,
  contract_type public.contract_type NOT NULL,
  recurrence_type public.recurrence_type,
  currency public.currency NOT NULL DEFAULT 'BRL',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renewal BOOLEAN DEFAULT false NOT NULL,
  requires_manager_approval BOOLEAN DEFAULT false NOT NULL,
  renewal_type public.renewal_type,
  status public.contract_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Anexos de Contratos
CREATE TABLE public.contract_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Projetos
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  department public.department NOT NULL,
  leader_id UUID,
  leader_name TEXT,
  coordinator_id UUID,
  coordinator_name TEXT,
  manager_id UUID,
  manager_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Histórico de Líderes
CREATE TABLE public.leader_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  previous_leader_id UUID,
  previous_leader_name TEXT,
  new_leader_id UUID NOT NULL,
  new_leader_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  reason TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Parcelas
CREATE TABLE public.installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  competence_month TEXT, -- formato: "2024-01"
  type public.installment_type NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  currency public.currency NOT NULL DEFAULT 'BRL',
  tax_percentage DECIMAL(5, 2),
  tax_estimated_value DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Comissões
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type public.commission_type NOT NULL,
  person_name TEXT NOT NULL,
  person_id UUID,
  is_percentage BOOLEAN NOT NULL DEFAULT true,
  value DECIMAL(15, 4) NOT NULL,
  calculation_base TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. TABELAS DE GOVERNANÇA
-- ========================================

-- Fechamento Mensal
CREATE TABLE public.monthly_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_month TEXT NOT NULL UNIQUE, -- formato: "2024-01"
  status public.monthly_closing_status NOT NULL DEFAULT 'open',
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  closed_by_name TEXT,
  justification TEXT,
  reopened_at TIMESTAMPTZ,
  reopened_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reopened_by_name TEXT,
  reopen_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Log de Fechamento Mensal
CREATE TABLE public.monthly_closing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_closing_id UUID NOT NULL REFERENCES public.monthly_closings(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('close', 'reopen')),
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_name TEXT NOT NULL,
  justification TEXT,
  performed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Taxas de Câmbio
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency public.currency NOT NULL,
  to_currency public.currency NOT NULL,
  rate DECIMAL(15, 6) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (from_currency, to_currency, effective_date)
);

-- 4. TABELA DE AUDIT LOG
-- ========================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type public.audit_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT,
  action public.audit_action NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX idx_clients_economic_group ON public.clients(economic_group_id);
CREATE INDEX idx_contracts_client ON public.contracts(client_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_projects_contract ON public.projects(contract_id);
CREATE INDEX idx_projects_department ON public.projects(department);
CREATE INDEX idx_installments_project ON public.installments(project_id);
CREATE INDEX idx_installments_competence ON public.installments(competence_month);
CREATE INDEX idx_commissions_project ON public.commissions(project_id);
CREATE INDEX idx_leader_history_project ON public.leader_history(project_id);
CREATE INDEX idx_monthly_closings_year_month ON public.monthly_closings(year_month);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- 6. TRIGGERS PARA UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_economic_groups_updated_at
  BEFORE UPDATE ON public.economic_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_installments_updated_at
  BEFORE UPDATE ON public.installments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_monthly_closings_updated_at
  BEFORE UPDATE ON public.monthly_closings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 7. RLS (Row Level Security) - BÁSICO
-- ========================================

ALTER TABLE public.economic_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leader_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_closing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo para usuários autenticados)
-- Ajuste conforme necessidades de segurança

CREATE POLICY "Authenticated users can read economic_groups"
  ON public.economic_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert economic_groups"
  ON public.economic_groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update economic_groups"
  ON public.economic_groups FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read clients"
  ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients"
  ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients"
  ON public.clients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read contracts"
  ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contracts"
  ON public.contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contracts"
  ON public.contracts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read contract_attachments"
  ON public.contract_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contract_attachments"
  ON public.contract_attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete contract_attachments"
  ON public.contract_attachments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read projects"
  ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects"
  ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read leader_history"
  ON public.leader_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert leader_history"
  ON public.leader_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read installments"
  ON public.installments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert installments"
  ON public.installments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update installments"
  ON public.installments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read commissions"
  ON public.commissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert commissions"
  ON public.commissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update commissions"
  ON public.commissions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read monthly_closings"
  ON public.monthly_closings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert monthly_closings"
  ON public.monthly_closings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update monthly_closings"
  ON public.monthly_closings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read monthly_closing_logs"
  ON public.monthly_closing_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert monthly_closing_logs"
  ON public.monthly_closing_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read exchange_rates"
  ON public.exchange_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert exchange_rates"
  ON public.exchange_rates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update exchange_rates"
  ON public.exchange_rates FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read audit_logs"
  ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit_logs"
  ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- 8. FUNÇÃO PARA GERAR CÓDIGO DE CONTRATO
-- ========================================

CREATE OR REPLACE FUNCTION public.generate_contract_code()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_code TEXT;
BEGIN
  year_part := to_char(NEW.start_date, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(code FROM 10 FOR 4) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.contracts
  WHERE code LIKE 'CTR-' || year_part || '-%';
  
  new_code := 'CTR-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  NEW.code := new_code;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_contract_code_trigger
  BEFORE INSERT ON public.contracts
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION public.generate_contract_code();

-- ========================================
-- FIM DO SCHEMA
-- ========================================
