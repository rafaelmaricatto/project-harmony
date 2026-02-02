import { useState, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  mockContracts, 
  mockProjects,
  getClientById 
} from "@/data/mockData";
import { isMonthClosed } from "@/data/monthlyClosingData";
import {
  Department,
  DEPARTMENT_LABELS,
  CURRENCY_SYMBOLS,
} from "@/types/contracts";
import { generateInstallments } from "@/lib/revenueCalculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  CalendarIcon, 
  Save,
  FolderKanban,
  Users,
  Calculator,
  AlertCircle,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProjectForm() {
  const navigate = useNavigate();
  const { contractId } = useParams();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    contractId: contractId || "",
    department: "" as Department | "",
    leaderName: "",
    coordinatorName: "",
    managerName: "",
    // Geração automática de parcelas
    totalValue: "",
    installmentCount: "",
    startDate: undefined as Date | undefined,
    taxPercentage: "",
  });

  // Parcelas geradas
  const [generatedInstallments, setGeneratedInstallments] = useState<ReturnType<typeof generateInstallments>>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Contrato selecionado
  const selectedContract = useMemo(() => {
    return mockContracts.find(c => c.id === formData.contractId);
  }, [formData.contractId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset parcelas se alterar dados principais
    if (['totalValue', 'installmentCount', 'startDate', 'taxPercentage'].includes(field)) {
      setHasGenerated(false);
      setGeneratedInstallments([]);
    }
  };

  const handleGenerateInstallments = () => {
    if (!formData.totalValue || !formData.installmentCount || !formData.startDate || !selectedContract) {
      toast.error("Preencha valor total, quantidade de parcelas e data inicial");
      return;
    }

    const installments = generateInstallments({
      projectId: `prj-new-${Date.now()}`,
      totalValue: parseFloat(formData.totalValue),
      installmentCount: parseInt(formData.installmentCount),
      startDate: formData.startDate,
      currency: selectedContract.currency,
      taxPercentage: formData.taxPercentage ? parseFloat(formData.taxPercentage) : undefined,
    });

    setGeneratedInstallments(installments);
    setHasGenerated(true);
    toast.success(`${installments.length} parcelas geradas automaticamente!`);
  };

  // Verifica se alguma parcela está em mês fechado
  const closedMonthWarnings = useMemo(() => {
    return generatedInstallments.filter(inst => {
      return inst.competenceMonth && isMonthClosed(inst.competenceMonth);
    });
  }, [generatedInstallments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contractId || !formData.department) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (closedMonthWarnings.length > 0) {
      toast.error("Existem parcelas em meses já fechados. Ajuste as datas.");
      return;
    }

    toast.success(`Projeto "${formData.name}" criado com sucesso!`, {
      description: hasGenerated 
        ? `${generatedInstallments.length} parcelas foram geradas automaticamente.`
        : "Você pode adicionar parcelas posteriormente."
    });
    
    navigate(contractId ? `/contratos/${contractId}` : "/projetos");
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" asChild>
              <Link to={contractId ? `/contratos/${contractId}` : "/projetos"}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Novo Projeto</h1>
              <p className="text-muted-foreground">
                Cadastre um novo projeto vinculado a um contrato
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to={contractId ? `/contratos/${contractId}` : "/projetos"}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar Projeto
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Identificação do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Identificação do Projeto
              </CardTitle>
              <CardDescription>
                Informações básicas do projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Auditoria Anual 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractId">Contrato Vinculado *</Label>
                <Select 
                  value={formData.contractId} 
                  onValueChange={(value) => handleInputChange("contractId", value)}
                  disabled={!!contractId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContracts.map(contract => {
                      const client = getClientById(contract.clientId);
                      return (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.code} - {client?.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedContract && (
                  <p className="text-xs text-muted-foreground">
                    Moeda: {CURRENCY_SYMBOLS[selectedContract.currency]} ({selectedContract.currency})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Área / Departamento *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => handleInputChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Responsáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Responsáveis
              </CardTitle>
              <CardDescription>
                Equipe responsável pelo projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaderName">Líder / Sênior</Label>
                <Input
                  id="leaderName"
                  value={formData.leaderName}
                  onChange={(e) => handleInputChange("leaderName", e.target.value)}
                  placeholder="Nome do líder"
                />
                <p className="text-xs text-muted-foreground">
                  Alterações de líder serão versionadas automaticamente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordinatorName">Coordenador</Label>
                <Input
                  id="coordinatorName"
                  value={formData.coordinatorName}
                  onChange={(e) => handleInputChange("coordinatorName", e.target.value)}
                  placeholder="Nome do coordenador"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerName">Gerente</Label>
                <Input
                  id="managerName"
                  value={formData.managerName}
                  onChange={(e) => handleInputChange("managerName", e.target.value)}
                  placeholder="Nome do gerente"
                />
              </div>
            </CardContent>
          </Card>

          {/* Geração Automática de Parcelas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Geração Automática de Parcelas
              </CardTitle>
              <CardDescription>
                Informe o valor total e quantidade de parcelas para gerar automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="totalValue">Valor Total do Projeto</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {selectedContract ? CURRENCY_SYMBOLS[selectedContract.currency] : 'R$'}
                    </span>
                    <Input
                      id="totalValue"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.totalValue}
                      onChange={(e) => handleInputChange("totalValue", e.target.value)}
                      placeholder="0,00"
                      className="pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installmentCount">Quantidade de Parcelas</Label>
                  <Input
                    id="installmentCount"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.installmentCount}
                    onChange={(e) => handleInputChange("installmentCount", e.target.value)}
                    placeholder="Ex: 12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Selecione"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleInputChange("startDate", date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxPercentage">Imposto (%)</Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxPercentage}
                    onChange={(e) => handleInputChange("taxPercentage", e.target.value)}
                    placeholder="Ex: 11.33"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerateInstallments}
                disabled={!formData.totalValue || !formData.installmentCount || !formData.startDate}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Gerar Parcelas
              </Button>

              {/* Aviso de meses fechados */}
              {closedMonthWarnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Atenção: {closedMonthWarnings.length} parcela(s) estão em meses já fechados 
                    e não poderão ser editadas. Considere ajustar a data inicial.
                  </AlertDescription>
                </Alert>
              )}

              {/* Tabela de parcelas geradas */}
              {hasGenerated && generatedInstallments.length > 0 && (
                <div className="border rounded-lg mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Competência</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Imposto Est.</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedInstallments.map((inst, index) => {
                        const isClosed = inst.competenceMonth && isMonthClosed(inst.competenceMonth);
                        return (
                          <TableRow key={inst.id} className={isClosed ? "bg-destructive/10" : ""}>
                            <TableCell className="font-medium">
                              {index + 1}/{generatedInstallments.length}
                            </TableCell>
                            <TableCell>{inst.competenceMonth}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(inst.periodStart, "dd/MM/yy")} - {format(inst.periodEnd, "dd/MM/yy")}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {CURRENCY_SYMBOLS[inst.currency]} {inst.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {inst.taxEstimatedValue 
                                ? `${CURRENCY_SYMBOLS[inst.currency]} ${inst.taxEstimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : "—"
                              }
                            </TableCell>
                            <TableCell>
                              {isClosed ? (
                                <span className="flex items-center gap-1 text-destructive text-sm">
                                  <Lock className="h-3 w-3" /> Mês fechado
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Editável</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {/* Totais */}
                  <div className="p-4 border-t bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg">
                        {selectedContract && CURRENCY_SYMBOLS[selectedContract.currency]}{" "}
                        {generatedInstallments.reduce((s, i) => s + i.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </AppLayout>
  );
}
