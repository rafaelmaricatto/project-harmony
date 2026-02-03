import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Building2, 
  Briefcase, 
  Users,
  DollarSign,
  Calculator,
  FileText
} from "lucide-react";
import { 
  getInstallmentsWithTax,
  getRevenueByCompany,
  getRevenueByDepartmentReport,
  getRevenueByLeader,
  getRevenueByProject,
  getMonthlyProjections,
  getManagerialStats
} from "@/lib/managerialTaxCalculations";
import { DEPARTMENT_LABELS, Department } from "@/types/contracts";
import { COMPANY_TYPE_LABELS } from "@/types/company";
import { TAX_INDEX_STATUS_LABELS } from "@/types/taxIndex";
import { mockMonthlyTaxIndices } from "@/data/taxIndexData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ManagerialReport() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  
  const stats = getManagerialStats();
  const projections = getMonthlyProjections();
  
  // Dados filtrados por mês
  const revenueByCompany = useMemo(() => 
    getRevenueByCompany(selectedMonth === "all" ? undefined : selectedMonth), 
    [selectedMonth]
  );
  
  const revenueByDepartment = useMemo(() => 
    getRevenueByDepartmentReport(selectedMonth === "all" ? undefined : selectedMonth), 
    [selectedMonth]
  );
  
  const revenueByLeader = useMemo(() => 
    getRevenueByLeader(selectedMonth === "all" ? undefined : selectedMonth), 
    [selectedMonth]
  );
  
  const revenueByProject = useMemo(() => 
    getRevenueByProject(selectedMonth === "all" ? undefined : selectedMonth), 
    [selectedMonth]
  );

  // Meses disponíveis
  const availableMonths = useMemo(() => {
    const months = mockMonthlyTaxIndices.map(ti => ti.yearMonth);
    return [...new Set(months)].sort().reverse();
  }, []);

  function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  function formatMonthYear(yearMonth: string): string {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const formatted = format(date, "MMM/yyyy", { locale: ptBR });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Relatório Gerencial</h1>
          <p className="text-muted-foreground">
            Análise de receita líquida com impostos gerenciais
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Bruta (Forecast)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.forecast.grossRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Projeção de receita futura
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Imposto Gerencial</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(stats.forecast.managerialTax)}
              </div>
              <p className="text-xs text-muted-foreground">
                Estimativa de impostos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(stats.forecast.netRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Receita após impostos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Índices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Brasil:</span>
                  <span className="font-medium">{formatPercentage(stats.lastTaxIndex)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Argentina:</span>
                  <span className="font-medium">{formatPercentage(stats.argentinaTaxRate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtro de mês */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Filtrar por competência:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {formatMonthYear(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs com diferentes visões */}
        <Tabs defaultValue="projection" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projection" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Projeção Mensal
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Por Empresa
            </TabsTrigger>
            <TabsTrigger value="department" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Por Área
            </TabsTrigger>
            <TabsTrigger value="leader" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Por Líder
            </TabsTrigger>
          </TabsList>

          {/* Projeção Mensal */}
          <TabsContent value="projection">
            <Card>
              <CardHeader>
                <CardTitle>Projeção de Receitas por Mês</CardTitle>
                <CardDescription>
                  Receita bruta, impostos gerenciais e receita líquida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Receita Bruta</TableHead>
                      <TableHead className="text-right">Imposto Gerencial</TableHead>
                      <TableHead className="text-right">Receita Líquida</TableHead>
                      <TableHead className="text-right">Índice Brasil</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projections.map(proj => (
                      <TableRow key={proj.yearMonth}>
                        <TableCell className="font-medium">
                          {formatMonthYear(proj.yearMonth)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={proj.status === 'consolidated' ? 'default' : 'outline'}>
                            {TAX_INDEX_STATUS_LABELS[proj.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(proj.grossRevenueBRL)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(proj.managerialTax)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(proj.netRevenueBRL)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage(proj.brazilTaxIndex)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por Empresa */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Empresa</CardTitle>
                <CardDescription>
                  Consolidação por pessoa jurídica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Projetos</TableHead>
                      <TableHead className="text-right">Receita Bruta</TableHead>
                      <TableHead className="text-right">Imposto Gerencial</TableHead>
                      <TableHead className="text-right">Receita Líquida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueByCompany.map(company => (
                      <TableRow key={company.companyId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {company.companyName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.companyType === 'brazil' ? 'default' : 'secondary'}>
                            {COMPANY_TYPE_LABELS[company.companyType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{company.projectCount}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(company.grossRevenueBRL)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(company.managerialTax)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(company.netRevenueBRL)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por Área */}
          <TabsContent value="department">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Área</CardTitle>
                <CardDescription>
                  Consolidação por departamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Área</TableHead>
                      <TableHead className="text-right">Projetos</TableHead>
                      <TableHead className="text-right">Receita Bruta</TableHead>
                      <TableHead className="text-right">Imposto Gerencial</TableHead>
                      <TableHead className="text-right">Receita Líquida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueByDepartment
                      .filter(d => d.grossRevenueBRL > 0)
                      .map(dept => (
                        <TableRow key={dept.department}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              {dept.departmentLabel}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{dept.projectCount}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(dept.grossRevenueBRL)}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            {formatCurrency(dept.managerialTax)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-primary">
                            {formatCurrency(dept.netRevenueBRL)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Por Líder */}
          <TabsContent value="leader">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Líder</CardTitle>
                <CardDescription>
                  Consolidação por responsável
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Líder</TableHead>
                      <TableHead className="text-right">Projetos</TableHead>
                      <TableHead className="text-right">Receita Bruta</TableHead>
                      <TableHead className="text-right">Imposto Gerencial</TableHead>
                      <TableHead className="text-right">Receita Líquida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueByLeader.map(leader => (
                      <TableRow key={leader.leaderName}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {leader.leaderName}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{leader.projectCount}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(leader.grossRevenueBRL)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(leader.managerialTax)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(leader.netRevenueBRL)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
