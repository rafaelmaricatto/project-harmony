import { MonthlyClosing, MonthlyClosingLog, ExchangeRate } from '@/types/monthlyClosing';

// Fechamentos mensais
export const mockMonthlyClosings: MonthlyClosing[] = [
  {
    id: 'mc-1',
    yearMonth: '2024-01',
    status: 'closed',
    closedAt: new Date('2024-02-05T10:00:00'),
    closedBy: 'user-admin',
    closedByName: 'Administrador',
    justification: 'Fechamento regular do mês',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: 'mc-2',
    yearMonth: '2024-02',
    status: 'closed',
    closedAt: new Date('2024-03-05T10:00:00'),
    closedBy: 'user-admin',
    closedByName: 'Administrador',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: 'mc-3',
    yearMonth: '2024-03',
    status: 'closed',
    closedAt: new Date('2024-04-05T10:00:00'),
    closedBy: 'user-admin',
    closedByName: 'Administrador',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-04-05'),
  },
  {
    id: 'mc-4',
    yearMonth: '2024-10',
    status: 'closed',
    closedAt: new Date('2024-11-05T10:00:00'),
    closedBy: 'user-admin',
    closedByName: 'Administrador',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-05'),
  },
  {
    id: 'mc-5',
    yearMonth: '2024-11',
    status: 'open',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'mc-6',
    yearMonth: '2024-12',
    status: 'open',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: 'mc-7',
    yearMonth: '2025-01',
    status: 'open',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'mc-8',
    yearMonth: '2025-02',
    status: 'open',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
];

// Log de fechamentos
export const mockMonthlyClosingLogs: MonthlyClosingLog[] = [
  {
    id: 'mcl-1',
    monthlyClosingId: 'mc-1',
    action: 'close',
    performedBy: 'user-admin',
    performedByName: 'Administrador',
    justification: 'Fechamento regular do mês',
    performedAt: new Date('2024-02-05T10:00:00'),
  },
  {
    id: 'mcl-2',
    monthlyClosingId: 'mc-2',
    action: 'close',
    performedBy: 'user-admin',
    performedByName: 'Administrador',
    performedAt: new Date('2024-03-05T10:00:00'),
  },
];

// Taxas de câmbio
export const mockExchangeRates: ExchangeRate[] = [
  {
    id: 'er-1',
    fromCurrency: 'USD',
    toCurrency: 'BRL',
    rate: 5.05,
    effectiveDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'er-2',
    fromCurrency: 'EUR',
    toCurrency: 'BRL',
    rate: 5.45,
    effectiveDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'er-3',
    fromCurrency: 'ARS',
    toCurrency: 'BRL',
    rate: 0.006,
    effectiveDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Funções auxiliares
export function getMonthlyClosingByMonth(yearMonth: string): MonthlyClosing | undefined {
  return mockMonthlyClosings.find(mc => mc.yearMonth === yearMonth);
}

export function isMonthClosed(yearMonth: string): boolean {
  const closing = getMonthlyClosingByMonth(yearMonth);
  return closing?.status === 'closed';
}

export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1;
  if (fromCurrency === 'BRL') return 1;
  
  const rate = mockExchangeRates.find(
    er => er.fromCurrency === fromCurrency && er.toCurrency === toCurrency
  );
  
  return rate?.rate || 1;
}

export function convertToBRL(value: number, currency: string): number {
  const rate = getExchangeRate(currency, 'BRL');
  return value * rate;
}

export function getClosingLogsByMonth(monthlyClosingId: string): MonthlyClosingLog[] {
  return mockMonthlyClosingLogs.filter(log => log.monthlyClosingId === monthlyClosingId);
}
