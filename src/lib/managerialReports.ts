import { 
  mockContracts, 
  mockProjects, 
  mockInstallments,
  getClientById,
  getContractById 
} from '@/data/mockData';
import { convertToBRL } from '@/data/monthlyClosingData';
import { Department, Currency } from '@/types/contracts';

// ========================================
// RELATÓRIOS GERENCIAIS - ESTRUTURA PREPARADA
// ========================================

export interface RevenueByLeader {
  leaderId?: string;
  leaderName: string;
  totalBRL: number;
  projectCount: number;
  projects: Array<{
    projectId: string;
    projectName: string;
    valueBRL: number;
  }>;
}

export interface RevenueByClient {
  clientId: string;
  clientName: string;
  totalBRL: number;
  contractCount: number;
  projectCount: number;
  contracts: Array<{
    contractId: string;
    contractCode: string;
    valueBRL: number;
  }>;
}

export interface RevenueByArea {
  department: Department;
  departmentLabel: string;
  totalBRL: number;
  projectCount: number;
  leaderBreakdown: RevenueByLeader[];
}

export interface PPRData {
  leaderId?: string;
  leaderName: string;
  projectId: string;
  projectName: string;
  department: Department;
  revenueGenerated: number;
  revenueReceived: number;
  period: string;
}

export interface CostAllocation {
  projectId: string;
  projectName: string;
  leaderId?: string;
  leaderName?: string;
  department: Department;
  revenueTotal: number;
  // Preparado para futura integração
  personnelCost?: number;
  operationalCost?: number;
  margin?: number;
}

// Departamentos
const DEPARTMENT_LABELS: Record<Department, string> = {
  finance: 'Finanças',
  accounting: 'Contabilidade',
  controlling: 'Controladoria',
  tax: 'Fiscal/Tributária',
  audit: 'Auditoria',
  ma: 'M&A',
};

/**
 * Calcula receita por líder de projeto
 */
export function calculateRevenueByLeader(
  filters?: { yearMonth?: string; department?: Department }
): RevenueByLeader[] {
  const today = new Date();
  const byLeader: Record<string, RevenueByLeader> = {};

  mockInstallments
    .filter(inst => {
      // Filtrar por mês se especificado
      if (filters?.yearMonth) {
        const competenceMonth = inst.competenceMonth || 
          `${new Date(inst.periodStart).getFullYear()}-${String(new Date(inst.periodStart).getMonth() + 1).padStart(2, '0')}`;
        if (competenceMonth !== filters.yearMonth) return false;
      }
      return true;
    })
    .forEach(inst => {
      const project = mockProjects.find(p => p.id === inst.projectId);
      if (!project) return;

      // Filtrar por departamento se especificado
      if (filters?.department && project.department !== filters.department) return;

      const leaderKey = project.leaderId || 'unassigned';
      const leaderName = project.leaderName || 'Não atribuído';

      if (!byLeader[leaderKey]) {
        byLeader[leaderKey] = {
          leaderId: project.leaderId,
          leaderName,
          totalBRL: 0,
          projectCount: 0,
          projects: [],
        };
      }

      const valueBRL = convertToBRL(inst.value, inst.currency);
      byLeader[leaderKey].totalBRL += valueBRL;

      // Verificar se o projeto já foi contado
      const existingProject = byLeader[leaderKey].projects.find(p => p.projectId === project.id);
      if (existingProject) {
        existingProject.valueBRL += valueBRL;
      } else {
        byLeader[leaderKey].projectCount++;
        byLeader[leaderKey].projects.push({
          projectId: project.id,
          projectName: project.name,
          valueBRL,
        });
      }
    });

  return Object.values(byLeader).sort((a, b) => b.totalBRL - a.totalBRL);
}

/**
 * Calcula receita por cliente
 */
export function calculateRevenueByClient(
  filters?: { yearMonth?: string; department?: Department }
): RevenueByClient[] {
  const byClient: Record<string, RevenueByClient> = {};

  mockInstallments
    .filter(inst => {
      if (filters?.yearMonth) {
        const competenceMonth = inst.competenceMonth || 
          `${new Date(inst.periodStart).getFullYear()}-${String(new Date(inst.periodStart).getMonth() + 1).padStart(2, '0')}`;
        if (competenceMonth !== filters.yearMonth) return false;
      }
      return true;
    })
    .forEach(inst => {
      const project = mockProjects.find(p => p.id === inst.projectId);
      if (!project) return;

      if (filters?.department && project.department !== filters.department) return;

      const contract = getContractById(project.contractId);
      if (!contract) return;

      const client = getClientById(contract.clientId);
      if (!client) return;

      if (!byClient[client.id]) {
        byClient[client.id] = {
          clientId: client.id,
          clientName: client.name,
          totalBRL: 0,
          contractCount: 0,
          projectCount: 0,
          contracts: [],
        };
      }

      const valueBRL = convertToBRL(inst.value, inst.currency);
      byClient[client.id].totalBRL += valueBRL;

      // Verificar se o contrato já foi contado
      const existingContract = byClient[client.id].contracts.find(c => c.contractId === contract.id);
      if (existingContract) {
        existingContract.valueBRL += valueBRL;
      } else {
        byClient[client.id].contractCount++;
        byClient[client.id].contracts.push({
          contractId: contract.id,
          contractCode: contract.code,
          valueBRL,
        });
      }
    });

  // Contar projetos únicos
  Object.values(byClient).forEach(clientData => {
    const contractIds = clientData.contracts.map(c => c.contractId);
    const projectCount = mockProjects.filter(p => contractIds.includes(p.contractId)).length;
    clientData.projectCount = projectCount;
  });

  return Object.values(byClient).sort((a, b) => b.totalBRL - a.totalBRL);
}

/**
 * Calcula receita por área com breakdown de líderes
 */
export function calculateRevenueByArea(
  filters?: { yearMonth?: string }
): RevenueByArea[] {
  const byArea: Record<Department, RevenueByArea> = {} as Record<Department, RevenueByArea>;

  // Inicializar todas as áreas
  Object.entries(DEPARTMENT_LABELS).forEach(([dept, label]) => {
    byArea[dept as Department] = {
      department: dept as Department,
      departmentLabel: label,
      totalBRL: 0,
      projectCount: 0,
      leaderBreakdown: [],
    };
  });

  mockInstallments
    .filter(inst => {
      if (filters?.yearMonth) {
        const competenceMonth = inst.competenceMonth || 
          `${new Date(inst.periodStart).getFullYear()}-${String(new Date(inst.periodStart).getMonth() + 1).padStart(2, '0')}`;
        if (competenceMonth !== filters.yearMonth) return false;
      }
      return true;
    })
    .forEach(inst => {
      const project = mockProjects.find(p => p.id === inst.projectId);
      if (!project) return;

      const valueBRL = convertToBRL(inst.value, inst.currency);
      byArea[project.department].totalBRL += valueBRL;
    });

  // Contar projetos únicos por área
  Object.keys(byArea).forEach(dept => {
    const projectsInArea = mockProjects.filter(p => p.department === dept);
    byArea[dept as Department].projectCount = projectsInArea.length;
    
    // Adicionar breakdown por líder
    byArea[dept as Department].leaderBreakdown = calculateRevenueByLeader({ 
      ...filters, 
      department: dept as Department 
    });
  });

  return Object.values(byArea)
    .filter(area => area.totalBRL > 0)
    .sort((a, b) => b.totalBRL - a.totalBRL);
}

/**
 * Preparação de dados para PPR (Programa de Participação nos Resultados)
 * Estrutura pronta para integração futura com módulo de equipe/pessoas
 */
export function preparePPRData(yearMonth: string): PPRData[] {
  const pprData: PPRData[] = [];

  mockInstallments
    .filter(inst => {
      const competenceMonth = inst.competenceMonth || 
        `${new Date(inst.periodStart).getFullYear()}-${String(new Date(inst.periodStart).getMonth() + 1).padStart(2, '0')}`;
      return competenceMonth === yearMonth;
    })
    .forEach(inst => {
      const project = mockProjects.find(p => p.id === inst.projectId);
      if (!project) return;

      pprData.push({
        leaderId: project.leaderId,
        leaderName: project.leaderName || 'Não atribuído',
        projectId: project.id,
        projectName: project.name,
        department: project.department,
        revenueGenerated: convertToBRL(inst.value, inst.currency),
        revenueReceived: 0, // Preparado para integração com módulo de faturamento
        period: yearMonth,
      });
    });

  return pprData;
}

/**
 * Alocação de custos por projeto
 * Estrutura pronta para integração futura com módulo de custos de pessoal
 */
export function prepareCostAllocation(
  filters?: { yearMonth?: string; department?: Department }
): CostAllocation[] {
  const allocations: Record<string, CostAllocation> = {};

  mockInstallments
    .filter(inst => {
      if (filters?.yearMonth) {
        const competenceMonth = inst.competenceMonth || 
          `${new Date(inst.periodStart).getFullYear()}-${String(new Date(inst.periodStart).getMonth() + 1).padStart(2, '0')}`;
        if (competenceMonth !== filters.yearMonth) return false;
      }
      return true;
    })
    .forEach(inst => {
      const project = mockProjects.find(p => p.id === inst.projectId);
      if (!project) return;

      if (filters?.department && project.department !== filters.department) return;

      if (!allocations[project.id]) {
        allocations[project.id] = {
          projectId: project.id,
          projectName: project.name,
          leaderId: project.leaderId,
          leaderName: project.leaderName,
          department: project.department,
          revenueTotal: 0,
          // Campos preparados para integração futura
          personnelCost: undefined,
          operationalCost: undefined,
          margin: undefined,
        };
      }

      allocations[project.id].revenueTotal += convertToBRL(inst.value, inst.currency);
    });

  return Object.values(allocations).sort((a, b) => b.revenueTotal - a.revenueTotal);
}

/**
 * Resumo gerencial consolidado
 */
export function getManagerialSummary(yearMonth?: string) {
  const filters = yearMonth ? { yearMonth } : undefined;

  return {
    byLeader: calculateRevenueByLeader(filters),
    byClient: calculateRevenueByClient(filters),
    byArea: calculateRevenueByArea(filters),
    pprData: yearMonth ? preparePPRData(yearMonth) : [],
    costAllocation: prepareCostAllocation(filters),
  };
}
