import { useState, useMemo } from "react";
import { DollarSign, Calendar, TrendingUp, Lock, Unlock, Download, Filter, Users, Building2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  mockPersons, 
  mockDepartments,
  getPositionById,
  getLevelById,
  getDepartmentById,
} from "@/data/teamData";
import { 
  calculatePersonMonthlyCost,
  consolidateCostsByDepartment,
  consolidateCostsByLeader,
  consolidateTotalCompanyCost,
  formatCurrency,
  formatPercentage,
  formatYearMonth,
  isMonthClosed,
} from "@/lib/teamCostCalculations";

export default function MonthlyCosts() {
  const currentDate = new Date();
  const [selectedYearMonth, setSelectedYearMonth] = useState(format(currentDate, "yyyy-MM"));
  const [viewMode, setViewMode] = useState("persons");

  // Generate month options (last 12 months + next 12 months)
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (let i = -12; i <= 12; i++) {
      const date = i < 0 ? subMonths(currentDate, Math.abs(i)) : addMonths(currentDate, i);
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy", { locale: ptBR });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  }, []);

  const monthClosed = isMonthClosed(selectedYearMonth);
  const isFuture = selectedYearMonth > format(currentDate, "yyyy-MM");

  // Calculate costs for all active persons in selected month
  const personCosts = useMemo(() => {
    return mockPersons
      .filter(p => p.status === 'active' || p.terminationDate)
      .map(person => ({
        person,
        cost: calculatePersonMonthlyCost(person, selectedYearMonth),
      }))
      .filter(({ cost }) => cost.totalCost > 0)
      .sort((a, b) => b.cost.totalCost - a.cost.totalCost);
  }, [selectedYearMonth]);

  const departmentCosts = useMemo(() => {
    return consolidateCostsByDepartment(selectedYearMonth);
  }, [selectedYearMonth]);

  const leaderCosts = useMemo(() => {
    return consolidateCostsByLeader(selectedYearMonth);
  }, [selectedYearMonth]);

  const totalCost = useMemo(() => {
    return consolidateTotalCompanyCost(selectedYearMonth);
  }, [selectedYearMonth]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Custos Mensais</h1>
            <p className="text-muted-foreground">
              Projeção e consolidação de custos por pessoa, departamento e líder
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Month Selector & Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Select value={selectedYearMonth} onValueChange={setSelectedYearMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {monthClosed && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Mês Fechado
                  </Badge>
                )}
                {isFuture && (
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Projeção
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Custo Total do Mês</div>
                <div className="text-2xl font-bold">{formatCurrency(totalCost.totalCost)}</div>
                <div className="text-xs text-muted-foreground">
                  {totalCost.personCount} colaboradores
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salários</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(personCosts.reduce((sum, { cost }) => sum + cost.baseSalary, 0))}
              </div>
              <Progress 
                value={personCosts.reduce((sum, { cost }) => sum + cost.baseSalary, 0) / totalCost.totalCost * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encargos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(personCosts.reduce((sum, { cost }) => sum + cost.charges, 0))}
              </div>
              <Progress 
                value={personCosts.reduce((sum, { cost }) => sum + cost.charges, 0) / totalCost.totalCost * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provisões</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(personCosts.reduce((sum, { cost }) => 
                  sum + cost.vacationProvision + cost.thirteenthProvision + cost.otherProvisions, 0))}
              </div>
              <Progress 
                value={personCosts.reduce((sum, { cost }) => 
                  sum + cost.vacationProvision + cost.thirteenthProvision + cost.otherProvisions, 0) / totalCost.totalCost * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benefícios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(personCosts.reduce((sum, { cost }) => sum + cost.benefit, 0))}
              </div>
              <Progress 
                value={personCosts.reduce((sum, { cost }) => sum + cost.benefit, 0) / totalCost.totalCost * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* View Tabs */}
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="persons" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Por Pessoa
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Por Departamento
            </TabsTrigger>
            <TabsTrigger value="leaders" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Por Líder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="persons" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Custos por Pessoa</CardTitle>
                <CardDescription>
                  Detalhamento de custos individuais para {formatYearMonth(selectedYearMonth)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Cargo / Nível</TableHead>
                      <TableHead className="text-right">Salário</TableHead>
                      <TableHead className="text-right">Benefícios</TableHead>
                      <TableHead className="text-right">Encargos</TableHead>
                      <TableHead className="text-right">Provisões</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Prop.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personCosts.map(({ person, cost }) => {
                      const position = getPositionById(person.positionId);
                      const level = getLevelById(person.levelId);
                      const provisions = cost.vacationProvision + cost.thirteenthProvision + cost.otherProvisions;
                      
                      return (
                        <TableRow key={person.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(person.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{person.fullName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {getDepartmentById(person.departmentId)?.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{position?.name}</div>
                            <div className="text-xs text-muted-foreground">{level?.name}</div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(cost.baseSalary)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(cost.benefit)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(cost.charges)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(provisions)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(cost.totalCost)}
                          </TableCell>
                          <TableCell className="text-center">
                            {cost.proportionalFactor < 1 ? (
                              <Badge variant="outline" className="text-xs">
                                {formatPercentage(cost.proportionalFactor * 100)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">100%</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Custos por Departamento</CardTitle>
                <CardDescription>
                  Consolidação por centro de custo para {formatYearMonth(selectedYearMonth)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Departamento</TableHead>
                      <TableHead className="text-center">Pessoas</TableHead>
                      <TableHead className="text-right">Custo Total</TableHead>
                      <TableHead className="text-right">% do Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentCosts.map((dept) => (
                      <TableRow key={dept.departmentId}>
                        <TableCell className="font-medium">
                          {dept.departmentName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{dept.personCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(dept.totalCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage((dept.totalCost / totalCost.totalCost) * 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Custos por Líder</CardTitle>
                <CardDescription>
                  Consolidação por supervisor direto para {formatYearMonth(selectedYearMonth)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Líder</TableHead>
                      <TableHead className="text-center">Subordinados</TableHead>
                      <TableHead className="text-right">Custo da Equipe</TableHead>
                      <TableHead className="text-right">% do Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderCosts.map((leader) => (
                      <TableRow key={leader.leaderId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(leader.leaderName || '')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{leader.leaderName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{leader.personCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(leader.totalCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage((leader.totalCost / totalCost.totalCost) * 100)}
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
