import React, { useContext } from 'react';
import EditableCard from '../../ui/EditableCard';
import { FinanceContext } from '../../../context/FinanceContext';
import { z } from 'zod';

const stipendioSchema = z.object({
  lordo: z.number().min(0),
  netto: z.number().min(0),
  oreStandard: z.number().min(1).max(400),
  oreEffettive: z.number().min(0)
});

const Stipendio = () => {
  const { state, dispatch } = useContext(FinanceContext);

  const handleSave = (data) => {
    try {
      const validated = stipendioSchema.parse(data);
      dispatch({ type: 'UPDATE_STIPENDIO', payload: validated });
    } catch (error) {
      alert('Errore validazione: ' + error.message);
    }
  };

  return (
    <EditableCard
      title="Stipendio"
      value={state.entrate.stipendio.netto}
      unit="€"
      fields={["lordo", "netto", "oreStandard", "oreEffettive"]}
      onSave={handleSave}
      expandable={false}
    />
  );
};

export default Stipendio;
