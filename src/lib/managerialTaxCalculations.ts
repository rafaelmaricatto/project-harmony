// ========================================
// CÁLCULOS GERENCIAIS DE IMPOSTOS
// ========================================

import { 
  mockProjects, 
  mockInstallments,
  getContractById 
} from '@/data/mockData';
import { mockCompanies, getCompanyById, getArgentinaTaxRate } from '@/data/companyData';
import { 
  getTaxIndexByMonth, 
  getLastKnownTaxRate, 
  getArgentinaFixedTaxRate,
  isMonthConsolidated 
} from '@/data/taxIndexData';
import { convertToBRL } from '@/data/monthlyClosingData';
import { Department, DEPARTMENT_LABELS } from '@/types/contracts';
import { CompanyType } from '@/types/company';
import { 
  InstallmentWithTax, 
  RevenueByCompany, 
  RevenueByDepartmentReport,
  RevenueByLeader,
  RevenueByProject,
  MonthlyProjection 
} from '@/types/managerialReport';

// Obter taxa de imposto aplicável para uma parcela
export function getTaxRateForInstallment(
  companyType: CompanyType,
  yearMonth: string
): number {
  if (companyType === 'argentina_subsidiary') {
    // Argentina usa taxa fixa
    return getArgentinaFixedTaxRate();
  }
  
  // Brasil: verificar se o mês está consolidado
  if (isMonthConsolidated(yearMonth)) {
    const index = getTaxIndexByMonth(yearMonth);
    return index?.taxIndexRate || getLastKnownTaxRate();
  }
  
  // Mês não consolidado: usar último índice conhecido (forecast)
  return getLastKnownTaxRate();
}

// Calcular imposto gerencial para uma parcela
export function calculateManagerialTax(
  grossRevenueBRL: number,
  taxRate: number
): number {
  return grossRevenueBRL * taxRate;
}

// Obter todas as parcelas com cálculos gerenciais aplicados
export function getInstallmentsWithTax(
  filters?: {
    yearMonth?: string;
    companyId?: string;
    department?: Department;
    projectId?: string;
  }
): InstallmentWithTax[] {
  const result: InstallmentWithTax[] = [];
  
  mockInstallments.forEach(inst => {
    const project = mockProjects.find(p => p.id === inst.projectId);
    if (!project) return;
    
    const contract = getContractById(project.contractId);
    if (!contract) return;
    
    // TODO: Quando tivermos companyId no contrato, usar isso
    // Por enquanto, assumir empresa Brasil para todos
    const companyId = 'comp-1'; // Placeholder
    const company = getCompanyById(companyId);
    if (!company) return;
    
    const yearMonth = inst.competenceMonth || 
      `${new Date(inst.periodStart).getFullYear()}-${String(new Date(inst.periodStart).getMonth() + 1).padStart(2, '0')}`;
    
    // Aplicar filtros
    if (filters?.yearMonth && yearMonth !== filters.yearMonth) return;
    if (filters?.companyId && companyId !== filters.companyId) return;
    if (filters?.department && project.department !== filters.department) return;
    if (filters?.projectId && project.id !== filters.projectId) return;
    
    const grossRevenueBRL = convertToBRL(inst.value, inst.currency);
    const taxRate = getTaxRateForInstallment(company.type, yearMonth);
    const managerialTax = calculateManagerialTax(grossRevenueBRL, taxRate);
    const netRevenue = grossRevenueBRL - managerialTax;
    
    result.push({
      installmentId: inst.id,
      projectId: project.id,
      projectName: project.name,
      contractId: project.contractId,
      companyId,
      companyName: company.name,
      companyType: company.type,
      department: project.department,
      leaderName: project.leaderName,
      yearMonth,
      grossRevenue: inst.value,
      currency: inst.currency,
      grossRevenueBRL,
      taxIndexApplied: taxRate,
      managerialTax,
      netRevenue,
      isConsolidated: isMonthConsolidated(yearMonth),
    });
  });
  
  return result;
}

// Agregação por empresa
export function getRevenueByCompany(yearMonth?: string): RevenueByCompany[] {
  const installments = getInstallmentsWithTax(yearMonth ? { yearMonth } : undefined);
  const byCompany: Record<string, RevenueByCompany> = {};
  const projectsByCompany: Record<string, Set<string>> = {};
  
  installments.forEach(inst => {
    if (!byCompany[inst.companyId]) {
      byCompany[inst.companyId] = {
        companyId: inst.companyId,
        companyName: inst.companyName,
        companyType: inst.companyType,
        grossRevenueBRL: 0,
        managerialTax: 0,
        netRevenueBRL: 0,
        projectCount: 0,
      };
      projectsByCompany[inst.companyId] = new Set();
    }
    
    byCompany[inst.companyId].grossRevenueBRL += inst.grossRevenueBRL;
    byCompany[inst.companyId].managerialTax += inst.managerialTax;
    byCompany[inst.companyId].netRevenueBRL += inst.netRevenue;
    projectsByCompany[inst.companyId].add(inst.projectId);
  });
  
  return Object.values(byCompany).map(c => ({
    ...c,
    projectCount: projectsByCompany[c.companyId].size,
  }));
}

// Agregação por departamento
export function getRevenueByDepartmentReport(yearMonth?: string): RevenueByDepartmentReport[] {
  const installments = getInstallmentsWithTax(yearMonth ? { yearMonth } : undefined);
  const byDept: Record<string, RevenueByDepartmentReport> = {};
  const projectsByDept: Record<string, Set<string>> = {};
  
  // Inicializar todos os departamentos
  Object.keys(DEPARTMENT_LABELS).forEach(dept => {
    byDept[dept] = {
      department: dept as Department,
      departmentLabel: DEPARTMENT_LABELS[dept as Department],
      grossRevenueBRL: 0,
      managerialTax: 0,
      netRevenueBRL: 0,
      projectCount: 0,
    };
    projectsByDept[dept] = new Set();
  });
  
  installments.forEach(inst => {
    byDept[inst.department].grossRevenueBRL += inst.grossRevenueBRL;
    byDept[inst.department].managerialTax += inst.managerialTax;
    byDept[inst.department].netRevenueBRL += inst.netRevenue;
    projectsByDept[inst.department].add(inst.projectId);
  });
  
  return Object.values(byDept).map(d => ({
    ...d,
    projectCount: projectsByDept[d.department].size,
  }));
}

// Agregação por líder
export function getRevenueByLeader(yearMonth?: string): RevenueByLeader[] {
  const installments = getInstallmentsWithTax(yearMonth ? { yearMonth } : undefined);
  const byLeader: Record<string, RevenueByLeader> = {};
  const projectsByLeader: Record<string, Set<string>> = {};
  
  installments.forEach(inst => {
    const leaderKey = inst.leaderName || 'Sem líder';
    
    if (!byLeader[leaderKey]) {
      byLeader[leaderKey] = {
        leaderName: leaderKey,
        grossRevenueBRL: 0,
        managerialTax: 0,
        netRevenueBRL: 0,
        projectCount: 0,
      };
      projectsByLeader[leaderKey] = new Set();
    }
    
    byLeader[leaderKey].grossRevenueBRL += inst.grossRevenueBRL;
    byLeader[leaderKey].managerialTax += inst.managerialTax;
    byLeader[leaderKey].netRevenueBRL += inst.netRevenue;
    projectsByLeader[leaderKey].add(inst.projectId);
  });
  
  return Object.values(byLeader).map(l => ({
    ...l,
    projectCount: projectsByLeader[l.leaderName].size,
  }));
}

// Agregação por projeto
export function getRevenueByProject(yearMonth?: string): RevenueByProject[] {
  const installments = getInstallmentsWithTax(yearMonth ? { yearMonth } : undefined);
  const byProject: Record<string, RevenueByProject> = {};
  
  installments.forEach(inst => {
    const contract = getContractById(inst.contractId);
    
    if (!byProject[inst.projectId]) {
      byProject[inst.projectId] = {
        projectId: inst.projectId,
        projectName: inst.projectName,
        clientName: contract?.client?.name || '',
        department: inst.department,
        leaderName: inst.leaderName,
        grossRevenueBRL: 0,
        managerialTax: 0,
        netRevenueBRL: 0,
      };
    }
    
    byProject[inst.projectId].grossRevenueBRL += inst.grossRevenueBRL;
    byProject[inst.projectId].managerialTax += inst.managerialTax;
    byProject[inst.projectId].netRevenueBRL += inst.netRevenue;
  });
  
  return Object.values(byProject);
}

// Projeção mensal consolidada
export function getMonthlyProjections(): MonthlyProjection[] {
  const installments = getInstallmentsWithTax();
  const projections: Record<string, MonthlyProjection> = {};
  
  installments.forEach(inst => {
    if (!projections[inst.yearMonth]) {
      projections[inst.yearMonth] = {
        yearMonth: inst.yearMonth,
        status: inst.isConsolidated ? 'consolidated' : 'forecast',
        grossRevenueBRL: 0,
        managerialTax: 0,
        netRevenueBRL: 0,
        brazilGrossRevenue: 0,
        brazilTax: 0,
        brazilNetRevenue: 0,
        argentinaGrossRevenue: 0,
        argentinaTax: 0,
        argentinaNetRevenue: 0,
        brazilTaxIndex: getLastKnownTaxRate(),
        argentinaTaxRate: getArgentinaFixedTaxRate(),
      };
    }
    
    const proj = projections[inst.yearMonth];
    proj.grossRevenueBRL += inst.grossRevenueBRL;
    proj.managerialTax += inst.managerialTax;
    proj.netRevenueBRL += inst.netRevenue;
    
    if (inst.companyType === 'brazil') {
      proj.brazilGrossRevenue += inst.grossRevenueBRL;
      proj.brazilTax += inst.managerialTax;
      proj.brazilNetRevenue += inst.netRevenue;
      proj.brazilTaxIndex = inst.taxIndexApplied;
    } else {
      proj.argentinaGrossRevenue += inst.grossRevenueBRL;
      proj.argentinaTax += inst.managerialTax;
      proj.argentinaNetRevenue += inst.netRevenue;
      proj.argentinaTaxRate = inst.taxIndexApplied;
    }
  });
  
  return Object.values(projections).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}

// Estatísticas resumidas
export function getManagerialStats() {
  const installments = getInstallmentsWithTax();
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthData = installments.filter(i => i.yearMonth === currentMonth);
  const futureData = installments.filter(i => i.yearMonth > currentMonth);
  
  return {
    currentMonth: {
      grossRevenue: currentMonthData.reduce((sum, i) => sum + i.grossRevenueBRL, 0),
      managerialTax: currentMonthData.reduce((sum, i) => sum + i.managerialTax, 0),
      netRevenue: currentMonthData.reduce((sum, i) => sum + i.netRevenue, 0),
    },
    forecast: {
      grossRevenue: futureData.reduce((sum, i) => sum + i.grossRevenueBRL, 0),
      managerialTax: futureData.reduce((sum, i) => sum + i.managerialTax, 0),
      netRevenue: futureData.reduce((sum, i) => sum + i.netRevenue, 0),
    },
    lastTaxIndex: getLastKnownTaxRate(),
    argentinaTaxRate: getArgentinaFixedTaxRate(),
  };
}
