import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OperacoesProvider } from "./context/OperacoesContext";
import { CarteiraProvider } from "./context/CarteiraContext";
import { AmbienteProvider } from "./context/AmbienteContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import MesaOperacoes from "./pages/MesaOperacoes";
import MinhasOfertas from "./pages/MinhasOfertas";
import DetalheOperacao from "./pages/DetalheOperacao";
import Historico from "./pages/Historico";
import Perfil from "./pages/Perfil";
import "./styles/global.css";

export default function App() {
  return (
    <CarteiraProvider>
      <AmbienteProvider>
      <OperacoesProvider>
        <BrowserRouter>
          <Routes>
            {/* Tela de Login */}
            <Route path="/" element={<Login />} />

            {/* Páginas internas com navegação compartilhada; o login ainda é demonstrativo. */}
            <Route element={<Layout />}>
              <Route path="/mesa" element={<MesaOperacoes />} />
              <Route path="/minhas-ofertas" element={<MinhasOfertas />} />
              <Route path="/operacoes/:id" element={<DetalheOperacao />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            {/* Redirecionamento de rotas desconhecidas */}
            <Route path="*" element={<Navigate to="/mesa" replace />} />
          </Routes>
        </BrowserRouter>
      </OperacoesProvider>
      </AmbienteProvider>
    </CarteiraProvider>
  );
}
