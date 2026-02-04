// ========================================
// TIPOS DO MÓDULO DE EQUIPE / PESSOAS
// ========================================

// Tipo de pessoa
export type PersonType = 'administrative' | 'commercial' | 'consulting';

export const PERSON_TYPE_LABELS: Record<PersonType, string> = {
  administrative: 'Administrativo',
  commercial: 'Comercial',
  consulting: 'Consultoria',
};

// Status da pessoa
export type PersonStatus = 'active' | 'inactive';

export const PERSON_STATUS_LABELS: Record<PersonStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

// ========================================
// CARGOS
// ========================================
export interface Position {
  id: string;
  name: string;
  type: PersonType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// NÍVEIS
// ========================================
export interface Level {
  id: string;
  positionId: string; // Referência ao cargo
  name: string; // Ex: Júnior, Pleno, Sênior, Coordenação, Gerência
  baseSalary: number; // Salário base de referência
  pprIndex: number; // Índice de PPR (apenas armazenar, não calcular)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// PESSOA
// ========================================
export interface Person {
  id: string;
  fullName: string;
  type: PersonType;
  positionId: string; // Cargo atual
  levelId: string; // Nível atual
  departmentId: string; // Área principal (departamento)
  supervisorId?: string; // Superior direto (auto-relacionamento)
  hireDate: Date;
  terminationDate?: Date;
  status: PersonStatus;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// DEPARTAMENTO / CENTRO DE CUSTO
// ========================================
export interface Department {
  id: string;
  name: string;
  code: string; // Código do centro de custo
  managerId?: string; // Gerente responsável
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// HISTÓRICO DE CARGO E NÍVEL
// ========================================
export interface PositionLevelHistory {
  id: string;
  personId: string;
  positionId: string;
  levelId: string;
  startDate: Date;
  endDate?: Date; // null = vigente
  reason?: string; // Motivo da mudança (promoção, reposicionamento, etc.)
  createdAt: Date;
}

// ========================================
// CUSTOS MENSAIS DA PESSOA
// ========================================
export interface PersonMonthlyCost {
  id: string;
  personId: string;
  yearMonth: string; // "2024-01"
  
  // Valores base
  baseSalary: number;
  benefit: number; // Cartão benefício
  
  // Encargos calculados
  charges: number;
  chargesPercentage: number; // % de encargos aplicado
  
  // Provisões
  vacationProvision: number;
  thirteenthProvision: number;
  otherProvisions: number;
  
  // Outros custos
  otherCosts: number;
  
  // Total calculado
  totalCost: number;
  
  // Proporcionalidade
  workingDays: number; // Dias trabalhados no mês
  totalDaysInMonth: number; // Total de dias do mês
  proportionalFactor: number; // workingDays / totalDaysInMonth
  
  // Controle
  isManualAdjustment: boolean; // Se foi ajustado manualmente
  notes?: string;
  isLocked: boolean; // Se o mês está fechado
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// RATEIO POR DEPARTAMENTO
// ========================================
export interface DepartmentAllocation {
  id: string;
  personId: string;
  departmentId: string;
  yearMonth: string; // "2024-01"
  percentage: number; // 0 a 100
  allocatedCost: number; // Custo calculado (% do custo total)
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// EVENTOS DE RESCISÃO
// ========================================
export type TerminationType = 
  | 'dismissal' // Demissão
  | 'resignation' // Pedido de demissão
  | 'agreement' // Acordo
  | 'contract_end' // Término de contrato PJ
  | 'retirement' // Aposentadoria
  | 'other';

export const TERMINATION_TYPE_LABELS: Record<TerminationType, string> = {
  dismissal: 'Demissão',
  resignation: 'Pedido de Demissão',
  agreement: 'Acordo',
  contract_end: 'Término de Contrato PJ',
  retirement: 'Aposentadoria',
  other: 'Outro',
};

export type TerminationClassification = 'cost' | 'expense';

export const TERMINATION_CLASSIFICATION_LABELS: Record<TerminationClassification, string> = {
  cost: 'Custo',
  expense: 'Despesa',
};

export interface TerminationEvent {
  id: string;
  personId: string;
  terminationDate: Date;
  type: TerminationType;
  severanceAmount: number; // Verbas indenizatórias (manual)
  classification: TerminationClassification;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// CONSOLIDAÇÕES GERENCIAIS
// ========================================
export interface CostConsolidation {
  yearMonth: string;
  departmentId?: string;
  departmentName?: string;
  leaderId?: string;
  leaderName?: string;
  coordinatorId?: string;
  coordinatorName?: string;
  managerId?: string;
  managerName?: string;
  totalCost: number;
  personCount: number;
}

// ========================================
// LOGS DE ALTERAÇÃO
// ========================================
export interface TeamAuditLog {
  id: string;
  entityType: 'person' | 'cost' | 'allocation' | 'position_history' | 'termination';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// ========================================
// CONFIGURAÇÕES DE ENCARGOS E PROVISÕES
// ========================================
export interface PayrollConfig {
  id: string;
  name: string;
  chargesPercentage: number; // % de encargos sobre salário
  vacationProvisionPercentage: number; // % provisão férias
  thirteenthProvisionPercentage: number; // % provisão 13º
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
