import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  History
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { 
  mockMonthlyClosings, 
  mockMonthlyClosingLogs,
  getClosingLogsByMonth 
} from "@/data/monthlyClosingData";
import { MONTHLY_CLOSING_STATUS_LABELS } from "@/types/monthlyClosing";

export default function MonthlyClosing() {
  const [closings, setClosings] = useState(mockMonthlyClosings);
  const [logs, setLogs] = useState(mockMonthlyClosingLogs);
  
  // Dialogs
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedClosing, setSelectedClosing] = useState<typeof closings[0] | null>(null);
  const [justification, setJustification] = useState("");

  // Ordenar por mês (mais recente primeiro)
  const sortedClosings = useMemo(() => {
    return [...closings].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  }, [closings]);

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

  const closingLogs = useMemo(() => {
    if (!selectedClosing) return [];
    return logs
      .filter(log => log.monthlyClosingId === selectedClosing.id)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }, [selectedClosing, logs]);

  function formatMonthYear(yearMonth: string): string {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const formatted = format(date, "MMMM yyyy", { locale: ptBR });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Fechamento Mensal</h1>
          <p className="text-muted-foreground">
            Gerencie o fechamento de períodos contábeis
          </p>
        </div>

        {/* Legenda */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Regras de Fechamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-rose-500" />
                <span>Meses fechados não permitem alterações em parcelas, valores, líder ou área.</span>
              </li>
              <li className="flex items-center gap-2">
                <Unlock className="h-4 w-4 text-emerald-500" />
                <span>Apenas perfis autorizados podem fechar ou reabrir meses.</span>
              </li>
              <li className="flex items-center gap-2">
                <History className="h-4 w-4 text-blue-500" />
                <span>Todas as ações são registradas no histórico com data, usuário e justificativa.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Tabela de fechamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Períodos</CardTitle>
            <CardDescription>Lista de meses e seus status de fechamento</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fechado em</TableHead>
                  <TableHead>Por</TableHead>
                  <TableHead>Justificativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClosings.map(closing => (
                  <TableRow key={closing.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatMonthYear(closing.yearMonth)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={closing.status === 'closed' ? 'destructive' : 'default'}>
                        {closing.status === 'closed' ? (
                          <Lock className="h-3 w-3 mr-1" />
                        ) : (
                          <Unlock className="h-3 w-3 mr-1" />
                        )}
                        {MONTHLY_CLOSING_STATUS_LABELS[closing.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {closing.closedAt 
                        ? format(new Date(closing.closedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "—"
                      }
                    </TableCell>
                    <TableCell>{closing.closedByName || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {closing.justification || closing.reopenReason || "—"}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCloseDialog(closing)}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Fechar
                          </Button>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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
