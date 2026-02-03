import { mockInstallments, mockProjects } from '@/data/mockData';
import { mockLeaderHistory } from '@/data/mockData';
import { isMonthClosed } from '@/data/monthlyClosingData';
import { addAuditLog, addLeaderChangeLog, CURRENT_USER } from '@/data/auditLogData';
import { LeaderHistoryEntry, Installment } from '@/types/contracts';

export interface LeaderPropagationResult {
  success: boolean;
  message: string;
  affectedInstallments: string[];
  blockedInstallments: string[];
  leaderHistoryEntry?: LeaderHistoryEntry;
}

/**
 * Propaga a alteração de líder para todas as parcelas a partir de um mês específico.
 * 
 * Regras:
 * - Parcelas em meses fechados NÃO podem ser alteradas
 * - O histórico de líderes é sempre versionado (nunca sobrescrito)
 * - Todas as alterações são registradas em audit log
 */
export function propagateLeaderChange(params: {
  projectId: string;
  newLeaderId: string;
  newLeaderName: string;
  effectiveFromMonth: string; // formato "2024-01"
  reason?: string;
}): LeaderPropagationResult {
  const { projectId, newLeaderId, newLeaderName, effectiveFromMonth, reason } = params;

  const project = mockProjects.find(p => p.id === projectId);
  if (!project) {
    return {
      success: false,
      message: 'Projeto não encontrado',
      affectedInstallments: [],
      blockedInstallments: [],
    };
  }

  const previousLeaderId = project.leaderId;
  const previousLeaderName = project.leaderName;

  // Encontrar todas as parcelas do projeto
  const projectInstallments = mockInstallments.filter(i => i.projectId === projectId);

  // Separar parcelas que podem e não podem ser alteradas
  const affectedInstallments: string[] = [];
  const blockedInstallments: string[] = [];

  projectInstallments.forEach(installment => {
    const competenceMonth = installment.competenceMonth || 
      `${new Date(installment.periodStart).getFullYear()}-${String(new Date(installment.periodStart).getMonth() + 1).padStart(2, '0')}`;

    // Verificar se o mês está fechado
    if (isMonthClosed(competenceMonth)) {
      blockedInstallments.push(installment.id);
      return;
    }

    // Verificar se a parcela é do mês informado em diante
    if (competenceMonth >= effectiveFromMonth) {
      affectedInstallments.push(installment.id);
      
      // Atualizar o líder na parcela (simulação - em produção seria no banco)
      const idx = mockInstallments.findIndex(i => i.id === installment.id);
      if (idx !== -1) {
        // Adicionar campo de líder à parcela se não existir
        (mockInstallments[idx] as Installment & { leaderId?: string; leaderName?: string }).leaderId = newLeaderId;
        (mockInstallments[idx] as Installment & { leaderId?: string; leaderName?: string }).leaderName = newLeaderName;
      }
    }
  });

  if (affectedInstallments.length === 0) {
    return {
      success: false,
      message: blockedInstallments.length > 0 
        ? 'Todas as parcelas deste período estão em meses fechados e não podem ser alteradas.'
        : 'Nenhuma parcela encontrada para o período informado.',
      affectedInstallments: [],
      blockedInstallments,
    };
  }

  // Criar entrada no histórico de líderes
  const historyEntry: LeaderHistoryEntry = {
    id: `lh-${Date.now()}`,
    projectId,
    previousLeaderId,
    previousLeaderName,
    newLeaderId,
    newLeaderName,
    startDate: new Date(`${effectiveFromMonth}-01`),
    reason,
    changedBy: CURRENT_USER.id,
    changedAt: new Date(),
  };

  // Atualizar a entrada anterior com data de fim
  const previousHistory = mockLeaderHistory.filter(h => h.projectId === projectId);
  if (previousHistory.length > 0) {
    const lastEntry = previousHistory[0];
    const idx = mockLeaderHistory.findIndex(h => h.id === lastEntry.id);
    if (idx !== -1) {
      mockLeaderHistory[idx].endDate = new Date(`${effectiveFromMonth}-01`);
    }
  }

  // Adicionar nova entrada ao histórico
  mockLeaderHistory.unshift(historyEntry);

  // Atualizar o líder atual do projeto
  const projectIdx = mockProjects.findIndex(p => p.id === projectId);
  if (projectIdx !== -1) {
    mockProjects[projectIdx].leaderId = newLeaderId;
    mockProjects[projectIdx].leaderName = newLeaderName;
    mockProjects[projectIdx].updatedAt = new Date();
  }

  // Registrar no audit log
  addAuditLog({
    entityType: 'project',
    entityId: projectId,
    entityName: project.name,
    action: 'leader_change',
    field: 'leaderId',
    oldValue: previousLeaderName || 'Não definido',
    newValue: newLeaderName,
    metadata: {
      effectiveFromMonth,
      affectedInstallments,
      blockedInstallments,
      reason,
    },
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
  });

  // Registrar no log específico de alteração de líderes
  addLeaderChangeLog({
    projectId,
    projectName: project.name,
    previousLeaderId,
    previousLeaderName,
    newLeaderId,
    newLeaderName,
    effectiveFromMonth,
    affectedInstallments,
    changedBy: CURRENT_USER.id,
    changedByName: CURRENT_USER.name,
    reason,
  });

  const message = blockedInstallments.length > 0
    ? `Líder alterado com sucesso! ${affectedInstallments.length} parcela(s) atualizada(s). ${blockedInstallments.length} parcela(s) em meses fechados não foram alteradas.`
    : `Líder alterado com sucesso! ${affectedInstallments.length} parcela(s) atualizada(s).`;

  return {
    success: true,
    message,
    affectedInstallments,
    blockedInstallments,
    leaderHistoryEntry: historyEntry,
  };
}

/**
 * Retorna os meses disponíveis para seleção (meses das parcelas do projeto que não estão fechados)
 */
export function getAvailableMonthsForLeaderChange(projectId: string): string[] {
  const projectInstallments = mockInstallments.filter(i => i.projectId === projectId);
  
  const months = new Set<string>();
  
  projectInstallments.forEach(installment => {
    const competenceMonth = installment.competenceMonth || 
      `${new Date(installment.periodStart).getFullYear()}-${String(new Date(installment.periodStart).getMonth() + 1).padStart(2, '0')}`;
    
    // Só adicionar meses que não estão fechados
    if (!isMonthClosed(competenceMonth)) {
      months.add(competenceMonth);
    }
  });

  return Array.from(months).sort();
}
