import React, { useState, useEffect } from 'react';
// Temporaneo: rimuoviamo FormField per debug perché può interferire con gli eventi di input

const defaultModel = {
  id: null,
  type: 'entrata',
  titolo: '',
  amount: 0,
  frequency: 'monthly',
  startDate: new Date().toISOString().slice(0, 10),
  autoGenerate: true,
  nextGeneration: new Date().toISOString() // Initialize next generation to now
};

const CashflowForm = ({ show = false, initial = null, onClose = () => {}, onSave = () => {} }) => {
  const [model, setModel] = useState(defaultModel);

  useEffect(() => {
    if (initial) setModel({ ...defaultModel, ...initial });
    else setModel(defaultModel);
  }, [initial]);

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 1200 }}>
      <div style={{ width: 520, background: 'var(--bg-light)', borderRadius: 10, padding: 16 }}>
  <h4 style={{ marginTop: 0, color: '#000' }}>{model.id ? 'Modifica cashflow' : 'Nuovo cashflow'}</h4>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#000' }}>Tipo</label>
          <select value={model.type} onChange={e => setModel(m => ({ ...m, type: e.target.value }))}>
            <option value="entrata">Entrata</option>
            <option value="uscita">Uscita</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#000' }}>Titolo</label>
          <input value={model.titolo} onChange={e => setModel(m => ({ ...m, titolo: e.target.value }))} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#000' }}>Importo</label>
          <input type="number" value={model.amount} onChange={e => setModel(m => ({ ...m, amount: Number(e.target.value) }))} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#000' }}>Frequenza</label>
          <select value={model.frequency} onChange={e => setModel(m => ({ ...m, frequency: e.target.value }))} style={{ width: '100%' }}>
            <option value="monthly">Mensile</option>
            <option value="quarterly">Trimestrale</option>
            <option value="semiannually">Semestrale</option>
            <option value="yearly">Annuale</option>
            <option value="once">Una tantum</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#000' }}>Data inizio</label>
          <input type="date" value={model.startDate} onChange={e => {
            const date = new Date(e.target.value);
            setModel(m => ({
              ...m,
              startDate: e.target.value,
              nextGeneration: date.toISOString() // Update nextGeneration when start date changes
            }));
          }} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#000' }}>
            <input type="checkbox" checked={!!model.autoGenerate} onChange={e => {
              const autoGen = e.target.checked;
              setModel(m => ({
                ...m,
                autoGenerate: autoGen,
                // Reset or set nextGeneration based on autoGenerate
                nextGeneration: autoGen ? new Date(m.startDate || new Date()).toISOString() : null
              }));
            }} />
            Generazione automatica
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ padding: '6px 10px' }}>Annulla</button>
          <button onClick={() => {
            // Ensure nextGeneration is properly set before saving
            const payload = {
              ...model,
              id: model.id || `cf_${Date.now()}`,
              nextGeneration: model.autoGenerate ? (model.nextGeneration || new Date(model.startDate || new Date()).toISOString()) : null
            };
            onSave(payload);
          }} style={{ padding: '6px 10px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
        </div>
      </div>
    </div>
  );
};

export default CashflowForm;
