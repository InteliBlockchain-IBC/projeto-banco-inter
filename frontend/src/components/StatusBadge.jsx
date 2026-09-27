const estilos = {
  Ofertada: { color: "var(--text-muted)", border: "var(--border-strong)" },
  Aceita: { color: "var(--warn)", border: "var(--warn)" },
  Liquidada: { color: "var(--ok)", border: "var(--ok)" },
  Cancelada: { color: "var(--muted-status)", border: "var(--border)" },
};

export default function StatusBadge({ status }) {
  const s = estilos[status] || estilos.Ofertada;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: s.color,
        borderLeft: `3px solid ${s.border}`,
        paddingLeft: 8,
        lineHeight: "20px",
      }}
    >
      {status}
    </span>
  );
}
