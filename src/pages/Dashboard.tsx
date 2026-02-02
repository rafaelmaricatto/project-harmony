import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  RefreshCcw,
  Building2,
  Briefcase,
  ArrowRight,
  Plus,
  BarChart3,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  calculateTotalProjectedRevenue,
  calculateRevenueByDepartment,
  calculateRevenueByContractType,
  calculateRevenueProjection,
  getContractStats
} from "@/lib/revenueCalculations";
import { mockClients, mockProjects } from "@/data/mockData";
import { mockExchangeRates } from "@/data/monthlyClosingData";
import { Department, DEPARTMENT_LABELS } from "@/types/contracts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(210, 70%, 50%)',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  // Filtros
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  
  // Dados calculados
  const totalRevenue = useMemo(() => calculateTotalProjectedRevenue(), []);
  const revenueByDept = useMemo(() => calculateRevenueByDepartment(), []);
  const revenueByType = useMemo(() => calculateRevenueByContractType(), []);
  const contractStats = useMemo(() => getContractStats(), []);
  
  const revenueProjection = useMemo(() => {
    return calculateRevenueProjection({
      department: departmentFilter !== "all" ? departmentFilter : undefined,
      clientId: clientFilter !== "all" ? clientFilter : undefined,
      projectId: projectFilter !== "all" ? projectFilter : undefined,
    });
  }, [departmentFilter, clientFilter, projectFilter]);
  
  // Filtrar projeção por mês se selecionado
  const filteredProjection = useMemo(() => {
    if (monthFilter === "all") return revenueProjection;
    return revenueProjection.filter(p => p.yearMonth === monthFilter);
  }, [revenueProjection, monthFilter]);
  
  // Meses disponíveis para filtro
  const availableMonths = useMemo(() => {
    return revenueProjection.map(p => p.yearMonth).sort();
  }, [revenueProjection]);
  
  // Total filtrado
  const filteredTotal = useMemo(() => {
    return filteredProjection.reduce((sum, p) => sum + p.totalBRL, 0);
  }, [filteredProjection]);

  // Dados para gráfico de pizza por tipo
  const pieData = revenueByType.map((item, index) => ({
    name: item.typeLabel,
    value: item.totalBRL,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // Dados para gráfico de barras por área
  const barData = revenueByDept
    .filter(d => d.totalBRL > 0)
    .map(item => ({
      name: item.departmentLabel,
      value: item.totalBRL,
      projects: item.projectCount,
    }));

  // Dados para gráfico de projeção mensal
  const projectionChartData = filteredProjection.map(item => ({
    month: item.yearMonth.split('-')[1] + '/' + item.yearMonth.split('-')[0].slice(2),
    value: item.totalBRL,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Gerencial</h1>
            <p className="text-muted-foreground">
              Visão consolidada de receitas e contratos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/relatorio-mensal">
                <BarChart3 className="mr-2 h-4 w-4" />
                Relatório Mensal
              </Link>
            </Button>
            <Button asChild>
              <Link to="/contratos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo Contrato
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards - Main */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Projetada Total
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Consolidado em BRL
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contratos Ativos
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats.active.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(contractStats.active.valueBRL)} em receita
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contratos a Vencer
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats.expiring.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(contractStats.expiring.valueBRL)} em risco
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Renovação
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <RefreshCcw className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats.renewal.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contratos em processo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Department and Contract Type */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Por Área */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Receita por Área
              </CardTitle>
              <CardDescription>Distribuição por centro de custo</CardDescription>
            </CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(v) => formatCurrency(v)}
                      fontSize={12}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
              
              {/* Lista detalhada */}
              <div className="mt-4 space-y-2">
                {revenueByDept.filter(d => d.totalBRL > 0).map(dept => (
                  <div key={dept.department} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{dept.departmentLabel}</Badge>
                      <span className="text-muted-foreground">{dept.projectCount} projetos</span>
                    </div>
                    <span className="font-medium">{formatCurrency(dept.totalBRL)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Por Tipo de Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Receita por Tipo
              </CardTitle>
              <CardDescription>Pontual vs Recorrente</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
              
              {/* Lista detalhada */}
              <div className="mt-4 space-y-2">
                {revenueByType.map(type => (
                  <div key={type.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={type.type === 'recurring' ? 'default' : 'secondary'}>
                        {type.typeLabel}
                      </Badge>
                      <span className="text-muted-foreground">{type.contractCount} contratos</span>
                    </div>
                    <span className="font-medium">{formatCurrency(type.totalBRL)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projeção de Receitas */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Projeção de Receitas
                </CardTitle>
                <CardDescription>Receitas futuras por mês de competência</CardDescription>
              </div>
              
              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {month.split('-')[1]}/{month.split('-')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as Department | "all")}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    {mockClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os projetos</SelectItem>
                    {mockProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Total Filtrado */}
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Filtrado</div>
              <div className="text-2xl font-bold">{formatCurrency(filteredTotal)}</div>
            </div>
            
            {/* Gráfico */}
            {projectionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis 
                    tickFormatter={(v) => formatCurrency(v)}
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Mês: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Receita"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados disponíveis para os filtros selecionados
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taxas de Câmbio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxas de Câmbio</CardTitle>
            <CardDescription>Taxas utilizadas para conversão para BRL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {mockExchangeRates.map(rate => (
                <div key={rate.id} className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
                  <Badge variant="outline">{rate.fromCurrency}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">BRL</Badge>
                  <span className="font-medium ml-2">
                    {rate.rate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
