import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ContractCard } from "@/components/contracts/ContractCard";
import { StatusBadge } from "@/components/contracts/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  mockContracts, 
  getClientById, 
  getProjectsByContractId 
} from "@/data/mockData";
import { 
  ContractStatus, 
  CONTRACT_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
  CURRENCY_SYMBOLS 
} from "@/types/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List,
  Eye,
  Pencil
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ContractsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Filtrar contratos
  const filteredContracts = mockContracts.filter(contract => {
    const client = getClientById(contract.clientId);
    const matchesSearch = 
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.crmSaleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contratos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os contratos da empresa
            </p>
          </div>
          <Button asChild>
            <Link to="/contratos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, código ou CRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as ContractStatus | "all")}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value as ContractStatus | "all")}>
          <TabsList>
            <TabsTrigger value="all">
              Todos ({mockContracts.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Ativos ({mockContracts.filter(c => c.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="pending_approval">
              Pendentes ({mockContracts.filter(c => c.status === 'pending_approval').length})
            </TabsTrigger>
            <TabsTrigger value="expiring_soon">
              Vencendo ({mockContracts.filter(c => c.status === 'expiring_soon').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content */}
        {viewMode === "cards" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContracts.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
                client={getClientById(contract.clientId)}
                projectCount={getProjectsByContractId(contract.id).length}
              />
            ))}
            {filteredContracts.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Nenhum contrato encontrado com os filtros aplicados.
              </div>
            )}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Projetos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map(contract => {
                  const client = getClientById(contract.clientId);
                  const projectCount = getProjectsByContractId(contract.id).length;
                  
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm">
                        {contract.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {client?.name || "—"}
                      </TableCell>
                      <TableCell>
                        {CONTRACT_TYPE_LABELS[contract.contractType]}
                      </TableCell>
                      <TableCell>
                        {CURRENCY_SYMBOLS[contract.currency]}
                      </TableCell>
                      <TableCell>
                        {format(new Date(contract.startDate), "dd/MM/yy", { locale: ptBR })}
                        {" — "}
                        {format(new Date(contract.endDate), "dd/MM/yy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={contract.status} />
                      </TableCell>
                      <TableCell>{projectCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/contratos/${contract.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/contratos/${contract.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredContracts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      Nenhum contrato encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
