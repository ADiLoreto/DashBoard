import React, { useContext } from 'react';
import { FinanceContext } from '../../../context/FinanceContext';
import { useFinancialCalculations } from '../../../hooks/useFinancialCalculations';
import { formatCurrency, getUserCurrency } from '../../../utils/format';
import BigTab from '../../ui/BigTab';

const Liquidita = () => {
  const { state } = useContext(FinanceContext);
  const { totaleLiquidita } = useFinancialCalculations();
  const currency = getUserCurrency();

  const conti = state.liquidita.contiCorrenti || [];
  const carte = state.liquidita.cartePrepagate || [];
  const contante = state.liquidita.contante || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--bg-light)', margin: 0 }}>Liquidità</h2>
        <div style={{ background: 'var(--bg-medium)', padding: '12px 16px', borderRadius: 12, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 13 }}>Totale liquidità</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: 22, fontWeight: 700 }}>{formatCurrency(totaleLiquidita, currency)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
        {conti.map(c => (
          <BigTab key={c.id} title={c.titolo || c.name || 'Conto'} value={c.saldo} titleStyle={{ fontSize: 22 }} valueStyle={{ fontSize: 22 }} />
        ))}
        {carte.map(c => (
          <BigTab key={c.id} title={c.titolo || c.name || 'Carta'} value={c.saldo} titleStyle={{ fontSize: 22 }} valueStyle={{ fontSize: 22 }} />
        ))}
        <BigTab key="contante" title="Contante" value={contante} titleStyle={{ fontSize: 22 }} valueStyle={{ fontSize: 22 }} />
      </div>
    </div>
  );
};

export default Liquidita;
