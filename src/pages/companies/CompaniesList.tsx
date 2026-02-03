import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  Plus, 
  Edit, 
  Search,
  Globe,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { 
  mockCompanies, 
  getActiveCompanies 
} from "@/data/companyData";
import { 
  Company, 
  CompanyType, 
  CompanyStatus,
  Country,
  COMPANY_TYPE_LABELS, 
  COMPANY_STATUS_LABELS,
  COUNTRY_LABELS 
} from "@/types/company";

export default function CompaniesList() {
  const [companies, setCompanies] = useState(mockCompanies);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Form
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    country: "BR" as Country,
    type: "brazil" as CompanyType,
    status: "active" as CompanyStatus,
    fixedTaxRate: "",
  });

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.cnpj && company.cnpj.includes(searchTerm));
      
      const matchesType = filterType === "all" || company.type === filterType;
      const matchesStatus = filterStatus === "all" || company.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [companies, searchTerm, filterType, filterStatus]);

  const openCreateDialog = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      cnpj: "",
      country: "BR",
      type: "brazil",
      status: "active",
      fixedTaxRate: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      cnpj: company.cnpj || "",
      country: company.country,
      type: company.type,
      status: company.status,
      fixedTaxRate: company.fixedTaxRate ? (company.fixedTaxRate * 100).toString() : "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    const now = new Date();
    
    if (editingCompany) {
      // Editar
      const updated: Company = {
        ...editingCompany,
        name: formData.name,
        cnpj: formData.cnpj || undefined,
        country: formData.country,
        type: formData.type,
        status: formData.status,
        fixedTaxRate: formData.type === 'argentina_subsidiary' && formData.fixedTaxRate 
          ? parseFloat(formData.fixedTaxRate) / 100 
          : undefined,
        updatedAt: now,
      };
      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? updated : c));
      toast.success("Empresa atualizada com sucesso!");
    } else {
      // Criar
      const newCompany: Company = {
        id: `comp-${Date.now()}`,
        name: formData.name,
        cnpj: formData.cnpj || undefined,
        country: formData.country,
        type: formData.type,
        status: formData.status,
        fixedTaxRate: formData.type === 'argentina_subsidiary' && formData.fixedTaxRate 
          ? parseFloat(formData.fixedTaxRate) / 100 
          : undefined,
        createdAt: now,
        updatedAt: now,
      };
      setCompanies(prev => [...prev, newCompany]);
      toast.success("Empresa criada com sucesso!");
    }
    
    setDialogOpen(false);
  };

  const handleTypeChange = (type: CompanyType) => {
    const country: Country = type === 'argentina_subsidiary' ? 'AR' : 'BR';
    setFormData(prev => ({ 
      ...prev, 
      type, 
      country,
      fixedTaxRate: type === 'argentina_subsidiary' ? '21' : '',
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">
              Cadastro de pessoas jurídicas (entidades faturadoras)
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(COMPANY_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
            <CardDescription>
              {filteredCompanies.length} empresa(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ/CUIT</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Taxa Fixa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map(company => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {company.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {company.cnpj || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {COUNTRY_LABELS[company.country]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.type === 'brazil' ? 'default' : 'secondary'}>
                          {COMPANY_TYPE_LABELS[company.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.fixedTaxRate 
                          ? `${(company.fixedTaxRate * 100).toFixed(0)}%`
                          : <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.status === 'active' ? 'default' : 'outline'}>
                          {COMPANY_STATUS_LABELS[company.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Criar/Editar Empresa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {editingCompany ? "Editar Empresa" : "Nova Empresa"}
            </DialogTitle>
            <DialogDescription>
              {editingCompany 
                ? "Atualize os dados da empresa" 
                : "Cadastre uma nova pessoa jurídica"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Consultoria Brasil Ltda"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleTypeChange(value as CompanyType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value as Country }))}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COUNTRY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj">
                  {formData.country === 'BR' ? 'CNPJ' : 'CUIT'}
                </Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder={formData.country === 'BR' ? '00.000.000/0001-00' : '00-00000000-0'}
                />
              </div>
            </div>
            
            {formData.type === 'argentina_subsidiary' && (
              <div className="space-y-2">
                <Label htmlFor="fixedTaxRate">Taxa de Imposto Fixa (%)</Label>
                <Input
                  id="fixedTaxRate"
                  type="number"
                  value={formData.fixedTaxRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, fixedTaxRate: e.target.value }))}
                  placeholder="21"
                />
                <p className="text-xs text-muted-foreground">
                  Percentual fixo de imposto para fins gerenciais
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CompanyStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPANY_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingCompany ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
