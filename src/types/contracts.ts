// ========================================
// TIPOS DO SISTEMA DE GESTÃO DE CONTRATOS
// ========================================

// Enums
export type ContractStatus = 
  | 'draft'           // Em elaboração
  | 'pending_approval' // Aguardando aprovação da controladoria
  | 'active'          // Ativo
  | 'expiring_soon'   // Próximo do vencimento
  | 'closed'          // Encerrado
  | 'renewed';        // Renovado

export type ContractType = 'one_time' | 'recurring';

export type RecurrenceType = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export type ClientType = 
  | 'renewal'          // Renovação (cliente de carteira)
  | 'existing_upsell'  // Nova venda para cliente existente
  | 'new_sale';        // Nova venda para cliente novo

export type RenewalType = 
  | 'with_adjustment'  // Renovação com reajuste
  | 'new_values';      // Renovação com novos valores

export type Currency = 'BRL' | 'USD' | 'ARS' | 'EUR';

export type InstallmentType = 'monthly' | 'one_time';

export type CommissionType = 
  | 'sales'           // Comissão de vendedor
  | 'management'      // Comissão de gerente/coordenador
  | 'partner';        // Bonificação de parceiro comercial

// Departamentos/Áreas
export type Department = 
  | 'finance'
  | 'accounting'
  | 'controlling'
  | 'tax'
  | 'audit'
  | 'ma'; // M&A

// Interfaces principais

export interface EconomicGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  legalName?: string;
  economicGroupId?: string;
  economicGroup?: EconomicGroup;
  isNew: boolean;
  brandRepresentation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  code: string; // Código automático (ex: CTR-2024-0001)
  crmSaleNumber?: string;
  
  // Cliente
  clientId: string;
  client?: Client;
  clientType: ClientType;
  
  // Tipo de contrato
  contractType: ContractType;
  recurrenceType?: RecurrenceType;
  currency: Currency;
  
  // Vigência
  startDate: Date;
  endDate: Date;
  autoRenewal: boolean;
  
  // Renovação e governança
  requiresManagerApproval: boolean;
  renewalType?: RenewalType;
  status: ContractStatus;
  
  // Anexos
  attachments: Attachment[];
  
  // Projetos vinculados
  projects?: Project[];
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  contractId: string;
  contract?: Contract;
  department: Department;
  
  // Responsáveis (preparados para integração futura)
  leaderId?: string;
  leaderName?: string;
  coordinatorId?: string;
  coordinatorName?: string;
  managerId?: string;
  managerName?: string;
  
  // Relacionamentos
  installments?: Installment[];
  commissions?: Commission[];
  leaderHistory?: LeaderHistoryEntry[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderHistoryEntry {
  id: string;
  projectId: string;
  previousLeaderId?: string;
  previousLeaderName?: string;
  newLeaderId: string;
  newLeaderName: string;
  startDate: Date;
  endDate?: Date;
  reason?: string;
  changedBy?: string;
  changedAt: Date;
}

export interface Installment {
  id: string;
  projectId: string;
  project?: Project;
  
  // Período
  periodStart: Date;
  periodEnd: Date;
  competenceMonth?: string; // ex: "2024-01"
  
  // Tipo e valores
  type: InstallmentType;
  value: number;
  currency: Currency; // Herdada do contrato
  
  // Impostos
  taxPercentage?: number;
  taxEstimatedValue?: number;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Commission {
  id: string;
  projectId: string;
  project?: Project;
  
  type: CommissionType;
  personName: string; // Nome da pessoa ou parceiro
  personId?: string; // ID futuro para integração
  
  // Valor
  isPercentage: boolean;
  value: number; // Percentual ou valor fixo
  calculationBase?: string; // ex: "receita recebida"
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Histórico de alterações (audit log)
export interface AuditLogEntry {
  id: string;
  entityType: 'contract' | 'project' | 'installment' | 'commission';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'status_change';
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  userName?: string;
  timestamp: Date;
}

// Helpers e constantes
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Em elaboração',
  pending_approval: 'Aguardando aprovação',
  active: 'Ativo',
  expiring_soon: 'Próximo do vencimento',
  closed: 'Encerrado',
  renewed: 'Renovado',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  one_time: 'Pontual',
  recurring: 'Recorrente',
};

export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  renewal: 'Renovação (cliente de carteira)',
  existing_upsell: 'Nova venda para cliente existente',
  new_sale: 'Nova venda para cliente novo',
};

export const RENEWAL_TYPE_LABELS: Record<RenewalType, string> = {
  with_adjustment: 'Renovação com reajuste',
  new_values: 'Renovação com novos valores',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  BRL: 'Real (R$)',
  USD: 'Dólar (US$)',
  ARS: 'Peso Argentino (ARS)',
  EUR: 'Euro (€)',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  BRL: 'R$',
  USD: 'US$',
  ARS: 'ARS',
  EUR: '€',
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  finance: 'Finanças',
  accounting: 'Contabilidade',
  controlling: 'Controladoria',
  tax: 'Fiscal/Tributária',
  audit: 'Auditoria',
  ma: 'M&A',
};

export const COMMISSION_TYPE_LABELS: Record<CommissionType, string> = {
  sales: 'Comissão de vendedor',
  management: 'Comissão de gerente/coordenador',
  partner: 'Bonificação de parceiro comercial',
};

export const INSTALLMENT_TYPE_LABELS: Record<InstallmentType, string> = {
  monthly: 'Mensal',
  one_time: 'Pontual',
};
