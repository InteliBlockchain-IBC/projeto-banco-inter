import Badge from "./ui/Badge";

export default function StatusBadge({ status, size = "md", className = "" }) {
  const map = {
    Ofertada: { variant: "neutral", label: "Ofertada", dot: true },
    Ativa: { variant: "neutral", label: "Ativa", dot: true },
    Aceita: { variant: "success", label: "Aceita", dot: true },
    Liquidada: { variant: "success", label: "Liquidada", dot: true },
    Cancelada: { variant: "danger", label: "Cancelada", dot: true },
  };

  const item = map[status] || { variant: "neutral", label: status, dot: false };

  return (
    <Badge variant={item.variant} size={size} dot={item.dot} className={className}>
      {item.label}
    </Badge>
  );
}
