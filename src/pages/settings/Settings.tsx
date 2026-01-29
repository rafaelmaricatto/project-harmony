import { AppLayout } from "@/components/layout/AppLayout";

export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configurações do sistema (em desenvolvimento)
          </p>
        </div>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
          Módulo de configurações será implementado na próxima fase
        </div>
      </div>
    </AppLayout>
  );
}
