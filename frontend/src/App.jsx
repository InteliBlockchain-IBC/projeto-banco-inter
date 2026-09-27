import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import MesaOperacoes from "./pages/MesaOperacoes";
import DetalheOperacao from "./pages/DetalheOperacao";
import Historico from "./pages/Historico";
import Perfil from "./pages/Perfil";
import { operacoesIniciais, gerarHashFicticio } from "./services/mockOperacoes";
import "./styles/global.css";

let sequencia = 1043;

export default function App() {
  const [operacoes, setOperacoes] = useState(operacoesIniciais);
  const [notificacoes, setNotificacoes] = useState([]);

  function notificar(mensagem) {
    setNotificacoes((atual) => [mensagem, ...atual].slice(0, 8));
  }

  // Nova oferta -> Modal de criação -> Publicar -> aparece em "Minhas ofertas"
  function publicarOferta({ valor, taxaCdi, prazoDias }) {
    sequencia += 1;
    const nova = {
      id: `OP-${sequencia}`,
      contraparte: "—",
      valor,
      taxaCdi,
      prazoDias,
      status: "Ofertada",
      minha: true,
      hash: null,
      criadaEm: new Date().toISOString(),
    };
    setOperacoes((atual) => [nova, ...atual]);
    notificar(`Oferta ${nova.id} publicada.`);
  }

  // Aceitar oferta -> Confirmar/assinar -> Aguardando confirmação -> Liquidada
  function aceitarOferta(id) {
    setOperacoes((atual) => atual.map((o) => (o.id === id ? { ...o, status: "Aceita" } : o)));
    notificar(`Oferta ${id} aceita. Aguardando confirmação na Sepolia…`);
    setTimeout(() => {
      setOperacoes((atual) =>
        atual.map((o) => (o.id === id ? { ...o, status: "Liquidada", hash: gerarHashFicticio() } : o))
      );
      notificar(`Oferta ${id} liquidada.`);
    }, 2200);
  }

  // Cancelar oferta -> Confirmar cancelamento -> Histórico
  function cancelarOferta(id) {
    setOperacoes((atual) => atual.map((o) => (o.id === id ? { ...o, status: "Cancelada" } : o)));
    notificar(`Oferta ${id} cancelada.`);
  }

  const contexto = { operacoes, publicarOferta, aceitarOferta, cancelarOferta };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout contexto={contexto} notificacoes={notificacoes} />}>
          <Route path="/mesa" element={<MesaOperacoes />} />
          <Route path="/operacoes/:id" element={<DetalheOperacao />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
