const ETAPAS = ["Ofertada", "Aceita", "Liquidada"];

export default function Timeline({ status }) {
  if (status === "Cancelada") {
    return (
      <div style={{ fontSize: 12, color: "var(--muted-status)", margin: "14px 0" }}>
        Ciclo interrompido — oferta cancelada antes do aceite.
      </div>
    );
  }
  const indiceAtual = ETAPAS.indexOf(status);
  return (
    <div style={{ display: "flex", margin: "16px 0", gap: 4 }}>
      {ETAPAS.map((etapa, i) => {
        const feita = i <= indiceAtual;
        return (
          <div key={etapa} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: feita ? "var(--accent)" : "var(--border)",
                marginBottom: 6,
              }}
            />
            <span style={{ fontSize: 11, color: feita ? "var(--text)" : "var(--text-faint)" }}>{etapa}</span>
          </div>
        );
      })}
    </div>
  );
}
