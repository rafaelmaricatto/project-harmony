import { AuditLog, LeaderChangeLog } from '@/types/auditLog';

// Mock de usuário atual (para protótipo)
export const CURRENT_USER = {
  id: 'user-1',
  name: 'Usuário Atual',
};

// Logs de auditoria
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    entityType: 'contract',
    entityId: 'ctr-1',
    entityName: 'CTR-2024-0001',
    action: 'status_change',
    field: 'status',
    oldValue: 'pending_approval',
    newValue: 'active',
    userId: 'user-admin',
    userName: 'Administrador',
    timestamp: new Date('2024-01-01T09:00:00'),
  },
  {
    id: 'audit-2',
    entityType: 'project',
    entityId: 'prj-5',
    entityName: 'Controladoria Estratégica',
    action: 'leader_change',
    field: 'leaderId',
    oldValue: 'Carlos Antigo',
    newValue: 'Ricardo Almeida',
    metadata: {
      effectiveFromMonth: '2024-06',
      affectedInstallments: ['inst-5', 'inst-6'],
    },
    userId: 'user-admin',
    userName: 'Administrador',
    timestamp: new Date('2024-05-28T14:30:00'),
  },
  {
    id: 'audit-3',
    entityType: 'contract',
    entityId: 'ctr-3',
    entityName: 'CTR-2024-0003',
    action: 'create',
    userId: 'user-1',
    userName: 'João da Silva',
    timestamp: new Date('2024-10-25T10:15:00'),
  },
  {
    id: 'audit-4',
    entityType: 'monthly_closing',
    entityId: 'mc-1',
    entityName: '2024-01',
    action: 'close_month',
    metadata: {
      justification: 'Fechamento regular do mês',
    },
    userId: 'user-admin',
    userName: 'Administrador',
    timestamp: new Date('2024-02-05T10:00:00'),
  },
  {
    id: 'audit-5',
    entityType: 'installment',
    entityId: 'inst-1',
    entityName: 'Parcela Jan/2024 - Auditoria Anual',
    action: 'value_change',
    field: 'value',
    oldValue: '20000',
    newValue: '25000',
    userId: 'user-2',
    userName: 'Maria Santos',
    timestamp: new Date('2024-01-15T16:45:00'),
  },
  {
    id: 'audit-6',
    entityType: 'contract',
    entityId: 'ctr-4',
    entityName: 'CTR-2023-0045',
    action: 'renewal',
    field: 'status',
    oldValue: 'active',
    newValue: 'renewed',
    metadata: {
      renewalType: 'new_values',
      newEndDate: '2025-12-31',
    },
    userId: 'user-admin',
    userName: 'Administrador',
    timestamp: new Date('2024-11-20T11:30:00'),
  },
];

// Histórico de alterações de líderes
export const mockLeaderChangeLogs: LeaderChangeLog[] = [
  {
    id: 'lcl-1',
    projectId: 'prj-5',
    projectName: 'Controladoria Estratégica',
    previousLeaderId: 'lead-old-1',
    previousLeaderName: 'Carlos Antigo',
    newLeaderId: 'lead-5',
    newLeaderName: 'Ricardo Almeida',
    effectiveFromMonth: '2024-06',
    affectedInstallments: ['inst-5', 'inst-6'],
    changedBy: 'user-admin',
    changedByName: 'Administrador',
    changedAt: new Date('2024-05-28T14:30:00'),
    reason: 'Promoção do líder anterior',
  },
];

// Funções de gerenciamento de logs
export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const newLog: AuditLog = {
    ...log,
    id: `audit-${Date.now()}`,
    timestamp: new Date(),
  };
  mockAuditLogs.unshift(newLog); // Adiciona no início (mais recente primeiro)
  return newLog;
}

export function addLeaderChangeLog(log: Omit<LeaderChangeLog, 'id' | 'changedAt'>): LeaderChangeLog {
  const newLog: LeaderChangeLog = {
    ...log,
    id: `lcl-${Date.now()}`,
    changedAt: new Date(),
  };
  mockLeaderChangeLogs.unshift(newLog);
  return newLog;
}

// Queries
export function getAuditLogsByEntity(entityType: string, entityId: string): AuditLog[] {
  return mockAuditLogs.filter(
    log => log.entityType === entityType && log.entityId === entityId
  );
}

export function getAuditLogsByAction(action: string): AuditLog[] {
  return mockAuditLogs.filter(log => log.action === action);
}

export function getRecentAuditLogs(limit: number = 50): AuditLog[] {
  return mockAuditLogs.slice(0, limit);
}

export function getLeaderChangeLogsByProject(projectId: string): LeaderChangeLog[] {
  return mockLeaderChangeLogs.filter(log => log.projectId === projectId);
}

// Log para alteração de valor
export function logValueChange(params: {
  entityType: 'installment' | 'commission';
  entityId: string;
  entityName: string;
  field: string;
  oldValue: number | string;
  newValue: number | string;
}): AuditLog {
  return addAuditLog({
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    action: 'value_change',
    field: params.field,
    oldValue: String(params.oldValue),
    newValue: String(params.newValue),
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
  });
}

// Log para fechamento/reabertura de mês
export function logMonthClosingAction(params: {
  monthlyClosingId: string;
  yearMonth: string;
  action: 'close_month' | 'reopen_month';
  justification?: string;
}): AuditLog {
  return addAuditLog({
    entityType: 'monthly_closing',
    entityId: params.monthlyClosingId,
    entityName: params.yearMonth,
    action: params.action,
    metadata: params.justification ? { justification: params.justification } : undefined,
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
  });
}

// Log para renovação de contrato
export function logContractRenewal(params: {
  contractId: string;
  contractCode: string;
  renewalType: string;
  newEndDate?: Date;
}): AuditLog {
  return addAuditLog({
    entityType: 'contract',
    entityId: params.contractId,
    entityName: params.contractCode,
    action: 'renewal',
    field: 'status',
    oldValue: 'active',
    newValue: 'renewed',
    metadata: {
      renewalType: params.renewalType,
      newEndDate: params.newEndDate?.toISOString(),
    },
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
  });
}
