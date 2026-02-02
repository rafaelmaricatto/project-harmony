import { 
  mockContracts, 
  mockProjects, 
  mockInstallments,
  getClientById,
  getContractById 
} from '@/data/mockData';
import { convertToBRL } from '@/data/monthlyClosingData';
import { Department, ContractType, Currency } from '@/types/contracts';

export interface RevenueByDepartment {
  department: Department;
  departmentLabel: string;
  totalBRL: number;
  projectCount: number;
}

export interface RevenueByContractType {
  type: ContractType;
  typeLabel: string;
  totalBRL: number;
  contractCount: number;
}

export interface RevenueProjection {
  yearMonth: string;
  totalBRL: number;
  byDepartment: Record<Department, number>;
  byContractType: Record<ContractType, number>;
}

export interface MonthlyReportProject {
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  department: Department;
  departmentLabel: string;
  monthlyValue: number;
  totalValue: number;
  currency: Currency;
  startDate: Date;
  endDate: Date;
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

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  one_time: 'Pontual',
  recurring: 'Recorrente',
};

// Calcula receita total projetada (soma de todas as parcelas futuras, convertida para BRL)
export function calculateTotalProjectedRevenue(): number {
  const today = new Date();
  
  return mockInstallments
    .filter(inst => new Date(inst.periodEnd) >= today)
    .reduce((sum, inst) => {
      return sum + convertToBRL(inst.value, inst.currency);
    }, 0);
}

// Receita por área/departamento
export function calculateRevenueByDepartment(): RevenueByDepartment[] {
  const today = new Date();
  const byDept: Record<string, { totalBRL: number; projectCount: number }> = {};
  
  // Inicializar todos os departamentos
  Object.keys(DEPARTMENT_LABELS).forEach(dept => {
    byDept[dept] = { totalBRL: 0, projectCount: 0 };
  });
  
  // Contar projetos únicos por departamento
  const projectsByDept: Record<string, Set<string>> = {};
  Object.keys(DEPARTMENT_LABELS).forEach(dept => {
    projectsByDept[dept] = new Set();
  });
  
  mockInstallments
    .filter(inst => new Date(inst.periodEnd) >= today)
    .forEach(inst => {
      const project = mockProjects.find(p => p.id === inst.projectId);
      if (project) {
        byDept[project.department].totalBRL += convertToBRL(inst.value, inst.currency);
        projectsByDept[project.department].add(project.id);
      }
    });
  
  return Object.entries(byDept).map(([dept, data]) => ({
    department: dept as Department,
    departmentLabel: DEPARTMENT_LABELS[dept as Department],
    totalBRL: data.totalBRL,
    projectCount: projectsByDept[dept].size,
  }));
}

// Receita por tipo de contrato
export function calculateRevenueByContractType(): RevenueByContractType[] {
  const today = new Date();
  const byType: Record<string, { totalBRL: number; contractCount: number }> = {
    one_time: { totalBRL: 0, contractCount: 0 },
    recurring: { totalBRL: 0, contractCount: 0 },
  };
  
  const contractsByType: Record<string, Set<string>> = {
    one_time: new Set(),
    recurring: new Set(),
  };
  
  mockInstallments
    .filter(inst => new Date(inst.periodEnd) >= today)
    .forEach(inst => {
      const project = mockProjects.find(p => p.id === inst.projectId);
      if (project) {
        const contract = getContractById(project.contractId);
        if (contract) {
          byType[contract.contractType].totalBRL += convertToBRL(inst.value, inst.currency);
          contractsByType[contract.contractType].add(contract.id);
        }
      }
    });
  
  return Object.entries(byType).map(([type, data]) => ({
    type: type as ContractType,
    typeLabel: CONTRACT_TYPE_LABELS[type as ContractType],
    totalBRL: data.totalBRL,
    contractCount: contractsByType[type].size,
  }));
}

// Projeção de receitas por mês
export function calculateRevenueProjection(
  filters?: {
    department?: Department;
    clientId?: string;
    projectId?: string;
  }
): RevenueProjection[] {
  const projections: Record<string, RevenueProjection> = {};
  
  mockInstallments.forEach(inst => {
    const project = mockProjects.find(p => p.id === inst.projectId);
    if (!project) return;
    
    const contract = getContractById(project.contractId);
    if (!contract) return;
    
    // Aplicar filtros
    if (filters?.department && project.department !== filters.department) return;
    if (filters?.clientId && contract.clientId !== filters.clientId) return;
    if (filters?.projectId && project.id !== filters.projectId) return;
    
    const yearMonth = inst.competenceMonth || 
      `${new Date(inst.periodStart).getFullYear()}-${String(new Date(inst.periodStart).getMonth() + 1).padStart(2, '0')}`;
    
    if (!projections[yearMonth]) {
      projections[yearMonth] = {
        yearMonth,
        totalBRL: 0,
        byDepartment: {} as Record<Department, number>,
        byContractType: {} as Record<ContractType, number>,
      };
      
      // Inicializar
      Object.keys(DEPARTMENT_LABELS).forEach(dept => {
        projections[yearMonth].byDepartment[dept as Department] = 0;
      });
      Object.keys(CONTRACT_TYPE_LABELS).forEach(type => {
        projections[yearMonth].byContractType[type as ContractType] = 0;
      });
    }
    
    const valueBRL = convertToBRL(inst.value, inst.currency);
    projections[yearMonth].totalBRL += valueBRL;
    projections[yearMonth].byDepartment[project.department] += valueBRL;
    projections[yearMonth].byContractType[contract.contractType] += valueBRL;
  });
  
  return Object.values(projections).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}

// Estatísticas de contratos
export function getContractStats() {
  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);
  const in90Days = new Date(today);
  in90Days.setDate(in90Days.getDate() + 90);
  
  const activeContracts = mockContracts.filter(c => c.status === 'active');
  const expiringContracts = mockContracts.filter(c => {
    const endDate = new Date(c.endDate);
    return c.status === 'active' && endDate <= in90Days && endDate >= today;
  });
  const renewalContracts = mockContracts.filter(c => c.status === 'renewed' || c.renewalType);
  
  // Calcular valores
  const activeValue = activeContracts.reduce((sum, c) => {
    const projects = mockProjects.filter(p => p.contractId === c.id);
    const projectInstallments = projects.flatMap(p => 
      mockInstallments.filter(i => i.projectId === p.id && new Date(i.periodEnd) >= today)
    );
    return sum + projectInstallments.reduce((s, i) => s + convertToBRL(i.value, i.currency), 0);
  }, 0);
  
  const expiringValue = expiringContracts.reduce((sum, c) => {
    const projects = mockProjects.filter(p => p.contractId === c.id);
    const projectInstallments = projects.flatMap(p => 
      mockInstallments.filter(i => i.projectId === p.id && new Date(i.periodEnd) >= today)
    );
    return sum + projectInstallments.reduce((s, i) => s + convertToBRL(i.value, i.currency), 0);
  }, 0);
  
  return {
    active: { count: activeContracts.length, valueBRL: activeValue },
    expiring: { count: expiringContracts.length, valueBRL: expiringValue },
    renewal: { count: renewalContracts.length },
  };
}

// Projetos por status no mês (para relatório mensal)
export function getProjectsByMonthStatus(yearMonth: string): {
  new: MonthlyReportProject[];
  closed: MonthlyReportProject[];
  renewed: MonthlyReportProject[];
} {
  const [year, month] = yearMonth.split('-').map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  
  const result = {
    new: [] as MonthlyReportProject[],
    closed: [] as MonthlyReportProject[],
    renewed: [] as MonthlyReportProject[],
  };
  
  mockProjects.forEach(project => {
    const contract = getContractById(project.contractId);
    if (!contract) return;
    
    const client = getClientById(contract.clientId);
    const installments = mockInstallments.filter(i => i.projectId === project.id);
    const monthlyValue = installments.find(i => i.competenceMonth === yearMonth)?.value || 0;
    const totalValue = installments.reduce((sum, i) => sum + i.value, 0);
    
    const projectData: MonthlyReportProject = {
      projectId: project.id,
      projectName: project.name,
      clientId: contract.clientId,
      clientName: client?.name || '',
      department: project.department,
      departmentLabel: DEPARTMENT_LABELS[project.department],
      monthlyValue,
      totalValue,
      currency: contract.currency,
      startDate: contract.startDate,
      endDate: contract.endDate,
    };
    
    // Projetos novos: criados no mês
    const createdAt = new Date(project.createdAt);
    if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
      result.new.push(projectData);
    }
    
    // Projetos encerrados: contrato termina no mês
    const endDate = new Date(contract.endDate);
    if (endDate >= startOfMonth && endDate <= endOfMonth && contract.status === 'closed') {
      result.closed.push(projectData);
    }
    
    // Projetos renovados: contrato renovado no mês
    if (contract.status === 'renewed') {
      const updatedAt = new Date(contract.updatedAt);
      if (updatedAt >= startOfMonth && updatedAt <= endOfMonth) {
        result.renewed.push(projectData);
      }
    }
  });
  
  return result;
}

// Gerar parcelas automaticamente
export function generateInstallments(params: {
  projectId: string;
  totalValue: number;
  installmentCount: number;
  startDate: Date;
  currency: Currency;
  taxPercentage?: number;
}) {
  const { projectId, totalValue, installmentCount, startDate, currency, taxPercentage } = params;
  const valuePerInstallment = totalValue / installmentCount;
  const installments = [];
  
  for (let i = 0; i < installmentCount; i++) {
    const periodStart = new Date(startDate);
    periodStart.setMonth(periodStart.getMonth() + i);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(0); // Último dia do mês
    
    const competenceMonth = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;
    
    installments.push({
      id: `inst-auto-${projectId}-${i + 1}`,
      projectId,
      periodStart,
      periodEnd,
      competenceMonth,
      type: 'monthly' as const,
      value: valuePerInstallment,
      currency,
      taxPercentage,
      taxEstimatedValue: taxPercentage ? valuePerInstallment * (taxPercentage / 100) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  return installments;
}
