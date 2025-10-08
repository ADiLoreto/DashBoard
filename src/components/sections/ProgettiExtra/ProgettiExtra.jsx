import React, { useContext } from 'react';
import { FinanceContext } from '../../../context/FinanceContext';
import BigTab from '../../ui/BigTab';

const ProgettiExtra = () => {
  const { state } = useContext(FinanceContext);
  const progetti = state.progettiExtra || [];
  const totale = progetti.reduce((sum, p) => sum + (p.valore || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--bg-light)', margin: 0 }}>Progetti Extra</h2>
        <div style={{ background: 'var(--bg-medium)', padding: '12px 16px', borderRadius: 12, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 13 }}>Totale progetti</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: 22, fontWeight: 700 }}>{totale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
        {progetti.map(p => (
          <BigTab key={p.id} title={p.titolo || p.name || 'Progetto'} value={p.valore} titleStyle={{ fontSize: 22 }} valueStyle={{ fontSize: 22 }} />
        ))}
      </div>
    </div>
  );
};

export default ProgettiExtra;
