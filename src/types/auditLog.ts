// ========================================
// TIPOS DE AUDIT LOG - HISTÓRICO E RASTREABILIDADE
// ========================================

export type AuditEntityType = 
  | 'contract' 
  | 'project' 
  | 'installment' 
  | 'commission'
  | 'monthly_closing'
  | 'leader_change';

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'status_change'
  | 'leader_change'
  | 'value_change'
  | 'close_month'
  | 'reopen_month'
  | 'renewal';

export interface AuditLog {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string; // Nome legível da entidade (ex: nome do projeto)
  action: AuditAction;
  field?: string; // Campo alterado
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>; // Dados adicionais específicos da ação
  userId: string;
  userName: string;
  timestamp: Date;
}

// Interface específica para alteração de líder com propagação
export interface LeaderChangeLog {
  id: string;
  projectId: string;
  projectName: string;
  previousLeaderId?: string;
  previousLeaderName?: string;
  newLeaderId: string;
  newLeaderName: string;
  effectiveFromMonth: string; // "2024-01"
  affectedInstallments: string[]; // IDs das parcelas afetadas
  changedBy: string;
  changedByName: string;
  changedAt: Date;
  reason?: string;
}

// Labels para exibição
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  status_change: 'Alteração de Status',
  leader_change: 'Alteração de Líder',
  value_change: 'Alteração de Valor',
  close_month: 'Fechamento de Mês',
  reopen_month: 'Reabertura de Mês',
  renewal: 'Renovação',
};

export const AUDIT_ENTITY_LABELS: Record<AuditEntityType, string> = {
  contract: 'Contrato',
  project: 'Projeto',
  installment: 'Parcela',
  commission: 'Comissão',
  monthly_closing: 'Fechamento Mensal',
  leader_change: 'Alteração de Líder',
};
