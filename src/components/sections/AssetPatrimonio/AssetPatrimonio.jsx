import React, { useContext } from 'react';
import EditableCard from '../../ui/EditableCard';
import { FinanceContext } from '../../../context/FinanceContext';
import { COLORS } from '../../../config/chartConfig';
import { useFinancialCalculations } from '../../../hooks/useFinancialCalculations';
// Se usi recharts: npm install recharts
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import EntriesGrid from '../../ui/EntriesGrid';

const getPieData = (patrimonio) => [
  { name: 'TFR', value: patrimonio.tfr },
  { name: 'Conti Deposito', value: patrimonio.contiDeposito.reduce((sum, c) => sum + c.saldo, 0) },
  { name: 'Azioni', value: patrimonio.investimenti.azioni.reduce((sum, i) => sum + i.valore, 0) },
  { name: 'ETF', value: patrimonio.investimenti.etf.reduce((sum, i) => sum + i.valore, 0) },
  { name: 'Crypto', value: patrimonio.investimenti.crypto.reduce((sum, i) => sum + i.valore, 0) },
  { name: 'Oro', value: patrimonio.investimenti.oro }
];

const AssetPatrimonio = () => {
  const { state, dispatch } = useContext(FinanceContext);
  const { totalePatrimonio } = useFinancialCalculations();
  const pieData = getPieData(state.patrimonio);

  const handleAddContoDeposito = (data) => {
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_PATRIMONIO_CONTO', payload: { id, ...data } });
  };

  const handleUpdateConto = (payload) => dispatch({ type: 'UPDATE_PATRIMONIO_CONTO', payload });
  const handleDeleteConto = (id) => dispatch({ type: 'DELETE_PATRIMONIO_CONTO', payload: { id } });

  const handleAddAzione = (data) => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_INVESTIMENTO_AZIONE', payload: { id, ...data } }); };
  const handleUpdateAzione = (payload) => dispatch({ type: 'UPDATE_INVESTIMENTO_AZIONE', payload });
  const handleDeleteAzione = (id) => dispatch({ type: 'DELETE_INVESTIMENTO_AZIONE', payload: { id } });

  const handleAddBuono = (data) => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_BUONO_TITOLO', payload: { id, ...data } }); };
  const handleUpdateBuono = (payload) => dispatch({ type: 'UPDATE_BUONO_TITOLO', payload });
  const handleDeleteBuono = (id) => dispatch({ type: 'DELETE_BUONO_TITOLO', payload: { id } });

  const handleAddETF = (data) => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_INVESTIMENTO_ETF', payload: { id, ...data } }); };
  const handleUpdateETF = (payload) => dispatch({ type: 'UPDATE_INVESTIMENTO_ETF', payload });
  const handleDeleteETF = (id) => dispatch({ type: 'DELETE_INVESTIMENTO_ETF', payload: { id } });

  const handleAddCrypto = (data) => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_INVESTIMENTO_CRYPTO', payload: { id, ...data } }); };
  const handleUpdateCrypto = (payload) => dispatch({ type: 'UPDATE_INVESTIMENTO_CRYPTO', payload });
  const handleDeleteCrypto = (id) => dispatch({ type: 'DELETE_INVESTIMENTO_CRYPTO', payload: { id } });

  const handleAddOro = (data) => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_ORO', payload: { id, ...data } }); };
  const handleUpdateOro = (payload) => dispatch({ type: 'UPDATE_ORO', payload });
  const handleDeleteOro = (id) => dispatch({ type: 'DELETE_ORO', payload: { id } });

  // Esempio: aggiungi logica per altri asset

  const sumField = (arr, ...keys) => (arr || []).reduce((s, item) => {
    for (const k of keys) {
      if (item[k] !== undefined && item[k] !== null) return s + Number(item[k] || 0);
    }
    return s;
  }, 0);

  const contiDepositoSum = sumField(state.patrimonio.contiDeposito, 'saldo', 'importo', 'valore');
  const buoniSum = sumField(state.patrimonio.buoniTitoli, 'importo', 'valore');
  const azioniSum = sumField(state.patrimonio.investimenti.azioni, 'importo', 'valore');
  const etfSum = sumField(state.patrimonio.investimenti.etf, 'importo', 'valore');
  const cryptoSum = sumField(state.patrimonio.investimenti.crypto, 'importo', 'valore');
  const oroSum = sumField(state.patrimonio.investimenti.oro, 'valore', 'importo');

  return (
    <div style={{ margin: '24px 0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1200, padding: '0 16px', boxSizing: 'border-box' }}>
      <div className="kpi-container">
        {/* Conti Deposito */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Conti Deposito</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{contiDepositoSum} €</div>
            <button onClick={() => { /* open via EntriesGrid add */ }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi nuova voce</button>
          </div>
        </div>
        <EntriesGrid entries={state.patrimonio.contiDeposito || []} onAdd={handleAddContoDeposito} onUpdate={handleUpdateConto} onDelete={handleDeleteConto} sectionTitle="Conti Deposito" />

        {/* Buoni/Titoli */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
          <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Buoni fruttiferi / Titoli</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{buoniSum} €</div>
            <button onClick={() => { }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi nuova voce</button>
          </div>
        </div>
        <EntriesGrid entries={state.patrimonio.buoniTitoli || []} onAdd={handleAddBuono} onUpdate={handleUpdateBuono} onDelete={handleDeleteBuono} sectionTitle="Buoni / Titoli" />

        {/* Azioni */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
          <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Azioni</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{azioniSum} €</div>
            <button onClick={() => { }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi nuova voce</button>
          </div>
        </div>
        <EntriesGrid entries={state.patrimonio.investimenti.azioni || []} onAdd={handleAddAzione} onUpdate={handleUpdateAzione} onDelete={handleDeleteAzione} sectionTitle="Azioni" />

        {/* ETF */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
          <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>ETF</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{etfSum} €</div>
            <button onClick={() => { }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi nuova voce</button>
          </div>
        </div>
        <EntriesGrid entries={state.patrimonio.investimenti.etf || []} onAdd={handleAddETF} onUpdate={handleUpdateETF} onDelete={handleDeleteETF} sectionTitle="ETF" />

        {/* Crypto */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
          <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Crypto</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{cryptoSum} €</div>
            <button onClick={() => { }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi nuova voce</button>
          </div>
        </div>
        <EntriesGrid entries={state.patrimonio.investimenti.crypto || []} onAdd={handleAddCrypto} onUpdate={handleUpdateCrypto} onDelete={handleDeleteCrypto} sectionTitle="Crypto" />

        {/* Oro */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
          <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Oro e materiali preziosi</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{oroSum} €</div>
            <button onClick={() => { }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi nuova voce</button>
          </div>
        </div>
        <EntriesGrid entries={state.patrimonio.investimenti.oro || []} onAdd={handleAddOro} onUpdate={handleUpdateOro} onDelete={handleDeleteOro} sectionTitle="Oro" />
      </div>
      </div>
    </div>
  );
};

export default AssetPatrimonio;
