import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  function handleEntrar(e) {
    e.preventDefault();
    // Mock: qualquer submissão leva direto para a Mesa de Operações.
    navigate("/mesa");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form
        onSubmit={handleEntrar}
        className="card"
        style={{ width: "100%", maxWidth: 340 }}
      >
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: ".08em" }}>PROTOCOLO DE CRÉDITO INTERFINANCEIRO</div>
          <h1 style={{ marginTop: 4 }}>Acessar a mesa</h1>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Instituição</label>
          <input placeholder="ex: banco-ficticio-a" defaultValue="banco-ficticio-a" />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Senha</label>
          <input type="password" placeholder="••••••••" defaultValue="mock" />
        </div>
        <button type="submit" className="primary" style={{ width: "100%" }}>Entrar</button>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 12 }}>
          Ambiente de teste — testnet Sepolia. Nenhuma credencial real é validada neste mock.
        </div>
      </form>
    </div>
  );
}
