import { useEffect, useRef, useCallback, useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';

// Hook: dispatch GENERATE_CASHFLOWS_FROM_ASSETS at mount and each hour
export default function useCashflowGeneration({ intervalMs = 1000 * 60 * 60 } = {}) {
  const { dispatch } = useContext(FinanceContext);
  const timerRef = useRef(null);

  const runGenerate = useCallback(() => {
    try {
      dispatch({ type: 'GENERATE_CASHFLOWS_FROM_ASSETS' });
    } catch (e) {
      // swallow errors to avoid crashing UI
      // console.error('generate cashflows failed', e);
    }
  }, [dispatch]);

  useEffect(() => {
    // run immediately on mount
    runGenerate();

    // schedule interval
    timerRef.current = setInterval(() => {
      runGenerate();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalMs, runGenerate]);

  // expose a force trigger
  return {
    forceGenerate: runGenerate
  };
}
