// Formatadores puros para dados vindos da API/blockchain.
// Valores monetários chegam em centavos (string de uint256) e são tratados com
// BigInt para nunca perder precisão nem arredondar silenciosamente.

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";

const TRANSACTION_HASH = /^0x[0-9a-fA-F]{64}$/;
const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

function groupThousands(inteiro) {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatCents(cents) {
  if (cents === null || cents === undefined || cents === "") return "—";
  let value;
  try {
    value = BigInt(cents);
  } catch {
    return "—";
  }
  const negativo = value < 0n;
  const absoluto = negativo ? -value : value;
  const wholeReais = groupThousands((absoluto / 100n).toString());
  const resto = (absoluto % 100n).toString().padStart(2, "0");
  return `${negativo ? "-" : ""}R$ ${wholeReais},${resto}`;
}

// 10000 bps = 100% do CDI. Mantém até duas casas sem arredondar.
export function formatCdiRate(bps) {
  const number = Number(bps);
  if (!Number.isInteger(number) || number < 0) return "—";
  const inteiro = Math.trunc(number / 100);
  const decimais = String(number % 100).padStart(2, "0").replace(/0+$/, "");
  return `${inteiro}${decimais ? `,${decimais}` : ""}% CDI`;
}

export function formatTerm(dias) {
  const number = Number(dias);
  if (!Number.isInteger(number) || number <= 0) return "—";
  if (number === 1) return "1 dia (overnight)";
  return `${number} dias`;
}

export function shortenHash(hash) {
  if (typeof hash !== "string" || hash.length < 12) return hash ?? "";
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

export function shortenAddress(endereco) {
  return shortenHash(endereco);
}

export function transactionExplorerUrl(hash) {
  return TRANSACTION_HASH.test(hash ?? "") ? `${SEPOLIA_EXPLORER}/tx/${hash}` : null;
}

export function addressExplorerUrl(endereco) {
  return ADDRESS_PATTERN.test(endereco ?? "") ? `${SEPOLIA_EXPLORER}/address/${endereco}` : null;
}

export function formatIsoDateTime(iso) {
  if (!iso) return "—";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "—";
  const dia = data.toLocaleDateString("pt-BR");
  const time = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia} às ${time}`;
}

export function formatTime(data) {
  if (!(data instanceof Date)) return "";
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
