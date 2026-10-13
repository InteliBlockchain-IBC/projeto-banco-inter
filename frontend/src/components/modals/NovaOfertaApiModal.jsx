import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import CarteiraControles from "../CarteiraControles";
import HashTransacao from "../HashTransacao";
import { useCarteira } from "../../context/CarteiraContext";
import { useAmbiente } from "../../context/AmbienteContext";
import { useOperacoes } from "../../context/OperacoesContext";
import { criarOfertaDemonstracao } from "../../services/api";
import { executarCriacaoOferta, mensagemErroTransacao } from "../../services/transacoes";
import { formatarCentavos } from "../../utils/formatadores";

function centavosDeReais(valor) {
  const normalizado = valor.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizado)) return null;
  const [reais, centavos = ""] = normalizado.split(".");
  const resultado = BigInt(reais) * 100n + BigInt(centavos.padEnd(2, "0"));
  return resultado > 0n ? resultado.toString() : null;
}

export default function NovaOfertaApiModal({ isOpen, onClose }) {
  const { conta, naSepolia, getProvider } = useCarteira();
  const { demonstracao, carteiraAtiva, limites, status: statusAmbiente, erro: erroAmbiente } = useAmbiente();
  const { notificar } = useOperacoes();
  const navigate = useNavigate();
  const tomadores = limites.filter((item) => item.isRegistered && item.wallet.toLowerCase() !== carteiraAtiva?.toLowerCase());
  const [tomador, setTomador] = useState("");
  const [valor, setValor] = useState("");
  const [taxa, setTaxa] = useState("105");
  const [prazo, setPrazo] = useState("1");
  const [transacao, setTransacao] = useState({ fase: "idle", hash: null, erro: null });
  const [novaOfertaId, setNovaOfertaId] = useState(null);
  const processando = ["preparando", "assinando", "confirmando"].includes(transacao.fase);

  async function enviar(evento) {
    evento.preventDefault();
    const amountCents = centavosDeReais(valor);
    const rateCdiBps = Math.round(Number(taxa.replace(",", ".")) * 100);
    const termDays = Number(prazo);
    const limiteTomador = tomadores.find((item) => item.wallet === tomador);
    if (!tomador || !limiteTomador) return setTransacao({ fase: "erro", erro: "Selecione uma instituição tomadora." });
    if (!amountCents || BigInt(amountCents) > BigInt(limiteTomador.availableLimitCents)) {
      return setTransacao({ fase: "erro", erro: "Informe um valor positivo dentro do limite do tomador." });
    }
    if (!Number.isInteger(rateCdiBps) || rateCdiBps < 1 || rateCdiBps > 100000 || !Number.isInteger(termDays) || termDays < 1 || termDays > 365) {
      return setTransacao({ fase: "erro", erro: "Confira a taxa e o prazo da oferta." });
    }
    setTransacao({ fase: "preparando", hash: null, erro: null });
    try {
      const dados = { borrowerWallet: tomador, amountCents, rateCdiBps, termDays, validitySeconds: 3600 };
      if (demonstracao) {
        const resultado = await criarOfertaDemonstracao({ ...dados, lenderWallet: carteiraAtiva });
        setNovaOfertaId(resultado.offer.id);
        setTransacao({ fase: "confirmada", hash: resultado.offer.createTxHash, erro: null, demonstracao: true });
        notificar(`Oferta #${resultado.offer.onchainOfferId} publicada na demonstração.`, "sucesso", resultado.offer.id);
        window.dispatchEvent(new Event("inter:ofertas-atualizadas"));
        return;
      }
      await executarCriacaoOferta({
        dados,
        carteira: conta, provider: getProvider(),
        aoAtualizar: (atualizacao) => setTransacao((anterior) => ({ ...anterior, ...atualizacao, erro: null })),
      });
      notificar("Transação de criação enviada à Sepolia.", "info");
    } catch (erro) {
      setTransacao((anterior) => ({ ...anterior, fase: "erro", hash: erro.hash ?? anterior.hash, erro: mensagemErroTransacao(erro) }));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={processando ? undefined : onClose} showClose={!processando} title="Nova oferta de crédito" subtitle={demonstracao ? "Publicação de demonstração no backend" : "A publicação exige assinatura na MetaMask"} maxWidth="max-w-md">
      <form className="space-y-4 text-sm" onSubmit={enviar}>
        {demonstracao ? <p className="break-all text-xs text-gray-600">Ofertante de demonstração: {carteiraAtiva}</p> : !conta || !naSepolia ? <CarteiraControles /> : <p className="break-all text-xs text-gray-600">Ofertante: {conta}</p>}
        <label className="block text-xs font-medium text-gray-700">Instituição tomadora
          <select required value={tomador} onChange={(evento) => setTomador(evento.target.value)} disabled={processando || statusAmbiente !== "ok"} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm">
            <option value="">Selecione</option>
            {tomadores.map((item) => <option key={item.wallet} value={item.wallet}>{item.institution?.name ?? item.wallet} — {formatarCentavos(item.availableLimitCents)} disponíveis</option>)}
          </select>
        </label>
        {statusAmbiente === "carregando" && <p role="status" className="text-xs">Carregando instituições...</p>}
        {statusAmbiente === "erro" && <p role="alert" className="text-xs text-rose-700">Não foi possível consultar os limites: {erroAmbiente?.message}</p>}
        <label className="block text-xs font-medium text-gray-700">Valor (R$)
          <input required type="text" inputMode="decimal" placeholder="1000000,00" value={valor} onChange={(evento) => setValor(evento.target.value)} disabled={processando} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-gray-700">Taxa (% CDI)
            <input required type="text" inputMode="decimal" value={taxa} onChange={(evento) => setTaxa(evento.target.value)} disabled={processando} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-gray-700">Prazo (dias)
            <input required type="number" min="1" max="365" value={prazo} onChange={(evento) => setPrazo(evento.target.value)} disabled={processando} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </label>
        </div>
        <p className="text-xs text-gray-500">A oferta terá validade de 1 hora. {demonstracao ? "A ação será registrada no PostgreSQL com hash sintético." : "O backend confirma a publicação após indexar a transação."}</p>
        {processando && <p role="status" className="text-xs text-amber-800">{demonstracao ? "Registrando oferta no backend..." : transacao.fase === "assinando" ? "Aguardando assinatura na MetaMask..." : transacao.fase === "confirmando" ? "Aguardando confirmação na Sepolia..." : "Preparando oferta..."}</p>}
        {transacao.fase === "confirmada" && <p role="status" className="text-xs text-emerald-700">{demonstracao ? "Oferta de demonstração registrada." : `Transação confirmada. ${transacao.sincronizando ? "Aguardando indexação pelo backend." : "Oferta registrada."}`}</p>}
        {transacao.erro && <p role="alert" className="text-xs text-rose-700">{transacao.erro}</p>}
        {transacao.hash && <div className="text-xs">Hash da transação: <HashTransacao valor={transacao.hash} /></div>}
        {novaOfertaId && <Button variant="outline" onClick={() => { onClose(); navigate(`/operacoes/${novaOfertaId}`); }}>Ver oferta criada</Button>}
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
          <Button variant="outline" onClick={onClose} disabled={processando}>Fechar</Button>
          <Button type="submit" disabled={!carteiraAtiva || (!demonstracao && !naSepolia) || processando || Boolean(transacao.hash) || statusAmbiente !== "ok"}>{demonstracao ? "Publicar demonstração" : "Publicar na Sepolia"}</Button>
        </div>
      </form>
    </Modal>
  );
}
