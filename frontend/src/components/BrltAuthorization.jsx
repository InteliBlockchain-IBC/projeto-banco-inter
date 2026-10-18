import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useEnvironment } from "../context/EnvironmentContext";
import { approveBrlt, readBrlt } from "../services/brlt";
import { transactionErrorMessage } from "../services/transactions";
import { formatCents } from "../utils/formatters";
import TransactionHash from "./TransactionHash";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function BrltAuthorization({ amountCentsBigInt }) {
  const { account, isSepolia, getProvider } = useWallet();
  const { deployment } = useEnvironment();
  const [query, setQuery] = useState({ status: "carregando", balance: null, approved: null, error: null });
  const [approval, setApproval] = useState({ phase: "idle", hash: null, error: null });
  const [version, setVersion] = useState(0);
  const enderecos = deployment?.data;

  useEffect(() => {
    if (!account || !isSepolia || !enderecos) return undefined;
    let active = true;
    readBrlt({ provider: getProvider(), wallet: account, deployment: enderecos })
      .then(({ balance, approved }) => {
        if (active) setQuery({ status: "ok", balance, approved, error: null });
      })
      .catch((error) => {
        if (active) setQuery({ status: "erro", balance: null, approved: null, error: transactionErrorMessage(error) });
      });
    return () => { active = false; };
  }, [account, isSepolia, enderecos, getProvider, version]);

  async function authorize() {
    setApproval({ phase: "verificando", hash: null, error: null });
    try {
      await approveBrlt({
        provider: getProvider(), wallet: account, deployment: enderecos, value: amountCentsBigInt,
        onUpdate: (update) => setApproval((previous) => ({ ...previous, ...update, error: null })),
      });
      setApproval((previous) => ({ ...previous, phase: "confirmada" }));
      setVersion((current) => current + 1);
    } catch (error) {
      setApproval((previous) => ({ ...previous, phase: "erro", hash: error.hash ?? previous.hash, error: transactionErrorMessage(error) }));
    }
  }

  const value = BigInt(amountCentsBigInt);
  const busy = ["verificando", "assinando", "confirmando"].includes(approval.phase);
  const sufficient = query.status === "ok" && query.balance >= value;
  const approved = query.status === "ok" && query.approved >= value;

  return (
    <Card className="space-y-2 p-4 text-xs text-gray-600">
      <strong className="block text-sm text-gray-900">BRLt do ofertante</strong>
      <p>Para o tomador aceitar esta oferta, o contrato precisa de autorização para transferir {formatCents(amountCentsBigInt)} em BRLt.</p>
      {query.status === "carregando" && <p role="status">Consultando saldo e autorização na Sepolia...</p>}
      {query.status === "erro" && <p role="alert" className="text-rose-700">{query.error}</p>}
      {query.status === "ok" && <>
        <p>Saldo: {formatCents(query.balance.toString())}</p>
        <p>Autorizado: {formatCents(query.approved.toString())}</p>
        {!sufficient && <p role="alert" className="text-rose-700">Saldo insuficiente. Solicite BRLt de teste ao administrador.</p>}
        {approved && <p role="status" className="text-emerald-700">Esta oferta já tem autorização suficiente.</p>}
      </>}
      {!approved && <Button size="sm" variant="outline" onClick={authorize}
        disabled={!account || !isSepolia || !sufficient || busy}>Autorizar BRLt na MetaMask</Button>}
      {query.status === "erro" && <Button size="sm" variant="outline" onClick={() => setVersion((current) => current + 1)}>Tentar novamente</Button>}
      {busy && <p role="status">{approval.phase === "assinando" ? "Aguardando assinatura na MetaMask..." : approval.phase === "confirmando" ? "Aguardando confirmação na Sepolia..." : "Verificando autorização..."}</p>}
      {approval.error && <p role="alert" className="text-rose-700">{approval.error}</p>}
      {approval.hash && <div>Hash da aprovação: <TransactionHash value={approval.hash} /></div>}
    </Card>
  );
}
