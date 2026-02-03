// ========================================
// TIPOS DE ÍNDICE MÉDIO DE IMPOSTOS
// ========================================

export type TaxIndexStatus = 'forecast' | 'consolidated';

// Índice médio mensal de impostos (calculado para Empresas Brasil)
export interface MonthlyTaxIndex {
  id: string;
  yearMonth: string; // formato: "2024-01"
  
  // Valores realizados (informados manualmente no fechamento)
  actualRevenue?: number; // Receita contábil realizada (BRL)
  actualTaxes?: number; // Impostos realizados (BRL)
  
  // Índice calculado
  taxIndexRate: number; // Percentual do índice médio (ex: 0.1133 = 11.33%)
  
  // Status
  status: TaxIndexStatus;
  
  // Metadados
  calculatedAt?: Date;
  consolidatedAt?: Date;
  consolidatedBy?: string;
  consolidatedByName?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Configuração do percentual fixo para Argentina
export interface ArgentinaTaxConfig {
  id: string;
  fixedTaxRate: number; // Percentual fixo (ex: 0.21 = 21%)
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Log de alterações de índices
export interface TaxIndexLog {
  id: string;
  monthlyTaxIndexId?: string;
  action: 'calculate' | 'consolidate' | 'update' | 'config_change';
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  justification?: string;
  performedAt: Date;
}

// Labels
export const TAX_INDEX_STATUS_LABELS: Record<TaxIndexStatus, string> = {
  forecast: 'Projetado',
  consolidated: 'Consolidado',
};
