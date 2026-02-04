import {
  Person,
  Position,
  Level,
  Department,
  PositionLevelHistory,
  PersonMonthlyCost,
  DepartmentAllocation,
  TerminationEvent,
  PayrollConfig,
  TeamAuditLog,
} from '@/types/team';

// ========================================
// CONFIGURAÇÃO PADRÃO DE FOLHA
// ========================================
export const mockPayrollConfigs: PayrollConfig[] = [
  {
    id: 'payroll-config-1',
    name: 'Configuração Padrão CLT',
    chargesPercentage: 68, // INSS, FGTS, etc.
    vacationProvisionPercentage: 11.11, // 1/9 do salário
    thirteenthProvisionPercentage: 8.33, // 1/12 do salário
    isDefault: true,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ========================================
// DEPARTAMENTOS / CENTROS DE CUSTO
// ========================================
export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Diretoria',
    code: 'DIR',
    managerId: 'person-1',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dept-2',
    name: 'Consultoria Tributária',
    code: 'CONS-TRIB',
    managerId: 'person-2',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dept-3',
    name: 'Consultoria Contábil',
    code: 'CONS-CONT',
    managerId: 'person-3',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dept-4',
    name: 'Administrativo',
    code: 'ADM',
    managerId: 'person-4',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dept-5',
    name: 'Comercial',
    code: 'COM',
    managerId: 'person-5',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'dept-6',
    name: 'Tecnologia',
    code: 'TI',
    managerId: 'person-6',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ========================================
// CARGOS
// ========================================
export const mockPositions: Position[] = [
  // Diretoria
  {
    id: 'pos-1',
    name: 'Diretor',
    type: 'administrative',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Gerência
  {
    id: 'pos-2',
    name: 'Gerente',
    type: 'consulting',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Coordenação
  {
    id: 'pos-3',
    name: 'Coordenador',
    type: 'consulting',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Consultores
  {
    id: 'pos-4',
    name: 'Consultor',
    type: 'consulting',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Analista
  {
    id: 'pos-5',
    name: 'Analista',
    type: 'administrative',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Assistente
  {
    id: 'pos-6',
    name: 'Assistente',
    type: 'administrative',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Comercial
  {
    id: 'pos-7',
    name: 'Executivo de Vendas',
    type: 'commercial',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ========================================
// NÍVEIS
// ========================================
export const mockLevels: Level[] = [
  // Diretor
  {
    id: 'level-1',
    positionId: 'pos-1',
    name: 'Diretor Executivo',
    baseSalary: 45000,
    pprIndex: 3.0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Gerentes
  {
    id: 'level-2',
    positionId: 'pos-2',
    name: 'Gerente Sênior',
    baseSalary: 25000,
    pprIndex: 2.5,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'level-3',
    positionId: 'pos-2',
    name: 'Gerente Pleno',
    baseSalary: 20000,
    pprIndex: 2.0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Coordenadores
  {
    id: 'level-4',
    positionId: 'pos-3',
    name: 'Coordenador Sênior',
    baseSalary: 15000,
    pprIndex: 1.8,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'level-5',
    positionId: 'pos-3',
    name: 'Coordenador Pleno',
    baseSalary: 12000,
    pprIndex: 1.5,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Consultores
  {
    id: 'level-6',
    positionId: 'pos-4',
    name: 'Consultor Sênior',
    baseSalary: 10000,
    pprIndex: 1.3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'level-7',
    positionId: 'pos-4',
    name: 'Consultor Pleno',
    baseSalary: 8000,
    pprIndex: 1.2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'level-8',
    positionId: 'pos-4',
    name: 'Consultor Júnior',
    baseSalary: 5500,
    pprIndex: 1.0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Analistas
  {
    id: 'level-9',
    positionId: 'pos-5',
    name: 'Analista Sênior',
    baseSalary: 7000,
    pprIndex: 1.2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'level-10',
    positionId: 'pos-5',
    name: 'Analista Pleno',
    baseSalary: 5500,
    pprIndex: 1.1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'level-11',
    positionId: 'pos-5',
    name: 'Analista Júnior',
    baseSalary: 4000,
    pprIndex: 1.0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Assistentes
  {
    id: 'level-12',
    positionId: 'pos-6',
    name: 'Assistente',
    baseSalary: 2500,
    pprIndex: 0.8,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Comercial
  {
    id: 'level-13',
    positionId: 'pos-7',
    name: 'Executivo Sênior',
    baseSalary: 12000,
    pprIndex: 1.5,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'level-14',
    positionId: 'pos-7',
    name: 'Executivo Pleno',
    baseSalary: 8000,
    pprIndex: 1.2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ========================================
// PESSOAS
// ========================================
export const mockPersons: Person[] = [
  // Diretoria
  {
    id: 'person-1',
    fullName: 'Roberto Carlos Silva',
    type: 'administrative',
    positionId: 'pos-1',
    levelId: 'level-1',
    departmentId: 'dept-1',
    supervisorId: undefined, // Diretor não tem supervisor
    hireDate: new Date('2015-03-01'),
    status: 'active',
    email: 'roberto.silva@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Gerentes
  {
    id: 'person-2',
    fullName: 'Maria Fernanda Costa',
    type: 'consulting',
    positionId: 'pos-2',
    levelId: 'level-2',
    departmentId: 'dept-2',
    supervisorId: 'person-1',
    hireDate: new Date('2018-06-15'),
    status: 'active',
    email: 'maria.costa@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-3',
    fullName: 'João Pedro Oliveira',
    type: 'consulting',
    positionId: 'pos-2',
    levelId: 'level-3',
    departmentId: 'dept-3',
    supervisorId: 'person-1',
    hireDate: new Date('2019-02-01'),
    status: 'active',
    email: 'joao.oliveira@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-4',
    fullName: 'Ana Paula Santos',
    type: 'administrative',
    positionId: 'pos-2',
    levelId: 'level-3',
    departmentId: 'dept-4',
    supervisorId: 'person-1',
    hireDate: new Date('2017-08-10'),
    status: 'active',
    email: 'ana.santos@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-5',
    fullName: 'Carlos Eduardo Lima',
    type: 'commercial',
    positionId: 'pos-2',
    levelId: 'level-2',
    departmentId: 'dept-5',
    supervisorId: 'person-1',
    hireDate: new Date('2020-01-15'),
    status: 'active',
    email: 'carlos.lima@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-6',
    fullName: 'Fernanda Ribeiro',
    type: 'administrative',
    positionId: 'pos-2',
    levelId: 'level-3',
    departmentId: 'dept-6',
    supervisorId: 'person-1',
    hireDate: new Date('2021-03-01'),
    status: 'active',
    email: 'fernanda.ribeiro@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Coordenadores
  {
    id: 'person-7',
    fullName: 'Lucas Mendes',
    type: 'consulting',
    positionId: 'pos-3',
    levelId: 'level-4',
    departmentId: 'dept-2',
    supervisorId: 'person-2',
    hireDate: new Date('2020-04-01'),
    status: 'active',
    email: 'lucas.mendes@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-8',
    fullName: 'Patricia Almeida',
    type: 'consulting',
    positionId: 'pos-3',
    levelId: 'level-5',
    departmentId: 'dept-3',
    supervisorId: 'person-3',
    hireDate: new Date('2021-07-15'),
    status: 'active',
    email: 'patricia.almeida@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Consultores
  {
    id: 'person-9',
    fullName: 'Bruno Carvalho',
    type: 'consulting',
    positionId: 'pos-4',
    levelId: 'level-6',
    departmentId: 'dept-2',
    supervisorId: 'person-7',
    hireDate: new Date('2022-01-10'),
    status: 'active',
    email: 'bruno.carvalho@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-10',
    fullName: 'Camila Souza',
    type: 'consulting',
    positionId: 'pos-4',
    levelId: 'level-7',
    departmentId: 'dept-2',
    supervisorId: 'person-7',
    hireDate: new Date('2022-06-01'),
    status: 'active',
    email: 'camila.souza@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-11',
    fullName: 'Diego Martins',
    type: 'consulting',
    positionId: 'pos-4',
    levelId: 'level-8',
    departmentId: 'dept-3',
    supervisorId: 'person-8',
    hireDate: new Date('2023-02-15'),
    status: 'active',
    email: 'diego.martins@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-12',
    fullName: 'Elena Gomes',
    type: 'consulting',
    positionId: 'pos-4',
    levelId: 'level-7',
    departmentId: 'dept-3',
    supervisorId: 'person-8',
    hireDate: new Date('2023-05-01'),
    status: 'active',
    email: 'elena.gomes@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Analistas e Assistentes
  {
    id: 'person-13',
    fullName: 'Felipe Nascimento',
    type: 'administrative',
    positionId: 'pos-5',
    levelId: 'level-10',
    departmentId: 'dept-4',
    supervisorId: 'person-4',
    hireDate: new Date('2022-08-01'),
    status: 'active',
    email: 'felipe.nascimento@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'person-14',
    fullName: 'Gabriela Pereira',
    type: 'administrative',
    positionId: 'pos-6',
    levelId: 'level-12',
    departmentId: 'dept-4',
    supervisorId: 'person-4',
    hireDate: new Date('2023-03-01'),
    status: 'active',
    email: 'gabriela.pereira@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Comercial
  {
    id: 'person-15',
    fullName: 'Henrique Campos',
    type: 'commercial',
    positionId: 'pos-7',
    levelId: 'level-13',
    departmentId: 'dept-5',
    supervisorId: 'person-5',
    hireDate: new Date('2021-09-15'),
    status: 'active',
    email: 'henrique.campos@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Pessoa demitida
  {
    id: 'person-16',
    fullName: 'Igor Fernandes',
    type: 'consulting',
    positionId: 'pos-4',
    levelId: 'level-8',
    departmentId: 'dept-2',
    supervisorId: 'person-7',
    hireDate: new Date('2022-03-01'),
    terminationDate: new Date('2024-09-30'),
    status: 'inactive',
    email: 'igor.fernandes@empresa.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-09-30'),
  },
];

// ========================================
// HISTÓRICO DE CARGO E NÍVEL (PROMOÇÕES)
// ========================================
export const mockPositionLevelHistory: PositionLevelHistory[] = [
  // Bruno foi promovido de Pleno para Sênior em julho
  {
    id: 'plh-1',
    personId: 'person-9',
    positionId: 'pos-4',
    levelId: 'level-7', // Consultor Pleno
    startDate: new Date('2022-01-10'),
    endDate: new Date('2024-06-30'),
    reason: 'Contratação inicial',
    createdAt: new Date('2022-01-10'),
  },
  {
    id: 'plh-2',
    personId: 'person-9',
    positionId: 'pos-4',
    levelId: 'level-6', // Consultor Sênior
    startDate: new Date('2024-07-01'),
    endDate: undefined,
    reason: 'Promoção por desempenho',
    createdAt: new Date('2024-07-01'),
  },
  // Lucas foi promovido de Coordenador Pleno para Sênior
  {
    id: 'plh-3',
    personId: 'person-7',
    positionId: 'pos-3',
    levelId: 'level-5', // Coordenador Pleno
    startDate: new Date('2020-04-01'),
    endDate: new Date('2024-03-31'),
    reason: 'Contratação inicial',
    createdAt: new Date('2020-04-01'),
  },
  {
    id: 'plh-4',
    personId: 'person-7',
    positionId: 'pos-3',
    levelId: 'level-4', // Coordenador Sênior
    startDate: new Date('2024-04-01'),
    endDate: undefined,
    reason: 'Promoção por tempo de casa e desempenho',
    createdAt: new Date('2024-04-01'),
  },
];

// ========================================
// EVENTO DE RESCISÃO
// ========================================
export const mockTerminationEvents: TerminationEvent[] = [
  {
    id: 'term-1',
    personId: 'person-16',
    terminationDate: new Date('2024-09-30'),
    type: 'agreement',
    severanceAmount: 15000,
    classification: 'expense',
    description: 'Rescisão por acordo mútuo. Aviso prévio indenizado + multa FGTS.',
    createdAt: new Date('2024-09-30'),
    updatedAt: new Date('2024-09-30'),
  },
];

// ========================================
// RATEIO POR DEPARTAMENTO (EXEMPLOS)
// ========================================
// Pessoas que trabalham em múltiplos departamentos
export const mockDepartmentAllocations: DepartmentAllocation[] = [
  // Lucas Mendes trabalha 70% Tributário, 30% Contábil
  {
    id: 'alloc-1',
    personId: 'person-7',
    departmentId: 'dept-2',
    yearMonth: '2024-01',
    percentage: 70,
    allocatedCost: 0, // Será calculado
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'alloc-2',
    personId: 'person-7',
    departmentId: 'dept-3',
    yearMonth: '2024-01',
    percentage: 30,
    allocatedCost: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Fernanda TI trabalha 80% TI, 20% Administrativo
  {
    id: 'alloc-3',
    personId: 'person-6',
    departmentId: 'dept-6',
    yearMonth: '2024-01',
    percentage: 80,
    allocatedCost: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'alloc-4',
    personId: 'person-6',
    departmentId: 'dept-4',
    yearMonth: '2024-01',
    percentage: 20,
    allocatedCost: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ========================================
// CUSTOS MENSAIS (gerados dinamicamente)
// ========================================
export const mockPersonMonthlyCosts: PersonMonthlyCost[] = [];

// ========================================
// LOGS DE AUDITORIA
// ========================================
export const mockTeamAuditLogs: TeamAuditLog[] = [
  {
    id: 'team-audit-1',
    entityType: 'person',
    entityId: 'person-9',
    action: 'update',
    field: 'levelId',
    oldValue: 'level-7',
    newValue: 'level-6',
    userId: 'user-admin',
    userName: 'Administrador',
    timestamp: new Date('2024-07-01T10:00:00'),
  },
  {
    id: 'team-audit-2',
    entityType: 'termination',
    entityId: 'term-1',
    action: 'create',
    userId: 'user-admin',
    userName: 'Administrador',
    timestamp: new Date('2024-09-30T14:00:00'),
  },
];

// ========================================
// FUNÇÕES HELPER
// ========================================
export function getPersonById(id: string): Person | undefined {
  return mockPersons.find(p => p.id === id);
}

export function getPositionById(id: string): Position | undefined {
  return mockPositions.find(p => p.id === id);
}

export function getLevelById(id: string): Level | undefined {
  return mockLevels.find(l => l.id === id);
}

export function getDepartmentById(id: string): Department | undefined {
  return mockDepartments.find(d => d.id === id);
}

export function getLevelsByPosition(positionId: string): Level[] {
  return mockLevels.filter(l => l.positionId === positionId);
}

export function getPersonsByDepartment(departmentId: string): Person[] {
  return mockPersons.filter(p => p.departmentId === departmentId && p.status === 'active');
}

export function getSubordinates(supervisorId: string): Person[] {
  return mockPersons.filter(p => p.supervisorId === supervisorId);
}

export function getHierarchyChain(personId: string): Person[] {
  const chain: Person[] = [];
  let current = getPersonById(personId);
  
  while (current) {
    chain.push(current);
    if (current.supervisorId) {
      current = getPersonById(current.supervisorId);
    } else {
      break;
    }
  }
  
  return chain;
}

export function getAllSubordinatesRecursive(supervisorId: string): Person[] {
  const result: Person[] = [];
  const directSubordinates = getSubordinates(supervisorId);
  
  for (const sub of directSubordinates) {
    result.push(sub);
    result.push(...getAllSubordinatesRecursive(sub.id));
  }
  
  return result;
}
