import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import OfertaCard from "../components/OfertaCard";
import NovaOfertaModal from "../components/NovaOfertaModal";
import { CDI_REFERENCIA, LIMITE_DISPONIVEL, formatarMoeda, STATUS } from "../services/mockOperacoes";

export default function MesaOperacoes() {
  const { operacoes, publicarOferta } = useOutletContext();
  const [filtro, setFiltro] = useState("Todas");
  const [modalAberto, setModalAberto] = useState(false);

  const filtros = ["Todas", ...STATUS];
  const listaFiltrada = operacoes.filter((o) => filtro === "Todas" || o.status === filtro);
  const ativas = operacoes.filter((o) => o.status === "Ofertada" || o.status === "Aceita").length;

  return (
    <div>
      <h1 style={{ marginBottom: 14 }}>Mesa de operações</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div className="stat">
          <div className="label">Limite disponível</div>
          <div className="value num">{formatarMoeda(LIMITE_DISPONIVEL)}</div>
        </div>
        <div className="stat">
          <div className="label">Taxa CDI ref.</div>
          <div className="value num">{CDI_REFERENCIA}% a.a.</div>
        </div>
        <div className="stat">
          <div className="label">Operações ativas</div>
          <div className="value num">{ativas}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              fontSize: 12,
              padding: "5px 10px",
              background: f === filtro ? "var(--accent-soft)" : "transparent",
              borderColor: f === filtro ? "var(--accent)" : "var(--border)",
              color: f === filtro ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {listaFiltrada.length === 0 ? (
        <div className="empty-state">Nenhuma oferta neste filtro.</div>
      ) : (
        listaFiltrada.map((o) => <OfertaCard key={o.id} operacao={o} />)
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button className="primary" onClick={() => setModalAberto(true)}>+ Nova oferta</button>
      </div>

      {modalAberto && (
        <NovaOfertaModal
          onClose={() => setModalAberto(false)}
          onPublicar={(dados) => {
            publicarOferta(dados);
            setModalAberto(false);
          }}
        />
      )}
    </div>
  );
}
