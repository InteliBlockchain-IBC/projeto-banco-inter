import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OperacoesProvider } from "./context/OperacoesContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import MesaOperacoes from "./pages/MesaOperacoes";
import DetalheOperacao from "./pages/DetalheOperacao";
import Historico from "./pages/Historico";
import Perfil from "./pages/Perfil";
import "./styles/global.css";

export default function App() {
  return (
    <OperacoesProvider>
      <BrowserRouter>
        <Routes>
          {/* Tela de Login */}
          <Route path="/" element={<Login />} />

          {/* Rotas Autenticadas com Shell de Navegação */}
          <Route element={<Layout />}>
            <Route path="/mesa" element={<MesaOperacoes />} />
            <Route path="/operacoes/:id" element={<DetalheOperacao />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>

          {/* Redirecionamento de rotas desconhecidas */}
          <Route path="*" element={<Navigate to="/mesa" replace />} />
        </Routes>
      </BrowserRouter>
    </OperacoesProvider>
  );
}
