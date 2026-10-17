import { useEffect, useState } from "react";
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
import { aprovarBrlt, consultarBrlt } from "../../services/brlt";
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
  const { demonstracao, carteiraAtiva, deployment, limiteOperador, limites, status: statusAmbiente, erro: erroAmbiente } = useAmbiente();
  const { notificar } = useOperacoes();
  const navigate = useNavigate();
  const tomadores = limites.filter((item) => item.isRegistered && item.wallet.toLowerCase() !== carteiraAtiva?.toLowerCase());
  const [tomador, setTomador] = useState("");
  const [valor, setValor] = useState("");
  const [taxa, setTaxa] = useState("105");
  const [prazo, setPrazo] = useState("1");
  const [transacao, setTransacao] = useState({ fase: "idle", hash: null, erro: null });
  const [aprovacao, setAprovacao] = useState({ fase: "idle", hash: null });
  const [brlt, setBrlt] = useState({ status: "idle", saldo: null, autorizado: null, erro: null });
  const [versaoBrlt, setVersaoBrlt] = useState(0);
  const [novaOfertaId, setNovaOfertaId] = useState(null);
  const processando = ["preparando", "assinando", "confirmando"].includes(transacao.fase) ||
    ["assinando", "confirmando"].includes(aprovacao.fase);
  const deploymentAtivo = deployment?.data;

  useEffect(() => {
    if (!isOpen || demonstracao || !conta || !naSepolia || !deploymentAtivo || !limiteOperador?.isRegistered) return undefined;
    let ativo = true;
    const provider = getProvider();
    setBrlt({ status: "carregando", saldo: null, autorizado: null, erro: null });
    consultarBrlt({ provider, carteira: conta, deployment: deploymentAtivo })
      .then(({ saldo, autorizado }) => {
        if (ativo) setBrlt({ status: "ok", saldo, autorizado, erro: null });
      })
      .catch((erro) => {
        if (ativo) setBrlt({ status: "erro", saldo: null, autorizado: null, erro: mensagemErroTransacao(erro) });
      });
    return () => { ativo = false; };
  }, [isOpen, demonstracao, conta, naSepolia, deploymentAtivo, limiteOperador?.isRegistered, getProvider, versaoBrlt]);

  async function enviar(evento) {
    evento.preventDefault();
    const amountCents = centavosDeReais(valor);
    const rateCdiBps = Math.round(Number(taxa.replace(",", ".")) * 100);
    const termDays = Number(prazo);
    const limiteTomador = tomadores.find((item) => item.wallet === tomador);
    if (!demonstracao && !limiteOperador?.isRegistered) {
      return setTransacao({ fase: "erro", erro: "Esta carteira não está cadastrada como instituição no contrato." });
    }
    if (!tomador || !limiteTomador) return setTransacao({ fase: "erro", erro: "Selecione uma instituição tomadora." });
    if (!amountCents || BigInt(amountCents) > BigInt(limiteTomador.availableLimitCents)) {
      return setTransacao({ fase: "erro", erro: "Informe um valor positivo dentro do limite do tomador." });
    }
    if (!Number.isInteger(rateCdiBps) || rateCdiBps < 1 || rateCdiBps > 100000 || !Number.isInteger(termDays) || termDays < 1 || termDays > 365) {
      return setTransacao({ fase: "erro", erro: "Confira a taxa e o prazo da oferta." });
    }
    setTransacao({ fase: "preparando", hash: null, erro: null });
    let ofertaIniciada = false;
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
      const provider = getProvider();
      setAprovacao({ fase: "verificando", hash: null });
      const autorizacao = await aprovarBrlt({
        provider, carteira: conta, deployment: deploymentAtivo, valor: amountCents,
        aoAtualizar: (atualizacao) => setAprovacao((anterior) => ({ ...anterior, ...atualizacao })),
      });
      setAprovacao({ fase: "confirmada", hash: autorizacao.hash });
      setBrlt((anterior) => ({ ...anterior, status: "ok", autorizado: anterior.autorizado > BigInt(amountCents) ? anterior.autorizado : BigInt(amountCents), erro: null }));
      ofertaIniciada = true;
      await executarCriacaoOferta({
        dados,
        carteira: conta, provider,
        aoAtualizar: (atualizacao) => setTransacao((anterior) => ({ ...anterior, ...atualizacao, erro: null })),
      });
      notificar("Transação de criação enviada à Sepolia.", "info");
    } catch (erro) {
      setAprovacao((anterior) => !ofertaIniciada && ["assinando", "confirmando", "verificando"].includes(anterior.fase)
        ? { ...anterior, fase: "erro", hash: erro.hash ?? anterior.hash } : anterior);
      setTransacao((anterior) => ({ ...anterior, fase: "erro", hash: ofertaIniciada ? erro.hash ?? anterior.hash : null, erro: mensagemErroTransacao(erro) }));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={processando ? undefined : onClose} showClose={!processando} title="Nova oferta de crédito" subtitle={demonstracao ? "Publicação de demonstração no backend" : "A publicação exige assinatura na MetaMask"} maxWidth="max-w-md">
      <form className="space-y-4 text-sm" onSubmit={enviar}>
        {demonstracao ? <p className="break-all text-xs text-gray-600">Ofertante de demonstração: {carteiraAtiva}</p> : !conta || !naSepolia ? <CarteiraControles /> : <p className="break-all text-xs text-gray-600">Ofertante: {conta}</p>}
        {!demonstracao && conta && statusAmbiente === "ok" && !limiteOperador?.isRegistered && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">Esta carteira não está cadastrada como instituição no contrato. Solicite o cadastro ao administrador antes de publicar uma oferta.</p>}
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
        <p className="text-xs text-gray-500">A oferta terá validade de 1 hora. {demonstracao ? "A ação será registrada pela API com hash sintético." : "O backend confirma a publicação após indexar a transação."}</p>
        {!demonstracao && conta && naSepolia && limiteOperador?.isRegistered && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            {brlt.status === "carregando" && <p role="status">Consultando saldo e autorização de BRLt na Sepolia...</p>}
            {brlt.status === "erro" && <><p role="alert" className="text-rose-700">{brlt.erro}</p><Button size="sm" variant="outline" onClick={() => setVersaoBrlt((atual) => atual + 1)}>Tentar novamente</Button></>}
            {brlt.status === "ok" && <>
              <p>Saldo de BRLt: {formatarCentavos(brlt.saldo.toString())}</p>
              <p>Autorizado para o contrato: {formatarCentavos(brlt.autorizado.toString())}</p>
              <p className="mt-1">Se a autorização for menor que o valor da oferta, a MetaMask solicitará a aprovação antes da publicação.</p>
            </>}
          </div>
        )}
        {aprovacao.fase === "assinando" && <p role="status" className="text-xs text-amber-800">Confirme a autorização de BRLt na MetaMask...</p>}
        {aprovacao.fase === "confirmando" && <p role="status" className="text-xs text-amber-800">Aguardando confirmação da autorização na Sepolia...</p>}
        {aprovacao.hash && <div className="text-xs">Hash da aprovação de BRLt: <HashTransacao valor={aprovacao.hash} /></div>}
        {processando && !["assinando", "confirmando"].includes(aprovacao.fase) && <p role="status" className="text-xs text-amber-800">{demonstracao ? "Registrando oferta no backend..." : transacao.fase === "assinando" ? "Aguardando assinatura da oferta na MetaMask..." : transacao.fase === "confirmando" ? "Aguardando confirmação da oferta na Sepolia..." : "Preparando oferta..."}</p>}
        {transacao.fase === "confirmada" && <p role="status" className="text-xs text-emerald-700">{demonstracao ? "Oferta de demonstração registrada." : `Transação confirmada. ${transacao.sincronizando ? "Aguardando indexação pelo backend." : "Oferta registrada."}`}</p>}
        {transacao.fase === "pendente" && <p role="status" className="text-xs text-amber-800">A oferta foi enviada, mas a confirmação ainda não apareceu. Consulte o hash antes de tentar outra vez.</p>}
        {transacao.erro && <p role="alert" className="text-xs text-rose-700">{transacao.erro}</p>}
        {transacao.hash && <div className="text-xs">Hash da oferta: <HashTransacao valor={transacao.hash} /></div>}
        {novaOfertaId && <Button variant="outline" onClick={() => { onClose(); navigate(`/operacoes/${novaOfertaId}`); }}>Ver oferta criada</Button>}
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
          <Button variant="outline" onClick={onClose} disabled={processando}>Fechar</Button>
          <Button type="submit" disabled={!carteiraAtiva || (!demonstracao && (!naSepolia || brlt.status !== "ok" || !limiteOperador?.isRegistered)) || processando || Boolean(transacao.hash) || statusAmbiente !== "ok"}>{demonstracao ? "Publicar demonstração" : "Autorizar e publicar na Sepolia"}</Button>
        </div>
      </form>
    </Modal>
  );
}
