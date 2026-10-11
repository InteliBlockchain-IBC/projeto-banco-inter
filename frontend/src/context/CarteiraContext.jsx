import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { criarConexaoMetaMask, SEPOLIA_CHAIN_ID, nomeRede } from "../services/metamask";

const CarteiraContext = createContext(null);

export function CarteiraProvider({ children }) {
  const [conexao] = useState(() => criarConexaoMetaMask());
  const estado = useSyncExternalStore(conexao.subscribe, conexao.getSnapshot);

  useEffect(() => conexao.iniciar(), [conexao]);

  return (
    <CarteiraContext.Provider value={{
      ...estado,
      conectada: Boolean(estado.conta),
      rede: nomeRede(estado.chainId),
      naSepolia: estado.chainId === SEPOLIA_CHAIN_ID,
      conectar: conexao.conectar,
      desconectar: conexao.desconectar,
      trocarParaSepolia: conexao.trocarParaSepolia,
      limparErro: conexao.limparErro,
      getProvider: conexao.getProvider,
    }}>
      {children}
    </CarteiraContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarteira() {
  const context = useContext(CarteiraContext);
  if (!context) throw new Error("useCarteira deve ser usado dentro de um CarteiraProvider");
  return context;
}
