import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
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
  getProjectWithRelations, 
  getContractById,
  getClientById,
  getInstallmentsByProjectId,
  getCommissionsByProjectId,
  getLeaderHistoryByProjectId
} from "@/data/mockData";
import {
  DEPARTMENT_LABELS,
  CURRENCY_SYMBOLS,
  INSTALLMENT_TYPE_LABELS,
  COMMISSION_TYPE_LABELS
} from "@/types/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Pencil,
  Users,
  DollarSign,
  Plus,
  History,
  UserCog,
  Receipt,
  Percent
} from "lucide-react";
import { useState, useCallback } from "react";
import { LeaderChangeModal } from "@/components/projects/LeaderChangeModal";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh when leader changes
  const handleLeaderChangeSuccess = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  if (!id) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Projeto não encontrado</p>
        </div>
      </AppLayout>
    );
  }

  const project = getProjectWithRelations(id);
  
  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Projeto não encontrado</p>
          <Button variant="link" asChild className="mt-4">
            <Link to="/projetos">Voltar para lista</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const contract = getContractById(project.contractId);
  const client = contract ? getClientById(contract.clientId) : undefined;
  const installments = getInstallmentsByProjectId(id);
  const commissions = getCommissionsByProjectId(id);
  const leaderHistory = getLeaderHistoryByProjectId(id);

  const currency = contract?.currency || 'BRL';
  const totalValue = installments.reduce((sum, inst) => sum + inst.value, 0);
  const totalTax = installments.reduce((sum, inst) => sum + (inst.taxEstimatedValue || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6" key={refreshKey}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to={contract ? `/contratos/${contract.id}` : "/projetos"}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Badge variant="secondary">
                {DEPARTMENT_LABELS[project.department]}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {client && contract && (
              <p className="text-muted-foreground">
                {client.name} • {contract.code}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to={`/projetos/${id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team & Leader History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipe do Projeto
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsLeaderDialogOpen(true)}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Alterar Líder
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Líder/Sênior</p>
                    <p className="font-medium">{project.leaderName || "—"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Coordenador</p>
                    <p className="font-medium">{project.coordinatorName || "—"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Gerente</p>
                    <p className="font-medium">{project.managerName || "—"}</p>
                  </div>
                </div>

                {/* Leader History */}
                {leaderHistory.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <History className="h-4 w-4" />
                      Histórico de Líderes
                    </div>
                    <div className="space-y-2">
                      {leaderHistory.map((entry) => (
                        <div 
                          key={entry.id}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{entry.newLeaderName}</span>
                              <span className="text-muted-foreground text-xs">
                                {format(new Date(entry.startDate), "dd/MM/yyyy", { locale: ptBR })}
                                {entry.endDate && (
                                  <> — {format(new Date(entry.endDate), "dd/MM/yyyy", { locale: ptBR })}</>
                                )}
                              </span>
                            </div>
                            {entry.previousLeaderName && (
                              <p className="text-muted-foreground text-xs">
                                Substituiu: {entry.previousLeaderName}
                              </p>
                            )}
                            {entry.reason && (
                              <p className="text-muted-foreground text-xs mt-1">
                                {entry.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Installments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Parcelas ({installments.length})
                </CardTitle>
                <Button size="sm" asChild>
                  <Link to={`/projetos/${id}/parcelas/nova`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Parcela
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {installments.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Impostos (%)</TableHead>
                          <TableHead className="text-right">Impostos Est.</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {installments.map(installment => (
                          <TableRow key={installment.id}>
                            <TableCell>
                              {installment.competenceMonth || (
                                <>
                                  {format(new Date(installment.periodStart), "dd/MM/yy", { locale: ptBR })}
                                  {" — "}
                                  {format(new Date(installment.periodEnd), "dd/MM/yy", { locale: ptBR })}
                                </>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {INSTALLMENT_TYPE_LABELS[installment.type]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {CURRENCY_SYMBOLS[currency]} {installment.value.toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-right">
                              {installment.taxPercentage ? `${installment.taxPercentage}%` : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {installment.taxEstimatedValue 
                                ? `${CURRENCY_SYMBOLS[currency]} ${installment.taxEstimatedValue.toLocaleString('pt-BR')}`
                                : "—"
                              }
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">
                              {installment.notes || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma parcela cadastrada</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link to={`/projetos/${id}/parcelas/nova`}>
                        Criar primeira parcela
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commissions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Comissões e Bonificações ({commissions.length})
                </CardTitle>
                <Button size="sm" asChild>
                  <Link to={`/projetos/${id}/comissoes/nova`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Comissão
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {commissions.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pessoa/Parceiro</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead>Base de Cálculo</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.map(commission => (
                          <TableRow key={commission.id}>
                            <TableCell className="font-medium">
                              {commission.personName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {COMMISSION_TYPE_LABELS[commission.type]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {commission.isPercentage 
                                ? `${commission.value}%`
                                : `${CURRENCY_SYMBOLS[currency]} ${commission.value.toLocaleString('pt-BR')}`
                              }
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {commission.calculationBase || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">
                              {commission.notes || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Percent className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma comissão cadastrada</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link to={`/projetos/${id}/comissoes/nova`}>
                        Cadastrar comissão
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
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
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">
                    {CURRENCY_SYMBOLS[currency]} {totalValue.toLocaleString('pt-BR')}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Parcelas</span>
                    <span className="font-medium">{installments.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impostos Estimados</span>
                    <span className="font-medium">
                      {CURRENCY_SYMBOLS[currency]} {totalTax.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Líquido Estimado</span>
                    <span className="font-medium">
                      {CURRENCY_SYMBOLS[currency]} {(totalValue - totalTax).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Info */}
            {contract && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contrato Vinculado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Código</p>
                    <p className="font-mono font-medium">{contract.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{client?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vigência</p>
                    <p className="text-sm">
                      {format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR })}
                      {" — "}
                      {format(new Date(contract.endDate), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full mt-2">
                    <Link to={`/contratos/${contract.id}`}>
                      Ver Contrato
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Leader Change Modal */}
      <LeaderChangeModal
        isOpen={isLeaderDialogOpen}
        onClose={() => setIsLeaderDialogOpen(false)}
        projectId={id}
        projectName={project.name}
        currentLeaderId={project.leaderId}
        currentLeaderName={project.leaderName}
        onSuccess={handleLeaderChangeSuccess}
      />
    </AppLayout>
  );
}
