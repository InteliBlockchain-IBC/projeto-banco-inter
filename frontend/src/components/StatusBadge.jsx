import Badge from "./ui/Badge";
import { Ban, CheckCircle2, Clock3, XCircle } from "lucide-react";

export default function StatusBadge({ status, size = "md", className = "" }) {
  const map = {
    Ofertada: { variant: "neutral", label: "Ofertada", icon: Clock3 },
    Ativa: { variant: "neutral", label: "Ativa", icon: Clock3 },
    Aceita: { variant: "accepted", label: "Aceita", icon: CheckCircle2 },
    Liquidada: { variant: "success", label: "Liquidada", dot: true },
    Negada: { variant: "danger", label: "Negada", icon: XCircle },
    Cancelada: { variant: "danger", label: "Cancelada", icon: Ban },
  };

  const item = map[status] || { variant: "neutral", label: status, dot: false };
  const Icon = item.icon;

  return (
    <Badge variant={item.variant} size={size} dot={item.dot} className={className}>
      {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${item.variant === "neutral" ? "text-gray-500" : ""}`} aria-hidden="true" />}
      {item.label}
    </Badge>
  );
}
