import { 
  Client, 
  Contract, 
  EconomicGroup, 
  Project, 
  Installment, 
  Commission,
  LeaderHistoryEntry,
  AuditLogEntry 
} from '@/types/contracts';

// Grupos Econômicos
export const mockEconomicGroups: EconomicGroup[] = [
  {
    id: 'eg-1',
    name: 'Grupo ABC Holdings',
    description: 'Holding de varejo e distribuição',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: 'eg-2',
    name: 'Grupo XYZ Industrial',
    description: 'Conglomerado industrial',
    createdAt: new Date('2022-06-20'),
    updatedAt: new Date('2022-06-20'),
  },
];

// Clientes
export const mockClients: Client[] = [
  {
    id: 'cli-1',
    name: 'ABC Varejo S.A.',
    legalName: 'ABC VAREJO SOCIEDADE ANÔNIMA',
    economicGroupId: 'eg-1',
    isNew: false,
    brandRepresentation: 'Marca Principal',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: 'cli-2',
    name: 'XYZ Indústria Ltda.',
    legalName: 'XYZ INDUSTRIA E COMERCIO LTDA',
    economicGroupId: 'eg-2',
    isNew: false,
    brandRepresentation: 'Marca Premium',
    createdAt: new Date('2022-06-20'),
    updatedAt: new Date('2022-06-20'),
  },
  {
    id: 'cli-3',
    name: 'Nova Tech Solutions',
    legalName: 'NOVA TECH SOLUTIONS EIRELI',
    isNew: true,
    brandRepresentation: 'Marca Digital',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'cli-4',
    name: 'Global Services Corp',
    legalName: 'GLOBAL SERVICES CORPORATION',
    isNew: false,
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2023-05-10'),
  },
];

// Contratos
export const mockContracts: Contract[] = [
  {
    id: 'ctr-1',
    code: 'CTR-2024-0001',
    crmSaleNumber: 'CRM-12345',
    clientId: 'cli-1',
    clientType: 'renewal',
    contractType: 'recurring',
    recurrenceType: 'monthly',
    currency: 'BRL',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    autoRenewal: true,
    requiresManagerApproval: true,
    renewalType: 'with_adjustment',
    status: 'active',
    attachments: [],
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'user-1',
  },
  {
    id: 'ctr-2',
    code: 'CTR-2024-0002',
    crmSaleNumber: 'CRM-12346',
    clientId: 'cli-2',
    clientType: 'existing_upsell',
    contractType: 'one_time',
    currency: 'BRL',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-08-31'),
    autoRenewal: false,
    requiresManagerApproval: false,
    status: 'active',
    attachments: [],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-01'),
    createdBy: 'user-2',
  },
  {
    id: 'ctr-3',
    code: 'CTR-2024-0003',
    clientId: 'cli-3',
    clientType: 'new_sale',
    contractType: 'recurring',
    recurrenceType: 'quarterly',
    currency: 'USD',
    startDate: new Date('2024-11-01'),
    endDate: new Date('2025-10-31'),
    autoRenewal: true,
    requiresManagerApproval: true,
    status: 'pending_approval',
    attachments: [],
    createdAt: new Date('2024-10-25'),
    updatedAt: new Date('2024-10-25'),
    createdBy: 'user-1',
  },
  {
    id: 'ctr-4',
    code: 'CTR-2023-0045',
    crmSaleNumber: 'CRM-11890',
    clientId: 'cli-4',
    clientType: 'renewal',
    contractType: 'recurring',
    recurrenceType: 'annual',
    currency: 'BRL',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2025-02-28'),
    autoRenewal: false,
    requiresManagerApproval: true,
    renewalType: 'new_values',
    status: 'expiring_soon',
    attachments: [],
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'user-3',
  },
];

// Projetos
export const mockProjects: Project[] = [
  {
    id: 'prj-1',
    name: 'Auditoria Anual 2024',
    contractId: 'ctr-1',
    department: 'audit',
    leaderId: 'lead-1',
    leaderName: 'Maria Santos',
    coordinatorId: 'coord-1',
    coordinatorName: 'João Silva',
    managerId: 'mgr-1',
    managerName: 'Carlos Oliveira',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'prj-2',
    name: 'Consultoria Fiscal Q1-Q2',
    contractId: 'ctr-1',
    department: 'tax',
    leaderId: 'lead-2',
    leaderName: 'Ana Costa',
    coordinatorId: 'coord-1',
    coordinatorName: 'João Silva',
    managerId: 'mgr-1',
    managerName: 'Carlos Oliveira',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'prj-3',
    name: 'Due Diligence - Aquisição Empresa Beta',
    contractId: 'ctr-2',
    department: 'ma',
    leaderId: 'lead-3',
    leaderName: 'Roberto Lima',
    coordinatorId: 'coord-2',
    coordinatorName: 'Fernanda Mendes',
    managerId: 'mgr-2',
    managerName: 'Paulo Souza',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: 'prj-4',
    name: 'Implementação Sistema Contábil',
    contractId: 'ctr-3',
    department: 'accounting',
    leaderId: 'lead-4',
    leaderName: 'Luciana Ferreira',
    coordinatorId: 'coord-3',
    coordinatorName: 'Marcos Pereira',
    managerId: 'mgr-3',
    managerName: 'Amanda Rocha',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: 'prj-5',
    name: 'Controladoria Estratégica',
    contractId: 'ctr-4',
    department: 'controlling',
    leaderId: 'lead-5',
    leaderName: 'Ricardo Almeida',
    coordinatorId: 'coord-4',
    coordinatorName: 'Juliana Santos',
    managerId: 'mgr-4',
    managerName: 'Eduardo Martins',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2024-06-01'),
  },
];

// Parcelas
export const mockInstallments: Installment[] = [
  // Projeto 1 - Auditoria Anual
  {
    id: 'inst-1',
    projectId: 'prj-1',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    competenceMonth: '2024-01',
    type: 'monthly',
    value: 25000,
    currency: 'BRL',
    taxPercentage: 11.33,
    taxEstimatedValue: 2832.50,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'inst-2',
    projectId: 'prj-1',
    periodStart: new Date('2024-02-01'),
    periodEnd: new Date('2024-02-29'),
    competenceMonth: '2024-02',
    type: 'monthly',
    value: 25000,
    currency: 'BRL',
    taxPercentage: 11.33,
    taxEstimatedValue: 2832.50,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'inst-3',
    projectId: 'prj-1',
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    competenceMonth: '2024-03',
    type: 'monthly',
    value: 25000,
    currency: 'BRL',
    taxPercentage: 11.33,
    taxEstimatedValue: 2832.50,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  // Projeto 3 - Due Diligence (pontual)
  {
    id: 'inst-4',
    projectId: 'prj-3',
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-08-31'),
    type: 'one_time',
    value: 180000,
    currency: 'BRL',
    taxPercentage: 11.33,
    taxEstimatedValue: 20394,
    notes: 'Projeto único de due diligence',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
  // Projeto 4 - Implementação Sistema
  {
    id: 'inst-5',
    projectId: 'prj-4',
    periodStart: new Date('2024-11-01'),
    periodEnd: new Date('2025-01-31'),
    competenceMonth: '2024-11',
    type: 'monthly',
    value: 15000,
    currency: 'USD',
    taxPercentage: 15,
    taxEstimatedValue: 2250,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

// Comissões
export const mockCommissions: Commission[] = [
  {
    id: 'com-1',
    projectId: 'prj-1',
    type: 'sales',
    personName: 'Pedro Vendas',
    isPercentage: true,
    value: 5,
    calculationBase: 'Receita recebida',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'com-2',
    projectId: 'prj-1',
    type: 'management',
    personName: 'Carlos Oliveira',
    isPercentage: true,
    value: 3,
    calculationBase: 'Receita recebida',
    notes: 'Comissão de gerência',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'com-3',
    projectId: 'prj-3',
    type: 'partner',
    personName: 'Parceiro Estratégico ABC',
    isPercentage: false,
    value: 10000,
    notes: 'Bonificação fixa por indicação',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
];

// Histórico de líderes
export const mockLeaderHistory: LeaderHistoryEntry[] = [
  {
    id: 'lh-1',
    projectId: 'prj-5',
    previousLeaderId: 'lead-old-1',
    previousLeaderName: 'Carlos Antigo',
    newLeaderId: 'lead-5',
    newLeaderName: 'Ricardo Almeida',
    startDate: new Date('2024-06-01'),
    reason: 'Promoção do líder anterior',
    changedBy: 'admin-1',
    changedAt: new Date('2024-05-28'),
  },
  {
    id: 'lh-2',
    projectId: 'prj-5',
    newLeaderId: 'lead-old-1',
    newLeaderName: 'Carlos Antigo',
    startDate: new Date('2023-06-05'),
    endDate: new Date('2024-05-31'),
    changedBy: 'admin-1',
    changedAt: new Date('2023-06-05'),
  },
];

// Audit Log
export const mockAuditLog: AuditLogEntry[] = [
  {
    id: 'log-1',
    entityType: 'contract',
    entityId: 'ctr-1',
    action: 'status_change',
    field: 'status',
    oldValue: 'pending_approval',
    newValue: 'active',
    userId: 'user-admin',
    userName: 'Administrador',
    timestamp: new Date('2024-01-01T09:00:00'),
  },
  {
    id: 'log-2',
    entityType: 'project',
    entityId: 'prj-5',
    action: 'update',
    field: 'leaderId',
    oldValue: 'Carlos Antigo',
    newValue: 'Ricardo Almeida',
    userId: 'user-admin',
    userName: 'Administrador',
    timestamp: new Date('2024-05-28T14:30:00'),
  },
  {
    id: 'log-3',
    entityType: 'contract',
    entityId: 'ctr-3',
    action: 'create',
    userId: 'user-1',
    userName: 'João da Silva',
    timestamp: new Date('2024-10-25T10:15:00'),
  },
];

// Funções auxiliares para buscar dados
export function getClientById(id: string): Client | undefined {
  return mockClients.find(c => c.id === id);
}

export function getContractById(id: string): Contract | undefined {
  return mockContracts.find(c => c.id === id);
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find(p => p.id === id);
}

export function getProjectsByContractId(contractId: string): Project[] {
  return mockProjects.filter(p => p.contractId === contractId);
}

export function getInstallmentsByProjectId(projectId: string): Installment[] {
  return mockInstallments.filter(i => i.projectId === projectId);
}

export function getCommissionsByProjectId(projectId: string): Commission[] {
  return mockCommissions.filter(c => c.projectId === projectId);
}

export function getLeaderHistoryByProjectId(projectId: string): LeaderHistoryEntry[] {
  return mockLeaderHistory.filter(h => h.projectId === projectId);
}

export function getContractWithRelations(id: string): Contract | undefined {
  const contract = getContractById(id);
  if (!contract) return undefined;
  
  const client = getClientById(contract.clientId);
  const projects = getProjectsByContractId(id);
  
  return {
    ...contract,
    client,
    projects,
  };
}

export function getProjectWithRelations(id: string): Project | undefined {
  const project = getProjectById(id);
  if (!project) return undefined;
  
  const contract = getContractById(project.contractId);
  const installments = getInstallmentsByProjectId(id);
  const commissions = getCommissionsByProjectId(id);
  const leaderHistory = getLeaderHistoryByProjectId(id);
  
  return {
    ...project,
    contract,
    installments,
    commissions,
    leaderHistory,
  };
}
