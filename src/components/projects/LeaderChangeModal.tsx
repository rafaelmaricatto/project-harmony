import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { propagateLeaderChange, getAvailableMonthsForLeaderChange } from "@/lib/leaderPropagation";
import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";

interface LeaderChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentLeaderId?: string;
  currentLeaderName?: string;
  onSuccess?: () => void;
}

export function LeaderChangeModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentLeaderId,
  currentLeaderName,
  onSuccess,
}: LeaderChangeModalProps) {
  const [newLeaderName, setNewLeaderName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obter meses disponíveis (não fechados)
  const availableMonths = getAvailableMonthsForLeaderChange(projectId);

  const formatMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const handleSubmit = () => {
    if (!newLeaderName.trim()) {
      toast.error("Informe o nome do novo líder");
      return;
    }
    if (!selectedMonth) {
      toast.error("Selecione o mês a partir do qual o novo líder assume");
      return;
    }

    setIsSubmitting(true);

    // Simular um pequeno delay para feedback visual
    setTimeout(() => {
      const result = propagateLeaderChange({
        projectId,
        newLeaderId: `lead-${Date.now()}`, // Em produção, seria um ID real
        newLeaderName: newLeaderName.trim(),
        effectiveFromMonth: selectedMonth,
        reason: reason.trim() || undefined,
      });

      setIsSubmitting(false);

      if (result.success) {
        toast.success("Líder alterado com sucesso!", {
          description: result.message,
        });
        
        // Reset form
        setNewLeaderName("");
        setSelectedMonth("");
        setReason("");
        
        onClose();
        onSuccess?.();
      } else {
        toast.error("Não foi possível alterar o líder", {
          description: result.message,
        });
      }
    }, 500);
  };

  const handleClose = () => {
    setNewLeaderName("");
    setSelectedMonth("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alterar Líder do Projeto</DialogTitle>
          <DialogDescription>
            Informe o novo líder e a partir de qual mês ele assume.
            O histórico será mantido automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Projeto */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Projeto</p>
            <p className="font-medium">{projectName}</p>
          </div>

          {/* Líder Atual */}
          <div className="space-y-2">
            <Label>Líder Atual</Label>
            <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <span className="font-medium">
                {currentLeaderName || "Não definido"}
              </span>
              {currentLeaderName && (
                <Badge variant="outline">Ativo</Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Novo Líder */}
          <div className="space-y-2">
            <Label htmlFor="newLeader">Novo Líder *</Label>
            <Input
              id="newLeader"
              value={newLeaderName}
              onChange={(e) => setNewLeaderName(e.target.value)}
              placeholder="Nome do novo líder"
            />
          </div>

          {/* Mês Efetivo */}
          <div className="space-y-2">
            <Label>A partir de qual mês? *</Label>
            {availableMonths.length > 0 ? (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonth(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Não há meses disponíveis para alteração. 
                  Todos os meses com parcelas estão fechados.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da alteração (opcional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Promoção, realocação, término de contrato..."
              rows={2}
            />
          </div>

          {/* Info sobre propagação */}
          {selectedMonth && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Todas as parcelas a partir de{" "}
                <strong>{formatMonth(selectedMonth)}</strong> serão atualizadas 
                com o novo líder. Parcelas em meses fechados não serão alteradas.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || availableMonths.length === 0}
          >
            {isSubmitting ? "Processando..." : "Confirmar Alteração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
