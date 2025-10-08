import React, { useState } from 'react';
import BigTab from './BigTab';

// props:
// entries: array of { id, titolo, importo }
// onAdd(payload), onUpdate(payload), onDelete(id)
const EntriesGrid = ({ entries = [], onAdd, onUpdate, onDelete, sectionTitle = '' }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ titolo: '', importo: '' });

  const openAdd = () => { setDraft({ titolo: '', importo: '' }); setShowAdd(true); };
  const handleAdd = () => {
    if (!draft.titolo || !draft.importo) return;
    onAdd({ titolo: draft.titolo, importo: Number(draft.importo) });
    setShowAdd(false);
  };

  // Editing is inline via BigTab.onUpdate; no edit modal is used here

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1100, display: 'flex', flexWrap: 'wrap', gap: 20, padding: '12px', boxSizing: 'border-box', justifyContent: 'flex-start' }}>

        {entries.map(e => (
          // pass numeric value so BigTab shows the real number; enable inline editing
          <BigTab
            key={e.id}
            title={e.titolo || e.title}
            value={e.importo !== undefined ? e.importo : e.value}
            titleStyle={{ fontSize: 22 }}
            valueStyle={{ fontSize: 22, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
            onUpdate={upd => {
              const payload = { ...e };
              if (upd.title !== undefined) payload.titolo = upd.title;
              if (upd.value !== undefined) payload.importo = Number(upd.value);
              onUpdate(payload);
            }}
            onDelete={() => onDelete(e.id)}
          />
        ))}

        <div className="big-tab add-tab" onClick={openAdd} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 160, borderRadius: 16, cursor: 'pointer', padding: 12, fontSize: 48 }}>
          <span style={{ fontSize: 64, color: 'var(--accent-cyan)' }}>+</span>
          <div style={{ fontSize: 18, marginTop: 8 }}>Aggiungi nuova voce</div>
        </div>

      </div>

  {showAdd && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(48, 57, 67, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200
        }}>
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
            <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 28 }}>Nuova voce</h2>
            <input
              type="text"
              placeholder="Titolo"
              value={draft.titolo}
              onChange={e => setDraft(d => ({ ...d, titolo: e.target.value }))}
              style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }}
            />
            <input
              type="number"
              placeholder="Valore (€)"
              value={draft.importo}
              onChange={e => setDraft(d => ({ ...d, importo: e.target.value }))}
              style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAdd(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Annulla</button>
              <button onClick={handleAdd} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Aggiungi</button>
            </div>
          </div>
        </div>
      )}

  {/* inline editing via BigTab; no edit modal here */}
    </div>
  );
};

export default EntriesGrid;
