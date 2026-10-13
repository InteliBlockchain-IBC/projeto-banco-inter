import { useParams } from "react-router-dom";
import DetalheOperacaoApi from "./DetalheOperacaoApi";

export default function DetalheOperacao() {
  const { id } = useParams();
  return <DetalheOperacaoApi key={id} id={id} />;
}
