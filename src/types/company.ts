// ========================================
// TIPOS DE EMPRESAS (PESSOAS JURÍDICAS)
// ========================================

export type CompanyType = 'brazil' | 'argentina_subsidiary';

export type CompanyStatus = 'active' | 'inactive';

export type Country = 'BR' | 'AR';

export interface Company {
  id: string;
  name: string;
  cnpj?: string; // CNPJ for Brazil, CUIT for Argentina
  country: Country;
  type: CompanyType;
  status: CompanyStatus;
  // Configuração de imposto fixo (usado apenas para Argentina)
  fixedTaxRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Labels
export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  brazil: 'Empresa Brasil',
  argentina_subsidiary: 'Filial Argentina',
};

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export const COUNTRY_LABELS: Record<Country, string> = {
  BR: 'Brasil',
  AR: 'Argentina',
};
