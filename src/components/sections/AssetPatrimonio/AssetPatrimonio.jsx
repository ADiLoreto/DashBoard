import React, { useContext, useState } from 'react';
import { useFinancialCalculations } from '../../../hooks/useFinancialCalculations';
import { formatCurrency, getUserCurrency } from '../../../utils/format';
import { AuthContext } from '../../../context/AuthContext';
import { FinanceContext } from '../../../context/FinanceContext';
import BigTab from '../../ui/BigTab';

const AssetPatrimonio = () => {
  const { totalePatrimonio } = useFinancialCalculations();
  const { user } = useContext(AuthContext);
  const username = user?.username;
  const currency = getUserCurrency(username);
  const { state, dispatch } = useContext(FinanceContext);

  // Conti Deposito UI state (modeled on Stipendio flow)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newConto, setNewConto] = useState({ titolo: '', saldo: '' });
  const [editingConto, setEditingConto] = useState(null);

  const conti = (state.patrimonio && state.patrimonio.contiDeposito) || [];

  const buoni = (state.patrimonio && state.patrimonio.buoniTitoli) || [];
  const azioni = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.azioni) || [];
  const etf = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.etf) || [];
  const crypto = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.crypto) || [];
  const oro = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.oro) || [];

  const getValue = (item) => Number(item.saldo ?? item.importo ?? item.valore ?? item.value ?? 0) || 0;

  // Buoni state
  const [showAddBuono, setShowAddBuono] = useState(false);
  const [showEditBuono, setShowEditBuono] = useState(false);
  const [newBuono, setNewBuono] = useState({ titolo: '', importo: '' });
  const [editingBuono, setEditingBuono] = useState(null);

  // Azioni state
  const [showAddAzione, setShowAddAzione] = useState(false);
  const [showEditAzione, setShowEditAzione] = useState(false);
  const [newAzione, setNewAzione] = useState({ titolo: '', valore: '' });
  const [editingAzione, setEditingAzione] = useState(null);

  // ETF state
  const [showAddEtf, setShowAddEtf] = useState(false);
  const [showEditEtf, setShowEditEtf] = useState(false);
  const [newEtf, setNewEtf] = useState({ titolo: '', valore: '' });
  const [editingEtf, setEditingEtf] = useState(null);

  // Crypto state
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [showEditCrypto, setShowEditCrypto] = useState(false);
  const [newCrypto, setNewCrypto] = useState({ titolo: '', valore: '' });
  const [editingCrypto, setEditingCrypto] = useState(null);

  // Oro state
  const [showAddOro, setShowAddOro] = useState(false);
  const [showEditOro, setShowEditOro] = useState(false);
  const [newOro, setNewOro] = useState({ titolo: '', valore: '' });
  const [editingOro, setEditingOro] = useState(null);

  // global Escape key handler: when any "add" modal is open, ESC cancels it
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (showAddModal) return setShowAddModal(false);
      if (showAddBuono) return setShowAddBuono(false);
      if (showAddAzione) return setShowAddAzione(false);
      if (showAddEtf) return setShowAddEtf(false);
      if (showAddCrypto) return setShowAddCrypto(false);
      if (showAddOro) return setShowAddOro(false);
    };

    const anyOpen = showAddModal || showAddBuono || showAddAzione || showAddEtf || showAddCrypto || showAddOro;
    if (anyOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAddModal, showAddBuono, showAddAzione, showAddEtf, showAddCrypto, showAddOro]);

  const handleAddConto = () => {
    if (!newConto.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_PATRIMONIO_CONTO', payload: { id, titolo: newConto.titolo, saldo: Number(newConto.saldo || 0) } });
    setNewConto({ titolo: '', saldo: '' });
    setShowAddModal(false);
  };

  const openEditConto = (c) => { setEditingConto({ ...c }); setShowEditModal(true); };
  const handleUpdateConto = () => { dispatch({ type: 'UPDATE_PATRIMONIO_CONTO', payload: editingConto }); setShowEditModal(false); setEditingConto(null); };
  const handleDeleteConto = (id) => { dispatch({ type: 'DELETE_PATRIMONIO_CONTO', payload: { id } }); setShowEditModal(false); setEditingConto(null); };

  // Buoni handlers
  const openEditBuono = (b) => { setEditingBuono({ ...b }); setShowEditBuono(true); };
  const handleAddBuono = () => {
    if (!newBuono.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_BUONO_TITOLO', payload: { id, titolo: newBuono.titolo, importo: Number(newBuono.importo || 0) } });
    setNewBuono({ titolo: '', importo: '' }); setShowAddBuono(false);
  };
  const handleUpdateBuono = () => { dispatch({ type: 'UPDATE_BUONO_TITOLO', payload: editingBuono }); setShowEditBuono(false); setEditingBuono(null); };
  const handleDeleteBuono = (id) => { dispatch({ type: 'DELETE_BUONO_TITOLO', payload: { id } }); setShowEditBuono(false); setEditingBuono(null); };

  // Azioni handlers
  const openEditAzione = (a) => { setEditingAzione({ ...a }); setShowEditAzione(true); };
  const handleAddAzione = () => {
    if (!newAzione.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_INVESTIMENTO_AZIONE', payload: { id, titolo: newAzione.titolo, valore: Number(newAzione.valore || 0) } });
    setNewAzione({ titolo: '', valore: '' }); setShowAddAzione(false);
  };
  const handleUpdateAzione = () => { dispatch({ type: 'UPDATE_INVESTIMENTO_AZIONE', payload: editingAzione }); setShowEditAzione(false); setEditingAzione(null); };
  const handleDeleteAzione = (id) => { dispatch({ type: 'DELETE_INVESTIMENTO_AZIONE', payload: { id } }); setShowEditAzione(false); setEditingAzione(null); };

  // ETF handlers
  const openEditEtf = (e) => { setEditingEtf({ ...e }); setShowEditEtf(true); };
  const handleAddEtf = () => {
    if (!newEtf.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_INVESTIMENTO_ETF', payload: { id, titolo: newEtf.titolo, valore: Number(newEtf.valore || 0) } });
    setNewEtf({ titolo: '', valore: '' }); setShowAddEtf(false);
  };
  const handleUpdateEtf = () => { dispatch({ type: 'UPDATE_INVESTIMENTO_ETF', payload: editingEtf }); setShowEditEtf(false); setEditingEtf(null); };
  const handleDeleteEtf = (id) => { dispatch({ type: 'DELETE_INVESTIMENTO_ETF', payload: { id } }); setShowEditEtf(false); setEditingEtf(null); };

  // Crypto handlers
  const openEditCrypto = (c) => { setEditingCrypto({ ...c }); setShowEditCrypto(true); };
  const handleAddCrypto = () => {
    if (!newCrypto.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_INVESTIMENTO_CRYPTO', payload: { id, titolo: newCrypto.titolo, valore: Number(newCrypto.valore || 0) } });
    setNewCrypto({ titolo: '', valore: '' }); setShowAddCrypto(false);
  };
  const handleUpdateCrypto = () => { dispatch({ type: 'UPDATE_INVESTIMENTO_CRYPTO', payload: editingCrypto }); setShowEditCrypto(false); setEditingCrypto(null); };
  const handleDeleteCrypto = (id) => { dispatch({ type: 'DELETE_INVESTIMENTO_CRYPTO', payload: { id } }); setShowEditCrypto(false); setEditingCrypto(null); };

  // Oro handlers
  const openEditOro = (o) => { setEditingOro({ ...o }); setShowEditOro(true); };
  const handleAddOro = () => {
    if (!newOro.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_ORO', payload: { id, titolo: newOro.titolo, valore: Number(newOro.valore || 0) } });
    setNewOro({ titolo: '', valore: '' }); setShowAddOro(false);
  };
  const handleUpdateOro = () => { dispatch({ type: 'UPDATE_ORO', payload: editingOro }); setShowEditOro(false); setEditingOro(null); };
  const handleDeleteOro = (id) => { dispatch({ type: 'DELETE_ORO', payload: { id } }); setShowEditOro(false); setEditingOro(null); };

  // Show summary and Conti Deposito subtab
  return (
    <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <h2 style={{ color: 'var(--bg-light)', marginBottom: 12 }}>Asset / Patrimonio</h2>
        <div style={{ background: 'var(--bg-medium)', padding: 20, borderRadius: 12 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Totale patrimonio</div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: 28, fontWeight: 700 }}>{formatCurrency(totalePatrimonio, currency)}</div>
        </div>

        {/* grid of cards that fills available viewport height */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 20, minHeight: 'calc(100vh - 220px)', gridAutoRows: 'auto', alignItems: 'start', overflow: 'hidden' }}>

          {/* Conti Deposito card */}
          <div style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Conti Deposito</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{formatCurrency(conti.reduce((s,c)=>s+Number(c.saldo||0),0), currency)}</div>
                <button onClick={() => setShowAddModal(true)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi</button>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, overflowY: 'auto', paddingBottom: 8, alignItems: 'flex-start', alignContent: 'flex-start' }}>
              {conti.map(c => (
                <BigTab key={c.id} title={c.titolo || c.name || 'Conto'} value={formatCurrency(Number(c.saldo||0), currency)} onClick={() => openEditConto(c)} />
              ))}
              <div className="big-tab add-tab" onClick={() => setShowAddModal(true)} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36, alignSelf: 'flex-start' }}>
                <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
              </div>
            </div>
          </div>

          {/* Buoni card */}
          <div style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Buoni / Titoli</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{formatCurrency(buoni.reduce((s,b)=>s+getValue(b),0), currency)}</div>
                <button onClick={() => setShowAddBuono(true)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi</button>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, overflowY: 'auto', paddingBottom: 8, alignItems: 'flex-start', alignContent: 'flex-start' }}>
              {buoni.map(b => (
                <BigTab key={b.id} title={b.titolo || b.name || 'Buono'} value={formatCurrency(getValue(b), currency)} onClick={() => openEditBuono(b)} />
              ))}
              <div className="big-tab add-tab" onClick={() => setShowAddBuono(true)} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36, alignSelf: 'flex-start' }}>
                <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
              </div>
            </div>
          </div>

          {/* Azioni card */}
          <div style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Azioni</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{formatCurrency(azioni.reduce((s,a)=>s+getValue(a),0), currency)}</div>
                <button onClick={() => setShowAddAzione(true)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi</button>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, overflowY: 'auto', paddingBottom: 8, alignItems: 'flex-start', alignContent: 'flex-start' }}>
              {azioni.map(a => (
                <BigTab key={a.id} title={a.titolo || a.name || 'Azione'} value={formatCurrency(getValue(a), currency)} onClick={() => openEditAzione(a)} />
              ))}
              <div className="big-tab add-tab" onClick={() => setShowAddAzione(true)} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36, alignSelf: 'flex-start' }}>
                <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
              </div>
            </div>
          </div>

          {/* ETF card */}
          <div style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>ETF</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{formatCurrency(etf.reduce((s,e)=>s+getValue(e),0), currency)}</div>
                <button onClick={() => setShowAddEtf(true)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi</button>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, overflowY: 'auto', paddingBottom: 8, alignItems: 'flex-start', alignContent: 'flex-start' }}>
              {etf.map(e => (
                <BigTab key={e.id} title={e.titolo || e.name || 'ETF'} value={formatCurrency(getValue(e), currency)} onClick={() => openEditEtf(e)} />
              ))}
              <div className="big-tab add-tab" onClick={() => setShowAddEtf(true)} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36, alignSelf: 'flex-start' }}>
                <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
              </div>
            </div>
          </div>

          {/* Crypto card */}
          <div style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Crypto</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{formatCurrency(crypto.reduce((s,c)=>s+getValue(c),0), currency)}</div>
                <button onClick={() => setShowAddCrypto(true)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi</button>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, overflowY: 'auto', paddingBottom: 8, alignItems: 'flex-start', alignContent: 'flex-start' }}>
              {crypto.map(c => (
                <BigTab key={c.id} title={c.titolo || c.name || 'Crypto'} value={formatCurrency(getValue(c), currency)} onClick={() => openEditCrypto(c)} />
              ))}
              <div className="big-tab add-tab" onClick={() => setShowAddCrypto(true)} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36, alignSelf: 'flex-start' }}>
                <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
              </div>
            </div>
          </div>

          {/* Oro card */}
          <div style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--bg-light)', margin: 0 }}>Materiali preziosi</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{formatCurrency(oro.reduce((s,o)=>s+getValue(o),0), currency)}</div>
                <button onClick={() => setShowAddOro(true)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>+ Aggiungi</button>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12, overflowY: 'auto', paddingBottom: 8, alignItems: 'flex-start', alignContent: 'flex-start' }}>
              {oro.map(o => (
                <BigTab key={o.id} title={o.titolo || o.name || 'Oro'} value={formatCurrency(getValue(o), currency)} onClick={() => openEditOro(o)} />
              ))}
              <div className="big-tab add-tab" onClick={() => setShowAddOro(true)} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36, alignSelf: 'flex-start' }}>
                  <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                </div>
            </div>
          </div>

        </div>

        {/* Add modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 28 }}>Nuovo Conto Deposito</h2>
              <input type="text" placeholder="Nome conto" value={newConto.titolo} onChange={e=>setNewConto(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Saldo (€)" value={newConto.saldo} onChange={e=>setNewConto(n=>({ ...n, saldo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddModal(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Annulla</button>
                <button onClick={handleAddConto} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal for Conto */}
        {showEditModal && editingConto && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h3 style={{ color: 'var(--bg-dark)', fontSize: 24 }}>Modifica Conto</h3>
              <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                <input type="text" value={editingConto.titolo || ''} onChange={e=>setEditingConto(prev=>({ ...prev, titolo: e.target.value }))} style={{ padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
                <input type="number" value={editingConto.saldo || 0} onChange={e=>setEditingConto(prev=>({ ...prev, saldo: Number(e.target.value) }))} style={{ padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
                <button onClick={()=>handleDeleteConto(editingConto.id)} style={{ background: '#ff6b6b', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={()=>setShowEditModal(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                  <button onClick={handleUpdateConto} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buoni modals */}
        {showAddBuono && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuovo Buono / Titolo</h2>
              <input type="text" placeholder="Titolo" value={newBuono.titolo} onChange={e=>setNewBuono(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Importo (€)" value={newBuono.importo} onChange={e=>setNewBuono(n=>({ ...n, importo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddBuono(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddBuono} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditBuono && editingBuono && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Buono</h3>
              <input value={editingBuono.titolo || ''} onChange={e=>setEditingBuono(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingBuono.importo || 0} onChange={e=>setEditingBuono(prev=>({ ...prev, importo: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteBuono(editingBuono.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditBuono(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateBuono} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Azioni modals */}
        {showAddAzione && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuova Azione</h2>
              <input type="text" placeholder="Titolo" value={newAzione.titolo} onChange={e=>setNewAzione(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newAzione.valore} onChange={e=>setNewAzione(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddAzione(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddAzione} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditAzione && editingAzione && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Azione</h3>
              <input value={editingAzione.titolo || ''} onChange={e=>setEditingAzione(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingAzione.valore || 0} onChange={e=>setEditingAzione(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteAzione(editingAzione.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditAzione(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateAzione} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ETF modals */}
        {showAddEtf && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuovo ETF</h2>
              <input type="text" placeholder="Titolo" value={newEtf.titolo} onChange={e=>setNewEtf(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newEtf.valore} onChange={e=>setNewEtf(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddEtf(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddEtf} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditEtf && editingEtf && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica ETF</h3>
              <input value={editingEtf.titolo || ''} onChange={e=>setEditingEtf(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingEtf.valore || 0} onChange={e=>setEditingEtf(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteEtf(editingEtf.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditEtf(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateEtf} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crypto modals */}
        {showAddCrypto && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuova Crypto</h2>
              <input type="text" placeholder="Titolo" value={newCrypto.titolo} onChange={e=>setNewCrypto(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newCrypto.valore} onChange={e=>setNewCrypto(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddCrypto(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddCrypto} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditCrypto && editingCrypto && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Crypto</h3>
              <input value={editingCrypto.titolo || ''} onChange={e=>setEditingCrypto(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingCrypto.valore || 0} onChange={e=>setEditingCrypto(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteCrypto(editingCrypto.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditCrypto(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateCrypto} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Oro modals */}
        {showAddOro && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuovo Oro / Materiale</h2>
              <input type="text" placeholder="Titolo" value={newOro.titolo} onChange={e=>setNewOro(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newOro.valore} onChange={e=>setNewOro(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddOro(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddOro} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditOro && editingOro && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Oro</h3>
              <input value={editingOro.titolo || ''} onChange={e=>setEditingOro(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingOro.valore || 0} onChange={e=>setEditingOro(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteOro(editingOro.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditOro(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateOro} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetPatrimonio;
