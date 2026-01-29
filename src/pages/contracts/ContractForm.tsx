import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { mockClients, mockEconomicGroups } from "@/data/mockData";
import {
  ContractType,
  RecurrenceType,
  ClientType,
  Currency,
  RenewalType,
  CONTRACT_TYPE_LABELS,
  RECURRENCE_TYPE_LABELS,
  CLIENT_TYPE_LABELS,
  CURRENCY_LABELS,
  RENEWAL_TYPE_LABELS,
} from "@/types/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  CalendarIcon, 
  Save,
  Building2,
  FileText,
  Calendar as CalendarIconOutline,
  Settings2,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ContractForm() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    // Client identification
    clientId: "",
    economicGroupId: "",
    brandRepresentation: "",
    isNewClient: false,
    clientType: "" as ClientType | "",
    
    // Contract identification
    crmSaleNumber: "",
    contractType: "" as ContractType | "",
    recurrenceType: "" as RecurrenceType | "",
    currency: "BRL" as Currency,
    
    // Validity
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    autoRenewal: false,
    
    // Renewal and governance
    requiresManagerApproval: true,
    renewalType: "" as RenewalType | "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.clientId || !formData.contractType || !formData.startDate || !formData.endDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Generate contract code
    const year = new Date().getFullYear();
    const sequence = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    const code = `CTR-${year}-${sequence}`;

    toast.success(`Contrato ${code} criado com sucesso!`, {
      description: "O contrato foi salvo como 'Em elaboração'"
    });
    
    navigate("/contratos");
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" asChild>
              <Link to="/contratos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Novo Contrato</h1>
              <p className="text-muted-foreground">
                Preencha as informações do contrato
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to="/contratos">Cancelar</Link>
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar Contrato
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Client Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Identificação do Cliente
              </CardTitle>
              <CardDescription>
                Informações sobre o cliente do contrato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente *</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => handleInputChange("clientId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="economicGroupId">Grupo Econômico</Label>
                <Select 
                  value={formData.economicGroupId} 
                  onValueChange={(value) => handleInputChange("economicGroupId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEconomicGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandRepresentation">Representação de Marca</Label>
                <Input
                  id="brandRepresentation"
                  value={formData.brandRepresentation}
                  onChange={(e) => handleInputChange("brandRepresentation", e.target.value)}
                  placeholder="Ex: Marca Principal"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cliente Novo?</Label>
                  <p className="text-sm text-muted-foreground">
                    Primeiro contrato com este cliente
                  </p>
                </div>
                <Switch
                  checked={formData.isNewClient}
                  onCheckedChange={(checked) => handleInputChange("isNewClient", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientType">Tipo de Cliente *</Label>
                <Select 
                  value={formData.clientType} 
                  onValueChange={(value) => handleInputChange("clientType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contract Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Identificação do Contrato
              </CardTitle>
              <CardDescription>
                Informações técnicas do contrato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crmSaleNumber">Número da Venda no CRM</Label>
                <Input
                  id="crmSaleNumber"
                  value={formData.crmSaleNumber}
                  onChange={(e) => handleInputChange("crmSaleNumber", e.target.value)}
                  placeholder="Ex: CRM-12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractType">Tipo de Contrato *</Label>
                <Select 
                  value={formData.contractType} 
                  onValueChange={(value) => handleInputChange("contractType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.contractType === "recurring" && (
                <div className="space-y-2">
                  <Label htmlFor="recurrenceType">Tipo de Recorrência *</Label>
                  <Select 
                    value={formData.recurrenceType} 
                    onValueChange={(value) => handleInputChange("recurrenceType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a recorrência" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RECURRENCE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currency">Moeda *</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => handleInputChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIconOutline className="h-5 w-5" />
                Vigência
              </CardTitle>
              <CardDescription>
                Período de validade do contrato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início *</Label>
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
                  <Label>Data de Término *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Selecione"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleInputChange("endDate", date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Renovação Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Renovar automaticamente ao término
                  </p>
                </div>
                <Switch
                  checked={formData.autoRenewal}
                  onCheckedChange={(checked) => handleInputChange("autoRenewal", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Renewal and Governance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Renovação e Governança
              </CardTitle>
              <CardDescription>
                Regras de aprovação e renovação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprovação do Gerente</Label>
                  <p className="text-sm text-muted-foreground">
                    Renovação depende de aprovação
                  </p>
                </div>
                <Switch
                  checked={formData.requiresManagerApproval}
                  onCheckedChange={(checked) => handleInputChange("requiresManagerApproval", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="renewalType">Tipo de Renovação</Label>
                <Select 
                  value={formData.renewalType} 
                  onValueChange={(value) => handleInputChange("renewalType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RENEWAL_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Anexos
              </CardTitle>
              <CardDescription>
                Upload do contrato em PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste arquivos ou clique para selecionar
                </p>
                <Button type="button" variant="secondary" size="sm">
                  Selecionar Arquivo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF até 10MB
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AppLayout>
  );
}
