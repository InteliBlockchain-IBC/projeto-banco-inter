import Modal from "./Modal";
import { formatCurrency } from "../services/mockOperations";

export default function ConfirmActionModal({ type, operation, onClose, onConfirm }) {
  const aceitar = type === "aceitar";
  return (
    <Modal title={aceitar ? "Confirmar aceite e assinar" : "Confirmar cancelamento"} onClose={onClose}>
      {aceitar ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Você vai aceitar a oferta de <strong style={{ color: "var(--text)" }}>{operation.counterparty}</strong>,
          {" "}valor <span className="num">{formatCurrency(operation.value)}</span>, taxa CDI{" "}
          <span className="num">{operation.cdiRate}%</span>. O limite de crédito será revalidado e a assinatura
          será solicitada na carteira conectada à Sepolia.
        </p>
      ) : (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          A oferta <span className="num">{operation.id}</span> será cancelada e deixará de estar disponível
          para outras instituições.
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <button className="ghost" onClick={onClose}>Voltar</button>
        <button className="primary" onClick={onConfirm}>
          {aceitar ? "Confirmar e assinar" : "Confirmar cancelamento"}
        </button>
      </div>
    </Modal>
  );
}
