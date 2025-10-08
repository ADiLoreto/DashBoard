import React, { useContext, useState } from 'react';
import BigTab from '../../ui/BigTab';
import { FinanceContext } from '../../../context/FinanceContext';
import { z } from 'zod';

const stipendioSchema = z.object({
  netto: z.number().min(0)
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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('Stipendio');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // for stipendio
  const [showEntryModal, setShowEntryModal] = useState(false); // for editing an entry
  const [newEntry, setNewEntry] = useState({ title: '', value: '' });
  const [editNetto, setEditNetto] = useState((state.entrate.stipendio.netto && state.entrate.stipendio.netto > 0) ? state.entrate.stipendio.netto : '');
  const [editingEntry, setEditingEntry] = useState(null);

  const handleTitleEdit = () => setIsEditingTitle(true);
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleTitleSave = () => setIsEditingTitle(false);

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.value) {
      // save to context as altra entrata
  const id = Math.random().toString(36).slice(2, 9);
  dispatch({ type: 'ADD_ENTRATA', payload: { id, titolo: newEntry.title, importo: Number(newEntry.value), date: new Date().toISOString().slice(0,10) } });
      setNewEntry({ title: '', value: '' });
      setShowAddModal(false);
    }
  };

  const openEditModal = () => {
  setEditNetto((state.entrate.stipendio.netto && state.entrate.stipendio.netto > 0) ? state.entrate.stipendio.netto : '');
    setShowEditModal(true);
  };

  const openEntryEdit = (entry) => {
    setEditingEntry(entry);
    setShowEntryModal(true);
  };

  const handleUpdateEntry = (payload) => {
    dispatch({ type: 'UPDATE_ENTRATA', payload });
    setShowEntryModal(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id) => {
    dispatch({ type: 'DELETE_ENTRATA', payload: { id } });
    setShowEntryModal(false);
    setEditingEntry(null);
  };

  // Calcolo totale entrate
  const totaleEntrate =
    (state.entrate.stipendio.netto || 0) +
    (state.entrate.bonus ? state.entrate.bonus.reduce((sum, b) => sum + (b.importo || 0), 0) : 0) +
    (state.entrate.altreEntrate ? state.entrate.altreEntrate.reduce((sum, e) => sum + (e.importo !== undefined ? e.importo : Number(e.value) || 0), 0) : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Totale entrate */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--bg-light)', margin: 0 }}>Entrate Attuali</h2>
        <div style={{ background: 'var(--bg-medium)', padding: '12px 16px', borderRadius: 12, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 13 }}>Totale entrate</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: 22, fontWeight: 700 }}>{totaleEntrate.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
        <BigTab
          title={title}
          value={state.entrate.stipendio.netto}
          titleStyle={{ fontSize: 22 }}
          valueStyle={{ fontSize: 22, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
          allowTitleEdit={false}
          onUpdate={update => {
            if (update.value !== undefined) handleSave({ netto: Number(update.value) });
          }}
        />
        {(state.entrate.altreEntrate || []).map((entry) => (
            <BigTab
            key={entry.id}
            title={entry.titolo || entry.title}
            value={entry.importo !== undefined ? entry.importo : entry.value}
            titleStyle={{ fontSize: 22 }}
              valueStyle={{ fontSize: 22, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
            onUpdate={update => {
              if (update.title !== undefined) handleUpdateEntry({ ...entry, titolo: update.title });
              if (update.value !== undefined) handleUpdateEntry({ ...entry, importo: Number(update.value) });
            }}
            onDelete={() => handleDeleteEntry(entry.id)}
          />
        ))}
        <div
          className="big-tab add-tab"
          style={{
            background: 'var(--bg-light)',
            color: 'var(--text-muted)',
            border: '2px dashed var(--bg-medium)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 260,
            minHeight: 180,
            borderRadius: 16,
            cursor: 'pointer',
            margin: 24,
            fontSize: 48,
            transition: 'all 0.2s'
          }}
          onClick={() => setShowAddModal(true)}
        >
          <span style={{ fontSize: 64, color: 'var(--accent-cyan)' }}>+</span>
          <div style={{ fontSize: 18, marginTop: 8 }}>Aggiungi nuova voce</div>
        </div>
      </div>

      {showAddModal && (
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
          zIndex: 1000
        }}>
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
            <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 28 }}>Nuova Voce</h2>
            <input
              type="text"
              placeholder="Titolo"
              value={newEntry.title}
              onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
              style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }}
            />
            <input
              type="number"
              placeholder="Valore (€)"
              value={newEntry.value}
              onChange={e => setNewEntry({ ...newEntry, value: e.target.value })}
              style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Annulla</button>
              <button onClick={handleAddEntry} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Aggiungi</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
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
          zIndex: 1000
        }}>
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
            <h3 style={{ color: 'var(--bg-dark)', fontSize: 28 }}>Modifica Stipendio</h3>
            <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
              <label style={{ fontWeight: 700 }}>Netto (€)</label>
              <input type="number" value={editNetto} onChange={e => setEditNetto(e.target.value)} style={{ padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
              <button onClick={() => { const n = Number(editNetto || 0); handleSave({ netto: n }); setShowEditModal(false); }} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Salva</button>
            </div>
          </div>
        </div>
      )}

      {showEntryModal && editingEntry && (
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
          zIndex: 1000
        }}>
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
            <h3 style={{ color: 'var(--bg-dark)', fontSize: 24 }}>Modifica voce</h3>
            <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
              <input type="text" value={editingEntry.titolo || editingEntry.title} onChange={e => setEditingEntry(prev => ({ ...prev, titolo: e.target.value }))} style={{ padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" value={editingEntry.importo !== undefined ? editingEntry.importo : editingEntry.value} onChange={e => setEditingEntry(prev => ({ ...prev, importo: Number(e.target.value) }))} style={{ padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
              <button onClick={() => { handleDeleteEntry(editingEntry.id); }} style={{ background: '#ff6b6b', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Elimina</button>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowEntryModal(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={() => handleUpdateEntry(editingEntry)} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stipendio;
