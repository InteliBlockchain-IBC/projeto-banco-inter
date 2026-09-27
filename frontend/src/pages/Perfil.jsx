import { LIMITE_DISPONIVEL, formatarMoeda } from "../services/mockOperacoes";

export default function Perfil() {
  return (
    <div>
      <h1 style={{ marginBottom: 14 }}>Perfil</h1>
      <div className="card" style={{ maxWidth: 420 }}>
        <Linha label="Instituição" valor="Banco Fictício A" mono={false} />
        <Linha label="Carteira conectada" valor="0x71a2...9f3c" />
        <Linha label="Rede" valor="Sepolia (testnet)" mono={false} />
        <Linha label="Limite de crédito" valor={formatarMoeda(LIMITE_DISPONIVEL)} borda={false} />
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10 }}>
        Dados fictícios — a conexão real de carteira entra na integração da Semana 4.
      </div>
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
