// ========================================
// TIPOS DE FECHAMENTO MENSAL E CÂMBIO
// ========================================

export type MonthlyClosingStatus = 'open' | 'closed';

export interface MonthlyClosing {
  id: string;
  yearMonth: string; // formato: "2024-01"
  status: MonthlyClosingStatus;
  closedAt?: Date;
  closedBy?: string;
  closedByName?: string;
  justification?: string;
  reopenedAt?: Date;
  reopenedBy?: string;
  reopenedByName?: string;
  reopenReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyClosingLog {
  id: string;
  monthlyClosingId: string;
  action: 'close' | 'reopen';
  performedBy: string;
  performedByName: string;
  justification?: string;
  performedAt: Date;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Labels
export const MONTHLY_CLOSING_STATUS_LABELS: Record<MonthlyClosingStatus, string> = {
  open: 'Aberto',
  closed: 'Fechado',
};
