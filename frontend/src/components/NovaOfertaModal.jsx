import { useState } from "react";
import Modal from "./Modal";

export default function NovaOfertaModal({ onClose, onPublicar }) {
  const [valor, setValor] = useState("");
  const [taxaCdi, setTaxaCdi] = useState("");
  const [prazoDias, setPrazoDias] = useState("");
  const [erro, setErro] = useState("");

  function handlePublicar() {
    if (!valor || !taxaCdi || !prazoDias) {
      setErro("Preencha valor, taxa CDI e prazo para publicar a oferta.");
      return;
    }
    onPublicar({
      valor: Number(valor),
      taxaCdi: Number(taxaCdi),
      prazoDias: Number(prazoDias),
    });
  }

  return (
    <Modal title="Nova oferta" onClose={onClose}>
      <div style={{ marginBottom: 10 }}>
        <label>Valor (R$)</label>
        <input type="number" placeholder="500000" value={valor} onChange={(e) => setValor(e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Taxa CDI (%)</label>
        <input type="number" placeholder="10.75" value={taxaCdi} onChange={(e) => setTaxaCdi(e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Prazo (dias)</label>
        <input type="number" placeholder="1" value={prazoDias} onChange={(e) => setPrazoDias(e.target.value)} />
      </div>
      {erro && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{erro}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
        <button className="ghost" onClick={onClose}>Cancelar</button>
        <button className="primary" onClick={handlePublicar}>Publicar oferta</button>
      </div>
    </Modal>
  );
}
