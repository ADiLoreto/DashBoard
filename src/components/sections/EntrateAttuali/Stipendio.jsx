import React, { useContext, useState } from 'react';
import BigTab from '../../ui/BigTab';
import CashflowForm from '../../wizard/forms/CashflowForm';
import { FinanceContext } from '../../../context/FinanceContext';
import { formatDate } from '../../../utils/format';
import { z } from 'zod';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';

const stipendioSchema = z.object({
  netto: z.number().min(0),
  hours: z.number().min(0).optional(),
  days: z.number().min(0).optional()
});

const Stipendio = () => {
  const { state, dispatch } = useContext(FinanceContext);

  // generated cashflows editing
  const [editingGenerated, setEditingGenerated] = useState(null);

  const handleEditGenerated = (entry) => {
    // normalize generated entry to CashflowForm model shape
    const model = {
      id: entry.id,
      type: entry.type || 'entrata',
      titolo: entry.titolo || entry.title || '',
      amount: entry.amount !== undefined ? entry.amount : entry.importo || 0,
      frequency: entry.frequency || 'monthly',
      startDate: entry.date || entry.startDate || new Date().toISOString().slice(0,10),
      autoGenerate: !!entry.autoGenerate,
      meta: { assetId: entry.sourceAssetId || entry.meta?.assetId, assetTipo: entry.sourceAssetTipo || entry.meta?.assetTipo }
    };
    setEditingGenerated(model);
  };

  const handleSaveGenerated = (updated) => {
    // dispatch an action to update generated cashflow (and sync to asset if reducer handles it)
    dispatch({ type: 'UPDATE_CASHFLOW_ASSET', payload: { ...updated, importo: updated.amount, date: updated.startDate, meta: updated.meta } });
    setEditingGenerated(null);
  };

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
  const [newEntry, setNewEntry] = useState({ title: '', value: '', hours: '', days: '' });
  const [editNetto, setEditNetto] = useState((state.entrate.stipendio.netto && state.entrate.stipendio.netto > 0) ? state.entrate.stipendio.netto : '');
  const [editHours, setEditHours] = useState((state.entrate.stipendio.hours !== undefined) ? state.entrate.stipendio.hours : 8);
  const [editDays, setEditDays] = useState((state.entrate.stipendio.days !== undefined) ? state.entrate.stipendio.days : 22);
  const [editingEntry, setEditingEntry] = useState(null);

  const handleTitleEdit = () => setIsEditingTitle(true);
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleTitleSave = () => setIsEditingTitle(false);

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.value) {
      // save to context as altra entrata
  const id = Math.random().toString(36).slice(2, 9);
  dispatch({ type: 'ADD_ENTRATA', payload: { id, titolo: newEntry.title, importo: Number(newEntry.value), hours: Number(newEntry.hours || 0), days: Number(newEntry.days || 0), date: new Date().toISOString().slice(0,10) } });
      setNewEntry({ title: '', value: '', hours: '', days: '' });
      setShowAddModal(false);
    }
  };

  const openEditModal = () => {
  setEditNetto((state.entrate.stipendio.netto && state.entrate.stipendio.netto > 0) ? state.entrate.stipendio.netto : '');
    setEditHours((state.entrate.stipendio.hours !== undefined) ? state.entrate.stipendio.hours : 8);
    setEditDays((state.entrate.stipendio.days !== undefined) ? state.entrate.stipendio.days : 22);
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

  // Calculate hourly pay for stipendio and other entries using hours * days
  const calcHourly = (amount, hours, days) => {
    const h = Number(hours || 0);
    const d = Number(days || 0);
    if (!h || h <= 0 || !d || d <= 0) return null;
    return amount / (h * d);
  };

  const stipendioHourly = calcHourly(state.entrate.stipendio.netto || 0, state.entrate.stipendio.hours || 0, state.entrate.stipendio.days || 0);

  // Build hourly data list for chart (only entries with valid hours and days)
  const hourlyData = [];
  if (stipendioHourly !== null) hourlyData.push({ name: title || 'Stipendio', hourly: Number(stipendioHourly.toFixed(2)) });
  
  // Add manual entries
  (state.entrate.altreEntrate || []).forEach(entry => {
    const amount = entry.importo !== undefined ? Number(entry.importo) : Number(entry.value || 0);
    const h = Number(entry.hours || 0);
    const d = Number(entry.days || 0);
    if (h && h > 0 && d && d > 0) {
      const hourly = calcHourly(amount, h, d);
      hourlyData.push({ name: entry.titolo || entry.title || 'Voce', hourly: Number((hourly || 0).toFixed(2)) });
    }
  });

  // Add cashflow entries if they have hours/days
  (state.entrate.cashflowAsset || []).forEach(entry => {
    const amount = entry.amount || entry.importo || 0;
    const h = Number(entry.hours || 0);
    const d = Number(entry.days || 0);
    if (h && h > 0 && d && d > 0) {
      const hourly = calcHourly(amount, h, d);
      hourlyData.push({ 
        name: (entry.titolo || entry.title || '(senza titolo)') + ' (auto)', 
        hourly: Number((hourly || 0).toFixed(2)) 
      });
    }
  });

  // Sort descending so highest hourly pay appears on top
  if (hourlyData.length > 1) {
    hourlyData.sort((a, b) => b.hourly - a.hourly);
  }

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

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <BigTab
            title={title}
            value={state.entrate.stipendio.netto}
            titleStyle={{ fontSize: 22 }}
            valueStyle={{ fontSize: 22, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
            allowTitleEdit={false}
            onUpdate={update => {
              if (update.value !== undefined) handleSave({ netto: Number(update.value), hours: Number(editHours || 0), days: Number(editDays || 0) });
            }}
            footer={(
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 16, color: 'var(--text-light)', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Time / h</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="number"
                          value={editHours}
                          onChange={e => {
                            const val = Number(e.target.value || 0);
                            setEditHours(val);
                            // update stipendio immediately so calcHourly sees the change (same behavior as other entries)
                            handleSave({ netto: Number(state.entrate.stipendio.netto || 0), hours: val, days: Number(editDays || 0) });
                          }}
                          style={{ width: 70, height: 44, lineHeight: '44px', padding: '0 13px', boxSizing: 'border-box', borderRadius: 18, border: '1px solid var(--bg-medium)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)', background: 'var(--bg-light)', fontFamily: 'Roboto Mono, monospace', fontSize: 20, WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        />
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>ore/giorno</div>
                        <input
                          type="number"
                          value={editDays}
                          onChange={e => {
                            const val = Number(e.target.value || 0);
                            setEditDays(val);
                            // update stipendio immediately so calcHourly sees the change (same behavior as other entries)
                            handleSave({ netto: Number(state.entrate.stipendio.netto || 0), hours: Number(editHours || 0), days: val });
                          }}
                          style={{ width: 70, height: 44, lineHeight: '44px', padding: '0 13px', boxSizing: 'border-box', borderRadius: 18, border: '1px solid var(--bg-medium)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)', background: 'var(--bg-light)', fontFamily: 'Roboto Mono, monospace', fontSize: 20, WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        />
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>giorni/mese</div>
                      </div>
                      {/* hourly pay display */}
                      <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>{stipendioHourly !== null ? (`Paga oraria: ${stipendioHourly.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`) : 'Paga oraria: -'}</div>
              </div>
            )}
          />
        </div>
        {(state.entrate.altreEntrate || []).map((entry) => (
          <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <BigTab
              title={entry.titolo || entry.title}
              value={entry.importo !== undefined ? entry.importo : entry.value}
              titleStyle={{ fontSize: 22 }}
              valueStyle={{ fontSize: 22, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
              onUpdate={update => {
                if (update.title !== undefined) handleUpdateEntry({ ...entry, titolo: update.title });
                if (update.value !== undefined) handleUpdateEntry({ ...entry, importo: Number(update.value) });
              }}
              onDelete={() => handleDeleteEntry(entry.id)}
              footer={(
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 16, color: 'var(--text-light)', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Time / h</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" value={entry.hours || ''} onChange={e => handleUpdateEntry({ ...entry, hours: Number(e.target.value || 0) })} style={{ width: 70, height: 40, lineHeight: '40px', padding: '0 13px', boxSizing: 'border-box', borderRadius: 18, border: '1px solid var(--bg-medium)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)', background: 'var(--bg-light)', fontFamily: 'Roboto Mono, monospace', fontSize: 20, WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>ore/giorno</div>
                    <input type="number" value={entry.days || ''} onChange={e => handleUpdateEntry({ ...entry, days: Number(e.target.value || 0) })} style={{ width: 70, height: 40, lineHeight: '40px', padding: '0 13px', boxSizing: 'border-box', borderRadius: 18, border: '1px solid var(--bg-medium)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)', background: 'var(--bg-light)', fontFamily: 'Roboto Mono, monospace', fontSize: 20, WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>giorni/mese</div>
                  </div>
                  {/* hourly pay for this entry */}
                  <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>{(entry.hours && entry.hours > 0 && entry.days && entry.days > 0) ? (`Paga oraria: ${( (entry.importo !== undefined ? Number(entry.importo) : Number(entry.value || 0)) / (Number(entry.hours) * Number(entry.days)) ).toLocaleString('it-IT',{ minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`) : 'Paga oraria: -'}</div>
                </div>
              )}
            />
          </div>
        ))}
        
        {/* Add new entry button */}
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
            fontSize: 48,
            transition: 'all 0.2s'
          }}
          onClick={() => setShowAddModal(true)}
        >
          <span style={{ fontSize: 64, color: 'var(--accent-cyan)' }}>+</span>
          <div style={{ fontSize: 18, marginTop: 8 }}>Aggiungi nuova voce</div>
        </div>

        {/* Read-only list: generated cashflows from assets */}
        {(state.entrate.cashflowAsset || []).length > 0 && (
          <div style={{ width: '100%', marginTop: 32, borderTop: '1px solid var(--bg-medium)', paddingTop: 24 }}>
            <h3 style={{ color: 'var(--bg-dark)', marginBottom: 16 }}>Entrate automatiche da Asset</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' }}>
              {(state.entrate.cashflowAsset || []).map(cf => (
                <BigTab
                  key={cf.id}
                  title={cf.titolo || cf.title || '(senza titolo)'}
                  value={cf.amount || cf.importo || 0}
                  titleStyle={{ fontSize: 20 }}
                  valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                  onUpdate={null} // read-only
                  footer={
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      {/* Time/h controls */}
                      <div style={{ fontSize: 16, color: 'var(--text-light)', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Time / h</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="number"
                          value={cf.hours || ''}
                          onChange={e => {
                            const val = Number(e.target.value || 0);
                            handleSaveGenerated({ 
                              ...cf,
                              hours: val,
                              days: cf.days || 0
                            });
                          }}
                          style={{ width: 70, height: 40, lineHeight: '40px', padding: '0 13px', boxSizing: 'border-box', borderRadius: 18, border: '1px solid var(--bg-medium)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)', background: 'var(--bg-light)', fontFamily: 'Roboto Mono, monospace', fontSize: 20, WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        />
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>ore/giorno</div>
                        <input
                          type="number"
                          value={cf.days || ''}
                          onChange={e => {
                            const val = Number(e.target.value || 0);
                            handleSaveGenerated({ 
                              ...cf,
                              hours: cf.hours || 0,
                              days: val
                            });
                          }}
                          style={{ width: 70, height: 40, lineHeight: '40px', padding: '0 13px', boxSizing: 'border-box', borderRadius: 18, border: '1px solid var(--bg-medium)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)', background: 'var(--bg-light)', fontFamily: 'Roboto Mono, monospace', fontSize: 20, WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        />
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>giorni/mese</div>
                      </div>

                      {/* hourly pay for this entry */}
                      <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                        {(cf.hours && cf.hours > 0 && cf.days && cf.days > 0) 
                          ? `Paga oraria: ${((cf.amount || cf.importo || 0) / (Number(cf.hours) * Number(cf.days))).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` 
                          : 'Paga oraria: -'}
                      </div>

                      {/* Original info */}
                      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                        {cf.frequency || cf.freq || '—'} · {formatDate(cf.date || cf.startDate)}
                      </div>
                      {((cf.sourceAssetTipo || cf.meta?.assetTipo) && (cf.sourceAssetId || cf.meta?.assetId)) && (
                        <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                          {cf.sourceAssetTipo || cf.meta?.assetTipo || ''} · {cf.sourceAssetId || cf.meta?.assetId}
                        </div>
                      )}
                      <button 
                        onClick={() => handleEditGenerated(cf)}
                        style={{ 
                          marginTop: 4,
                          padding: '6px 16px',
                          background: 'var(--bg-medium)',
                          border: 'none',
                          borderRadius: 16,
                          color: 'var(--text-light)',
                          cursor: 'pointer'
                        }}
                      >
                        Modifica
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}

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
            <input
              type="number"
              placeholder="Time / h"
              value={newEntry.hours}
              onChange={e => setNewEntry({ ...newEntry, hours: e.target.value })}
              style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }}
            />
            <input
              type="number"
              placeholder="Giorni / mese"
              value={newEntry.days}
              onChange={e => setNewEntry({ ...newEntry, days: e.target.value })}
              style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Annulla</button>
              <button onClick={handleAddEntry} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Aggiungi</button>
            </div>
          </div>
        </div>
      )}

      {/* Hourly pay horizontal bar chart */}
      {hourlyData && hourlyData.length > 0 && (
        <div style={{ width: '100%', maxWidth: 900, margin: '12px auto', padding: 12, background: 'var(--bg-medium)', borderRadius: 12 }}>
          <h3 style={{ color: 'var(--bg-light)', margin: '6px 0 12px' }}>Paga oraria per voce</h3>
          <div style={{ width: '100%', height: Math.min(300, 60 * hourlyData.length) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={hourlyData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(v) => `${v} €`} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip formatter={(val) => `${Number(val).toLocaleString('it-IT',{ minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`} />
                    <Bar dataKey="hourly" fill="#06d2fa" radius={[4, 4, 4, 4]}>
                      <LabelList dataKey="hourly" position="right" formatter={(v) => `${Number(v).toLocaleString('it-IT',{ minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`} />
                    </Bar>
              </BarChart>
            </ResponsiveContainer>
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
              <label style={{ fontWeight: 700 }}>Time / h</label>
              <input type="number" value={editHours} onChange={e => setEditHours(e.target.value)} style={{ padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <label style={{ fontWeight: 700 }}>Giorni / mese</label>
              <input type="number" value={editDays} onChange={e => setEditDays(e.target.value)} style={{ padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
              <button onClick={() => { const n = Number(editNetto || 0); const h = Number(editHours || 0); const d = Number(editDays || 0); handleSave({ netto: n, hours: h, days: d }); setShowEditModal(false); }} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Salva</button>
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

      {/* CashflowForm modal for editing generated cashflows */}
      {editingGenerated && (
        <CashflowForm show={true} initial={editingGenerated} onClose={() => setEditingGenerated(null)} onSave={handleSaveGenerated} />
      )}
    </div>
  );
};

export default Stipendio;
