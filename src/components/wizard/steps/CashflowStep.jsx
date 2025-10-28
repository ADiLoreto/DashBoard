import React, { useState } from 'react';
import CashflowForm from '../forms/CashflowForm';

const CashflowStep = ({ formData, setFormData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const items = formData.cashflows || [];

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const updated = items.filter(i => i.id !== id);
    setFormData(prev => ({ ...prev, cashflows: updated }));
  };

  const handleSave = (payload) => {
    const exists = items.find(i => i.id === payload.id);
    let updated;
    if (exists) {
      updated = items.map(i => (i.id === payload.id ? payload : i));
    } else {
      updated = [...items, payload];
    }
    setFormData(prev => ({ ...prev, cashflows: updated }));
    setModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: '#000' }}>Cashflows</h4>
        <button onClick={handleAdd} style={{ padding: '6px 10px' }}>Aggiungi</button>
      </div>

      {items.length === 0 && <div style={{ color: '#000' }}>Nessun cashflow definito</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(cf => (
          <div key={cf.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: 'var(--bg-medium)' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#000' }}>{cf.titolo || '(senza titolo)'}</div>
              <div style={{ fontSize: 12, color: '#000' }}>{cf.type} · {cf.frequency} · {cf.amount}€</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleEdit(cf)} style={{ padding: '6px 8px' }}>Modifica</button>
              <button onClick={() => handleDelete(cf.id)} style={{ padding: '6px 8px' }}>Elimina</button>
            </div>
          </div>
        ))}
      </div>

      <CashflowForm show={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
};

export default CashflowStep;
