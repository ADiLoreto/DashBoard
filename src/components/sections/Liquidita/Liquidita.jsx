import React, { useContext, useState, useEffect, useRef } from 'react';
import { FinanceContext } from '../../../context/FinanceContext';
import { AuthContext } from '../../../context/AuthContext';
import { useFinancialCalculations } from '../../../hooks/useFinancialCalculations';
import { formatCurrency, getUserCurrency } from '../../../utils/format';
import BigTab from '../../ui/BigTab';

const Liquidita = () => {
  const { state, dispatch } = useContext(FinanceContext);
  const { user } = useContext(AuthContext);
  const username = user?.username;
  const { totaleLiquidita } = useFinancialCalculations();
  const currency = getUserCurrency(username);

  const conti = state.liquidita.contiCorrenti || [];
  const carte = state.liquidita.cartePrepagate || [];
  const contante = state.liquidita.contante || 0;

  const [showAddConto, setShowAddConto] = useState(false);
  const [newConto, setNewConto] = useState({ titolo: '', saldo: '' });
  const [editingConto, setEditingConto] = useState(null);

  const [showAddCarta, setShowAddCarta] = useState(false);
  const [newCarta, setNewCarta] = useState({ titolo: '', saldo: '' });
  const [editingCarta, setEditingCarta] = useState(null);

  const [showEditContante, setShowEditContante] = useState(false);
  const [editContanteValue, setEditContanteValue] = useState(contante);

  // On first mount, if there are no conti, create a default 'Conto Corrente'
  const _didInit = useRef(false);
  useEffect(() => {
    if (_didInit.current) return;
    _didInit.current = true;
    if ((conti || []).length === 0) {
      const id = Math.random().toString(36).slice(2,9);
      dispatch({ type: 'ADD_LIQUIDITA_CONTO', payload: { id, titolo: 'Conto Corrente', saldo: 0 } });
    }
  }, [conti.length, dispatch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--bg-light)', margin: 0 }}>Liquidità</h2>
        <div style={{ background: 'var(--bg-medium)', padding: '12px 16px', borderRadius: 12, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 13 }}>Totale liquidità</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: 22, fontWeight: 700 }}>{formatCurrency(totaleLiquidita, currency)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
        {conti.map(c => (
          <BigTab
            key={c.id}
            title={c.titolo || c.name || 'Conto'}
            value={c.saldo}
            titleStyle={{ fontSize: 22 }}
            valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
            onUpdate={update => {
              if (update.title !== undefined) dispatch({ type: 'UPDATE_LIQUIDITA_CONTO', payload: { ...c, titolo: update.title } });
              if (update.value !== undefined) dispatch({ type: 'UPDATE_LIQUIDITA_CONTO', payload: { ...c, saldo: Number(update.value) } });
            }}
            onDelete={() => dispatch({ type: 'DELETE_LIQUIDITA_CONTO', payload: { id: c.id } })}
          />
        ))}

        <div className="big-tab add-tab" onClick={() => setShowAddConto(true)} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
          <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
          <div style={{ fontSize: 14, marginTop: 6 }}>Aggiungi Conto</div>
        </div>

        {carte.map(c => (
          <BigTab
            key={c.id}
            title={c.titolo || c.name || 'Carta'}
            value={c.saldo}
            titleStyle={{ fontSize: 22 }}
            valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
            onUpdate={update => {
              if (update.title !== undefined) dispatch({ type: 'UPDATE_LIQUIDITA_CARTE', payload: { ...c, titolo: update.title } });
              if (update.value !== undefined) dispatch({ type: 'UPDATE_LIQUIDITA_CARTE', payload: { ...c, saldo: Number(update.value) } });
            }}
            onDelete={() => dispatch({ type: 'DELETE_LIQUIDITA_CARTE', payload: { id: c.id } })}
          />
        ))}

        <div className="big-tab add-tab" onClick={() => setShowAddCarta(true)} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
          <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
          <div style={{ fontSize: 14, marginTop: 6 }}>Aggiungi Carta</div>
        </div>

        <BigTab
          key="contante"
          title="Contante"
          value={contante}
          titleStyle={{ fontSize: 22 }}
          valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
          onUpdate={update => {
            if (update.value !== undefined) dispatch({ type: 'UPDATE_LIQUIDITA_CONTANTE', payload: { contante: Number(update.value) } });
          }}
        />
      </div>

      {/* Add Conto Modal */}
      {showAddConto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
            <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 28 }}>Nuovo Conto Corrente</h2>
            <input type="text" placeholder="Nome conto" value={newConto.titolo} onChange={e=>setNewConto(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
            <input type="number" placeholder="Saldo (€)" value={newConto.saldo} onChange={e=>setNewConto(n=>({ ...n, saldo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAddConto(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Annulla</button>
              <button onClick={() => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_LIQUIDITA_CONTO', payload: { id, titolo: newConto.titolo, saldo: Number(newConto.saldo || 0) } }); setNewConto({ titolo: '', saldo: '' }); setShowAddConto(false); }} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Aggiungi</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Carta Modal */}
      {showAddCarta && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
            <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 28 }}>Nuova Carta</h2>
            <input type="text" placeholder="Nome carta" value={newCarta.titolo} onChange={e=>setNewCarta(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
            <input type="number" placeholder="Saldo (€)" value={newCarta.saldo} onChange={e=>setNewCarta(n=>({ ...n, saldo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowAddCarta(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Annulla</button>
              <button onClick={() => { const id = Math.random().toString(36).slice(2,9); dispatch({ type: 'ADD_LIQUIDITA_CARTE', payload: { id, titolo: newCarta.titolo, saldo: Number(newCarta.saldo || 0) } }); setNewCarta({ titolo: '', saldo: '' }); setShowAddCarta(false); }} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Aggiungi</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contante Modal (optional) */}
      {showEditContante && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
            <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 28 }}>Modifica Contante</h2>
            <input type="number" value={editContanteValue} onChange={e=>setEditContanteValue(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowEditContante(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Annulla</button>
              <button onClick={() => { dispatch({ type: 'UPDATE_LIQUIDITA_CONTANTE', payload: { contante: Number(editContanteValue || 0) } }); setShowEditContante(false); }} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liquidita;
