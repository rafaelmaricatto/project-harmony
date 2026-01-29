import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/contracts/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  getContractWithRelations, 
  getClientById,
  getProjectsByContractId,
  getInstallmentsByProjectId,
  getCommissionsByProjectId
} from "@/data/mockData";
import {
  CONTRACT_TYPE_LABELS,
  RECURRENCE_TYPE_LABELS,
  CLIENT_TYPE_LABELS,
  CURRENCY_SYMBOLS,
  DEPARTMENT_LABELS,
  RENEWAL_TYPE_LABELS
} from "@/types/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Building2,
  FileText,
  RefreshCw,
  Users,
  DollarSign,
  FolderKanban,
  Plus,
  ChevronRight
} from "lucide-react";

export default function ContractDetails() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Contrato não encontrado</p>
        </div>
      </AppLayout>
    );
  }

  const contract = getContractWithRelations(id);
  
  if (!contract) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Contrato não encontrado</p>
          <Button variant="link" asChild className="mt-4">
            <Link to="/contratos">Voltar para lista</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const client = getClientById(contract.clientId);
  const projects = getProjectsByContractId(id);

  // Calcular totais
  const totalValue = projects.reduce((acc, project) => {
    const installments = getInstallmentsByProjectId(project.id);
    return acc + installments.reduce((sum, inst) => sum + inst.value, 0);
  }, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/contratos">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <span className="text-sm font-mono text-muted-foreground">
                {contract.code}
              </span>
              <StatusBadge status={contract.status} />
            </div>
            <h1 className="text-2xl font-bold">{client?.name}</h1>
            {client?.legalName && (
              <p className="text-sm text-muted-foreground">{client.legalName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to={`/contratos/${id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações do Contrato
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Contrato</p>
                    <p className="font-medium">
                      {CONTRACT_TYPE_LABELS[contract.contractType]}
                      {contract.recurrenceType && (
                        <span className="text-muted-foreground ml-1">
                          ({RECURRENCE_TYPE_LABELS[contract.recurrenceType]})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Cliente</p>
                    <p className="font-medium">{CLIENT_TYPE_LABELS[contract.clientType]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Moeda</p>
                    <p className="font-medium">{CURRENCY_SYMBOLS[contract.currency]} ({contract.currency})</p>
                  </div>
                  {contract.crmSaleNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Número CRM</p>
                      <p className="font-medium font-mono">{contract.crmSaleNumber}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vigência</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR })}
                        {" — "}
                        {format(new Date(contract.endDate), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Renovação Automática</p>
                    <div className="flex items-center gap-2">
                      {contract.autoRenewal ? (
                        <>
                          <RefreshCw className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium text-emerald-600">Sim</span>
                        </>
                      ) : (
                        <span className="font-medium">Não</span>
                      )}
                    </div>
                  </div>
                  {contract.renewalType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Renovação</p>
                      <p className="font-medium">{RENEWAL_TYPE_LABELS[contract.renewalType]}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Aprovação do Gerente</p>
                    <p className="font-medium">
                      {contract.requiresManagerApproval ? "Necessária" : "Não necessária"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Projetos ({projects.length})
                </CardTitle>
                <Button size="sm" asChild>
                  <Link to={`/contratos/${id}/projetos/novo`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Projeto
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Área</TableHead>
                          <TableHead>Líder</TableHead>
                          <TableHead>Parcelas</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map(project => {
                          const installments = getInstallmentsByProjectId(project.id);
                          const projectTotal = installments.reduce((sum, inst) => sum + inst.value, 0);
                          
                          return (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium">{project.name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {DEPARTMENT_LABELS[project.department]}
                                </Badge>
                              </TableCell>
                              <TableCell>{project.leaderName || "—"}</TableCell>
                              <TableCell>{installments.length}</TableCell>
                              <TableCell className="text-right font-medium">
                                {CURRENCY_SYMBOLS[contract.currency]} {projectTotal.toLocaleString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link to={`/projetos/${project.id}`}>
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum projeto cadastrado</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link to={`/contratos/${id}/projetos/novo`}>
                        Criar primeiro projeto
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{client?.name}</p>
                </div>
                {client?.legalName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Razão Social</p>
                    <p className="text-sm">{client.legalName}</p>
                  </div>
                )}
                {client?.brandRepresentation && (
                  <div>
                    <p className="text-sm text-muted-foreground">Representação de Marca</p>
                    <p className="font-medium">{client.brandRepresentation}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Cliente Novo</p>
                  <Badge variant={client?.isNew ? "default" : "secondary"}>
                    {client?.isNew ? "Sim" : "Não"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total do Contrato</p>
                  <p className="text-2xl font-bold">
                    {CURRENCY_SYMBOLS[contract.currency]} {totalValue.toLocaleString('pt-BR')}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Projetos</p>
                    <p className="font-medium">{projects.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parcelas</p>
                    <p className="font-medium">
                      {projects.reduce((acc, p) => acc + getInstallmentsByProjectId(p.id).length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.map(project => (
                    <div key={project.id} className="text-sm">
                      <p className="font-medium text-muted-foreground">{project.name}</p>
                      <div className="mt-1 space-y-1 text-sm">
                        {project.leaderName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Líder:</span>
                            <span>{project.leaderName}</span>
                          </div>
                        )}
                        {project.coordinatorName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coordenador:</span>
                            <span>{project.coordinatorName}</span>
                          </div>
                        )}
                        {project.managerName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gerente:</span>
                            <span>{project.managerName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Nenhum projeto cadastrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
