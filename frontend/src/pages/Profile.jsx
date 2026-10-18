import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TransactionHash from "../components/TransactionHash";
import WalletControls from "../components/WalletControls";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { useWallet } from "../context/WalletContext";
import { useEnvironment } from "../context/EnvironmentContext";
import { getCreditLimitHistory } from "../services/api";
import { formatCents, formatIsoDateTime } from "../utils/formatters";

export default function Profile() {
  const { account, network, isSepolia } = useWallet();
  const { activeWallet, operatorLimit, demo, status, error, reload } = useEnvironment();
  const [history, setHistory] = useState({ status: "carregando", data: [], error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!activeWallet) return undefined;
    const controller = new AbortController();
    getCreditLimitHistory(activeWallet, { signal: controller.signal })
      .then((data) => setHistory({ status: "ok", data, error: null }))
      .catch((failure) => { if (!controller.signal.aborted) setHistory({ status: "erro", data: [], error: failure }); });
    return () => controller.abort();
  }, [activeWallet, version]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Perfil da instituição</h1>
        <p className="mt-1 text-sm text-gray-500">Identidade e limite associados à carteira selecionada.</p>
      </div>

      {demo && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Banco de demonstração selecionado no cabeçalho. Os endereços e eventos desta instância são sintéticos.</p>}
      {!demo && <Card className="space-y-3 p-5">
        <h2 className="font-semibold">Carteira MetaMask</h2>
        <p className="break-all font-mono text-xs">{account || "Nenhuma carteira conectada"}</p>
        <p className="text-xs text-gray-500">{account ? `Rede: ${network}${isSepolia ? "" : " — selecione Sepolia para assinar"}` : "Conecte a carteira para consultar seu perfil."}</p>
        <WalletControls />
      </Card>}
      {status === "carregando" && <LoadingState rows={3} label="Carregando perfil" />}
      {status === "erro" && <ErrorState title="Não foi possível carregar o perfil" message={error?.message} onRetry={reload} />}
      {status === "ok" && activeWallet && <>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-gray-900">{operatorLimit?.institution?.name ?? (operatorLimit?.isRegistered ? "Carteira cadastrada" : "Cadastro não localizado")}</h2>
          <div className="text-xs text-gray-600">Carteira: <TransactionHash value={activeWallet} type="endereco" /></div>
          {operatorLimit ? <>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500">Limite disponível para tomada</p>
              <strong className="text-2xl text-gray-900">{formatCents(operatorLimit.availableLimitCents)}</strong>
            </div>
            <p className="text-xs text-gray-500">Observado no bloco {operatorLimit.observedBlock?.toLocaleString("pt-BR") ?? "—"} em {formatIsoDateTime(operatorLimit.observedAt)}.</p>
          </> : <p className="text-sm text-amber-700">A API não encontrou um limite cadastrado para esta carteira.</p>}
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Histórico do limite</h2>
            <Button size="sm" variant="outline" onClick={() => setVersion((v) => v + 1)}>Atualizar</Button>
          </div>
          {history.status === "carregando" && <LoadingState rows={2} label="Carregando histórico do limite" />}
          {history.status === "erro" && <ErrorState title="Histórico indisponível" message={history.error?.message} onRetry={() => setVersion((v) => v + 1)} />}
          {history.status === "ok" && history.data.length === 0 && <p className="text-sm text-gray-500">Nenhuma mudança de limite registrada.</p>}
          {history.status === "ok" && <ul className="divide-y divide-gray-100">{history.data.map((item, index) => <li key={`${item.txHash}-${index}`} className="space-y-1 py-3 text-xs">
            <p className="font-semibold text-gray-800">{item.changeKind === "settlement" ? "Liquidação" : "Atualização administrativa"} · {formatCents(item.newLimitCents)}</p>
            <p className="text-gray-500">{formatIsoDateTime(item.blockTimestamp)}</p>
            {item.txHash && <TransactionHash value={item.txHash} />}
          </li>)}</ul>}
        </Card>
      </>}
    </div>
  );
}
