import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ArrowRight } from "lucide-react";
import InterLogo from "../components/InterLogo";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("operador@bancoa.com.br");
  const [senha, setSenha] = useState("••••••••");
  const [carregando, setCarregando] = useState(false);

  function handleEntrar(e) {
    e.preventDefault();
    setCarregando(true);
    setTimeout(() => {
      navigate("/mesa");
    }, 300);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-between p-4 sm:p-8">
      {/* Topo: Logo Inter */}
      <div className="max-w-6xl w-full mx-auto">
        <InterLogo />
      </div>

      <div className="w-full max-w-4xl mx-auto my-auto py-8">
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between p-8">
            <div>
              <h1 className="text-2xl font-bold leading-snug tracking-tight text-gray-900 sm:text-3xl">
                Conectando instituições para um mercado financeiro mais eficiente.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Liquidez interfinanceira segura, automatizada por contratos inteligentes e liquidação garantida via blockchain.
              </p>
            </div>

            <div className="relative my-8 flex h-52 items-center justify-center overflow-hidden" aria-hidden="true">
              <div className="absolute h-36 w-56 -translate-x-9 translate-y-3 -rotate-12 rounded-2xl border border-gray-300 bg-gray-200 shadow-lg sm:w-60">
                <span className="absolute left-5 top-5 text-lg font-bold tracking-tight text-gray-500">inter</span>
                <span className="absolute bottom-6 left-5 h-5 w-8 rounded bg-gray-300" />
              </div>
              <div className="absolute flex h-40 w-60 translate-x-7 -translate-y-1 rotate-12 flex-col justify-between rounded-2xl border border-orange-300 bg-[linear-gradient(135deg,#ffb14f_0%,#ff850b_52%,#e76500_100%)] p-5 shadow-xl sm:w-64">
                <div className="flex items-start justify-between text-white">
                  <span className="text-2xl font-bold tracking-tight">inter</span>
                  <span className="text-[10px] font-semibold tracking-widest">CRÉDITO</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="grid h-7 w-9 grid-cols-2 overflow-hidden rounded-md border border-gray-500 bg-gray-300 shadow-inner">
                    <span className="border-b border-r border-gray-500" /><span className="border-b border-gray-500" />
                    <span className="border-r border-gray-500" /><span />
                  </span>
                  <span className="relative h-9 w-14">
                    <span className="absolute left-0 top-0 h-9 w-9 rounded-full border border-white/80 bg-red-500/90" />
                    <span className="absolute right-0 top-0 h-9 w-9 rounded-full border border-white/80 bg-amber-400/85" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 p-8 shadow-xs">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Acesse sua conta
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Entre com suas credenciais para acessar a plataforma.
                </p>
              </div>

              <form onSubmit={handleEntrar} className="space-y-4">
                <Input
                  label="Email corporativo"
                  id="email"
                  type="email"
                  placeholder="operador@bancoa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div>
                  <Input
                    label="Senha"
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                      onClick={() => alert("Recuperação de senha simulada. Utilize as credenciais padrão para acessar.")}
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 mt-2"
                  disabled={carregando}
                >
                  {carregando ? "Acessando..." : "Entrar na Mesa"}
                  {!carregando && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Rodapé institucional */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-gray-400">
        © 2026 Inter - Crédito Interfinanceiro. Todos os direitos reservados.
      </div>
    </div>
  );
}
