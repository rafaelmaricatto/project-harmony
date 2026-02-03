// ========================================
// TIPOS DE RELATÓRIOS GERENCIAIS
// ========================================

import { Department, Currency } from './contracts';
import { CompanyType } from './company';

// Parcela com cálculos gerenciais aplicados
export interface InstallmentWithTax {
  installmentId: string;
  projectId: string;
  projectName: string;
  contractId: string;
  companyId: string;
  companyName: string;
  companyType: CompanyType;
  department: Department;
  leaderName?: string;
  yearMonth: string;
  
  // Valores originais
  grossRevenue: number; // Receita bruta
  currency: Currency;
  grossRevenueBRL: number; // Receita bruta convertida para BRL
  
  // Impostos gerenciais
  taxIndexApplied: number; // Índice aplicado (% decimal)
  managerialTax: number; // Imposto gerencial calculado (BRL)
  
  // Receita líquida gerencial
  netRevenue: number; // Receita líquida = grossRevenueBRL - managerialTax
  
  // Status
  isConsolidated: boolean;
}

// Agregação por empresa
export interface RevenueByCompany {
  companyId: string;
  companyName: string;
  companyType: CompanyType;
  grossRevenueBRL: number;
  managerialTax: number;
  netRevenueBRL: number;
  projectCount: number;
}

// Agregação por área/departamento
export interface RevenueByDepartmentReport {
  department: Department;
  departmentLabel: string;
  grossRevenueBRL: number;
  managerialTax: number;
  netRevenueBRL: number;
  projectCount: number;
}

// Agregação por líder
export interface RevenueByLeader {
  leaderId?: string;
  leaderName: string;
  grossRevenueBRL: number;
  managerialTax: number;
  netRevenueBRL: number;
  projectCount: number;
}

// Agregação por projeto
export interface RevenueByProject {
  projectId: string;
  projectName: string;
  clientName: string;
  department: Department;
  leaderName?: string;
  grossRevenueBRL: number;
  managerialTax: number;
  netRevenueBRL: number;
}

// Projeção mensal consolidada
export interface MonthlyProjection {
  yearMonth: string;
  status: 'forecast' | 'consolidated';
  
  // Totais
  grossRevenueBRL: number;
  managerialTax: number;
  netRevenueBRL: number;
  
  // Por tipo de empresa
  brazilGrossRevenue: number;
  brazilTax: number;
  brazilNetRevenue: number;
  
  argentinaGrossRevenue: number;
  argentinaTax: number;
  argentinaNetRevenue: number;
  
  // Índice aplicado
  brazilTaxIndex: number;
  argentinaTaxRate: number;
}
