import { useState, useMemo } from "react";
import { Plus, Building2, Users, DollarSign } from "lucide-react";
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
import { 
  mockDepartments,
  mockPersons,
  getPersonById,
  getPersonsByDepartment,
} from "@/data/teamData";
import { 
  consolidateCostsByDepartment,
  formatCurrency,
} from "@/lib/teamCostCalculations";
import { format } from "date-fns";

export default function DepartmentsList() {
  const currentYearMonth = format(new Date(), "yyyy-MM");
  
  const departmentCosts = useMemo(() => {
    return consolidateCostsByDepartment(currentYearMonth);
  }, [currentYearMonth]);

  const getDepartmentCost = (deptId: string) => {
    const cost = departmentCosts.find(c => c.departmentId === deptId);
    return cost?.totalCost || 0;
  };

  const getDepartmentPersonCount = (deptId: string) => {
    return getPersonsByDepartment(deptId).length;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const totalCost = departmentCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const totalPersons = mockPersons.filter(p => p.status === 'active').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departamentos</h1>
            <p className="text-muted-foreground">
              Centros de custo e alocação de pessoas
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Departamento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departamentos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDepartments.length}</div>
              <p className="text-xs text-muted-foreground">centros de custo ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colaboradores Alocados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPersons}</div>
              <p className="text-xs text-muted-foreground">pessoas ativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total ({currentYearMonth})</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
              <p className="text-xs text-muted-foreground">custo mensal projetado</p>
            </CardContent>
          </Card>
        </div>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Centros de Custo</CardTitle>
            <CardDescription>
              Visualize custos e alocações por departamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Gerente</TableHead>
                  <TableHead className="text-center">Pessoas</TableHead>
                  <TableHead className="text-right">Custo Mensal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDepartments.map((dept) => {
                  const manager = dept.managerId ? getPersonById(dept.managerId) : null;
                  const personCount = getDepartmentPersonCount(dept.id);
                  const cost = getDepartmentCost(dept.id);
                  
                  return (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {dept.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>
                        {manager ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(manager.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{manager.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{personCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(cost)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={dept.isActive ? "default" : "secondary"}>
                          {dept.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
