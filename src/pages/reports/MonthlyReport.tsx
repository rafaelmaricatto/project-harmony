import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CalendarDays, 
  Plus, 
  CheckCircle, 
  RefreshCcw,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getProjectsByMonthStatus, MonthlyReportProject } from "@/lib/revenueCalculations";
import { CURRENCY_SYMBOLS, DEPARTMENT_LABELS } from "@/types/contracts";

function formatCurrency(value: number, currency: string): string {
  return `${CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency} ${value.toLocaleString('pt-BR')}`;
}

function ProjectTable({ projects, title, icon: Icon, emptyMessage }: { 
  projects: MonthlyReportProject[]; 
  title: string; 
  icon: React.ElementType;
  emptyMessage: string;
}) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{projects.length} projetos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{projects.length} projetos</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Área</TableHead>
              <TableHead className="text-right">Valor Mensal</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead>Período</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(project => (
              <TableRow key={project.projectId}>
                <TableCell className="font-medium">
                  <Link 
                    to={`/projetos/${project.projectId}`}
                    className="hover:underline"
                  >
                    {project.projectName}
                  </Link>
                </TableCell>
                <TableCell>{project.clientName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {DEPARTMENT_LABELS[project.department]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(project.monthlyValue, project.currency)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(project.totalValue, project.currency)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(project.startDate), "dd/MM/yy", { locale: ptBR })} - {format(new Date(project.endDate), "dd/MM/yy", { locale: ptBR })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function MonthlyReport() {
  // Gerar lista de meses (últimos 12 meses + próximos 3)
  const monthOptions = useMemo(() => {
    const months = [];
    const today = new Date();
    
    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = format(d, "MMMM yyyy", { locale: ptBR });
      months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    
    // Próximos 3 meses
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = format(d, "MMMM yyyy", { locale: ptBR });
      months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    
    return months;
  }, []);

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const projectsByStatus = useMemo(() => {
    return getProjectsByMonthStatus(selectedMonth);
  }, [selectedMonth]);

  const selectedMonthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Relatório Mensal</h1>
              <p className="text-muted-foreground">
                Movimentação de projetos por mês de competência
              </p>
            </div>
          </div>
          
          {/* Seletor de mês */}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Novos no Mês
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Plus className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsByStatus.new.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Projetos iniciados em {selectedMonthLabel}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Encerrados no Mês
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-rose-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsByStatus.closed.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contratos finalizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Renovados no Mês
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <RefreshCcw className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsByStatus.renewed.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contratos renovados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabelas por status */}
        <div className="space-y-6">
          <ProjectTable 
            projects={projectsByStatus.new}
            title="Projetos Novos"
            icon={Plus}
            emptyMessage="Nenhum projeto novo iniciado neste mês."
          />
          
          <ProjectTable 
            projects={projectsByStatus.closed}
            title="Projetos Encerrados"
            icon={CheckCircle}
            emptyMessage="Nenhum projeto encerrado neste mês."
          />
          
          <ProjectTable 
            projects={projectsByStatus.renewed}
            title="Projetos Renovados"
            icon={RefreshCcw}
            emptyMessage="Nenhum projeto renovado neste mês."
          />
        </div>
      </div>
    </AppLayout>
  );
}
