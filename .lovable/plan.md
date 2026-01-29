

## Sistema de Gestão de Contratos e Projetos — Fase 1

### Visão Geral
Aplicação web para gestão de contratos e projetos de consultoria, com visual corporativo clássico (tons de azul e cinza), estrutura modular e navegação em camadas (Contrato → Projetos → Parcelas).

---

### Módulo 1: Contratos (Entrega Completa)

**1.1 Dashboard de Contratos**
- Visão geral com cards resumindo: contratos ativos, próximos do vencimento, aguardando aprovação
- Tabela listando todos os contratos com filtros por status, cliente, área e período
- Busca rápida por nome do cliente ou código do contrato
- Indicadores visuais de status (badges coloridos)

**1.2 Cadastro/Edição de Contrato**
Formulário completo em etapas com todos os campos especificados:
- **Identificação do Cliente**: cliente, grupo econômico, representação de marca, cliente novo, tipo de cliente
- **Identificação do Contrato**: ID automático, código gerado, número CRM, tipo (pontual/recorrente), recorrência, moeda
- **Vigência**: datas de início/término, renovação automática
- **Renovação e Governança**: aprovação do gerente, tipo de renovação, status do contrato
- **Anexos**: upload de PDF do contrato

**1.3 Fluxo de Status**
- Contratos iniciam como "Em elaboração"
- Transições visuais entre status (Em elaboração → Aguardando aprovação → Ativo → etc.)
- Indicação clara do status atual com histórico de mudanças

---

### Módulo 2: Projetos (Vinculados ao Contrato)

**2.1 Lista de Projetos por Contrato**
- Visualização hierárquica: ao abrir um contrato, ver todos os seus projetos
- Cards ou tabela com nome do projeto, área, líder atual, status

**2.2 Cadastro/Edição de Projeto**
- Nome do projeto, contrato vinculado (seleção ou automático)
- Área/Departamento (dropdown com opções da consultoria)
- Campos preparados para integração futura: Líder/Sênior, Coordenador, Gerente (texto ou seleção simples por enquanto)

**2.3 Histórico de Líderes**
- Ao alterar líder: modal perguntando "A partir de qual período o novo líder assume?"
- Registro automático com líder anterior, novo líder, período de responsabilidade
- Timeline visual do histórico de líderes
- **Nunca sobrescrever** — sempre versionar

---

### Módulo 3: Parcelas/Fases do Projeto

**3.1 Lista de Parcelas**
- Tabela mostrando todas as parcelas de um projeto
- Período de competência, tipo, valor, impostos estimados

**3.2 Cadastro de Parcelas**
- Vinculação automática ao projeto
- Tipo: Mensal ou Pontual
- Período de competência (mês/ano ou datas)
- Valor, moeda (herdada do contrato)
- Impostos: percentual e valor estimado
- Observações livres

**3.3 Resumo Financeiro**
- Total do projeto (soma das parcelas)
- Total de impostos estimados
- Visão por período

---

### Módulo 4: Comissões e Bonificações

**4.1 Cadastro por Projeto**
- Múltiplas comissões por projeto
- Tipos: Comissão de vendedor, Comissão de gerente/coordenador, Bonificação de parceiro
- Campos: Pessoa/parceiro, tipo, percentual ou valor fixo, base de cálculo, observações

---

### Estrutura Técnica e Navegação

**Navegação em Camadas**
- Menu lateral com: Dashboard, Contratos, Clientes, Grupos Econômicos, Configurações
- Drill-down: Contrato → Projetos → Parcelas
- Breadcrumbs para orientação

**Logs e Histórico**
- Registro de todas as alterações críticas (mudança de status, alteração de líder, edições de valores)
- Visualização de quem alterou, quando e o que mudou

**Visual Corporativo**
- Paleta: azul escuro, cinza, branco
- Tipografia profissional
- Formulários claros e organizados em seções
- Tabelas responsivas com ações contextuais

---

### Dados de Demonstração
- 3-4 contratos de exemplo com diferentes status
- Projetos vinculados com parcelas
- Histórico de líderes simulado

---

### Preparação para Fases Futuras
A estrutura será projetada para fácil adição de:
- ✅ Autenticação e permissões (próxima fase)
- ✅ Notificações e alertas de vencimento
- ✅ Módulo de faturamento
- ✅ Integração com cadastro de pessoas/equipe
- ✅ Relatórios gerenciais e PPR

