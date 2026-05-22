import { createContext, useContext, useState, useCallback } from 'react';

const SummaryContext = createContext();

export const SummaryProvider = ({ children }) => {
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((item) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id);
      return [item, ...filtered].slice(0, 100);
    });
  }, []);

  const setResult = useCallback(
    (result) => {
      setLastResult(result);
      if (result?.id) addToHistory(result);
    },
    [addToHistory]
  );

  return (
    <SummaryContext.Provider
      value={{
        lastResult,
        setLastResult: setResult,
        history,
        setHistory,
        addToHistory,
      }}
    >
      {children}
    </SummaryContext.Provider>
  );
};

export const useSummary = () => {
  const ctx = useContext(SummaryContext);
  if (!ctx) throw new Error('useSummary must be used within SummaryProvider');
  return ctx;
};
