import { MonthlyTaxIndex, ArgentinaTaxConfig, TaxIndexLog, TaxIndexStatus } from '@/types/taxIndex';

// Índices médios mensais
export const mockMonthlyTaxIndices: MonthlyTaxIndex[] = [
  // Meses consolidados (com dados reais)
  {
    id: 'mti-1',
    yearMonth: '2024-01',
    actualRevenue: 850000,
    actualTaxes: 96305,
    taxIndexRate: 0.1133, // 11.33%
    status: 'consolidated',
    calculatedAt: new Date('2024-02-05'),
    consolidatedAt: new Date('2024-02-05'),
    consolidatedBy: 'user-admin',
    consolidatedByName: 'Administrador',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: 'mti-2',
    yearMonth: '2024-02',
    actualRevenue: 920000,
    actualTaxes: 106720,
    taxIndexRate: 0.1160, // 11.60%
    status: 'consolidated',
    calculatedAt: new Date('2024-03-05'),
    consolidatedAt: new Date('2024-03-05'),
    consolidatedBy: 'user-admin',
    consolidatedByName: 'Administrador',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: 'mti-3',
    yearMonth: '2024-03',
    actualRevenue: 780000,
    actualTaxes: 85800,
    taxIndexRate: 0.1100, // 11.00%
    status: 'consolidated',
    calculatedAt: new Date('2024-04-05'),
    consolidatedAt: new Date('2024-04-05'),
    consolidatedBy: 'user-admin',
    consolidatedByName: 'Administrador',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-04-05'),
  },
  {
    id: 'mti-4',
    yearMonth: '2024-10',
    actualRevenue: 1050000,
    actualTaxes: 126000,
    taxIndexRate: 0.1200, // 12.00%
    status: 'consolidated',
    calculatedAt: new Date('2024-11-05'),
    consolidatedAt: new Date('2024-11-05'),
    consolidatedBy: 'user-admin',
    consolidatedByName: 'Administrador',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-05'),
  },
  // Meses abertos (forecast)
  {
    id: 'mti-5',
    yearMonth: '2024-11',
    taxIndexRate: 0.1200, // Usa último índice conhecido
    status: 'forecast',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'mti-6',
    yearMonth: '2024-12',
    taxIndexRate: 0.1200, // Usa último índice conhecido
    status: 'forecast',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'mti-7',
    yearMonth: '2025-01',
    taxIndexRate: 0.1200, // Usa último índice conhecido
    status: 'forecast',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'mti-8',
    yearMonth: '2025-02',
    taxIndexRate: 0.1200, // Usa último índice conhecido
    status: 'forecast',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
];

// Configuração de taxa fixa Argentina
export const mockArgentinaTaxConfig: ArgentinaTaxConfig = {
  id: 'atc-1',
  fixedTaxRate: 0.21, // 21%
  effectiveFrom: new Date('2022-01-01'),
  createdAt: new Date('2022-01-01'),
  updatedAt: new Date('2022-01-01'),
};

// Logs de alterações
export const mockTaxIndexLogs: TaxIndexLog[] = [
  {
    id: 'til-1',
    monthlyTaxIndexId: 'mti-1',
    action: 'consolidate',
    performedBy: 'user-admin',
    performedByName: 'Administrador',
    justification: 'Fechamento mensal janeiro 2024',
    performedAt: new Date('2024-02-05'),
  },
  {
    id: 'til-2',
    monthlyTaxIndexId: 'mti-2',
    action: 'consolidate',
    performedBy: 'user-admin',
    performedByName: 'Administrador',
    justification: 'Fechamento mensal fevereiro 2024',
    performedAt: new Date('2024-03-05'),
  },
];

// Funções auxiliares
export function getTaxIndexByMonth(yearMonth: string): MonthlyTaxIndex | undefined {
  return mockMonthlyTaxIndices.find(ti => ti.yearMonth === yearMonth);
}

export function getLastConsolidatedTaxIndex(): MonthlyTaxIndex | undefined {
  const consolidated = mockMonthlyTaxIndices
    .filter(ti => ti.status === 'consolidated')
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  return consolidated[0];
}

export function getLastKnownTaxRate(): number {
  const lastConsolidated = getLastConsolidatedTaxIndex();
  return lastConsolidated?.taxIndexRate || 0.1133; // Fallback 11.33%
}

export function isMonthConsolidated(yearMonth: string): boolean {
  const index = getTaxIndexByMonth(yearMonth);
  return index?.status === 'consolidated';
}

export function calculateTaxIndex(actualRevenue: number, actualTaxes: number): number {
  if (actualRevenue <= 0) return 0;
  return actualTaxes / actualRevenue;
}

export function getArgentinaFixedTaxRate(): number {
  return mockArgentinaTaxConfig.fixedTaxRate;
}
