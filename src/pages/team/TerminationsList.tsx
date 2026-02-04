import { useState, useMemo } from "react";
import { Plus, UserX, Calendar, DollarSign, FileText } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  mockTerminationEvents,
  mockPersons,
  getPersonById,
  getPositionById,
  getLevelById,
} from "@/data/teamData";
import { 
  TERMINATION_TYPE_LABELS,
  TERMINATION_CLASSIFICATION_LABELS,
} from "@/types/team";
import { formatCurrency } from "@/lib/teamCostCalculations";

export default function TerminationsList() {
  const terminationsWithPersons = useMemo(() => {
    return mockTerminationEvents.map(termination => ({
      termination,
      person: getPersonById(termination.personId),
    })).sort((a, b) => 
      new Date(b.termination.terminationDate).getTime() - 
      new Date(a.termination.terminationDate).getTime()
    );
  }, []);

  const totalSeverance = terminationsWithPersons.reduce(
    (sum, { termination }) => sum + termination.severanceAmount, 
    0
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'dismissal': return 'destructive';
      case 'resignation': return 'default';
      case 'agreement': return 'secondary';
      default: return 'outline';
    }
  };

  const getClassificationBadgeVariant = (classification: string) => {
    return classification === 'cost' ? 'default' : 'secondary';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rescisões</h1>
            <p className="text-muted-foreground">
              Eventos de desligamento e verbas indenizatórias
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Rescisão
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Rescisões</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{terminationsWithPersons.length}</div>
              <p className="text-xs text-muted-foreground">no período</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verbas Indenizatórias</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSeverance)}</div>
              <p className="text-xs text-muted-foreground">valor total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockPersons.filter(p => p.status === 'inactive').length}
              </div>
              <p className="text-xs text-muted-foreground">colaboradores desligados</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Impacto nos Custos</p>
                <p className="text-sm text-muted-foreground">
                  As verbas indenizatórias impactam apenas o mês do evento de rescisão e não são incluídas em projeções futuras.
                  A classificação contábil define se o valor será tratado como custo ou despesa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terminations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Rescisões</CardTitle>
            <CardDescription>
              Eventos de desligamento registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {terminationsWithPersons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma rescisão registrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Cargo / Nível</TableHead>
                    <TableHead>Data Rescisão</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Verbas</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {terminationsWithPersons.map(({ termination, person }) => {
                    if (!person) return null;
                    const position = getPositionById(person.positionId);
                    const level = getLevelById(person.levelId);
                    
                    return (
                      <TableRow key={termination.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-muted">
                                {getInitials(person.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{person.fullName}</div>
                              <div className="text-xs text-muted-foreground">
                                {person.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{position?.name}</div>
                          <div className="text-xs text-muted-foreground">{level?.name}</div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(termination.terminationDate), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(termination.type)}>
                            {TERMINATION_TYPE_LABELS[termination.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(termination.severanceAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getClassificationBadgeVariant(termination.classification)}>
                            {TERMINATION_CLASSIFICATION_LABELS[termination.classification]}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <span className="text-sm text-muted-foreground truncate block">
                            {termination.description || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
