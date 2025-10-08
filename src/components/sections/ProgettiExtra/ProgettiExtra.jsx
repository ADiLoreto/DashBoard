import React, { useContext } from 'react';
import { FinanceContext } from '../../../context/FinanceContext';
import EntriesGrid from '../../ui/EntriesGrid';

const ProgettiExtra = () => {
  const { state, dispatch } = useContext(FinanceContext);
  const progetti = state.progettiExtra || [];

  const addProject = (data) => {
    const id = Math.random().toString(36).slice(2,9);
    // normalize to 'valore' in state so rendering + totals are consistent
    dispatch({ type: 'ADD_PROGETTO_EXTRA', payload: { id, titolo: data.titolo, valore: Number(data.importo) } });
  };
  const updateProject = (payload) => dispatch({ type: 'UPDATE_PROGETTO_EXTRA', payload });
  const deleteProject = (id) => dispatch({ type: 'DELETE_PROGETTO_EXTRA', payload: { id } });

  const totale = progetti.reduce((sum, p) => sum + (p.valore !== undefined ? p.valore : (p.importo || 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--bg-light)', margin: 0 }}>Progetti Extra</h2>
        <div style={{ background: 'var(--bg-medium)', padding: '12px 16px', borderRadius: 12, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 13 }}>Totale progetti</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: 22, fontWeight: 700 }}>{totale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <EntriesGrid
          entries={progetti.map(p => ({ id: p.id, titolo: p.titolo || p.name || 'Progetto', importo: (p.valore !== undefined ? p.valore : p.importo) }))}
          onAdd={addProject}
          onUpdate={(payload) => updateProject({ id: payload.id, titolo: payload.titolo, valore: payload.importo })}
          onDelete={(id) => deleteProject(id)}
          sectionTitle="Progetti Extra"
        />
      </div>
    </div>
  );
};

export default ProgettiExtra;
