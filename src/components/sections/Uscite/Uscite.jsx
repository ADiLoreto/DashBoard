import React, { useContext } from 'react';
import { FinanceContext } from '../../../context/FinanceContext';
import EntriesGrid from '../../ui/EntriesGrid';

const Uscite = () => {
  const { state, dispatch } = useContext(FinanceContext);

  const addFissa = (data) => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_USCITA_FISSA', payload: { id, ...data } }); };
  const updateFissa = (payload) => dispatch({ type: 'UPDATE_USCITA_FISSA', payload });
  const deleteFissa = (id) => dispatch({ type: 'DELETE_USCITA_FISSA', payload: { id } });

  const addVariabile = (data) => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_USCITA_VARIABILE', payload: { id, ...data } }); };
  const updateVariabile = (payload) => dispatch({ type: 'UPDATE_USCITA_VARIABILE', payload });
  const deleteVariabile = (id) => dispatch({ type: 'DELETE_USCITA_VARIABILE', payload: { id } });

  // Calcolo totale uscite
  const totaleUscite =
    (state.uscite.fisse ? state.uscite.fisse.reduce((sum, u) => sum + (u.importo || 0), 0) : 0) +
    (state.uscite.variabili ? state.uscite.variabili.reduce((sum, u) => sum + (u.importo || 0), 0) : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--bg-light)', margin: 0 }}>Uscite</h2>
        <div style={{ background: 'var(--bg-medium)', padding: '12px 16px', borderRadius: 12, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 13 }}>Totale uscite</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: 22, fontWeight: 700 }}>{totaleUscite.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h3 style={{ color: 'var(--bg-light)', fontSize: 20, marginBottom: 8 }}>Fisse</h3>
          <EntriesGrid entries={state.uscite.fisse || []} onAdd={addFissa} onUpdate={updateFissa} onDelete={deleteFissa} sectionTitle="Uscite Fisse" />
        </div>
        <div>
          <h3 style={{ color: 'var(--bg-light)', fontSize: 20, marginBottom: 8 }}>Variabili</h3>
          <EntriesGrid entries={state.uscite.variabili || []} onAdd={addVariabile} onUpdate={updateVariabile} onDelete={deleteVariabile} sectionTitle="Uscite Variabili" />
        </div>
      </div>
    </div>
  );
};

export default Uscite;
