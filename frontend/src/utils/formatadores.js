// Formatadores puros para dados vindos da API/blockchain.
// Valores monetários chegam em centavos (string de uint256) e são tratados com
// BigInt para nunca perder precisão nem arredondar silenciosamente.

export const SEPOLIA_CHAIN_ID = 11155111;
export const EXPLORER_SEPOLIA = "https://sepolia.etherscan.io";

const HASH_TX = /^0x[0-9a-fA-F]{64}$/;
const ENDERECO = /^0x[0-9a-fA-F]{40}$/;

function agruparMilhares(inteiro) {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatarCentavos(centavos) {
  if (centavos === null || centavos === undefined || centavos === "") return "—";
  let valor;
  try {
    valor = BigInt(centavos);
  } catch {
    return "—";
  }
  const negativo = valor < 0n;
  const absoluto = negativo ? -valor : valor;
  const reais = agruparMilhares((absoluto / 100n).toString());
  const resto = (absoluto % 100n).toString().padStart(2, "0");
  return `${negativo ? "-" : ""}R$ ${reais},${resto}`;
}

// 10000 bps = 100% do CDI. Mantém até duas casas sem arredondar.
export function formatarTaxaCdi(bps) {
  const numero = Number(bps);
  if (!Number.isInteger(numero) || numero < 0) return "—";
  const inteiro = Math.trunc(numero / 100);
  const decimais = String(numero % 100).padStart(2, "0").replace(/0+$/, "");
  return `${inteiro}${decimais ? `,${decimais}` : ""}% CDI`;
}

export function formatarPrazo(dias) {
  const numero = Number(dias);
  if (!Number.isInteger(numero) || numero <= 0) return "—";
  if (numero === 1) return "1 dia (overnight)";
  return `${numero} dias`;
}

export function abreviarHash(hash) {
  if (typeof hash !== "string" || hash.length < 12) return hash ?? "";
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

export function abreviarEndereco(endereco) {
  return abreviarHash(endereco);
}

export function urlExplorerTx(hash) {
  return HASH_TX.test(hash ?? "") ? `${EXPLORER_SEPOLIA}/tx/${hash}` : null;
}

export function urlExplorerEndereco(endereco) {
  return ENDERECO.test(endereco ?? "") ? `${EXPLORER_SEPOLIA}/address/${endereco}` : null;
}

export function formatarDataHoraIso(iso) {
  if (!iso) return "—";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "—";
  const dia = data.toLocaleDateString("pt-BR");
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia} às ${hora}`;
}

export function formatarHora(data) {
  if (!(data instanceof Date)) return "";
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
