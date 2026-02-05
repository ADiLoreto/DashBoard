import React, { useContext, useState } from 'react';
import { useFinancialCalculations } from '../../../hooks/useFinancialCalculations';
import { formatCurrency, getUserCurrency } from '../../../utils/format';
import { AuthContext } from '../../../context/AuthContext';
import { FinanceContext } from '../../../context/FinanceContext';
import BigTab from '../../ui/BigTab';
import AssetWizard from '../../wizard/AssetWizard';
import { calculateNetIncome, calculateROI, calculatePayback } from '../../../utils/calculations';
import ExpensesPopup from '../../ui/ExpensesPopup';
import { PieChart, Pie, Cell } from 'recharts';

// animated inline SVG donut chart: items (array), getValue(item) -> number
// responsive: when `responsive` is true the svg scales to its container (keeps aspect ratio)
const DonutChart = ({ items = [], getValue, size = 64, thickness, responsive = true, offsetX = 0, offsetY = 0, emptyScale = 0.7, emptyOffsetY = -27}) => {
  const data = (items || []).map((it, i) => ({
    name: it.titolo || it.name || `item-${i}`,
    value: Number(getValue(it) || 0),
  }));

  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const strokeWidth = typeof thickness === 'number' ? thickness : Math.max(6, Math.round(size * 0.18));
  const outer = Math.round(size / 2);
  const inner = Math.max(0, outer - strokeWidth);

  const palette = ['var(--accent-cyan)', 'var(--accent-blue)', 'var(--text-muted)', 'var(--bg-light)', 'var(--bg-darker)'];

  // count non-zero slices to decide padding
  const nonZeroCount = data.filter(d => (d.value || 0) > 0).length;
  // use a small padding for multi-slice donuts to minimize visible gaps (anti-aliasing still possible)
  const paddingAngle = nonZeroCount <= 1 ? 0 : 0.6;

  const cx = outer + (offsetX || 0);
  const cy = outer + (offsetY || 0);

  if (!total) {
    // draw a smaller ring centered in the same viewBox so layout/responsive behaviour stays identical
    const scale = Math.max(0.2, Math.min(1, emptyScale)); // clamp scale between 0.2 and 1
    const emptyOuter = Math.round(outer * scale);
    const emptyStroke = Math.max(3, Math.round(strokeWidth * scale));
    const r = Math.max(0, emptyOuter - emptyStroke / 2);
    const cyEmpty = outer + (typeof emptyOffsetY === 'number' ? emptyOffsetY : (offsetY || 0));

    return (
      <svg viewBox={`0 0 ${size} ${size}`} style={responsive ? { width: '100%', height: 'auto' } : { width: size, height: size }} preserveAspectRatio="xMidYMid meet">
        <circle cx={cx} cy={cyEmpty} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={emptyStroke} strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <PieChart width={size} height={size}>
      <Pie
        data={data}
        dataKey="value"
        cx={cx}
        cy={cy}
        innerRadius={inner}
        outerRadius={outer}
        startAngle={90}
        endAngle={-270}
        paddingAngle={paddingAngle}
        isAnimationActive={true}
        animationDuration={1200}
        animationEasing="ease"
        stroke="none"
      >
        {data.map((d, i) => (
          <Cell key={i} fill={palette[i % palette.length]} stroke="none" />
        ))}
      </Pie>
    </PieChart>
  );
};

const AssetPatrimonio = () => {
  const { totalePatrimonio } = useFinancialCalculations();
  const { user } = useContext(AuthContext);
  const username = user?.username;
  const currency = getUserCurrency(username);
  const { state, dispatch } = useContext(FinanceContext);

  // per-card expand/hover state: cards are minimized by default
  const [expandedCards, setExpandedCards] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const toggleCard = (key) => setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
  const isCardOpen = (key) => !!expandedCards[key] || hoveredCard === key;

  // Conti Deposito UI state (modeled on Stipendio flow)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newConto, setNewConto] = useState({ titolo: '', saldo: '' });
  const [editingConto, setEditingConto] = useState(null);

  const conti = (state.patrimonio && state.patrimonio.contiDeposito) || [];
  // Immobili (ex contiDepositoExtra) — sezione per valori immobiliari
  const immobili = ((state.patrimonio && state.patrimonio.immobili) || []).map(i => ({
    ...i,
    expenses: i.expenses || [],
    taxRate: i.taxRate || 0,
    yearlyRent: i.yearlyRent || 0
  }));

  // Effect per la generazione automatica dei cashflow quando gli immobili cambiano
  React.useEffect(() => {
    // Se ci sono immobili con yearlyRent > 0, genera i cashflow
    const hasRentedProperties = immobili.some(i => i.yearlyRent > 0);
    if (hasRentedProperties) {
      dispatch({ type: 'GENERATE_CASHFLOWS_FROM_ASSETS' });
    }
  }, [immobili, dispatch]); // Dipendenze: immobili e dispatch

  const buoni = (state.patrimonio && state.patrimonio.buoniTitoli) || [];
  const azioni = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.azioni) || [];
  const etf = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.etf) || [];
  const crypto = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.crypto) || [];
  const oro = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.oro) || [];
  const obbligazioni = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.obbligazioni) || [];
  const fondi = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.fondi) || [];
  const polizze = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.polizze) || [];
  const bassoRischio = (state.patrimonio && state.patrimonio.investimenti && state.patrimonio.investimenti.bassoRischio) || [];

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

  // Obbligazioni state
  const [showAddObbligazioni, setShowAddObbligazioni] = useState(false);
  const [showEditObbligazioni, setShowEditObbligazioni] = useState(false);
  const [newObbligazioni, setNewObbligazioni] = useState({ titolo: '', valore: '' });
  const [editingObbligazioni, setEditingObbligazioni] = useState(null);

  // Fondi Comuni state
  const [showAddFondi, setShowAddFondi] = useState(false);
  const [showEditFondi, setShowEditFondi] = useState(false);
  const [newFondi, setNewFondi] = useState({ titolo: '', valore: '' });
  const [editingFondi, setEditingFondi] = useState(null);

  // Polizze Assicurative state
  const [showAddPolizze, setShowAddPolizze] = useState(false);
  const [showEditPolizze, setShowEditPolizze] = useState(false);
  const [newPolizze, setNewPolizze] = useState({ titolo: '', valore: '' });
  const [editingPolizze, setEditingPolizze] = useState(null);

  // Investimenti a Basso Rischio state
  const [showAddBassoRischio, setShowAddBassoRischio] = useState(false);
  const [showEditBassoRischio, setShowEditBassoRischio] = useState(false);
  const [newBassoRischio, setNewBassoRischio] = useState({ titolo: '', valore: '' });
  const [editingBassoRischio, setEditingBassoRischio] = useState(null);

  // Wizard integration state (FASE 3.1)
  const [showWizard, setShowWizard] = useState(false);
  const [wizardAsset, setWizardAsset] = useState(null);
  const [wizardAssetType, setWizardAssetType] = useState(null);

  // Immobili state
  const [showAddImmobile, setShowAddImmobile] = useState(false);
  const [showEditImmobile, setShowEditImmobile] = useState(false);
  const [newImmobile, setNewImmobile] = useState({ titolo: '', valore: '' });
  const [editingImmobile, setEditingImmobile] = useState(null);
  // Expenses popup state for immobili
  const [expensesFor, setExpensesFor] = useState(null);

  const handleOpenExpenses = (asset) => {
    setExpensesFor(asset);
  };
  const handleCloseExpenses = () => setExpensesFor(null);
  const handleSaveExpenses = (data) => {
    // data: { expenses: [...], taxRate, yearlyRent }
    if (!expensesFor) { setExpensesFor(null); return; }
    const updated = { ...expensesFor, ...data };
    dispatch({ type: 'UPDATE_PATRIMONIO_IMMOBILE', payload: updated });
    // auto-generate cashflows for assets affected by this change
    dispatch({ type: 'GENERATE_CASHFLOWS_FROM_ASSETS' });
    setExpensesFor(null);
  };

  // global Escape key handler: when any "add" modal is open, ESC cancels it
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      // add modals
      if (showAddModal) { setShowAddModal(false); return; }
  if (showAddImmobile) { setShowAddImmobile(false); return; }
      if (showAddBuono) { setShowAddBuono(false); return; }
      if (showAddAzione) { setShowAddAzione(false); return; }
      if (showAddEtf) { setShowAddEtf(false); return; }
      if (showAddCrypto) { setShowAddCrypto(false); return; }
      if (showAddOro) { setShowAddOro(false); return; }
      if (showAddObbligazioni) { setShowAddObbligazioni(false); return; }
      if (showAddFondi) { setShowAddFondi(false); return; }
      if (showAddPolizze) { setShowAddPolizze(false); return; }
      if (showAddBassoRischio) { setShowAddBassoRischio(false); return; }

  // wizard - close and clear
  if (showWizard) { setShowWizard(false); setWizardAsset(null); setWizardAssetType(null); return; }

      // edit modals - treat ESC as Annulla and clear editing state
      if (showEditModal) { setShowEditModal(false); setEditingConto(null); return; }
  if (showEditImmobile) { setShowEditImmobile(false); setEditingImmobile(null); return; }
      if (showEditBuono) { setShowEditBuono(false); setEditingBuono(null); return; }
      if (showEditAzione) { setShowEditAzione(false); setEditingAzione(null); return; }
      if (showEditEtf) { setShowEditEtf(false); setEditingEtf(null); return; }
      if (showEditCrypto) { setShowEditCrypto(false); setEditingCrypto(null); return; }
      if (showEditOro) { setShowEditOro(false); setEditingOro(null); return; }
      if (showEditObbligazioni) { setShowEditObbligazioni(false); setEditingObbligazioni(null); return; }
      if (showEditFondi) { setShowEditFondi(false); setEditingFondi(null); return; }
      if (showEditPolizze) { setShowEditPolizze(false); setEditingPolizze(null); return; }
      if (showEditBassoRischio) { setShowEditBassoRischio(false); setEditingBassoRischio(null); return; }
    };

  const anyOpen = showAddModal || showAddImmobile || showAddBuono || showAddAzione || showAddEtf || showAddCrypto || showAddOro || showAddObbligazioni || showAddFondi || showAddPolizze || showAddBassoRischio || showWizard || showEditModal || showEditImmobile || showEditBuono || showEditAzione || showEditEtf || showEditCrypto || showEditOro || showEditObbligazioni || showEditFondi || showEditPolizze || showEditBassoRischio;
    if (anyOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAddModal, showAddImmobile, showAddBuono, showAddAzione, showAddEtf, showAddCrypto, showAddOro, showAddObbligazioni, showAddFondi, showAddPolizze, showAddBassoRischio, showWizard, showEditModal, showEditImmobile, showEditBuono, showEditAzione, showEditEtf, showEditCrypto, showEditOro, showEditObbligazioni, showEditFondi, showEditPolizze, showEditBassoRischio]);


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

  // Immobili handlers (prima conti_extra)
  const openEditImmobile = (m) => { setEditingImmobile({ ...m }); setShowEditImmobile(true); };
  const handleAddImmobile = () => {
    if (!newImmobile.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_PATRIMONIO_IMMOBILE', payload: { id, titolo: newImmobile.titolo, valore: Number(newImmobile.valore || 0) } });
    setNewImmobile({ titolo: '', valore: '' });
    setShowAddImmobile(false);
  };
  const handleUpdateImmobile = () => { dispatch({ type: 'UPDATE_PATRIMONIO_IMMOBILE', payload: editingImmobile }); setShowEditImmobile(false); setEditingImmobile(null); };
  const handleDeleteImmobile = (id) => { dispatch({ type: 'DELETE_PATRIMONIO_IMMOBILE', payload: { id } }); setShowEditImmobile(false); setEditingImmobile(null); };

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

  // Obbligazioni handlers
  const openEditObbligazioni = (o) => { setEditingObbligazioni({ ...o }); setShowEditObbligazioni(true); };
  const handleAddObbligazioni = () => {
    if (!newObbligazioni.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_INVESTIMENTO_OBBLIGAZIONI', payload: { id, titolo: newObbligazioni.titolo, valore: Number(newObbligazioni.valore || 0) } });
    setNewObbligazioni({ titolo: '', valore: '' }); setShowAddObbligazioni(false);
  };
  const handleUpdateObbligazioni = () => { dispatch({ type: 'UPDATE_INVESTIMENTO_OBBLIGAZIONI', payload: editingObbligazioni }); setShowEditObbligazioni(false); setEditingObbligazioni(null); };
  const handleDeleteObbligazioni = (id) => { dispatch({ type: 'DELETE_INVESTIMENTO_OBBLIGAZIONI', payload: { id } }); setShowEditObbligazioni(false); setEditingObbligazioni(null); };

  // Fondi Comuni handlers
  const openEditFondi = (f) => { setEditingFondi({ ...f }); setShowEditFondi(true); };
  const handleAddFondi = () => {
    if (!newFondi.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_INVESTIMENTO_FONDI', payload: { id, titolo: newFondi.titolo, valore: Number(newFondi.valore || 0) } });
    setNewFondi({ titolo: '', valore: '' }); setShowAddFondi(false);
  };
  const handleUpdateFondi = () => { dispatch({ type: 'UPDATE_INVESTIMENTO_FONDI', payload: editingFondi }); setShowEditFondi(false); setEditingFondi(null); };
  const handleDeleteFondi = (id) => { dispatch({ type: 'DELETE_INVESTIMENTO_FONDI', payload: { id } }); setShowEditFondi(false); setEditingFondi(null); };

  // Polizze Assicurative handlers
  const openEditPolizze = (p) => { setEditingPolizze({ ...p }); setShowEditPolizze(true); };
  const handleAddPolizze = () => {
    if (!newPolizze.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_INVESTIMENTO_POLIZZE', payload: { id, titolo: newPolizze.titolo, valore: Number(newPolizze.valore || 0) } });
    setNewPolizze({ titolo: '', valore: '' }); setShowAddPolizze(false);
  };
  const handleUpdatePolizze = () => { dispatch({ type: 'UPDATE_INVESTIMENTO_POLIZZE', payload: editingPolizze }); setShowEditPolizze(false); setEditingPolizze(null); };
  const handleDeletePolizze = (id) => { dispatch({ type: 'DELETE_INVESTIMENTO_POLIZZE', payload: { id } }); setShowEditPolizze(false); setEditingPolizze(null); };

  // Investimenti a Basso Rischio handlers
  const openEditBassoRischio = (b) => { setEditingBassoRischio({ ...b }); setShowEditBassoRischio(true); };
  const handleAddBassoRischio = () => {
    if (!newBassoRischio.titolo) return;
    const id = Math.random().toString(36).slice(2,9);
    dispatch({ type: 'ADD_INVESTIMENTO_BASSORISCHIO', payload: { id, titolo: newBassoRischio.titolo, valore: Number(newBassoRischio.valore || 0) } });
    setNewBassoRischio({ titolo: '', valore: '' }); setShowAddBassoRischio(false);
  };
  const handleUpdateBassoRischio = () => { dispatch({ type: 'UPDATE_INVESTIMENTO_BASSORISCHIO', payload: editingBassoRischio }); setShowEditBassoRischio(false); setEditingBassoRischio(null); };
  const handleDeleteBassoRischio = (id) => { dispatch({ type: 'DELETE_INVESTIMENTO_BASSORISCHIO', payload: { id } }); setShowEditBassoRischio(false); setEditingBassoRischio(null); };

  // Wizard handlers: open wizard for create/edit and save callback (FASE 3.1 / 3.2)
  const handleAddAsset = (assetType) => {
    setWizardAssetType(assetType);
    setWizardAsset(null);
    setShowWizard(true);
  };

  const handleEditAsset = (asset, assetType) => {
    setWizardAssetType(assetType);
    setWizardAsset(asset);
    setShowWizard(true);
  };

  const handleSaveFromWizard = (assetData) => {
    // assetData should contain { id?, titolo, valore, ... } and the wizardAssetType indicates target section
    const type = wizardAssetType;
    if (!type) { setShowWizard(false); return; }

    // Map section keys to reducer action types
    const mapAdd = {
      conti: 'ADD_PATRIMONIO_CONTO',
      immobili: 'ADD_PATRIMONIO_IMMOBILE',
      buoni: 'ADD_BUONO_TITOLO',
      azioni: 'ADD_INVESTIMENTO_AZIONE',
      etf: 'ADD_INVESTIMENTO_ETF',
      crypto: 'ADD_INVESTIMENTO_CRYPTO',
      oro: 'ADD_ORO',
      obbligazioni: 'ADD_INVESTIMENTO_OBBLIGAZIONI',
      fondi: 'ADD_INVESTIMENTO_FONDI',
      polizze: 'ADD_INVESTIMENTO_POLIZZE',
      bassoRischio: 'ADD_INVESTIMENTO_BASSORISCHIO'
    };
    const mapUpdate = {
      conti: 'UPDATE_PATRIMONIO_CONTO',
      immobili: 'UPDATE_PATRIMONIO_IMMOBILE',
      buoni: 'UPDATE_BUONO_TITOLO',
      azioni: 'UPDATE_INVESTIMENTO_AZIONE',
      etf: 'UPDATE_INVESTIMENTO_ETF',
      crypto: 'UPDATE_INVESTIMENTO_CRYPTO',
      oro: 'UPDATE_ORO',
      obbligazioni: 'UPDATE_INVESTIMENTO_OBBLIGAZIONI',
      fondi: 'UPDATE_INVESTIMENTO_FONDI',
      polizze: 'UPDATE_INVESTIMENTO_POLIZZE',
      bassoRischio: 'UPDATE_INVESTIMENTO_BASSORISCHIO'
    };

    if (assetData.id) {
      const action = mapUpdate[type];
      if (action) dispatch({ type: action, payload: assetData });
      // generate cashflows after updating an existing asset
      dispatch({ type: 'GENERATE_CASHFLOWS_FROM_ASSETS' });
    } else {
      // ensure we generate an id for new items
      const id = Math.random().toString(36).slice(2,9);
      const payload = { id, ...assetData };
      const action = mapAdd[type];
      if (action) dispatch({ type: action, payload });
      // generate cashflows after adding a new asset
      dispatch({ type: 'GENERATE_CASHFLOWS_FROM_ASSETS' });
    }

    // close and reset
    setShowWizard(false);
    setWizardAsset(null);
    setWizardAssetType(null);
  };

  // Show summary and Conti Deposito subtab
  return (
    <div style={{ margin: '6px 0', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '100%', padding: '6px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <h2 style={{ color: 'var(--bg-light)', margin: 0 }}>Asset / Patrimonio</h2>
          <div style={{ background: 'var(--bg-medium)', padding: '12px 16px', borderRadius: 12, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 13 }}>Totale patrimonio</div>
            <div style={{ color: 'var(--accent-cyan)', fontSize: 22, fontWeight: 700 }}>{formatCurrency(totalePatrimonio, currency)}</div>
          </div>
        </div>

        {/* grid of cards that fills available viewport height */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 12, minHeight: 'calc(100vh - 160px)', gridAutoRows: 'auto', alignItems: 'start', overflow: 'hidden' }}>

          {/* Conti Deposito card */}
          {(() => {
            const key = 'conti';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                  style={{
                  background: 'var(--bg-medium)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  minWidth: 0,
                  minHeight: open ? 320 : undefined,
                  aspectRatio: open ? undefined : '1 / 1',
                  transition: 'min-height 220ms ease, aspect-ratio 220ms ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Conti Deposito</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(conti.reduce((s,c)=>s+Number(c.saldo||0),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={conti} getValue={c => Number(c.saldo || 0)} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>

                {/* entries - only visible when open */}
        <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
                    {conti.map(c => (
                        <BigTab
                        key={c.id}
                        title={c.titolo || c.name || 'Conto'}
                        value={c.saldo}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_PATRIMONIO_CONTO', payload: { ...c, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_PATRIMONIO_CONTO', payload: { ...c, saldo: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteConto(c.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('conti')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Buoni card */}
          {(() => {
            const key = 'buoni';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Buoni / Titoli</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(buoni.reduce((s,b)=>s+getValue(b),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={buoni} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {buoni.map(b => (
                      <BigTab
                        key={b.id}
                        title={b.titolo || b.name || 'Buono'}
                        value={b.importo}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_BUONO_TITOLO', payload: { ...b, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_BUONO_TITOLO', payload: { ...b, importo: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteBuono(b.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('buoni')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Immobili (nuova sezione) */}
          {(() => {
            const key = 'immobili';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: 'var(--bg-medium)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  minWidth: 0,
                  minHeight: open ? 320 : undefined,
                  aspectRatio: open ? undefined : '1 / 1',
                  transition: 'min-height 220ms ease, aspect-ratio 220ms ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Immobili</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(immobili.reduce((s,i)=>s+Number(i.valore||0),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={immobili} getValue={i => Number(i.valore || 0)} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>

                {/* entries - only visible when open */}
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
                    {immobili.map(i => {
                        const income = calculateNetIncome(i.yearlyRent || 0, i.expenses || [], i.taxRate || 0);
                        const roi = calculateROI(i.yearlyRent || 0, i.expenses || [], i.taxRate || 0, i.valore || 0);
                        const payback = calculatePayback(i.yearlyRent || 0, i.expenses || [], i.taxRate || 0, i.valore || 0);
                        return (
                          <BigTab
                            key={i.id}
                            title={i.titolo || i.name || 'Immobile'}
                            value={i.valore}
                            titleStyle={{ fontSize: 22 }}
                            valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                            onUpdate={update => {
                              if (update.title !== undefined) dispatch({ type: 'UPDATE_PATRIMONIO_IMMOBILE', payload: { ...i, titolo: update.title } });
                              if (update.value !== undefined) dispatch({ type: 'UPDATE_PATRIMONIO_IMMOBILE', payload: { ...i, valore: Number(update.value) } });
                            }}
                            onDelete={() => handleDeleteImmobile(i.id)}
                            onEditCashflow={() => handleEditAsset(i, 'immobili')}
                            onExpensesClick={() => handleOpenExpenses(i)}
                            roiDetails={{
                              roi: isNaN(roi) ? '0.00' : Number(roi).toFixed(2),
                              income: isNaN(income) ? '0.00' : Number(income).toFixed(2),
                              payback: payback === Infinity ? Infinity : (isNaN(payback) ? null : Number(payback))
                            }}
                          />
                        );
                    })}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('immobili')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Azioni card */}
          {(() => {
            const key = 'azioni';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Azioni</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(azioni.reduce((s,a)=>s+getValue(a),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={azioni} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {azioni.map(a => (
                      <BigTab
                        key={a.id}
                        title={a.titolo || a.name || 'Azione'}
                        value={a.valore}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_AZIONE', payload: { ...a, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_AZIONE', payload: { ...a, valore: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteAzione(a.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('azioni')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {(() => {
            const key = 'etf';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>ETF</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(etf.reduce((s,e)=>s+getValue(e),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={etf} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {etf.map(e => (
                      <BigTab
                        key={e.id}
                        title={e.titolo || e.name || 'ETF'}
                        value={e.valore}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_ETF', payload: { ...e, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_ETF', payload: { ...e, valore: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteEtf(e.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('etf')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {(() => {
            const key = 'crypto';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Crypto</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(crypto.reduce((s,c)=>s+getValue(c),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={crypto} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {crypto.map(c => (
                      <BigTab
                        key={c.id}
                        title={c.titolo || c.name || 'Crypto'}
                        value={c.valore}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_CRYPTO', payload: { ...c, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_CRYPTO', payload: { ...c, valore: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteCrypto(c.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('crypto')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {(() => {
            const key = 'oro';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Materiali preziosi</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(oro.reduce((s,o)=>s+getValue(o),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={oro} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {oro.map(o => (
                      <BigTab
                        key={o.id}
                        title={o.titolo || o.name || 'Oro'}
                        value={o.valore}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_ORO', payload: { ...o, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_ORO', payload: { ...o, valore: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteOro(o.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('oro')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Obbligazioni card */}
          {(() => {
            const key = 'obbligazioni';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Obbligazioni</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(obbligazioni.reduce((s,o)=>s+getValue(o),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={obbligazioni} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {obbligazioni.map(o => (
                      <BigTab
                        key={o.id}
                        title={o.titolo || o.name || 'Obbligazione'}
                        value={o.valore}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_OBBLIGAZIONI', payload: { ...o, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_OBBLIGAZIONI', payload: { ...o, valore: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteObbligazioni(o.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('obbligazioni')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Fondi Comuni card */}
          {(() => {
            const key = 'fondi';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Fondi Comuni</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(fondi.reduce((s,f)=>s+getValue(f),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={fondi} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {fondi.map(f => (
                      <BigTab
                        key={f.id}
                        title={f.titolo || f.name || 'Fondo'}
                        value={f.valore}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_FONDI', payload: { ...f, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_FONDI', payload: { ...f, valore: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteFondi(f.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('fondi')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Polizze Assicurative card */}
          {(() => {
            const key = 'polizze';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Polizze Assicurative</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(polizze.reduce((s,p)=>s+getValue(p),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={polizze} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {polizze.map(p => (
                      <BigTab
                        key={p.id}
                        title={p.titolo || p.name || 'Polizza'}
                        value={p.valore}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_POLIZZE', payload: { ...p, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_POLIZZE', payload: { ...p, valore: Number(update.value) } });
                        }}
                        onDelete={() => handleDeletePolizze(p.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('polizze')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Investimenti a Basso Rischio card */}
          {(() => {
            const key = 'bassoRischio';
            const open = isCardOpen(key);
            return (
              <div
                onMouseEnter={() => setHoveredCard(key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ background: 'var(--bg-medium)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: open ? 320 : undefined, aspectRatio: open ? undefined : '1 / 1', transition: 'min-height 220ms ease, aspect-ratio 220ms ease' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <h3 onClick={() => toggleCard(key)} style={{ color: 'var(--bg-light)', margin: 0, cursor: 'pointer', textAlign: 'center', fontSize: 22, fontWeight: 700 }}>Investimenti</h3>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginTop: 6, textAlign: 'center', fontSize: 20 }}>{formatCurrency(bassoRischio.reduce((s,b)=>s+getValue(b),0), currency)}</div>
                  </div>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 12 }}>
                    <DonutChart items={bassoRischio} getValue={getValue} size={180} responsive={true} offsetX={-5} offsetY={-5} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: open ? 'flex' : 'none', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 8 }}>
                  {/* ...DonutChart rimosso dalla sezione espansa... */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {bassoRischio.map(b => (
                      <BigTab
                        key={b.id}
                        title={b.titolo || b.name || 'Investimento'}
                        value={b.valore}
                        titleStyle={{ fontSize: 22 }}
                        valueStyle={{ fontSize: 20, fontFamily: 'inherit', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        onUpdate={update => {
                          if (update.title !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_BASSORISCHIO', payload: { ...b, titolo: update.title } });
                          if (update.value !== undefined) dispatch({ type: 'UPDATE_INVESTIMENTO_BASSORISCHIO', payload: { ...b, valore: Number(update.value) } });
                        }}
                        onDelete={() => handleDeleteBassoRischio(b.id)}
                      />
                    ))}
                    <div className="big-tab add-tab" onClick={() => handleAddAsset('bassoRischio')} style={{ background: 'var(--bg-light)', color: 'var(--text-muted)', border: '2px dashed var(--bg-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 220, minHeight: 120, borderRadius: 12, cursor: 'pointer', padding: 12, fontSize: 36 }}>
                      <span style={{ fontSize: 48, color: 'var(--accent-cyan)' }}>+</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Asset wizard (opens for add/edit asset) */}
        {showWizard && (
          <AssetWizard
            show={showWizard}
            asset={wizardAsset}
            assetType={wizardAssetType}
            onClose={() => { setShowWizard(false); setWizardAsset(null); setWizardAssetType(null); }}
            onSave={(data) => handleSaveFromWizard(data)}
          />
        )}

        {/* Expenses popup for immobili (gestione spese / ROI) */}
        {expensesFor && (
          <ExpensesPopup
            isOpen={!!expensesFor}
            initialData={expensesFor}
            onClose={handleCloseExpenses}
            onSave={handleSaveExpenses}
          />
        )}

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

        {/* Immobili Add/Edit modals */}
        {showAddImmobile && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 28 }}>Nuovo Immobile</h2>
              <input type="text" placeholder="Nome immobile" value={newImmobile.titolo} onChange={e=>setNewImmobile(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newImmobile.valore} onChange={e=>setNewImmobile(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 18, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddImmobile(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Annulla</button>
                <button onClick={handleAddImmobile} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 24px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditImmobile && editingImmobile && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Immobile</h3>
              <input value={editingImmobile.titolo || ''} onChange={e=>setEditingImmobile(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingImmobile.valore || 0} onChange={e=>setEditingImmobile(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteImmobile(editingImmobile.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditImmobile(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateImmobile} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
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

        {/* Obbligazioni modals */}
        {showAddObbligazioni && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuova Obbligazione</h2>
              <input type="text" placeholder="Titolo" value={newObbligazioni.titolo} onChange={e=>setNewObbligazioni(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newObbligazioni.valore} onChange={e=>setNewObbligazioni(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddObbligazioni(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddObbligazioni} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditObbligazioni && editingObbligazioni && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Obbligazione</h3>
              <input value={editingObbligazioni.titolo || ''} onChange={e=>setEditingObbligazioni(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingObbligazioni.valore || 0} onChange={e=>setEditingObbligazioni(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteObbligazioni(editingObbligazioni.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditObbligazioni(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateObbligazioni} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fondi Comuni modals */}
        {showAddFondi && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuovo Fondo Comune</h2>
              <input type="text" placeholder="Titolo" value={newFondi.titolo} onChange={e=>setNewFondi(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newFondi.valore} onChange={e=>setNewFondi(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddFondi(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddFondi} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditFondi && editingFondi && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Fondo Comune</h3>
              <input value={editingFondi.titolo || ''} onChange={e=>setEditingFondi(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingFondi.valore || 0} onChange={e=>setEditingFondi(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteFondi(editingFondi.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditFondi(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateFondi} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Polizze Assicurative modals */}
        {showAddPolizze && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuova Polizza Assicurativa</h2>
              <input type="text" placeholder="Titolo" value={newPolizze.titolo} onChange={e=>setNewPolizze(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newPolizze.valore} onChange={e=>setNewPolizze(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddPolizze(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddPolizze} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditPolizze && editingPolizze && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Polizza Assicurativa</h3>
              <input value={editingPolizze.titolo || ''} onChange={e=>setEditingPolizze(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingPolizze.valore || 0} onChange={e=>setEditingPolizze(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeletePolizze(editingPolizze.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditPolizze(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdatePolizze} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investimenti a Basso Rischio modals */}
        {showAddBassoRischio && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 32, borderRadius: 16, minWidth: 420, boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>
              <h2 style={{ color: 'var(--bg-dark)', marginBottom: 16, fontSize: 24 }}>Nuovo Investimento a Basso Rischio</h2>
              <input type="text" placeholder="Titolo" value={newBassoRischio.titolo} onChange={e=>setNewBassoRischio(n=>({ ...n, titolo: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <input type="number" placeholder="Valore (€)" value={newBassoRischio.valore} onChange={e=>setNewBassoRischio(n=>({ ...n, valore: e.target.value }))} style={{ width: '100%', marginBottom: 12, padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid var(--bg-medium)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={()=>setShowAddBassoRischio(false)} style={{ background: 'var(--bg-medium)', color: 'var(--bg-light)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Annulla</button>
                <button onClick={handleAddBassoRischio} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 8, padding: '10px 20px' }}>Aggiungi</button>
              </div>
            </div>
          </div>
        )}
        {showEditBassoRischio && editingBassoRischio && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(48, 57, 67, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-light)', padding: 28, borderRadius: 12, minWidth: 420 }}>
              <h3>Modifica Investimento a Basso Rischio</h3>
              <input value={editingBassoRischio.titolo || ''} onChange={e=>setEditingBassoRischio(prev=>({ ...prev, titolo: e.target.value }))} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
              <input type="number" value={editingBassoRischio.valore || 0} onChange={e=>setEditingBassoRischio(prev=>({ ...prev, valore: Number(e.target.value) }))} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <button onClick={()=>handleDeleteBassoRischio(editingBassoRischio.id)} style={{ padding: '8px 12px', background: '#ff6b6b', color: 'white' }}>Elimina</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={()=>setShowEditBassoRischio(false)} style={{ padding: '8px 12px' }}>Annulla</button>
                  <button onClick={handleUpdateBassoRischio} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
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
