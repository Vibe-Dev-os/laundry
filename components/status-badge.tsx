import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_LABELS, type ReservationStatus } from "@/lib/types"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  received: "bg-primary/10 text-primary",
  washing: "bg-warning/15 text-warning",
  drying: "bg-warning/15 text-warning",
  ready: "bg-success/15 text-success",
  claimed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-success/15 text-success",
  voided: "bg-destructive/10 text-destructive",
  sent: "bg-success/15 text-success",
  failed: "bg-destructive/10 text-destructive",
  active: "bg-success/15 text-success",
  inactive: "bg-muted text-muted-foreground",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = STATUS_LABELS[status as ReservationStatus] ?? status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", STATUS_STYLES[status], className)}>
      {label}
    </Badge>
  )
}
