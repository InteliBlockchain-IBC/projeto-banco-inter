import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import HashTransacao from "../components/HashTransacao";
import CarteiraControles from "../components/CarteiraControles";
import EstadoCarregando from "../components/ui/EstadoCarregando";
import EstadoErro from "../components/ui/EstadoErro";
import { useCarteira } from "../context/CarteiraContext";
import { useAmbiente } from "../context/AmbienteContext";
import { buscarHistoricoLimite } from "../services/api";
import { formatarCentavos, formatarDataHoraIso } from "../utils/formatadores";

export default function Perfil() {
  const { conta, rede, naSepolia } = useCarteira();
  const { carteiraAtiva, limiteOperador, demonstracao, status, erro, recarregar } = useAmbiente();
  const [historico, setHistorico] = useState({ status: "carregando", dados: [], erro: null });
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!carteiraAtiva) return undefined;
    const controlador = new AbortController();
    buscarHistoricoLimite(carteiraAtiva, { signal: controlador.signal })
      .then((dados) => setHistorico({ status: "ok", dados, erro: null }))
      .catch((falha) => { if (!controlador.signal.aborted) setHistorico({ status: "erro", dados: [], erro: falha }); });
    return () => controlador.abort();
  }, [carteiraAtiva, versao]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Perfil da instituição</h1>
        <p className="mt-1 text-sm text-gray-500">Identidade e limite associados à carteira selecionada.</p>
      </div>

      {demonstracao && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Banco de demonstração selecionado no cabeçalho. Os endereços e eventos desta instância são sintéticos.</p>}
      {!demonstracao && <Card className="space-y-3 p-5">
        <h2 className="font-semibold">Carteira MetaMask</h2>
        <p className="break-all font-mono text-xs">{conta || "Nenhuma carteira conectada"}</p>
        <p className="text-xs text-gray-500">{conta ? `Rede: ${rede}${naSepolia ? "" : " — selecione Sepolia para assinar"}` : "Conecte a carteira para consultar seu perfil."}</p>
        <CarteiraControles />
      </Card>}
      {status === "carregando" && <EstadoCarregando linhas={3} rotulo="Carregando perfil" />}
      {status === "erro" && <EstadoErro titulo="Não foi possível carregar o perfil" mensagem={erro?.message} onTentarNovamente={recarregar} />}
      {status === "ok" && carteiraAtiva && <>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-gray-900">{limiteOperador?.institution?.name ?? "Instituição não cadastrada"}</h2>
          <div className="text-xs text-gray-600">Carteira: <HashTransacao valor={carteiraAtiva} tipo="endereco" /></div>
          {limiteOperador ? <>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500">Limite disponível para tomada</p>
              <strong className="text-2xl text-gray-900">{formatarCentavos(limiteOperador.availableLimitCents)}</strong>
            </div>
            <p className="text-xs text-gray-500">Observado no bloco {limiteOperador.observedBlock?.toLocaleString("pt-BR") ?? "—"} em {formatarDataHoraIso(limiteOperador.observedAt)}.</p>
          </> : <p className="text-sm text-amber-700">A API não encontrou um limite cadastrado para esta carteira.</p>}
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Histórico do limite</h2>
            <Button size="sm" variant="outline" onClick={() => setVersao((v) => v + 1)}>Atualizar</Button>
          </div>
          {historico.status === "carregando" && <EstadoCarregando linhas={2} rotulo="Carregando histórico do limite" />}
          {historico.status === "erro" && <EstadoErro titulo="Histórico indisponível" mensagem={historico.erro?.message} onTentarNovamente={() => setVersao((v) => v + 1)} />}
          {historico.status === "ok" && historico.dados.length === 0 && <p className="text-sm text-gray-500">Nenhuma mudança de limite registrada.</p>}
          {historico.status === "ok" && <ul className="divide-y divide-gray-100">{historico.dados.map((item, indice) => <li key={`${item.txHash}-${indice}`} className="space-y-1 py-3 text-xs">
            <p className="font-semibold text-gray-800">{item.changeKind === "settlement" ? "Liquidação" : "Atualização administrativa"} · {formatarCentavos(item.newLimitCents)}</p>
            <p className="text-gray-500">{formatarDataHoraIso(item.blockTimestamp)}</p>
            {item.txHash && <HashTransacao valor={item.txHash} />}
          </li>)}</ul>}
        </Card>
      </>}
    </div>
  );
}
