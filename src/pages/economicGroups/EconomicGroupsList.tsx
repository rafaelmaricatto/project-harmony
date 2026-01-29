import { AppLayout } from "@/components/layout/AppLayout";

export default function EconomicGroupsList() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Grupos Econômicos</h1>
          <p className="text-muted-foreground">
            Cadastro de grupos econômicos (em desenvolvimento)
          </p>
        </div>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
          Módulo de grupos econômicos será implementado na próxima fase
        </div>
      </div>
    </AppLayout>
  );
}
