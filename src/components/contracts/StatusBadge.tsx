import { Badge } from "@/components/ui/badge";
import { ContractStatus, CONTRACT_STATUS_LABELS } from "@/types/contracts";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

const statusStyles: Record<ContractStatus, string> = {
  draft: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  pending_approval: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  expiring_soon: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100",
  closed: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100",
  renewed: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(statusStyles[status], "font-medium", className)}
    >
      {CONTRACT_STATUS_LABELS[status]}
    </Badge>
  );
}
