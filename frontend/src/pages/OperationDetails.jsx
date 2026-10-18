import { useParams } from "react-router-dom";
import ApiOperationDetails from "./ApiOperationDetails";

export default function OperationDetails() {
  const { id } = useParams();
  return <ApiOperationDetails key={id} id={id} />;
}
