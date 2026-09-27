import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LIMITE_DISPONIVEL, formatarMoeda } from "../services/mockOperacoes";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "var(--text)" : "var(--text-muted)",
  borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
  paddingBottom: 4,
  fontSize: 13,
});

export default function Layout({ contexto, notificacoes }) {
  const [notifAbertas, setNotifAbertas] = useState(false);

  return (
    <div className="app-shell">
      <div
        className="hairline"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 18, flexWrap: "wrap", gap: 10 }}
      >
        <strong style={{ letterSpacing: ".02em" }}>MESA DE OPERAÇÕES</strong>

        <nav style={{ display: "flex", gap: 20 }}>
          <NavLink to="/mesa" style={linkStyle}>Mesa</NavLink>
          <NavLink to="/historico" style={linkStyle}>Histórico</NavLink>
          <NavLink to="/perfil" style={linkStyle}>Perfil</NavLink>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <span className="num" style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Limite disp.: {formatarMoeda(LIMITE_DISPONIVEL)}
          </span>
          <span style={{ fontSize: 12, color: "var(--ok)" }}>● Sepolia</span>
          <button className="ghost" style={{ padding: "4px 8px" }} onClick={() => setNotifAbertas((v) => !v)}>
            Notificações {notificacoes.length > 0 && `(${notificacoes.length})`}
          </button>
          {notifAbertas && (
            <div
              className="card"
              style={{ position: "absolute", top: 34, right: 0, width: 260, zIndex: 10 }}
            >
              {notificacoes.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Nenhuma notificação.</span>
              ) : (
                notificacoes.map((n, i) => (
                  <div key={i} style={{ fontSize: 12, padding: "6px 0", borderBottom: i < notificacoes.length - 1 ? "1px solid var(--border)" : "none" }}>
                    {n}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Outlet context={contexto} />
    </div>
  );
}
