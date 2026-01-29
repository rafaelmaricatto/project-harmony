import { AppLayout } from "@/components/layout/AppLayout";

export default function ClientsList() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Cadastro de clientes (em desenvolvimento)
          </p>
        </div>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
          Módulo de clientes será implementado na próxima fase
        </div>
      </div>
    </AppLayout>
  );
}
