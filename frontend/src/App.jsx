import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OperationsProvider } from "./context/OperationsContext";
import { WalletProvider } from "./context/WalletContext";
import { EnvironmentProvider } from "./context/EnvironmentContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import OperationsDesk from "./pages/OperationsDesk";
import MyOffers from "./pages/MyOffers";
import OperationDetails from "./pages/OperationDetails";
import History from "./pages/History";
import Profile from "./pages/Profile";
import "./styles/global.css";

export default function App() {
  return (
    <WalletProvider>
      <EnvironmentProvider>
      <OperationsProvider>
        <BrowserRouter>
          <Routes>
            {/* Tela de Login */}
            <Route path="/" element={<Login />} />

            {/* Páginas internas com navegação compartilhada; o login ainda é demonstrativo. */}
            <Route element={<Layout />}>
              <Route path="/mesa" element={<OperationsDesk />} />
              <Route path="/minhas-ofertas" element={<MyOffers />} />
              <Route path="/operacoes/:id" element={<OperationDetails />} />
              <Route path="/historico" element={<History />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>

            {/* Redirecionamento de rotas desconhecidas */}
            <Route path="*" element={<Navigate to="/mesa" replace />} />
          </Routes>
        </BrowserRouter>
      </OperationsProvider>
      </EnvironmentProvider>
    </WalletProvider>
  );
}
