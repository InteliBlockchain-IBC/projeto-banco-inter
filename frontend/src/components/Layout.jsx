import { Outlet } from "react-router-dom";
import Header from "./Header";
import NovaOfertaModal from "./modals/NovaOfertaModal";
import ConfirmarOperacaoModal from "./modals/ConfirmarOperacaoModal";
import ProcessandoOperacaoModal from "./modals/ProcessandoOperacaoModal";
import CancelarOfertaModal from "./modals/CancelarOfertaModal";
import { useOperacoes } from "../context/OperacoesContext";

export default function Layout() {
  const {
    modalNovaOfertaAberto,
    setModalNovaOfertaAberto,
    modalConfirmarOperacao,
    setModalConfirmarOperacao,
    confirmarAceiteOferta,
    modalProcessando,
    setModalProcessando,
    modalCancelar,
    setModalCancelar,
    confirmarCancelamentoOferta,
  } = useOperacoes();

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Modais Globais */}
      {modalNovaOfertaAberto && (
        <NovaOfertaModal
          isOpen={modalNovaOfertaAberto}
          onClose={() => setModalNovaOfertaAberto(false)}
        />
      )}

      {modalConfirmarOperacao && (
        <ConfirmarOperacaoModal
          isOpen={Boolean(modalConfirmarOperacao)}
          operacao={modalConfirmarOperacao}
          onClose={() => setModalConfirmarOperacao(null)}
          onConfirmar={(op) => confirmarAceiteOferta(op)}
        />
      )}

      {modalProcessando && (
        <ProcessandoOperacaoModal
          isOpen={Boolean(modalProcessando)}
          dadosProcessando={modalProcessando}
          onClose={() => setModalProcessando(null)}
        />
      )}

      {modalCancelar && (
        <CancelarOfertaModal
          isOpen={Boolean(modalCancelar)}
          operacao={modalCancelar}
          onClose={() => setModalCancelar(null)}
          onConfirmar={(op) => confirmarCancelamentoOferta(op)}
        />
      )}
    </div>
  );
}
