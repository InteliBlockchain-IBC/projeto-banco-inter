import { useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { formatarMoeda, LIMITE_TOTAL, LIMITE_UTILIZADO_PADRAO, CARTEIRA_CONECTADA } from "../services/mockOperacoes";
import { useOperacoes } from "../context/OperacoesContext";
import { Wallet, ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";

export default function Perfil() {
  const { instituicaoAtual, perfilContato, setPerfilContato } = useOperacoes();
  const [responsavel, setResponsavel] = useState(perfilContato.responsavel);
  const [email, setEmail] = useState(perfilContato.email);
  const [salvo, setSalvo] = useState(false);

  function salvarContato(event) {
    event.preventDefault();
    setPerfilContato({ responsavel: responsavel.trim(), email: email.trim() });
    setSalvo(true);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Perfil da Instituição
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Identidade institucional, chaves criptográficas autorizadas e limites regulatórios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Dados da Instituição (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">
                  {instituicaoAtual.slice(0, 1)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {instituicaoAtual} S.A.
                  </h2>
                  <span className="text-xs text-gray-500">
                    Instituição Financeira Autorizada pelo Banco Central
                  </span>
                </div>
              </div>
              <Badge variant="success" size="sm" dot>
                Ativo
              </Badge>
            </div>

            <div className="divide-y divide-gray-100 text-sm mt-2">
              <div className="py-3 flex justify-between">
                <span className="text-xs text-gray-500">CNPJ</span>
                <span className="font-mono text-xs font-semibold text-gray-900">
                  00.123.456/0001-99
                </span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-xs text-gray-500">Código COMPE / ISPB</span>
                <span className="font-mono text-xs font-semibold text-gray-900">
                  077 • 00416968
                </span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-xs text-gray-500">Segmento Bacen</span>
                <span className="text-xs font-semibold text-gray-900">
                  S1 / Conglomerado Prudencial
                </span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-xs text-gray-500">Mesa Autorizada</span>
                <span className="text-xs font-semibold text-gray-900">
                  Crédito Interfinanceiro (CDI / Over)
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-bold text-gray-900">Editar perfil</h2>
            <p className="mt-1 text-xs text-gray-500">Atualize os dados de contato da mesa de operações.</p>
            <form onSubmit={salvarContato} className="mt-4 space-y-4">
              <label className="block text-xs font-medium text-gray-600">
                Responsável
                <input type="text" required value={responsavel} onChange={(event) => { setResponsavel(event.target.value); setSalvo(false); }} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange" />
              </label>
              <label className="block text-xs font-medium text-gray-600">
                E-mail de contato
                <input type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setSalvo(false); }} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-inter-orange focus:ring-1 focus:ring-inter-orange" />
              </label>
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm">Salvar alterações</Button>
                {salvo && <span role="status" className="text-xs text-emerald-700">Dados salvos.</span>}
              </div>
            </form>
          </Card>

          {/* Carteira e Infraestrutura Web3 */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-700" />
                <h2 className="text-sm font-bold text-gray-900">
                  Carteira Blockchain & Chaves
                </h2>
              </div>
              <Badge variant="neutral" size="sm">
                Rede: Sepolia
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-gray-500 block mb-1">
                  Endereço público da carteira operadora
                </span>
                <div className="flex items-center justify-between bg-gray-50 px-3.5 py-2.5 rounded-lg border border-gray-200 font-mono text-gray-800">
                  <span>{CARTEIRA_CONECTADA}</span>
                  <a
                    href="https://sepolia.etherscan.io"
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-black flex items-center gap-1"
                  >
                    <span>Etherscan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block mb-1">Status do Nó</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sincronizado
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 block mb-1">Tipo de Assinatura</span>
                  <span className="font-semibold text-gray-800">
                    ECDSA secp256k1
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna Direita: Limites de Crédito */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Limites Operacionais
            </h2>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Limite Total Concedido
                </span>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  {formatarMoeda(LIMITE_TOTAL)}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Volume Utilizado na Grade
                </span>
                <div className="text-lg font-bold text-gray-700 mt-1">
                  {formatarMoeda(LIMITE_UTILIZADO_PADRAO)}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-inter-orange h-1.5 w-1/4 rounded-full" />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  25% do teto operacional
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Disponível para Tomada
                </span>
                <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">
                  {formatarMoeda(LIMITE_TOTAL - LIMITE_UTILIZADO_PADRAO)}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-2 text-[11px] text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Revisão de risco periódica aprovada pelo comitê de crédito e tesouraria.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
