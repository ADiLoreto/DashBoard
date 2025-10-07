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

  return (
    <div style={{ padding: 24 }}>
      <h2>Uscite</h2>
      <h3>Fisse</h3>
      <EntriesGrid entries={state.uscite.fisse || []} onAdd={addFissa} onUpdate={updateFissa} onDelete={deleteFissa} sectionTitle="Uscite Fisse" />

      <h3 style={{ marginTop: 24 }}>Variabili</h3>
      <EntriesGrid entries={state.uscite.variabili || []} onAdd={addVariabile} onUpdate={updateVariabile} onDelete={deleteVariabile} sectionTitle="Uscite Variabili" />
    </div>
  );
};

export default Uscite;
