import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import ContractsList from "./pages/contracts/ContractsList";
import ContractDetails from "./pages/contracts/ContractDetails";
import ContractForm from "./pages/contracts/ContractForm";
import ProjectsList from "./pages/projects/ProjectsList";
import ProjectDetails from "./pages/projects/ProjectDetails";
import ProjectForm from "./pages/projects/ProjectForm";
import ClientsList from "./pages/clients/ClientsList";
import EconomicGroupsList from "./pages/economicGroups/EconomicGroupsList";
import Settings from "./pages/settings/Settings";
import MonthlyReport from "./pages/reports/MonthlyReport";
import MonthlyClosing from "./pages/closing/MonthlyClosing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Contracts */}
          <Route path="/contratos" element={<ContractsList />} />
          <Route path="/contratos/novo" element={<ContractForm />} />
          <Route path="/contratos/:id" element={<ContractDetails />} />
          <Route path="/contratos/:id/editar" element={<ContractForm />} />
          
          {/* Projects */}
          <Route path="/projetos" element={<ProjectsList />} />
          <Route path="/projetos/novo" element={<ProjectForm />} />
          <Route path="/projetos/novo/:contractId" element={<ProjectForm />} />
          <Route path="/projetos/:id" element={<ProjectDetails />} />
          
          {/* Reports */}
          <Route path="/relatorio-mensal" element={<MonthlyReport />} />
          
          {/* Monthly Closing */}
          <Route path="/fechamento-mensal" element={<MonthlyClosing />} />
          
          {/* Clients */}
          <Route path="/clientes" element={<ClientsList />} />
          
          {/* Economic Groups */}
          <Route path="/grupos-economicos" element={<EconomicGroupsList />} />
          
          {/* Settings */}
          <Route path="/configuracoes" element={<Settings />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
