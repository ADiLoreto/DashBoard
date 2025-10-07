import React, { useState } from 'react';
import BigTab from './BigTab';

// props:
// entries: array of { id, titolo, importo }
// onAdd(payload), onUpdate(payload), onDelete(id)
const EntriesGrid = ({ entries = [], onAdd, onUpdate, onDelete, sectionTitle = '' }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ titolo: '', importo: '' });

  const openAdd = () => { setDraft({ titolo: '', importo: '' }); setShowAdd(true); };
  const handleAdd = () => {
    if (!draft.titolo || !draft.importo) return;
    onAdd({ titolo: draft.titolo, importo: Number(draft.importo) });
    setShowAdd(false);
  };

  const openEdit = (entry) => { setEditing(entry); setShowEdit(true); };
  const handleUpdate = () => { onUpdate(editing); setShowEdit(false); setEditing(null); };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1100, display: 'flex', flexWrap: 'wrap', gap: 20, padding: '12px', boxSizing: 'border-box', justifyContent: 'flex-start' }}>

        {entries.map(e => (
          <BigTab key={e.id} title={e.titolo || e.title} value={(e.importo !== undefined ? e.importo : e.value) + ' €'} onClick={() => openEdit(e)} />
        ))}

        <div className="big-tab add-tab" onClick={openAdd} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 160, borderRadius: 16, cursor: 'pointer', padding: 12, fontSize: 48 }}>
          <span style={{ fontSize: 64, color: 'var(--accent-cyan)' }}>+</span>
          <div style={{ fontSize: 18, marginTop: 8 }}>Aggiungi nuova voce</div>
        </div>

      </div>

      {showAdd && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48,57,67,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>Nuova voce {sectionTitle}</h3>
            <input placeholder="Titolo" value={draft.titolo} onChange={e => setDraft(d => ({ ...d, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
            <input placeholder="Valore (€)" type="number" value={draft.importo} onChange={e => setDraft(d => ({ ...d, importo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '8px 12px' }}>Annulla</button>
              <button onClick={handleAdd} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Aggiungi</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && editing && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48,57,67,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>Modifica voce</h3>
            <input value={editing.titolo || editing.title} onChange={e => setEditing(prev => ({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
            <input type="number" value={editing.importo !== undefined ? editing.importo : editing.value} onChange={e => setEditing(prev => ({ ...prev, importo: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button onClick={() => { onDelete(editing.id); setShowEdit(false); setEditing(null); }} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowEdit(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                <button onClick={() => { onUpdate(editing); setShowEdit(false); setEditing(null); }} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntriesGrid;
