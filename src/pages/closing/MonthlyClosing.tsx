import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Lock, 
  Unlock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  History,
  Calculator,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { 
  mockMonthlyClosings, 
  mockMonthlyClosingLogs,
  getClosingLogsByMonth 
} from "@/data/monthlyClosingData";
import { 
  mockMonthlyTaxIndices, 
  getTaxIndexByMonth,
  calculateTaxIndex,
  getLastKnownTaxRate 
} from "@/data/taxIndexData";
import { MONTHLY_CLOSING_STATUS_LABELS } from "@/types/monthlyClosing";
import { TAX_INDEX_STATUS_LABELS } from "@/types/taxIndex";

export default function MonthlyClosing() {
  const [closings, setClosings] = useState(mockMonthlyClosings);
  const [logs, setLogs] = useState(mockMonthlyClosingLogs);
  const [taxIndices, setTaxIndices] = useState(mockMonthlyTaxIndices);
  
  // Dialogs
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [consolidateDialogOpen, setConsolidateDialogOpen] = useState(false);
  const [selectedClosing, setSelectedClosing] = useState<typeof closings[0] | null>(null);
  const [justification, setJustification] = useState("");
  
  // Campos de consolidação
  const [actualRevenue, setActualRevenue] = useState("");
  const [actualTaxes, setActualTaxes] = useState("");

  // Ordenar por mês (mais recente primeiro)
  const sortedClosings = useMemo(() => {
    return [...closings].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  }, [closings]);

  // Calcular índice em tempo real
  const calculatedIndex = useMemo(() => {
    const revenue = parseFloat(actualRevenue) || 0;
    const taxes = parseFloat(actualTaxes) || 0;
    if (revenue <= 0) return 0;
    return calculateTaxIndex(revenue, taxes);
  }, [actualRevenue, actualTaxes]);

  const handleCloseMonth = () => {
    if (!selectedClosing) return;
    
    const now = new Date();
    const updatedClosing = {
      ...selectedClosing,
      status: 'closed' as const,
      closedAt: now,
      closedBy: 'user-admin',
      closedByName: 'Administrador',
      justification: justification || undefined,
      updatedAt: now,
    };
    
    setClosings(prev => prev.map(c => c.id === selectedClosing.id ? updatedClosing : c));
    
    // Adicionar log
    const newLog = {
      id: `mcl-${Date.now()}`,
      monthlyClosingId: selectedClosing.id,
      action: 'close' as const,
      performedBy: 'user-admin',
      performedByName: 'Administrador',
      justification: justification || undefined,
      performedAt: now,
    };
    setLogs(prev => [...prev, newLog]);
    
    toast.success(`Mês ${formatMonthYear(selectedClosing.yearMonth)} fechado com sucesso!`);
    setCloseDialogOpen(false);
    setJustification("");
    setSelectedClosing(null);
  };

  const handleReopenMonth = () => {
    if (!selectedClosing || !justification.trim()) {
      toast.error("Justificativa é obrigatória para reabrir um mês");
      return;
    }
    
    const now = new Date();
    const updatedClosing = {
      ...selectedClosing,
      status: 'open' as const,
      reopenedAt: now,
      reopenedBy: 'user-admin',
      reopenedByName: 'Administrador',
      reopenReason: justification,
      updatedAt: now,
    };
    
    setClosings(prev => prev.map(c => c.id === selectedClosing.id ? updatedClosing : c));
    
    // Reverter o índice para forecast
    setTaxIndices(prev => prev.map(ti => 
      ti.yearMonth === selectedClosing.yearMonth 
        ? { ...ti, status: 'forecast' as const, updatedAt: now }
        : ti
    ));
    
    // Adicionar log
    const newLog = {
      id: `mcl-${Date.now()}`,
      monthlyClosingId: selectedClosing.id,
      action: 'reopen' as const,
      performedBy: 'user-admin',
      performedByName: 'Administrador',
      justification,
      performedAt: now,
    };
    setLogs(prev => [...prev, newLog]);
    
    toast.success(`Mês ${formatMonthYear(selectedClosing.yearMonth)} reaberto com sucesso!`);
    setReopenDialogOpen(false);
    setJustification("");
    setSelectedClosing(null);
  };

  const handleConsolidate = () => {
    if (!selectedClosing) return;
    
    const revenue = parseFloat(actualRevenue) || 0;
    const taxes = parseFloat(actualTaxes) || 0;
    
    if (revenue <= 0) {
      toast.error("Receita contábil deve ser maior que zero");
      return;
    }
    
    const now = new Date();
    const index = calculatedIndex;
    
    // Atualizar ou criar índice
    const existingIndex = taxIndices.find(ti => ti.yearMonth === selectedClosing.yearMonth);
    
    if (existingIndex) {
      setTaxIndices(prev => prev.map(ti => 
        ti.yearMonth === selectedClosing.yearMonth 
          ? {
              ...ti,
              actualRevenue: revenue,
              actualTaxes: taxes,
              taxIndexRate: index,
              status: 'consolidated' as const,
              calculatedAt: now,
              consolidatedAt: now,
              consolidatedBy: 'user-admin',
              consolidatedByName: 'Administrador',
              updatedAt: now,
            }
          : ti
      ));
    } else {
      const newIndex = {
        id: `mti-${Date.now()}`,
        yearMonth: selectedClosing.yearMonth,
        actualRevenue: revenue,
        actualTaxes: taxes,
        taxIndexRate: index,
        status: 'consolidated' as const,
        calculatedAt: now,
        consolidatedAt: now,
        consolidatedBy: 'user-admin',
        consolidatedByName: 'Administrador',
        createdAt: now,
        updatedAt: now,
      };
      setTaxIndices(prev => [...prev, newIndex]);
    }
    
    // Fechar o mês automaticamente
    const updatedClosing = {
      ...selectedClosing,
      status: 'closed' as const,
      closedAt: now,
      closedBy: 'user-admin',
      closedByName: 'Administrador',
      justification: `Consolidação: Receita R$ ${revenue.toLocaleString('pt-BR')}, Impostos R$ ${taxes.toLocaleString('pt-BR')}, Índice ${(index * 100).toFixed(2)}%`,
      updatedAt: now,
    };
    
    setClosings(prev => prev.map(c => c.id === selectedClosing.id ? updatedClosing : c));
    
    // Adicionar log
    const newLog = {
      id: `mcl-${Date.now()}`,
      monthlyClosingId: selectedClosing.id,
      action: 'close' as const,
      performedBy: 'user-admin',
      performedByName: 'Administrador',
      justification: `Consolidação com índice médio de ${(index * 100).toFixed(2)}%`,
      performedAt: now,
    };
    setLogs(prev => [...prev, newLog]);
    
    toast.success(`Mês ${formatMonthYear(selectedClosing.yearMonth)} consolidado com índice de ${(index * 100).toFixed(2)}%!`);
    setConsolidateDialogOpen(false);
    setActualRevenue("");
    setActualTaxes("");
    setSelectedClosing(null);
  };

  const openCloseDialog = (closing: typeof closings[0]) => {
    setSelectedClosing(closing);
    setJustification("");
    setCloseDialogOpen(true);
  };

  const openReopenDialog = (closing: typeof closings[0]) => {
    setSelectedClosing(closing);
    setJustification("");
    setReopenDialogOpen(true);
  };

  const openHistoryDialog = (closing: typeof closings[0]) => {
    setSelectedClosing(closing);
    setHistoryDialogOpen(true);
  };

  const openConsolidateDialog = (closing: typeof closings[0]) => {
    setSelectedClosing(closing);
    const existingIndex = taxIndices.find(ti => ti.yearMonth === closing.yearMonth);
    if (existingIndex?.actualRevenue) {
      setActualRevenue(existingIndex.actualRevenue.toString());
      setActualTaxes((existingIndex.actualTaxes || 0).toString());
    } else {
      setActualRevenue("");
      setActualTaxes("");
    }
    setConsolidateDialogOpen(true);
  };

  const closingLogs = useMemo(() => {
    if (!selectedClosing) return [];
    return logs
      .filter(log => log.monthlyClosingId === selectedClosing.id)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }, [selectedClosing, logs]);

  const getTaxIndexForMonth = (yearMonth: string) => {
    return taxIndices.find(ti => ti.yearMonth === yearMonth);
  };

  function formatMonthYear(yearMonth: string): string {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const formatted = format(date, "MMMM yyyy", { locale: ptBR });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatPercentage(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Fechamento Mensal</h1>
          <p className="text-muted-foreground">
            Gerencie o fechamento de períodos e consolidação de índices de impostos
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Índice Consolidado</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(getLastKnownTaxRate())}</div>
              <p className="text-xs text-muted-foreground">
                Índice médio de impostos Brasil
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meses Consolidados</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {closings.filter(c => c.status === 'closed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                de {closings.length} períodos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Argentina</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">21,00%</div>
              <p className="text-xs text-muted-foreground">
                Percentual fixo configurado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Legenda */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Regras de Fechamento e Consolidação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-500" />
                <span><strong>Índice Médio:</strong> Total impostos realizados ÷ Receita total realizada (apenas Empresas Brasil)</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span><strong>Forecast:</strong> Meses não consolidados usam o último índice conhecido</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-rose-500" />
                <span>Meses fechados não permitem alterações em parcelas, valores, líder ou área</span>
              </li>
              <li className="flex items-center gap-2">
                <History className="h-4 w-4 text-amber-500" />
                <span>Todas as ações são registradas no histórico com data, usuário e justificativa</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Tabela de fechamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Períodos</CardTitle>
            <CardDescription>Lista de meses, status e índices de impostos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receita Realizada</TableHead>
                  <TableHead>Impostos Realizados</TableHead>
                  <TableHead>Índice Médio</TableHead>
                  <TableHead>Consolidado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClosings.map(closing => {
                  const taxIndex = getTaxIndexForMonth(closing.yearMonth);
                  return (
                    <TableRow key={closing.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatMonthYear(closing.yearMonth)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={closing.status === 'closed' ? 'destructive' : 'default'}>
                            {closing.status === 'closed' ? (
                              <Lock className="h-3 w-3 mr-1" />
                            ) : (
                              <Unlock className="h-3 w-3 mr-1" />
                            )}
                            {MONTHLY_CLOSING_STATUS_LABELS[closing.status]}
                          </Badge>
                          {taxIndex && (
                            <Badge variant={taxIndex.status === 'consolidated' ? 'secondary' : 'outline'} className="text-xs">
                              {TAX_INDEX_STATUS_LABELS[taxIndex.status]}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {taxIndex?.actualRevenue 
                          ? formatCurrency(taxIndex.actualRevenue)
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell>
                        {taxIndex?.actualTaxes 
                          ? formatCurrency(taxIndex.actualTaxes)
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {taxIndex ? (
                            <>
                              <span className={taxIndex.status === 'consolidated' ? 'font-medium' : 'text-muted-foreground'}>
                                {formatPercentage(taxIndex.taxIndexRate)}
                              </span>
                              {taxIndex.status === 'forecast' && (
                                <Badge variant="outline" className="text-xs">forecast</Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {taxIndex?.consolidatedAt 
                          ? format(new Date(taxIndex.consolidatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "—"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistoryDialog(closing)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          
                          {closing.status === 'open' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openConsolidateDialog(closing)}
                              >
                                <Calculator className="h-4 w-4 mr-1" />
                                Consolidar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCloseDialog(closing)}
                              >
                                <Lock className="h-4 w-4 mr-1" />
                                Fechar
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReopenDialog(closing)}
                            >
                              <Unlock className="h-4 w-4 mr-1" />
                              Reabrir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Consolidar Mês */}
      <Dialog open={consolidateDialogOpen} onOpenChange={setConsolidateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              Consolidar Mês - {selectedClosing && formatMonthYear(selectedClosing.yearMonth)}
            </DialogTitle>
            <DialogDescription>
              Informe os valores realizados para calcular o índice médio de impostos.
              Este índice será aplicado às parcelas deste mês.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="actualRevenue">Receita Contábil Realizada (R$)</Label>
              <Input
                id="actualRevenue"
                type="number"
                placeholder="0,00"
                value={actualRevenue}
                onChange={(e) => setActualRevenue(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="actualTaxes">Impostos Realizados (R$)</Label>
              <Input
                id="actualTaxes"
                type="number"
                placeholder="0,00"
                value={actualTaxes}
                onChange={(e) => setActualTaxes(e.target.value)}
              />
            </div>
            
            <Card className="bg-muted">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Índice Médio Calculado:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPercentage(calculatedIndex)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fórmula: Impostos Realizados ÷ Receita Realizada
                </p>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsolidateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConsolidate} disabled={!actualRevenue || parseFloat(actualRevenue) <= 0}>
              Consolidar e Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Fechar Mês */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-500" />
              Fechar Mês
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja fechar o mês de{" "}
              <strong>{selectedClosing && formatMonthYear(selectedClosing.yearMonth)}</strong>?
              <br /><br />
              Após o fechamento, não será possível alterar parcelas, valores, líder ou área
              referentes a este período.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2 py-4">
            <Label htmlFor="justification">Justificativa (opcional)</Label>
            <Textarea
              id="justification"
              placeholder="Informe o motivo do fechamento..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseMonth}>
              Confirmar Fechamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Reabrir Mês */}
      <AlertDialog open={reopenDialogOpen} onOpenChange={setReopenDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-amber-500" />
              Reabrir Mês
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reabrir o mês de{" "}
              <strong>{selectedClosing && formatMonthYear(selectedClosing.yearMonth)}</strong>?
              <br /><br />
              Esta ação será registrada no histórico e requer uma justificativa.
              O índice consolidado será revertido para forecast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2 py-4">
            <Label htmlFor="reopen-justification">Justificativa *</Label>
            <Textarea
              id="reopen-justification"
              placeholder="Informe o motivo da reabertura..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReopenMonth}
              disabled={!justification.trim()}
            >
              Confirmar Reabertura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Histórico */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico - {selectedClosing && formatMonthYear(selectedClosing.yearMonth)}
            </DialogTitle>
            <DialogDescription>
              Registro de todas as ações realizadas neste período
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {closingLogs.length > 0 ? (
              closingLogs.map(log => (
                <div key={log.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={log.action === 'close' ? 'destructive' : 'default'}>
                      {log.action === 'close' ? 'Fechamento' : 'Reabertura'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.performedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>Por:</strong> {log.performedByName}
                  </div>
                  {log.justification && (
                    <div className="text-sm">
                      <strong>Justificativa:</strong> {log.justification}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum registro de ação para este período.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
