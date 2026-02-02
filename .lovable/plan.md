# Sistema de Gestão de Contratos e Projetos

## Fase 1 - Implementação Base ✅

### Módulo de Contratos
- [x] Dashboard com cards de estatísticas
- [x] Lista de contratos com filtros e busca
- [x] Formulário de criação/edição de contratos
- [x] Detalhes do contrato com projetos vinculados
- [x] Badges de status visuais

### Módulo de Projetos
- [x] Lista de projetos com filtros
- [x] Detalhes do projeto com parcelas e comissões
- [x] Histórico de líderes (versionamento)
- [x] Modal de alteração de líder com registro histórico

### Dados Mock
- [x] Contratos de exemplo
- [x] Projetos vinculados
- [x] Parcelas e comissões
- [x] Histórico de líderes simulado

---

## Fase 2 - Funcionalidades Gerenciais ✅

### 1. Dashboard Gerencial
- [x] Receita projetada total (consolidada em BRL)
- [x] Receita por área/departamento (com gráfico de barras)
- [x] Receita por tipo de contrato (pontual vs recorrente - gráfico de pizza)
- [x] Cards com quantidade E valor financeiro
- [x] Projeção de receitas futuras com gráfico
- [x] Filtros por mês, área, cliente e projeto
- [x] Exibição de taxas de câmbio utilizadas

### 2. Relatório Mensal de Projetos
- [x] Seletor de mês de competência
- [x] Projetos novos no mês
- [x] Projetos encerrados no mês
- [x] Projetos renovados no mês
- [x] Tabelas com projeto, cliente, área, valores e período

### 3. Automação de Parcelas
- [x] Formulário de novo projeto com geração automática
- [x] Informar valor total, quantidade de parcelas e data inicial
- [x] Cálculo automático de valor por parcela
- [x] Geração sequencial mês a mês
- [x] Cálculo de impostos estimados
- [x] Validação de meses fechados

### 4. Fechamento Mensal (Governança)
- [x] Lista de períodos com status (Aberto/Fechado)
- [x] Ação de fechar mês (com justificativa opcional)
- [x] Ação de reabrir mês (com justificativa obrigatória)
- [x] Histórico de ações por período
- [x] Validação em formulários (bloqueio de meses fechados)
- [x] Logs de quem fechou/reabriu, quando e por quê

---

## Próximas Fases (Planejadas)

### Fase 3 - Autenticação e Permissões
- [ ] Login/logout com email e senha
- [ ] Perfis: Administrador, Controladoria, Diretoria, Gerentes
- [ ] Controle de acesso por área
- [ ] Fluxo de aprovação de contratos

### Fase 4 - Notificações e Alertas
- [ ] Alertas de contratos a vencer (30/60/90 dias)
- [ ] Solicitação de aprovação de renovação
- [ ] Dashboard de pendências

### Fase 5 - Integrações
- [ ] Upload real de anexos PDF
- [ ] Integração com cadastro de pessoas
- [ ] Módulo de faturamento
- [ ] Relatórios gerenciais e PPR
