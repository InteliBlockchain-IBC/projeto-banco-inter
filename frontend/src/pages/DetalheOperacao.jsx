import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import Timeline from "../components/Timeline";
import ConfirmarAcaoModal from "../components/ConfirmarAcaoModal";
import { acoesDisponiveis, formatarData, formatarMoeda } from "../services/mockOperacoes";

export default function DetalheOperacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { operacoes, aceitarOferta, cancelarOferta } = useOutletContext();
  const [confirmando, setConfirmando] = useState(null); // "aceitar" | "cancelar" | null

  const operacao = operacoes.find((o) => o.id === id);

  // Quando a liquidação é confirmada, a interface leva o usuário ao histórico
  // (mesmo caminho final das duas jornadas do fluxo).
  useEffect(() => {
    if (operacao?.status === "Liquidada") {
      const t = setTimeout(() => navigate("/historico"), 1200);
      return () => clearTimeout(t);
    }
  }, [operacao?.status, navigate]);

  if (!operacao) {
    return <div className="empty-state">Operação não encontrada.</div>;
  }

  const acoes = acoesDisponiveis(operacao);
  const processando = operacao.status === "Aceita";

  function confirmar() {
    if (confirmando === "aceitar") aceitarOferta(operacao.id);
    if (confirmando === "cancelar") {
      cancelarOferta(operacao.id);
      navigate("/historico");
    }
    setConfirmando(null);
  }

  return (
    <div>
      <button className="ghost" style={{ padding: 0, marginBottom: 14 }} onClick={() => navigate(-1)}>
        ← voltar
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h1>Operação {operacao.id}</h1>
        <StatusBadge status={operacao.status} />
      </div>

      <Timeline status={operacao.status} />

      <div className="card" style={{ marginBottom: 14 }}>
        <Linha label="Contraparte" valor={operacao.contraparte} mono={false} />
        <Linha label="Valor" valor={formatarMoeda(operacao.valor)} />
        <Linha label="Taxa CDI" valor={`${operacao.taxaCdi}%`} />
        <Linha label="Prazo" valor={`${operacao.prazoDias} dia(s)`} />
        <Linha label="Data" valor={formatarData(operacao.criadaEm)} borda={false} />
      </div>

      {processando && (
        <div className="card" style={{ marginBottom: 14, borderColor: "var(--warn)", color: "var(--warn)", fontSize: 13 }}>
          Transação enviada. Aguardando confirmação na Sepolia…
        </div>
      )}

      {operacao.hash && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>HASH DA TRANSAÇÃO</div>
          <div className="num" style={{ fontSize: 12 }}>{operacao.hash}</div>
        </div>
      )}

      {acoes.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {acoes.includes("cancelar") && (
            <button className="ghost" onClick={() => setConfirmando("cancelar")}>Cancelar oferta</button>
          )}
          {acoes.includes("aceitar") && (
            <button className="primary" onClick={() => setConfirmando("aceitar")}>Aceitar oferta</button>
          )}
        </div>
      )}

      {confirmando && (
        <ConfirmarAcaoModal
          tipo={confirmando}
          operacao={operacao}
          onClose={() => setConfirmando(null)}
          onConfirmar={confirmar}
        />
      )}
    </div>
  );
}

function Linha({ label, valor, mono = true, borda = true }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "7px 0",
        borderBottom: borda ? "1px solid var(--border)" : "none",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className={mono ? "num" : ""}>{valor}</span>
    </div>
  );
}
