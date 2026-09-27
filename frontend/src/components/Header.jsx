import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useOperacoes } from "../context/OperacoesContext";
import { ChevronDown, Check, LogOut } from "lucide-react";

export default function Header() {
  const { instituicaoAtual, setInstituicaoAtual } = useOperacoes();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const navigate = useNavigate();

  const instituicoes = [
    { id: "Banco A", nome: "Banco A (Sua Instituição)", carteira: "0x8204...7a1c" },
    { id: "Banco B", nome: "Banco B S.A.", carteira: "0x39fa...12e8" },
    { id: "Banco D", nome: "Banco D Investimentos", carteira: "0x61bc...89d4" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Lado Esquerdo: Logo Inter + Subtítulo */}
        <div className="flex items-center gap-3">
          <Link to="/mesa" className="flex items-center gap-2 group">
            <div className="flex items-baseline">
              <span className="text-2xl font-black tracking-tighter text-neutral-900 font-sans">
                inter
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] ml-0.5 mb-1" />
            </div>
            <div className="h-4 w-px bg-gray-300 ml-1" />
            <span className="text-xs font-semibold text-gray-500 tracking-tight">
              Crédito Interfinanceiro
            </span>
          </Link>
        </div>

        {/* Centro: Abas de navegação */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/mesa"
            className={({ isActive }) =>
              `px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white font-semibold shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              }`
            }
          >
            Mesa de Operações
          </NavLink>
          <NavLink
            to="/historico"
            className={({ isActive }) =>
              `px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white font-semibold shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              }`
            }
          >
            Histórico
          </NavLink>
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              `px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white font-semibold shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              }`
            }
          >
            Perfil
          </NavLink>
        </nav>

        {/* Lado Direito: Seletor de Banco / Perfil */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownAberto((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200/90 rounded-lg transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">
              {instituicaoAtual.slice(0, 1)}
            </div>
            <span>{instituicaoAtual}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownAberto && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownAberto(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Alternar Instituição
                  </span>
                </div>
                {instituicoes.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => {
                      setInstituicaoAtual(inst.id);
                      setDropdownAberto(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{inst.nome}</div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {inst.carteira}
                      </div>
                    </div>
                    {instituicaoAtual === inst.id && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownAberto(false);
                      navigate("/");
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
