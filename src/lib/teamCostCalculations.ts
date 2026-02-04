import { format, getDaysInMonth, differenceInDays, startOfMonth, endOfMonth, parseISO, isAfter, isBefore, isWithinInterval } from 'date-fns';
import {
  Person,
  PersonMonthlyCost,
  DepartmentAllocation,
  CostConsolidation,
  PositionLevelHistory,
  PayrollConfig,
} from '@/types/team';
import {
  mockPersons,
  mockLevels,
  mockDepartments,
  mockPayrollConfigs,
  mockDepartmentAllocations,
  mockPositionLevelHistory,
  getPersonById,
  getLevelById,
  getDepartmentById,
  getAllSubordinatesRecursive,
} from '@/data/teamData';
import { mockMonthlyClosings } from '@/data/monthlyClosingData';

// ========================================
// CONFIGURAÇÕES
// ========================================
const DEFAULT_BENEFIT = 800; // Valor padrão do benefício

// ========================================
// FUNÇÕES DE CÁLCULO DE CUSTOS
// ========================================

/**
 * Obtém a configuração de folha padrão
 */
export function getDefaultPayrollConfig(): PayrollConfig {
  return mockPayrollConfigs.find(c => c.isDefault) || mockPayrollConfigs[0];
}

/**
 * Verifica se um mês está fechado
 */
export function isMonthClosed(yearMonth: string): boolean {
  const closing = mockMonthlyClosings.find(c => c.yearMonth === yearMonth);
  return closing?.status === 'closed';
}

/**
 * Obtém o nível vigente de uma pessoa em determinado mês
 */
export function getActiveLevelForMonth(personId: string, yearMonth: string): string | null {
  const [year, month] = yearMonth.split('-').map(Number);
  const targetDate = new Date(year, month - 1, 15); // Meio do mês
  
  // Buscar no histórico
  const history = mockPositionLevelHistory
    .filter(h => h.personId === personId)
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  
  for (const record of history) {
    const startDate = new Date(record.startDate);
    const endDate = record.endDate ? new Date(record.endDate) : new Date('2099-12-31');
    
    if (isWithinInterval(targetDate, { start: startDate, end: endDate })) {
      return record.levelId;
    }
  }
  
  // Se não há histórico, usar o nível atual da pessoa
  const person = getPersonById(personId);
  return person?.levelId ?? null;
}

/**
 * Calcula o fator proporcional para admissão/demissão
 */
export function calculateProportionalFactor(
  person: Person,
  yearMonth: string
): { factor: number; workingDays: number; totalDays: number } {
  const [year, month] = yearMonth.split('-').map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const totalDays = getDaysInMonth(new Date(year, month - 1));
  
  let startDate = monthStart;
  let endDate = monthEnd;
  
  // Ajustar para data de admissão
  const hireDate = new Date(person.hireDate);
  if (isAfter(hireDate, monthStart) && isBefore(hireDate, monthEnd)) {
    startDate = hireDate;
  } else if (isAfter(hireDate, monthEnd)) {
    // Pessoa ainda não foi admitida
    return { factor: 0, workingDays: 0, totalDays };
  }
  
  // Ajustar para data de demissão
  if (person.terminationDate) {
    const termDate = new Date(person.terminationDate);
    if (isBefore(termDate, monthStart)) {
      // Pessoa já foi demitida
      return { factor: 0, workingDays: 0, totalDays };
    }
    if (isBefore(termDate, monthEnd)) {
      endDate = termDate;
    }
  }
  
  const workingDays = differenceInDays(endDate, startDate) + 1;
  const factor = workingDays / totalDays;
  
  return { factor, workingDays, totalDays };
}

/**
 * Calcula o custo mensal de uma pessoa
 */
export function calculatePersonMonthlyCost(
  person: Person,
  yearMonth: string,
  config?: PayrollConfig
): PersonMonthlyCost {
  const payrollConfig = config || getDefaultPayrollConfig();
  const { factor, workingDays, totalDays } = calculateProportionalFactor(person, yearMonth);
  
  // Obter nível vigente no mês
  const activeLevelId = getActiveLevelForMonth(person.id, yearMonth);
  const level = activeLevelId ? getLevelById(activeLevelId) : getLevelById(person.levelId);
  
  if (!level || factor === 0) {
    return {
      id: `cost-${person.id}-${yearMonth}`,
      personId: person.id,
      yearMonth,
      baseSalary: 0,
      benefit: 0,
      charges: 0,
      chargesPercentage: payrollConfig.chargesPercentage,
      vacationProvision: 0,
      thirteenthProvision: 0,
      otherProvisions: 0,
      otherCosts: 0,
      totalCost: 0,
      workingDays: 0,
      totalDaysInMonth: totalDays,
      proportionalFactor: 0,
      isManualAdjustment: false,
      isLocked: isMonthClosed(yearMonth),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  // Salário e benefício proporcionais
  const baseSalary = level.baseSalary * factor;
  const benefit = DEFAULT_BENEFIT * factor;
  
  // Encargos e provisões são integrais (não proporcionais)
  const fullSalary = level.baseSalary;
  const charges = fullSalary * (payrollConfig.chargesPercentage / 100);
  const vacationProvision = fullSalary * (payrollConfig.vacationProvisionPercentage / 100);
  const thirteenthProvision = fullSalary * (payrollConfig.thirteenthProvisionPercentage / 100);
  
  // Total
  const totalCost = baseSalary + benefit + charges + vacationProvision + thirteenthProvision;
  
  return {
    id: `cost-${person.id}-${yearMonth}`,
    personId: person.id,
    yearMonth,
    baseSalary,
    benefit,
    charges,
    chargesPercentage: payrollConfig.chargesPercentage,
    vacationProvision,
    thirteenthProvision,
    otherProvisions: 0,
    otherCosts: 0,
    totalCost,
    workingDays,
    totalDaysInMonth: totalDays,
    proportionalFactor: factor,
    isManualAdjustment: false,
    isLocked: isMonthClosed(yearMonth),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Gera custos mensais para todas as pessoas em um período
 */
export function generateMonthlyCostsForPeriod(
  startYearMonth: string,
  endYearMonth: string
): PersonMonthlyCost[] {
  const costs: PersonMonthlyCost[] = [];
  const [startYear, startMonth] = startYearMonth.split('-').map(Number);
  const [endYear, endMonth] = endYearMonth.split('-').map(Number);
  
  let currentYear = startYear;
  let currentMonth = startMonth;
  
  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    const yearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    for (const person of mockPersons) {
      const cost = calculatePersonMonthlyCost(person, yearMonth);
      if (cost.totalCost > 0) {
        costs.push(cost);
      }
    }
    
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  
  return costs;
}

// ========================================
// FUNÇÕES DE RATEIO
// ========================================

/**
 * Obtém alocações de uma pessoa em um mês
 */
export function getPersonAllocations(personId: string, yearMonth: string): DepartmentAllocation[] {
  return mockDepartmentAllocations.filter(
    a => a.personId === personId && a.yearMonth === yearMonth
  );
}

/**
 * Calcula custos rateados por departamento
 */
export function calculateAllocatedCosts(
  personId: string,
  yearMonth: string,
  totalCost: number
): DepartmentAllocation[] {
  const allocations = getPersonAllocations(personId, yearMonth);
  
  if (allocations.length === 0) {
    // Se não há rateio, alocar 100% no departamento principal
    const person = getPersonById(personId);
    if (person) {
      return [{
        id: `alloc-default-${personId}-${yearMonth}`,
        personId,
        departmentId: person.departmentId,
        yearMonth,
        percentage: 100,
        allocatedCost: totalCost,
        createdAt: new Date(),
        updatedAt: new Date(),
      }];
    }
    return [];
  }
  
  // Calcular custo alocado para cada departamento
  return allocations.map(alloc => ({
    ...alloc,
    allocatedCost: totalCost * (alloc.percentage / 100),
  }));
}

/**
 * Valida se o rateio de uma pessoa soma 100%
 */
export function validateAllocationPercentages(personId: string, yearMonth: string): boolean {
  const allocations = getPersonAllocations(personId, yearMonth);
  if (allocations.length === 0) return true; // Sem rateio = 100% no principal
  
  const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
  return Math.abs(total - 100) < 0.01; // Tolerância para arredondamentos
}

// ========================================
// FUNÇÕES DE CONSOLIDAÇÃO
// ========================================

/**
 * Consolida custos por departamento
 */
export function consolidateCostsByDepartment(yearMonth: string): CostConsolidation[] {
  const consolidations: Map<string, CostConsolidation> = new Map();
  
  for (const person of mockPersons) {
    const cost = calculatePersonMonthlyCost(person, yearMonth);
    if (cost.totalCost === 0) continue;
    
    const allocations = calculateAllocatedCosts(person.id, yearMonth, cost.totalCost);
    
    for (const alloc of allocations) {
      const dept = getDepartmentById(alloc.departmentId);
      const key = alloc.departmentId;
      
      if (!consolidations.has(key)) {
        consolidations.set(key, {
          yearMonth,
          departmentId: alloc.departmentId,
          departmentName: dept?.name || 'Desconhecido',
          totalCost: 0,
          personCount: 0,
        });
      }
      
      const current = consolidations.get(key)!;
      current.totalCost += alloc.allocatedCost;
      current.personCount++;
    }
  }
  
  return Array.from(consolidations.values());
}

/**
 * Consolida custos por líder (supervisor direto)
 */
export function consolidateCostsByLeader(yearMonth: string): CostConsolidation[] {
  const consolidations: Map<string, CostConsolidation> = new Map();
  
  for (const person of mockPersons) {
    if (!person.supervisorId) continue;
    
    const cost = calculatePersonMonthlyCost(person, yearMonth);
    if (cost.totalCost === 0) continue;
    
    const leader = getPersonById(person.supervisorId);
    const key = person.supervisorId;
    
    if (!consolidations.has(key)) {
      consolidations.set(key, {
        yearMonth,
        leaderId: person.supervisorId,
        leaderName: leader?.fullName || 'Desconhecido',
        totalCost: 0,
        personCount: 0,
      });
    }
    
    const current = consolidations.get(key)!;
    current.totalCost += cost.totalCost;
    current.personCount++;
  }
  
  return Array.from(consolidations.values());
}

/**
 * Consolida custos por hierarquia (incluindo subordinados recursivos)
 */
export function consolidateCostsByManager(yearMonth: string, managerId: string): CostConsolidation {
  const manager = getPersonById(managerId);
  const subordinates = getAllSubordinatesRecursive(managerId);
  
  let totalCost = 0;
  let personCount = 0;
  
  // Incluir custo do próprio gerente
  const managerCost = calculatePersonMonthlyCost(manager!, yearMonth);
  totalCost += managerCost.totalCost;
  if (managerCost.totalCost > 0) personCount++;
  
  // Incluir custos dos subordinados
  for (const sub of subordinates) {
    const cost = calculatePersonMonthlyCost(sub, yearMonth);
    totalCost += cost.totalCost;
    if (cost.totalCost > 0) personCount++;
  }
  
  return {
    yearMonth,
    managerId,
    managerName: manager?.fullName || 'Desconhecido',
    totalCost,
    personCount,
  };
}

/**
 * Consolida custo total da empresa
 */
export function consolidateTotalCompanyCost(yearMonth: string): CostConsolidation {
  let totalCost = 0;
  let personCount = 0;
  
  for (const person of mockPersons) {
    const cost = calculatePersonMonthlyCost(person, yearMonth);
    totalCost += cost.totalCost;
    if (cost.totalCost > 0) personCount++;
  }
  
  return {
    yearMonth,
    totalCost,
    personCount,
  };
}

/**
 * Gera resumo de custos para um período
 */
export function generateCostSummary(startYearMonth: string, endYearMonth: string): {
  byMonth: CostConsolidation[];
  byDepartment: Map<string, CostConsolidation[]>;
  byLeader: Map<string, CostConsolidation[]>;
} {
  const byMonth: CostConsolidation[] = [];
  const byDepartment: Map<string, CostConsolidation[]> = new Map();
  const byLeader: Map<string, CostConsolidation[]> = new Map();
  
  const [startYear, startMonth] = startYearMonth.split('-').map(Number);
  const [endYear, endMonth] = endYearMonth.split('-').map(Number);
  
  let currentYear = startYear;
  let currentMonth = startMonth;
  
  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    const yearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    // Custo total do mês
    byMonth.push(consolidateTotalCompanyCost(yearMonth));
    
    // Por departamento
    const deptConsolidations = consolidateCostsByDepartment(yearMonth);
    for (const dc of deptConsolidations) {
      if (!byDepartment.has(dc.departmentId!)) {
        byDepartment.set(dc.departmentId!, []);
      }
      byDepartment.get(dc.departmentId!)!.push(dc);
    }
    
    // Por líder
    const leaderConsolidations = consolidateCostsByLeader(yearMonth);
    for (const lc of leaderConsolidations) {
      if (!byLeader.has(lc.leaderId!)) {
        byLeader.set(lc.leaderId!, []);
      }
      byLeader.get(lc.leaderId!)!.push(lc);
    }
    
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  
  return { byMonth, byDepartment, byLeader };
}

// ========================================
// FORMATAÇÃO
// ========================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return `${months[parseInt(month) - 1]}/${year}`;
}
