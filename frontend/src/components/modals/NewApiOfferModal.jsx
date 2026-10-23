import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import WalletControls from "../WalletControls";
import TransactionHash from "../TransactionHash";
import PendingIndexingNotice from "../PendingIndexingNotice";
import { useWallet } from "../../context/WalletContext";
import { useEnvironment } from "../../context/EnvironmentContext";
import { useOperations } from "../../context/OperationsContext";
import { createDemoOffer } from "../../services/api";
import { executeOfferCreation, transactionErrorMessage } from "../../services/transactions";
import { approveBrlt, readBrlt } from "../../services/brlt";
import { formatCents } from "../../utils/formatters";

function centsFromReais(value) {
  // Converte texto monetário sem passar por ponto flutuante, preservando os centavos.
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [wholeReais, cents = ""] = normalized.split(".");
  const result = BigInt(wholeReais) * 100n + BigInt(cents.padEnd(2, "0"));
  return result > 0n ? result.toString() : null;
}

export default function NewApiOfferModal({ isOpen, onClose }) {
  const { account, isSepolia, getProvider } = useWallet();
  const { demo, activeWallet, deployment, operatorLimit, limits, status: statusAmbiente, error: erroAmbiente } = useEnvironment();
  const { notify } = useOperations();
  const navigate = useNavigate();
  const borrowers = limits.filter((item) => item.isRegistered && item.wallet.toLowerCase() !== activeWallet?.toLowerCase());
  const [borrower, setTomador] = useState("");
  const [value, setValue] = useState("");
  const [rate, setRate] = useState("105");
  const [term, setTerm] = useState("1");
  const [transaction, setTransaction] = useState({ phase: "idle", hash: null, error: null });
  const [approval, setApproval] = useState({ phase: "idle", hash: null });
  const [brlt, setBrlt] = useState({ status: "idle", balance: null, approved: null, error: null });
  const [brltVersion, setBrltVersion] = useState(0);
  const [newOfferId, setNewOfferId] = useState(null);
  const processing = ["preparando", "assinando", "confirmando"].includes(transaction.phase) ||
    ["assinando", "confirmando"].includes(approval.phase);
  const activeDeployment = deployment?.data;

  useEffect(() => {
    if (!isOpen || demo || !account || !isSepolia || !activeDeployment || !operatorLimit?.isRegistered) return undefined;
    let active = true;
    const provider = getProvider();
    setBrlt({ status: "carregando", balance: null, approved: null, error: null });
    readBrlt({ provider, wallet: account, deployment: activeDeployment })
      .then(({ balance, approved }) => {
        if (active) setBrlt({ status: "ok", balance, approved, error: null });
      })
      .catch((error) => {
        if (active) setBrlt({ status: "erro", balance: null, approved: null, error: transactionErrorMessage(error) });
      });
    return () => { active = false; };
  }, [isOpen, demo, account, isSepolia, activeDeployment, operatorLimit?.isRegistered, getProvider, brltVersion]);

  async function submit(event) {
    event.preventDefault();
    const amountCents = centsFromReais(value);
    const rateCdiBps = Math.round(Number(rate.replace(",", ".")) * 100);
    const termDays = Number(term);
    const borrowerLimit = borrowers.find((item) => item.wallet === borrower);
    if (!demo && !operatorLimit?.isRegistered) {
      return setTransaction({ phase: "erro", error: "O cadastro desta carteira ainda não apareceu na API. Aguarde a sincronização e tente novamente." });
    }
    if (!borrower || !borrowerLimit) return setTransaction({ phase: "erro", error: "Selecione uma instituição tomadora." });
    if (!amountCents || BigInt(amountCents) > BigInt(borrowerLimit.availableLimitCents)) {
      return setTransaction({ phase: "erro", error: "Informe um valor positivo dentro do limite do tomador." });
    }
    if (!Number.isInteger(rateCdiBps) || rateCdiBps < 1 || rateCdiBps > 100000 || !Number.isInteger(termDays) || termDays < 1 || termDays > 365) {
      return setTransaction({ phase: "erro", error: "Confira a taxa e o prazo da oferta." });
    }
    setTransaction({ phase: "preparando", hash: null, error: null });
    let offerStarted = false;
    try {
      const data = { borrowerWallet: borrower, amountCents, rateCdiBps, termDays, validitySeconds: 3600 };
      // A demo registra a oferta pela API; na Sepolia é preciso aprovar BRLt antes de assinar.
      if (demo) {
        const result = await createDemoOffer({ ...data, lenderWallet: activeWallet });
        setNewOfferId(result.offer.id);
        setTransaction({ phase: "confirmada", hash: result.offer.createTxHash, error: null, demo: true });
        notify(`Oferta #${result.offer.onchainOfferId} publicada na demonstração.`, "sucesso", result.offer.id);
        window.dispatchEvent(new Event("inter:ofertas-atualizadas"));
        return;
      }
      const provider = getProvider();
      setApproval({ phase: "verificando", hash: null });
      const authorization = await approveBrlt({
        provider, wallet: account, deployment: activeDeployment, value: amountCents,
        onUpdate: (update) => setApproval((previous) => ({ ...previous, ...update })),
      });
      setApproval({ phase: "confirmada", hash: authorization.hash });
      setBrlt((previous) => ({ ...previous, status: "ok", approved: previous.approved > BigInt(amountCents) ? previous.approved : BigInt(amountCents), error: null }));
      offerStarted = true;
      await executeOfferCreation({
        data,
        wallet: account, provider,
        onUpdate: (update) => setTransaction((previous) => ({ ...previous, ...update, error: null })),
      });
      notify("Transação de criação enviada à Sepolia.", "info");
    } catch (error) {
      setApproval((previous) => !offerStarted && ["assinando", "confirmando", "verificando"].includes(previous.phase)
        ? { ...previous, phase: "erro", hash: error.hash ?? previous.hash } : previous);
      setTransaction((previous) => ({ ...previous, phase: "erro", hash: offerStarted ? error.hash ?? previous.hash : null, error: transactionErrorMessage(error) }));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={processing ? undefined : onClose} showClose={!processing} title={transaction.phase === "confirmada" && transaction.sincronizando ? "Transação confirmada" : "Nova oferta de crédito"} subtitle={transaction.phase === "confirmada" && transaction.sincronizando ? "Aguardando atualização da oferta" : demo ? "Publicação de demonstração no backend" : "A publicação exige assinatura na MetaMask"} maxWidth="max-w-md">
      {transaction.phase === "confirmada" && transaction.sincronizando ? (
        <PendingIndexingNotice hash={transaction.hash} onClose={onClose} />
      ) : <form className="space-y-4 text-sm" onSubmit={submit}>
        {demo ? <p className="break-all text-xs text-gray-600">Ofertante de demonstração: {activeWallet}</p> : !account || !isSepolia ? <WalletControls /> : <p className="break-all text-xs text-gray-600">Ofertante: {account}</p>}
        {!demo && account && statusAmbiente === "ok" && !operatorLimit?.isRegistered && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">O cadastro desta carteira ainda não apareceu na API. Aguarde a sincronização da Sepolia ou confirme o endereço com o administrador.</p>}
        <label className="block text-xs font-medium text-gray-700">Instituição tomadora
          <select required value={borrower} onChange={(event) => setTomador(event.target.value)} disabled={processing || statusAmbiente !== "ok"} className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-sm">
            <option value="">Selecione</option>
            {borrowers.map((item) => <option key={item.wallet} value={item.wallet}>{item.institution?.name ?? item.wallet} — {formatCents(item.availableLimitCents)} disponíveis</option>)}
          </select>
        </label>
        {statusAmbiente === "carregando" && <p role="status" className="text-xs">Carregando instituições...</p>}
        {statusAmbiente === "erro" && <p role="alert" className="text-xs text-rose-700">Não foi possível consultar os limites: {erroAmbiente?.message}</p>}
        <label className="block text-xs font-medium text-gray-700">Valor (R$)
          <input required type="text" inputMode="decimal" placeholder="1000000,00" value={value} onChange={(event) => setValue(event.target.value)} disabled={processing} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-gray-700">Taxa (% CDI)
            <input required type="text" inputMode="decimal" value={rate} onChange={(event) => setRate(event.target.value)} disabled={processing} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-gray-700">Prazo (dias)
            <input required type="number" min="1" max="365" value={term} onChange={(event) => setTerm(event.target.value)} disabled={processing} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </label>
        </div>
        <p className="text-xs text-gray-500">A oferta terá validade de 1 hora. {demo ? "A ação será registrada pela API com hash sintético." : "O backend confirma a publicação após indexar a transação."}</p>
        {!demo && account && isSepolia && operatorLimit?.isRegistered && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            {brlt.status === "carregando" && <p role="status">Consultando saldo e autorização de BRLt na Sepolia...</p>}
            {brlt.status === "erro" && <><p role="alert" className="text-rose-700">{brlt.error}</p><Button size="sm" variant="outline" onClick={() => setBrltVersion((current) => current + 1)}>Tentar novamente</Button></>}
            {brlt.status === "ok" && <>
              <p>Saldo de BRLt: {formatCents(brlt.balance.toString())}</p>
              <p>Autorizado para o contrato: {formatCents(brlt.approved.toString())}</p>
              <p className="mt-1">Se a autorização for menor que o valor da oferta, a MetaMask solicitará a aprovação antes da publicação.</p>
            </>}
          </div>
        )}
        {approval.phase === "assinando" && <p role="status" className="text-xs text-amber-800">Confirme a autorização de BRLt na MetaMask...</p>}
        {approval.phase === "confirmando" && <p role="status" className="text-xs text-amber-800">Aguardando confirmação da autorização na Sepolia...</p>}
        {approval.hash && <div className="text-xs">Hash da aprovação de BRLt: <TransactionHash value={approval.hash} /></div>}
        {processing && !["assinando", "confirmando"].includes(approval.phase) && <p role="status" className="text-xs text-amber-800">{demo ? "Registrando oferta no backend..." : transaction.phase === "assinando" ? "Aguardando assinatura da oferta na MetaMask..." : transaction.phase === "confirmando" ? "Aguardando confirmação da oferta na Sepolia..." : "Preparando oferta..."}</p>}
        {transaction.phase === "confirmada" && <p role="status" className="text-xs text-emerald-700">{demo ? "Oferta de demonstração registrada." : `Transação confirmada. ${transaction.sincronizando ? "Aguardando indexação pelo backend." : "Oferta registrada."}`}</p>}
        {transaction.phase === "pendente" && <p role="status" className="text-xs text-amber-800">A oferta foi enviada, mas a confirmação ainda não apareceu. Consulte o hash antes de tentar outra vez.</p>}
        {transaction.error && <p role="alert" className="text-xs text-rose-700">{transaction.error}</p>}
        {transaction.hash && <div className="text-xs">Hash da oferta: <TransactionHash value={transaction.hash} /></div>}
        {newOfferId && <Button variant="outline" onClick={() => { onClose(); navigate(`/operacoes/${newOfferId}`); }}>Ver oferta criada</Button>}
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
          <Button variant="outline" onClick={onClose} disabled={processing}>Fechar</Button>
          <Button type="submit" disabled={!activeWallet || (!demo && (!isSepolia || brlt.status !== "ok" || !operatorLimit?.isRegistered)) || processing || Boolean(transaction.hash) || statusAmbiente !== "ok"}>{demo ? "Publicar demonstração" : "Autorizar e publicar na Sepolia"}</Button>
        </div>
      </form>}
    </Modal>
  );
}
