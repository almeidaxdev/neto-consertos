import { ServiceStatus, STATUS_COLORS, STATUS_LABELS } from "@/types";
import { Badge } from "@/components/ui/Badge";

export function StatusBadge({ status }: { status: ServiceStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <Badge className={`${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
