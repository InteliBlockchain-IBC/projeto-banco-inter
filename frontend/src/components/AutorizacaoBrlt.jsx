import { useEffect, useState } from "react";
import { useCarteira } from "../context/CarteiraContext";
import { useAmbiente } from "../context/AmbienteContext";
import { aprovarBrlt, consultarBrlt } from "../services/brlt";
import { mensagemErroTransacao } from "../services/transacoes";
import { formatarCentavos } from "../utils/formatadores";
import HashTransacao from "./HashTransacao";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function AutorizacaoBrlt({ valorCentavos }) {
  const { conta, naSepolia, getProvider } = useCarteira();
  const { deployment } = useAmbiente();
  const [consulta, setConsulta] = useState({ status: "carregando", saldo: null, autorizado: null, erro: null });
  const [aprovacao, setAprovacao] = useState({ fase: "idle", hash: null, erro: null });
  const [versao, setVersao] = useState(0);
  const enderecos = deployment?.data;

  useEffect(() => {
    if (!conta || !naSepolia || !enderecos) return undefined;
    let ativo = true;
    consultarBrlt({ provider: getProvider(), carteira: conta, deployment: enderecos })
      .then(({ saldo, autorizado }) => {
        if (ativo) setConsulta({ status: "ok", saldo, autorizado, erro: null });
      })
      .catch((erro) => {
        if (ativo) setConsulta({ status: "erro", saldo: null, autorizado: null, erro: mensagemErroTransacao(erro) });
      });
    return () => { ativo = false; };
  }, [conta, naSepolia, enderecos, getProvider, versao]);

  async function autorizar() {
    setAprovacao({ fase: "verificando", hash: null, erro: null });
    try {
      await aprovarBrlt({
        provider: getProvider(), carteira: conta, deployment: enderecos, valor: valorCentavos,
        aoAtualizar: (atualizacao) => setAprovacao((anterior) => ({ ...anterior, ...atualizacao, erro: null })),
      });
      setAprovacao((anterior) => ({ ...anterior, fase: "confirmada" }));
      setVersao((atual) => atual + 1);
    } catch (erro) {
      setAprovacao((anterior) => ({ ...anterior, fase: "erro", hash: erro.hash ?? anterior.hash, erro: mensagemErroTransacao(erro) }));
    }
  }

  const valor = BigInt(valorCentavos);
  const ocupado = ["verificando", "assinando", "confirmando"].includes(aprovacao.fase);
  const suficiente = consulta.status === "ok" && consulta.saldo >= valor;
  const autorizado = consulta.status === "ok" && consulta.autorizado >= valor;

  return (
    <Card className="space-y-2 p-4 text-xs text-gray-600">
      <strong className="block text-sm text-gray-900">BRLt do ofertante</strong>
      <p>Para o tomador aceitar esta oferta, o contrato precisa de autorização para transferir {formatarCentavos(valorCentavos)} em BRLt.</p>
      {consulta.status === "carregando" && <p role="status">Consultando saldo e autorização na Sepolia...</p>}
      {consulta.status === "erro" && <p role="alert" className="text-rose-700">{consulta.erro}</p>}
      {consulta.status === "ok" && <>
        <p>Saldo: {formatarCentavos(consulta.saldo.toString())}</p>
        <p>Autorizado: {formatarCentavos(consulta.autorizado.toString())}</p>
        {!suficiente && <p role="alert" className="text-rose-700">Saldo insuficiente. Solicite BRLt de teste ao administrador.</p>}
        {autorizado && <p role="status" className="text-emerald-700">Esta oferta já tem autorização suficiente.</p>}
      </>}
      {!autorizado && <Button size="sm" variant="outline" onClick={autorizar}
        disabled={!conta || !naSepolia || !suficiente || ocupado}>Autorizar BRLt na MetaMask</Button>}
      {consulta.status === "erro" && <Button size="sm" variant="outline" onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</Button>}
      {ocupado && <p role="status">{aprovacao.fase === "assinando" ? "Aguardando assinatura na MetaMask..." : aprovacao.fase === "confirmando" ? "Aguardando confirmação na Sepolia..." : "Verificando autorização..."}</p>}
      {aprovacao.erro && <p role="alert" className="text-rose-700">{aprovacao.erro}</p>}
      {aprovacao.hash && <div>Hash da aprovação: <HashTransacao valor={aprovacao.hash} /></div>}
    </Card>
  );
}
