import { Outlet } from "react-router-dom";
import Header from "./Header";
import WalletNotice from "./WalletNotice";
import DataSourceNotice from "./DataSourceNotice";
import NewOfferModal from "./modals/NewApiOfferModal";
import { useOperations } from "../context/OperationsContext";

export default function Layout() {
  const { newOfferModalOpen, setNewOfferModalOpen } = useOperations();
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-gray-900 flex flex-col font-sans">
      <Header />
      <WalletNotice />
      <DataSourceNotice />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      {newOfferModalOpen && <NewOfferModal isOpen onClose={() => setNewOfferModalOpen(false)} />}
    </div>
  );
}
