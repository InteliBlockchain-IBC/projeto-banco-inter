import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useOperacoes } from "../context/OperacoesContext";
import { useAmbiente } from "../context/AmbienteContext";
import { useCarteira } from "../context/CarteiraContext";
import { abreviarEndereco } from "../services/metamask";
import { ChevronDown, LogOut, Bell, CheckCircle2, XCircle, Ban, Info, UserRound, Moon, Sun } from "lucide-react";
import InterLogo from "./InterLogo";
import CarteiraControles from "./CarteiraControles";

export default function Header() {
  const { notificacoes, marcarNotificacoesComoLidas } = useOperacoes();
  const { demonstracao, limites, limiteOperador, status, setCarteiraDemo } = useAmbiente();
  const { conta } = useCarteira();
  const instituicaoAtual = limiteOperador?.institution?.name
    ?? (!demonstracao && status === "ok" && conta ? "Carteira não cadastrada" : "Instituição não identificada");
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [modoEscuro, setModoEscuro] = useState(() => window.localStorage.getItem("inter-theme") === "dark");
  const navRef = useRef(null);
  const abaRefs = useRef([]);
  const [indicador, setIndicador] = useState({ left: 0, width: 0 });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = modoEscuro ? "dark" : "light";
    window.localStorage.setItem("inter-theme", modoEscuro ? "dark" : "light");
  }, [modoEscuro]);

  const abas = [
    { to: "/mesa", label: "Mesa de Operações", curta: "Mesa" },
    { to: "/minhas-ofertas", label: "Minhas ofertas", curta: "Minhas" },
    { to: "/historico", label: "Histórico", curta: "Histórico" },
  ];
  const idDetalhe = pathname.startsWith("/operacoes/") ? pathname.split("/").at(-1) : null;
  const abaAtiva = idDetalhe ? 0 : abas.findIndex(({ to }) => to === pathname);
  const naoLidas = notificacoes.filter((item) => !item.lida).length;

  useLayoutEffect(() => {
    const nav = navRef.current;
    const aba = abaRefs.current[abaAtiva];
    if (!nav || !aba) return;

    const medir = () => setIndicador({ left: aba.offsetLeft, width: aba.offsetWidth });
    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(nav);
    observer.observe(aba);
    return () => observer.disconnect();
  }, [abaAtiva]);

  function alternarNotificacoes() {
    setDropdownAberto(false);
    setNotificacoesAbertas((abertas) => !abertas);
    if (!notificacoesAbertas) marcarNotificacoesComoLidas();
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
          {abas.map(({ to, label, curta }, index) => (
            <NavLink
              key={to}
              to={to}
              ref={(node) => { abaRefs.current[index] = node; }}
              className={() =>
                `inline-flex h-full items-center justify-center px-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-300 motion-reduce:transition-none ${
                  abaAtiva === index
                    ? "text-inter-orange"
                    : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              <span className="lg:hidden">{curta}</span>
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
          {abaAtiva >= 0 && <span aria-hidden="true" className="pointer-events-none absolute bottom-[-2px] h-1 rounded-full bg-inter-orange transition-[left,width] duration-300 ease-in-out motion-reduce:transition-none" style={{ left: indicador.left, width: indicador.width }} />}
        </nav>

        {/* Lado Direito: Notificações e seletor de banco */}
        <div className="relative flex h-16 items-center gap-2">
          <CarteiraControles compacto />
          <button
            type="button"
            onClick={alternarNotificacoes}
            aria-label={`Notificações${naoLidas ? `, ${naoLidas} não lidas` : ""}`}
            aria-expanded={notificacoesAbertas}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-gray-500 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inter-orange"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {naoLidas > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-inter-orange" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => { setNotificacoesAbertas(false); setDropdownAberto((prev) => !prev); }}
            aria-expanded={dropdownAberto}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200/90 rounded-lg transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">
              {instituicaoAtual.slice(0, 1)}
            </div>
            <span>{instituicaoAtual}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

        </div>
      </div>
      {notificacoesAbertas && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setNotificacoesAbertas(false)} aria-hidden="true" />
          <div className="absolute right-4 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:right-6 lg:right-8">
            <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">Notificações</div>
            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-gray-500">Nenhuma notificação por enquanto.</p>
              ) : notificacoes.map((item) => {
                const Icon = item.tipo === "sucesso" ? CheckCircle2 : item.tipo === "negada" ? XCircle : item.tipo === "aviso" ? Ban : Info;
                const cor = item.tipo === "sucesso" ? "text-emerald-600" : item.tipo === "negada" ? "text-rose-600" : item.tipo === "aviso" ? "text-amber-600" : "text-gray-500";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setNotificacoesAbertas(false); if (item.rawId) navigate(`/operacoes/${item.rawId}`); }}
                    className="flex w-full cursor-pointer items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cor}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-gray-800">{item.mensagem}</span>
                      <span className="mt-1 block text-[11px] text-gray-400">{new Date(item.hora).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
      {dropdownAberto && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setDropdownAberto(false)} aria-hidden="true" />
          <div className="absolute right-4 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl sm:right-6 lg:right-8">
            <button
              type="button"
              onClick={() => { setDropdownAberto(false); navigate("/perfil"); }}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-gray-50 ${pathname === "/perfil" ? "font-semibold text-inter-orange" : "text-gray-700"}`}
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span>Perfil</span>
            </button>
            {demonstracao && <div className="border-t border-gray-100 px-3 py-2 text-[11px] font-semibold text-gray-500">Operar como (demonstração)</div>}
            {demonstracao && limites.map((item) => (
              <button key={item.wallet} type="button" onClick={() => { setCarteiraDemo(item.wallet); setDropdownAberto(false); }} className={`w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50 ${limiteOperador?.wallet === item.wallet ? "font-semibold text-inter-orange" : "text-gray-700"}`}>
                {item.institution?.name ?? "Instituição"} <span className="font-mono text-[10px]">{abreviarEndereco(item.wallet)}</span>
              </button>
            ))}
            <button
              type="button"
              role="switch"
              aria-checked={modoEscuro}
              onClick={() => setModoEscuro((ativo) => !ativo)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                {modoEscuro ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                <span>Modo escuro</span>
              </span>
              <span className={`relative h-5 w-9 rounded-full transition-colors ${modoEscuro ? "bg-inter-orange" : "bg-gray-300"}`} aria-hidden="true">
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#fff] shadow-xs transition-transform ${modoEscuro ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </span>
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              type="button"
              onClick={() => { setDropdownAberto(false); navigate("/"); }}
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
