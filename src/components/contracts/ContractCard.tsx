import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { 
  Contract, 
  Client,
  CONTRACT_TYPE_LABELS, 
  RECURRENCE_TYPE_LABELS,
  CLIENT_TYPE_LABELS,
  CURRENCY_SYMBOLS 
} from "@/types/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Building2, 
  FileText, 
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";

interface ContractCardProps {
  contract: Contract;
  client?: Client;
  projectCount?: number;
}

export function ContractCard({ contract, client, projectCount = 0 }: ContractCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {contract.code}
              </span>
              <StatusBadge status={contract.status} />
            </div>
            <CardTitle className="text-lg">
              {client?.name || "Cliente não encontrado"}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/contratos/${contract.id}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{CONTRACT_TYPE_LABELS[contract.contractType]}</span>
            {contract.recurrenceType && (
              <span className="text-xs">
                ({RECURRENCE_TYPE_LABELS[contract.recurrenceType]})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{CLIENT_TYPE_LABELS[contract.clientType]}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR })}
            {" — "}
            {format(new Date(contract.endDate), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">
              {CURRENCY_SYMBOLS[contract.currency]}
            </span>
            {contract.autoRenewal && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                <span className="text-xs">Renovação automática</span>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {projectCount} {projectCount === 1 ? "projeto" : "projetos"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
