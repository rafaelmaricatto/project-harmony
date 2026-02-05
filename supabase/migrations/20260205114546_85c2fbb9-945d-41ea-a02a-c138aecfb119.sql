-- ========================================
-- SCHEMA DO MÓDULO DE EQUIPE / PESSOAS
-- ========================================

-- 0. FUNÇÃO AUXILIAR PARA UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. ENUMS ADICIONAIS
-- ========================================

CREATE TYPE public.person_type AS ENUM ('administrative', 'commercial', 'consulting');

CREATE TYPE public.person_status AS ENUM ('active', 'inactive');

CREATE TYPE public.termination_type AS ENUM ('dismissal', 'agreement', 'pj_termination', 'resignation', 'retirement');

CREATE TYPE public.cost_classification AS ENUM ('cost', 'expense');

-- 2. TABELA DE DEPARTAMENTOS
-- ========================================

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  cost_center TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. TABELA DE CARGOS
-- ========================================

CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.person_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. TABELA DE NÍVEIS
-- ========================================

CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_salary DECIMAL(15, 2) NOT NULL,
  ppr_index DECIMAL(5, 4),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. TABELA DE PESSOAS
-- ========================================

CREATE TABLE public.persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  type public.person_type NOT NULL,
  current_position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  current_level_id UUID REFERENCES public.levels(id) ON DELETE SET NULL,
  primary_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  hire_date DATE NOT NULL,
  termination_date DATE,
  status public.person_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. HISTÓRICO DE CARGO E NÍVEL
-- ========================================

CREATE TABLE public.person_position_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
  level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. CUSTOS MENSAIS DA PESSOA
-- ========================================

CREATE TABLE public.person_monthly_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,
  base_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
  benefits DECIMAL(15, 2) NOT NULL DEFAULT 0,
  charges DECIMAL(15, 2) NOT NULL DEFAULT 0,
  provisions DECIMAL(15, 2) NOT NULL DEFAULT 0,
  other_costs DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  proportionality_factor DECIMAL(5, 4) DEFAULT 1,
  is_projected BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (person_id, year_month)
);

-- 8. RATEIO POR DEPARTAMENTO
-- ========================================

CREATE TABLE public.person_department_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  year_month TEXT NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  allocated_cost DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (person_id, department_id, year_month)
);

-- 9. EVENTOS DE RESCISÃO
-- ========================================

CREATE TABLE public.termination_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  termination_date DATE NOT NULL,
  termination_type public.termination_type NOT NULL,
  severance_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  description TEXT,
  classification public.cost_classification NOT NULL DEFAULT 'cost',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX idx_persons_supervisor ON public.persons(supervisor_id);
CREATE INDEX idx_persons_department ON public.persons(primary_department_id);
CREATE INDEX idx_persons_status ON public.persons(status);
CREATE INDEX idx_persons_type ON public.persons(type);
CREATE INDEX idx_levels_position ON public.levels(position_id);
CREATE INDEX idx_position_history_person ON public.person_position_history(person_id);
CREATE INDEX idx_position_history_dates ON public.person_position_history(start_date, end_date);
CREATE INDEX idx_monthly_costs_person ON public.person_monthly_costs(person_id);
CREATE INDEX idx_monthly_costs_year_month ON public.person_monthly_costs(year_month);
CREATE INDEX idx_allocations_person ON public.person_department_allocations(person_id);
CREATE INDEX idx_allocations_department ON public.person_department_allocations(department_id);
CREATE INDEX idx_allocations_year_month ON public.person_department_allocations(year_month);
CREATE INDEX idx_termination_person ON public.termination_events(person_id);

-- 11. TRIGGERS PARA UPDATED_AT
-- ========================================

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_levels_updated_at
  BEFORE UPDATE ON public.levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_persons_updated_at
  BEFORE UPDATE ON public.persons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_position_history_updated_at
  BEFORE UPDATE ON public.person_position_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_monthly_costs_updated_at
  BEFORE UPDATE ON public.person_monthly_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_allocations_updated_at
  BEFORE UPDATE ON public.person_department_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_termination_events_updated_at
  BEFORE UPDATE ON public.termination_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 12. FUNÇÃO PARA VALIDAR SOMA DE RATEIO
-- ========================================

CREATE OR REPLACE FUNCTION public.validate_allocation_percentage()
RETURNS TRIGGER AS $$
DECLARE
  total_percentage DECIMAL(5, 2);
BEGIN
  SELECT COALESCE(SUM(percentage), 0) INTO total_percentage
  FROM public.person_department_allocations
  WHERE person_id = NEW.person_id 
    AND year_month = NEW.year_month
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  total_percentage := total_percentage + NEW.percentage;
  
  IF total_percentage > 100 THEN
    RAISE EXCEPTION 'A soma dos percentuais de rateio nao pode ultrapassar 100 porcento. Total atual: %', total_percentage;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_allocation_percentage_trigger
  BEFORE INSERT OR UPDATE ON public.person_department_allocations
  FOR EACH ROW EXECUTE FUNCTION public.validate_allocation_percentage();

-- 13. FUNÇÃO PARA CALCULAR CUSTO TOTAL
-- ========================================

CREATE OR REPLACE FUNCTION public.calculate_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_cost := NEW.base_salary + NEW.benefits + NEW.charges + NEW.provisions + NEW.other_costs;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_total_cost_trigger
  BEFORE INSERT OR UPDATE ON public.person_monthly_costs
  FOR EACH ROW EXECUTE FUNCTION public.calculate_total_cost();

-- 14. RLS (Row Level Security)
-- ========================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_monthly_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_department_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.termination_events ENABLE ROW LEVEL SECURITY;

-- Políticas para departments
CREATE POLICY "Authenticated users can read departments"
  ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert departments"
  ON public.departments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update departments"
  ON public.departments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete departments"
  ON public.departments FOR DELETE TO authenticated USING (true);

-- Políticas para positions
CREATE POLICY "Authenticated users can read positions"
  ON public.positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert positions"
  ON public.positions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update positions"
  ON public.positions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete positions"
  ON public.positions FOR DELETE TO authenticated USING (true);

-- Políticas para levels
CREATE POLICY "Authenticated users can read levels"
  ON public.levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert levels"
  ON public.levels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update levels"
  ON public.levels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete levels"
  ON public.levels FOR DELETE TO authenticated USING (true);

-- Políticas para persons
CREATE POLICY "Authenticated users can read persons"
  ON public.persons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert persons"
  ON public.persons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update persons"
  ON public.persons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete persons"
  ON public.persons FOR DELETE TO authenticated USING (true);

-- Políticas para person_position_history
CREATE POLICY "Authenticated users can read position_history"
  ON public.person_position_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert position_history"
  ON public.person_position_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update position_history"
  ON public.person_position_history FOR UPDATE TO authenticated USING (true);

-- Políticas para person_monthly_costs
CREATE POLICY "Authenticated users can read monthly_costs"
  ON public.person_monthly_costs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert monthly_costs"
  ON public.person_monthly_costs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update monthly_costs"
  ON public.person_monthly_costs FOR UPDATE TO authenticated USING (true);

-- Políticas para person_department_allocations
CREATE POLICY "Authenticated users can read allocations"
  ON public.person_department_allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert allocations"
  ON public.person_department_allocations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update allocations"
  ON public.person_department_allocations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete allocations"
  ON public.person_department_allocations FOR DELETE TO authenticated USING (true);

-- Políticas para termination_events
CREATE POLICY "Authenticated users can read termination_events"
  ON public.termination_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert termination_events"
  ON public.termination_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update termination_events"
  ON public.termination_events FOR UPDATE TO authenticated USING (true);

-- ========================================
-- FIM DO SCHEMA DE EQUIPE
-- ========================================