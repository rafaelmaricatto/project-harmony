import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  mockProjects, 
  getContractById, 
  getClientById,
  getInstallmentsByProjectId 
} from "@/data/mockData";
import { 
  Department,
  DEPARTMENT_LABELS,
  CURRENCY_SYMBOLS 
} from "@/types/contracts";
import { 
  Plus, 
  Search, 
  Eye,
  FolderKanban
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "all">("all");

  // Filtrar projetos
  const filteredProjects = mockProjects.filter(project => {
    const contract = getContractById(project.contractId);
    const client = contract ? getClientById(contract.clientId) : undefined;
    
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.leaderName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || project.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projetos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os projetos vinculados aos contratos
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cliente ou líder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select 
            value={departmentFilter} 
            onValueChange={(value) => setDepartmentFilter(value as Department | "all")}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as áreas</SelectItem>
              {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Projeto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Líder</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map(project => {
                const contract = getContractById(project.contractId);
                const client = contract ? getClientById(contract.clientId) : undefined;
                const installments = getInstallmentsByProjectId(project.id);
                const totalValue = installments.reduce((sum, inst) => sum + inst.value, 0);
                const currency = contract?.currency || 'BRL';
                
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        {project.name}
                      </div>
                    </TableCell>
                    <TableCell>{client?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {DEPARTMENT_LABELS[project.department]}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.leaderName || "—"}</TableCell>
                    <TableCell>{installments.length}</TableCell>
                    <TableCell className="text-right font-medium">
                      {CURRENCY_SYMBOLS[currency]} {totalValue.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/projetos/${project.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhum projeto encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
