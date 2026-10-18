import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useOperations } from "../context/OperationsContext";
import { useEnvironment } from "../context/EnvironmentContext";
import { shortenAddress } from "../services/metamask";
import { Settings2, LogOut, Bell, CheckCircle2, XCircle, Ban, Info, UserRound, Moon, Sun } from "lucide-react";
import InterLogo from "./InterLogo";
import WalletControls from "./WalletControls";

export default function Header() {
  const { notifications, markNotificationsRead } = useOperations();
  const { demo, limits, operatorLimit, setDemoWallet } = useEnvironment();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem("inter-theme") === "dark");
  const navRef = useRef(null);
  const abaRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    window.localStorage.setItem("inter-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const tabs = [
    { to: "/mesa", label: "Mesa de Operações", curta: "Mesa" },
    { to: "/minhas-ofertas", label: "Minhas ofertas", curta: "Minhas" },
    { to: "/historico", label: "Histórico", curta: "Histórico" },
  ];
  const detailId = pathname.startsWith("/operacoes/") ? pathname.split("/").at(-1) : null;
  const activeTab = detailId ? 0 : tabs.findIndex(({ to }) => to === pathname);
  const unreadCount = notifications.filter((item) => !item.read).length;

  useLayoutEffect(() => {
    const nav = navRef.current;
    const tab = abaRefs.current[activeTab];
    if (!nav || !tab) return;

    const measure = () => setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    observer.observe(tab);
    return () => observer.disconnect();
  }, [activeTab]);

  function toggleNotifications() {
    setDropdownOpen(false);
    setNotificationsOpen((abertas) => !abertas);
    if (!notificationsOpen) markNotificationsRead();
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between md:flex-nowrap">
        {/* Lado Esquerdo: Logo Inter + Subtítulo */}
        <div className="flex h-16 items-center gap-3">
          <Link to="/mesa" className="flex items-center gap-2 group">
            <InterLogo />
            <div className="hidden lg:block h-4 w-px bg-gray-300 ml-1" />
            <span className="hidden lg:inline text-xs font-semibold text-gray-500 tracking-tight">
              Crédito Interfinanceiro
            </span>
          </Link>
        </div>

        {/* Centro: Abas de navegação */}
        <nav ref={navRef} className="relative order-3 flex h-12 w-full items-stretch justify-center gap-2 border-b border-gray-200 sm:gap-4 md:order-none md:h-16 md:w-auto md:gap-3 lg:gap-5">
          {tabs.map(({ to, label, curta }, index) => (
            <NavLink
              key={to}
              to={to}
              ref={(node) => { abaRefs.current[index] = node; }}
              className={() =>
                `inline-flex h-full items-center justify-center px-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-300 motion-reduce:transition-none ${
                  activeTab === index
                    ? "text-inter-orange"
                    : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              <span className="lg:hidden">{curta}</span>
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
          {activeTab >= 0 && <span aria-hidden="true" className="pointer-events-none absolute bottom-[-2px] h-1 rounded-full bg-inter-orange transition-[left,width] duration-300 ease-in-out motion-reduce:transition-none" style={{ left: indicator.left, width: indicator.width }} />}
        </nav>

        {/* Lado Direito: Notificações e seletor de banco */}
        <div className="relative flex h-16 items-center gap-2">
          <WalletControls compact />
          <button
            type="button"
            onClick={toggleNotifications}
            aria-label={`Notificações${unreadCount ? `, ${unreadCount} não lidas` : ""}`}
            aria-expanded={notificationsOpen}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-gray-500 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inter-orange"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-inter-orange" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => { setNotificationsOpen(false); setDropdownOpen((prev) => !prev); }}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
            aria-label="Abrir configurações"
            title="Configurações"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200/90 bg-gray-50 text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-inter-orange cursor-pointer"
          >
            <Settings2 className="h-5 w-5" aria-hidden="true" />
          </button>

        </div>
      </div>
      {notificationsOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} aria-hidden="true" />
          <div className="absolute right-4 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:right-6 lg:right-8">
            <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">Notificações</div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-gray-500">Nenhuma notificação por enquanto.</p>
              ) : notifications.map((item) => {
                const Icon = item.type === "sucesso" ? CheckCircle2 : item.type === "negada" ? XCircle : item.type === "aviso" ? Ban : Info;
                const color = item.type === "sucesso" ? "text-emerald-600" : item.type === "negada" ? "text-rose-600" : item.type === "aviso" ? "text-amber-600" : "text-gray-500";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setNotificationsOpen(false); if (item.rawId) navigate(`/operacoes/${item.rawId}`); }}
                    className="flex w-full cursor-pointer items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-gray-800">{item.message}</span>
                      <span className="mt-1 block text-[11px] text-gray-400">{new Date(item.time).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
          <div className="absolute right-4 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl sm:right-6 lg:right-8">
            <button
              type="button"
              onClick={() => { setDropdownOpen(false); navigate("/perfil"); }}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-gray-50 ${pathname === "/perfil" ? "font-semibold text-inter-orange" : "text-gray-700"}`}
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span>Perfil</span>
            </button>
            {demo && <div className="border-t border-gray-100 px-3 py-2 text-[11px] font-semibold text-gray-500">Operar como (demonstração)</div>}
            {demo && limits.map((item) => (
              <button key={item.wallet} type="button" onClick={() => { setDemoWallet(item.wallet); setDropdownOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50 ${operatorLimit?.wallet === item.wallet ? "font-semibold text-inter-orange" : "text-gray-700"}`}>
                {item.institution?.name ?? "Instituição"} <span className="font-mono text-[10px]">{shortenAddress(item.wallet)}</span>
              </button>
            ))}
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={() => setDarkMode((active) => !active)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                {darkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                <span>Modo escuro</span>
              </span>
              <span className={`relative h-5 w-9 rounded-full transition-colors ${darkMode ? "bg-inter-orange" : "bg-gray-300"}`} aria-hidden="true">
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#fff] shadow-xs transition-transform ${darkMode ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </span>
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              type="button"
              onClick={() => { setDropdownOpen(false); navigate("/"); }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sair da conta</span>
            </button>
          </div>
        </>
      )}
    </header>
  );
}
