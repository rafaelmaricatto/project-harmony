import { Company, CompanyType, CompanyStatus, Country } from '@/types/company';

// Empresas (Pessoas Jurídicas)
export const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Consultoria Brasil Ltda',
    cnpj: '12.345.678/0001-90',
    country: 'BR',
    type: 'brazil',
    status: 'active',
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2020-01-01'),
  },
  {
    id: 'comp-2',
    name: 'Consultoria Brasil S.A.',
    cnpj: '98.765.432/0001-10',
    country: 'BR',
    type: 'brazil',
    status: 'active',
    createdAt: new Date('2021-06-01'),
    updatedAt: new Date('2021-06-01'),
  },
  {
    id: 'comp-3',
    name: 'Consultoria Argentina S.R.L.',
    cnpj: '30-12345678-9', // CUIT
    country: 'AR',
    type: 'argentina_subsidiary',
    status: 'active',
    fixedTaxRate: 0.21, // 21% fixo para Argentina
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2022-01-01'),
  },
];

// Funções auxiliares
export function getCompanyById(id: string): Company | undefined {
  return mockCompanies.find(c => c.id === id);
}

export function getActiveCompanies(): Company[] {
  return mockCompanies.filter(c => c.status === 'active');
}

export function getBrazilCompanies(): Company[] {
  return mockCompanies.filter(c => c.type === 'brazil' && c.status === 'active');
}

export function getArgentinaCompanies(): Company[] {
  return mockCompanies.filter(c => c.type === 'argentina_subsidiary' && c.status === 'active');
}

// Obter taxa de imposto fixa da Argentina (padrão 21%)
export function getArgentinaTaxRate(): number {
  const argCompany = mockCompanies.find(c => c.type === 'argentina_subsidiary');
  return argCompany?.fixedTaxRate || 0.21;
}
