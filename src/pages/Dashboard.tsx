import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ContractCard } from "@/components/contracts/ContractCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  mockContracts, 
  mockClients, 
  getProjectsByContractId,
  getClientById 
} from "@/data/mockData";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Calcular estatísticas
  const activeContracts = mockContracts.filter(c => c.status === 'active').length;
  const expiringContracts = mockContracts.filter(c => c.status === 'expiring_soon').length;
  const pendingApproval = mockContracts.filter(c => c.status === 'pending_approval').length;
  const totalContracts = mockContracts.length;

  // Contratos recentes (últimos 3)
  const recentContracts = [...mockContracts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Contratos próximos do vencimento
  const expiringList = mockContracts
    .filter(c => c.status === 'expiring_soon' || c.status === 'active')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 3);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral dos contratos e projetos
            </p>
          </div>
          <Button asChild>
            <Link to="/contratos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Contratos"
            value={totalContracts}
            description="Todos os contratos cadastrados"
            icon={FileText}
          />
          <StatCard
            title="Contratos Ativos"
            value={activeContracts}
            description="Em vigência"
            icon={CheckCircle}
            iconClassName="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            title="Próximos do Vencimento"
            value={expiringContracts}
            description="Nos próximos 90 dias"
            icon={AlertTriangle}
            iconClassName="bg-rose-100 text-rose-600"
          />
          <StatCard
            title="Aguardando Aprovação"
            value={pendingApproval}
            description="Pendentes de análise"
            icon={Clock}
            iconClassName="bg-amber-100 text-amber-600"
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contratos Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Contratos Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/contratos">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentContracts.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  client={getClientById(contract.clientId)}
                  projectCount={getProjectsByContractId(contract.id).length}
                />
              ))}
            </CardContent>
          </Card>

          {/* Próximos do Vencimento */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Próximos do Vencimento</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/contratos?status=expiring_soon">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {expiringList.length > 0 ? (
                expiringList.map(contract => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    client={getClientById(contract.clientId)}
                    projectCount={getProjectsByContractId(contract.id).length}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum contrato próximo do vencimento
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
