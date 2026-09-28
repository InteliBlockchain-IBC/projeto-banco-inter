import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ArrowRight, Layers, ShieldCheck } from "lucide-react";
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

      {/* Conteúdo Central: Card Duplo */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Lado Esquerdo: Apresentação da Mesa */}
          <div className="bg-white/80 rounded-2xl border border-gray-200/90 p-8 flex flex-col justify-between shadow-xs">
            <div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
                Conectando instituições para um mercado financeiro mais eficiente.
              </h1>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Liquidez interfinanceira segura, automatizada por contratos inteligentes e liquidação garantida via blockchain.
              </p>
            </div>

            {/* Ilustração / Cards Estilizados */}
            <div className="my-8 relative h-36 flex items-center justify-center">
              {/* Card de Fundo */}
              <div className="absolute w-52 h-28 rounded-xl bg-gray-100 border border-gray-200 -rotate-6 transform -translate-x-4 shadow-xs flex flex-col justify-between p-3.5">
                <div className="w-8 h-3 rounded bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="w-24 h-2 rounded bg-gray-200" />
                  <div className="w-16 h-2 rounded bg-gray-200" />
                </div>
              </div>
              {/* Card da Frente */}
              <div className="absolute w-52 h-28 rounded-xl bg-gray-200/80 border border-gray-300 rotate-3 transform translate-x-3 shadow-sm flex flex-col justify-between p-3.5">
                <div className="flex justify-between items-center">
                  <div className="w-7 h-7 rounded-full bg-gray-300" />
                  <span className="text-[10px] font-mono text-gray-500 font-bold">101,5% CDI</span>
                </div>
                <div className="space-y-1.5">
                  <div className="w-28 h-2.5 rounded bg-gray-300" />
                  <div className="w-20 h-2 rounded bg-gray-300" />
                </div>
              </div>
            </div>

          </div>

          {/* Lado Direito: Formulário de Acesso */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-8 shadow-xs flex flex-col justify-between">
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

            {/* Nota de rodapé da PoC */}
            <div className="mt-8 p-3 rounded-lg bg-gray-50 border border-gray-200/80 text-center">
              <span className="text-[11px] text-gray-500">
                Use credenciais simuladas para acessar a PoC
              </span>
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
