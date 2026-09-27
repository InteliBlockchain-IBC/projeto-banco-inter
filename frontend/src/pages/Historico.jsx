import { useNavigate, useOutletContext } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { formatarData, formatarMoeda } from "../services/mockOperacoes";

export default function Historico() {
  const { operacoes } = useOutletContext();
  const navigate = useNavigate();

  const ordenadas = [...operacoes].sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm));

  return (
    <div>
      <h1 style={{ marginBottom: 14 }}>Histórico</h1>
      {ordenadas.length === 0 ? (
        <div className="empty-state">Ainda não há operações registradas.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Contraparte</th>
              <th>Valor</th>
              <th>Taxa CDI</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((o) => (
              <tr key={o.id} className="clickable" onClick={() => navigate(`/operacoes/${o.id}`)}>
                <td>{o.contraparte}</td>
                <td className="num">{formatarMoeda(o.valor)}</td>
                <td className="num">{o.taxaCdi}%</td>
                <td><StatusBadge status={o.status} /></td>
                <td className="num">{formatarData(o.criadaEm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
