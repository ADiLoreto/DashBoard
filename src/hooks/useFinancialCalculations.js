import { useContext, useMemo } from 'react';
import { FinanceContext } from '../context/FinanceContext';

export const useFinancialCalculations = () => {
  const { state } = useContext(FinanceContext);

  const totaleEntrate = useMemo(() => {
    return state.entrate.stipendio.netto +
           state.entrate.bonus.reduce((sum, b) => sum + b.importo, 0) +
           state.entrate.altreEntrate.reduce((sum, e) => sum + e.importo, 0) +
           (state.entrate.cashflowAsset || []).reduce((sum, cf) => sum + cf.amount, 0);
  }, [state.entrate]);

  const totalePatrimonio = useMemo(() => {
    return state.patrimonio.tfr +
           (state.patrimonio.contiDeposito || []).reduce((sum, c) => sum + (c.saldo || 0), 0) +
           (state.patrimonio.buoniTitoli || []).reduce((sum, b) => sum + (b.importo || 0), 0) +
           (state.patrimonio.investimenti.azioni || []).reduce((sum, i) => sum + (i.valore || 0), 0);
    // ...aggiungere ETF, crypto, oro
  }, [state.patrimonio]);

  const totaleLiquidita = useMemo(() => {
    return state.liquidita.contiCorrenti.reduce((sum,c)=>sum+c.saldo,0) +
           state.liquidita.cartePrepagate.reduce((sum,c)=>sum+c.saldo,0) +
           state.liquidita.contante;
  }, [state.liquidita]);

  const netWorth = totalePatrimonio + totaleLiquidita;
  const savingRate = (totaleEntrate - (state.uscite.fisse.reduce((sum,e)=>sum+e.importo,0) + state.uscite.variabili.reduce((sum,e)=>sum+e.importo,0))) / totaleEntrate * 100;

  return { totaleEntrate, totalePatrimonio, totaleLiquidita, netWorth, savingRate };
};
