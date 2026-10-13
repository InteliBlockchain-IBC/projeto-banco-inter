import { Outlet } from "react-router-dom";
import Header from "./Header";
import CarteiraAviso from "./CarteiraAviso";
import FonteDadosAviso from "./FonteDadosAviso";
import NovaOfertaModal from "./modals/NovaOfertaApiModal";
import { useOperacoes } from "../context/OperacoesContext";

export default function Layout() {
  const { modalNovaOfertaAberto, setModalNovaOfertaAberto } = useOperacoes();
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-gray-900 flex flex-col font-sans">
      <Header />
      <CarteiraAviso />
      <FonteDadosAviso />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      {modalNovaOfertaAberto && <NovaOfertaModal isOpen onClose={() => setModalNovaOfertaAberto(false)} />}
    </div>
  );
}
