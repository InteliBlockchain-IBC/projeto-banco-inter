import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { createMetaMaskConnection, SEPOLIA_CHAIN_ID, networkName } from "../services/metamask";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [connection] = useState(() => createMetaMaskConnection());
  const state = useSyncExternalStore(connection.subscribe, connection.getSnapshot);

  useEffect(() => connection.start(), [connection]);

  return (
    <WalletContext.Provider value={{
      ...state,
      connected: Boolean(state.account),
      network: networkName(state.chainId),
      isSepolia: state.chainId === SEPOLIA_CHAIN_ID,
      connect: connection.connect,
      disconnect: connection.disconnect,
      switchToSepolia: connection.switchToSepolia,
      clearError: connection.clearError,
      getProvider: connection.getProvider,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet deve ser usado dentro de um WalletProvider");
  return context;
}
