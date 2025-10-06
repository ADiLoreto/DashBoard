import React, { useContext, useState } from 'react';
import BigTab from '../../ui/BigTab';
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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('Stipendio');
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', value: '' });
  const [entries, setEntries] = useState([]);

  const handleTitleEdit = () => setIsEditingTitle(true);
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleTitleSave = () => setIsEditingTitle(false);

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.value) {
      setEntries([...entries, newEntry]);
      setNewEntry({ title: '', value: '' });
      setShowModal(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
      <BigTab
        title={isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleSave}
            autoFocus
            style={{ fontSize: 32, fontWeight: 700, background: 'var(--bg-light)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '4px 12px' }}
          />
        ) : (
          <span style={{ cursor: 'pointer' }} onClick={handleTitleEdit}>{title}</span>
        )}
        value={state.entrate.stipendio.netto + ' €'}
        onClick={() => {/* Qui puoi aprire il dettaglio o la modifica */}}
      />
      {entries.map((entry, idx) => (
        <BigTab
          key={idx}
          title={entry.title}
          value={entry.value}
          onClick={() => {/* Dettaglio/modifica voce */}}
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
        onClick={() => setShowModal(true)}
      >
        <span style={{ fontSize: 64, color: 'var(--accent-cyan)' }}>+</span>
        <div style={{ fontSize: 18, marginTop: 8 }}>Aggiungi nuova voce</div>
      </div>

      {showModal && (
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
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
            <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16 }}>Nuova Voce</h2>
            <input
              type="text"
              placeholder="Titolo"
              value={newEntry.title}
              onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
              style={{ width: '100%', marginBottom: 12, padding: '8px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }}
            />
            <input
              type="number"
              placeholder="Valore (€)"
              value={newEntry.value}
              onChange={e => setNewEntry({ ...newEntry, value: e.target.value })}
              style={{ width: '100%', marginBottom: 12, padding: '8px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Annulla</button>
              <button onClick={handleAddEntry} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Aggiungi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stipendio;
