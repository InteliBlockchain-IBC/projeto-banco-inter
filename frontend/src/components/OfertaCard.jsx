import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatarMoeda } from "../services/mockOperacoes";

export default function OfertaCard({ operacao }) {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      style={{ marginBottom: 8, cursor: "pointer" }}
      onClick={() => navigate(`/operacoes/${operacao.id}`)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Campo label="Contraparte" valor={operacao.contraparte} mono={false} />
          <Campo label="Valor" valor={formatarMoeda(operacao.valor)} />
          <Campo label="Taxa CDI" valor={`${operacao.taxaCdi}%`} />
          <Campo label="Prazo" valor={`${operacao.prazoDias}d`} />
        </div>
        <StatusBadge status={operacao.status} />
      </div>
    </div>
  );
}

function Campo({ label, valor, mono = true }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".04em" }}>
        {label}
      </div>
      <div className={mono ? "num" : ""} style={{ fontSize: 14 }}>{valor}</div>
    </div>
  );
}
