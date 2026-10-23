import { createContext, useCallback, useContext, useMemo, useState } from "react";

const OperationsContext = createContext(null);
const SAVED_OFFERS_KEY = "inter-ofertas-salvas";

export function OperationsProvider({ children }) {
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const savedOffers = JSON.parse(localStorage.getItem(SAVED_OFFERS_KEY) ?? "[]");
      return Array.isArray(savedOffers) ? savedOffers : [];
    } catch { return []; }
  });
  const [comparisonSelection, setComparisonSelection] = useState([]);
  const [newOfferModalOpen, setNewOfferModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  function toggleSaved(id) {
    setSavedIds((previousItems) => {
      const nextItems = previousItems.includes(id)
        ? previousItems.filter((item) => item !== id)
        : [...previousItems, id];
      try { localStorage.setItem(SAVED_OFFERS_KEY, JSON.stringify(nextItems)); } catch { /* Favoritos mantidos em memória. */ }
      return nextItems;
    });
  }

  const withSaved = useCallback(
    (lista) => lista.map((operation) => ({ ...operation, saved: savedIds.includes(operation.id) })),
    [savedIds],
  );

  function toggleComparisonSelection(id) {
    setComparisonSelection((previousItems) => previousItems.includes(id)
      ? previousItems.filter((item) => item !== id)
      : [...previousItems, id]);
  }

  function notify(message, type = "info", rawId = null) {
    setNotifications((previousItems) => [{
      id: `${Date.now()}-${Math.random()}`, message, type,
      time: new Date().toISOString(), rawId, read: false,
    }, ...previousItems].slice(0, 10));
  }

  function markNotificationsRead() {
    setNotifications((previousItems) => previousItems.map((item) => ({ ...item, read: true })));
  }

  const value = useMemo(() => ({
    withSaved, toggleSaved, comparisonSelection, toggleComparisonSelection,
    newOfferModalOpen, setNewOfferModalOpen,
    notifications, notify, markNotificationsRead,
  }), [withSaved, comparisonSelection, newOfferModalOpen, notifications]);

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) throw new Error("useOperations requer OperationsProvider");
  return context;
}
