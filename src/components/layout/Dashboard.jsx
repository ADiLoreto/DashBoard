import React, { useState, useContext } from 'react';
import BigTab from '../ui/BigTab';
import { useAuth } from '../../context/AuthContext';
import { FinanceContext } from '../../context/FinanceContext';
import Stipendio from '../sections/EntrateAttuali/Stipendio';
import AssetPatrimonio from '../sections/AssetPatrimonio/AssetPatrimonio';
import Uscite from '../sections/Uscite/Uscite';
import Liquidita from '../sections/Liquidita/Liquidita';
import HistoricalSavePreviewModal from '../ui/HistoricalSavePreviewModal';
import { expandDiffs } from '../../utils/diff';
import ProgettiExtra, { computeTotaleProgetti } from '../sections/ProgettiExtra/ProgettiExtra';
import LibertaGiorni from '../sections/LibertaGiorni/LibertaGiorni';
import { useFinancialCalculations } from '../../hooks/useFinancialCalculations';
import useCashflowGeneration from '../../hooks/useCashflowGeneration';
import { formatCurrency, getUserCurrency } from '../../utils/format';
import { loadHistory, saveSnapshot, clearDraft, loadDraft, clearHistory } from '../../utils/supabaseStorage';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Line, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const Dashboard = (props) => {
  const { activeSection, setActiveSection } = props;
  const { user } = useAuth();
  const userId = user?.id;
  const userUsername = user?.username;
  const { dirty, markSaved, state, loading, saveCurrentSnapshot, loadSnapshotHistory } = useContext(FinanceContext);

  // ========== STATI ==========
  const [tick, setTick] = useState(0);
  const [saveDate, setSaveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [today] = useState(() => new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [history, setHistory] = useState([]);
  const [userSettings, setUserSettings] = useState({});
  const [showDraftMsg, setShowDraftMsg] = useState(false);
  const [draftSummary, setDraftSummary] = useState([]);
  const [draftDebug, setDraftDebug] = useState(null);
  const [showDraftDetails, setShowDraftDetails] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDiffs, setPreviewDiffs] = useState([]);
  const [previewPayload, setPreviewPayload] = useState(null);
  const [previewOnSaved, setPreviewOnSaved] = useState(null);
  const [visibleSeries, setVisibleSeries] = useState({ tfr: true, conti: true, buoni: true, azioni: true, etf: true, crypto: true });
  const [visibleLiquidita, setVisibleLiquidita] = useState({ conti: true, carte: true, altro: true });

  const canonicalizeDate = (d) => d ? String(d).slice(0,10) : '';

  // stable stringify with sorted object keys to avoid false positives from key order
  const stableStringify = (v) => {
    const helper = (obj) => {
      if (obj === null) return 'null';
      if (obj === undefined) return 'undefined';
      if (Array.isArray(obj)) return `[${obj.map(i => helper(i)).join(',')}]`;
      if (typeof obj === 'object') {
        const keys = Object.keys(obj).sort();
        return `{${keys.map(k => `${JSON.stringify(k)}:${helper(obj[k])}`).join(',')}}`;
      }
      return JSON.stringify(obj);
    };
    try { return helper(v); } catch (e) { return String(v); }
  };

  const equalish = (a, b) => {
    // treat undefined/null and empty array as equivalent when empty
    const isEmptyArray = x => Array.isArray(x) && x.length === 0;
    if ((a === undefined || a === null) && isEmptyArray(b)) return true;
    if ((b === undefined || b === null) && isEmptyArray(a)) return true;
    // normal deep compare using stable stringify
    return stableStringify(a) === stableStringify(b);
  };

  const computeDiffs = (existingState = {}, proposedState = {}) => {
    // computeDiffs: compare section-by-section and return raw diffs (do NOT expand arrays here)
    const sections = ['entrate','uscite','patrimonio','liquidita'];
    const diffs = [];

    sections.forEach(section => {
      const cur = existingState[section];
      const prop = proposedState[section];
      if (JSON.stringify(cur) !== JSON.stringify(prop)) {
        // if object, list top-level keys; otherwise single field
        if (cur && typeof cur === 'object' && prop && typeof prop === 'object') {
          const keys = Array.from(new Set([...(Object.keys(cur||{})), ...(Object.keys(prop||{}))]));
          keys.forEach(k => {
            const c = cur ? cur[k] : undefined;
            const p = prop ? prop[k] : undefined;
            if (JSON.stringify(c) !== JSON.stringify(p)) {
              // Do NOT expand arrays here: return a raw diff per field
              diffs.push({ section, field: k, current: c === undefined ? null : c, proposed: p === undefined ? null : p });
            }
          });
        } else {
          diffs.push({ section, field: section, current: cur === undefined ? null : cur, proposed: prop === undefined ? null : prop });
        }
      }
    });
    return diffs;
  };

  const handleAttemptSave = async (snapshot, onSaved) => {
    if (!userId) {
      setSaveConfirm('Devi essere loggato per salvare');
      return;
    }

    const canonical = canonicalizeDate(snapshot?.date || snapshot?.state?.date || saveDate);
    const todayCanon = canonicalizeDate(today);
    
    // if saving into past, compute diffs vs existing history entry
    if (canonical && canonical < todayCanon) {
      try {
        const historyArr = await loadSnapshotHistory();
        const existing = historyArr.find(h => canonicalizeDate(h?.date || h?.state?.date || h) === canonical);
        const existingState = existing && existing.state ? existing.state : {};
        const proposedState = snapshot.state || {};
        const diffs = computeDiffs(existingState, proposedState);

        const expanded = expandDiffs(existingState, proposedState);

        if (expanded.length === 0) {
          const res = await saveCurrentSnapshot(canonical);
          if (res.ok) {
            setSaveConfirm(`Snapshot salvato: ${canonical}`);
            setTimeout(() => setSaveConfirm(''), 3000);
            setTick(t => t + 1);
          } else {
            setSaveConfirm(`Errore: ${res.error}`);
          }
          return;
        }

        setPreviewDiffs(expanded);
        setPreviewPayload(snapshot);
        setPreviewOnSaved(() => onSaved);
        setShowPreview(true);
      } catch (error) {
        console.error('Error loading history:', error);
        setSaveConfirm('Errore nel caricamento dello storico');
      }
    } else {
      // normal save
      const res = await saveCurrentSnapshot(canonical || saveDate);
      if (res.ok) {
        setSaveConfirm(`Snapshot salvato: ${canonical || saveDate}`);
        setTimeout(() => setSaveConfirm(''), 3000);
        setTick(t => t + 1);
        if (typeof onSaved === 'function') onSaved();
      } else {
        setSaveConfirm(`Errore: ${res.error}`);
      }
    }
  };

  const handleApplySelected = (selectedDiffs) => {
    // merge selected diffs into existing snapshot state and save
    const canonical = canonicalizeDate(previewPayload?.date || previewPayload?.state?.date || saveDate);
    const historyArr = loadHistory(userId) || [];
    const existing = historyArr.find(h => canonicalizeDate(h) === canonical);
    const existingState = existing && existing.state ? existing.state : {};
    const proposedState = previewPayload.state || {};

    const mergedState = applySelectedDiffs(existingState, proposedState, selectedDiffs);
    // ensure date present
    const snapshotToSave = { date: canonical, state: { ...(mergedState || {}), date: canonical } };
    saveSnapshot(snapshotToSave, userId);
  try { clearDraft(userId); setShowDraftMsg(false); console.log('DRAFT CLEARED after applySelected'); } catch (e) {}
  setShowPreview(false);
    setPreviewDiffs([]);
    setPreviewPayload(null);
    setSaveConfirm(`Snapshot storico (parziale) salvato: ${canonical}`);
    setTimeout(() => setSaveConfirm(''), 3000);
    setTick(t => t + 1);
    // call original onSaved callback if present
    if (typeof previewOnSaved === 'function') {
      try { previewOnSaved(); } catch (e) { /* ignore */ }
    }
  };

  // placeholder donut data (visual only)
  // ...existing code...

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleResetHistory = () => {
    if (!userId) return;
    clearHistory(userId);
    // force re-render by bumping tick
  setTick(t => t + 1);
    setShowDraftMsg(false);
  };

  // re-render when user settings update (currency change)
  React.useEffect(() => {
    const h = () => setTick(t => t + 1);
    window.addEventListener('user_settings_changed', h);
    return () => window.removeEventListener('user_settings_changed', h);
  }, []);

  // reload user settings whenever userId or tick changes
  React.useEffect(() => {
    try {
      const keyFor = (username) => (username ? `user_settings_${username}` : 'user_settings');
      const raw = localStorage.getItem(keyFor(userUsername));
      setUserSettings(raw ? JSON.parse(raw) : {});
    } catch (e) {
      setUserSettings({});
    }
  }, [userUsername, tick]);

  // reload history when userId or tick changes
  React.useEffect(() => {
    if (!userId) return;
    
    const loadHistoryData = async () => {
      try {
        const hist = await loadHistory(userId);
        setHistory(hist || []);
      } catch (e) {
        console.error('Error loading history:', e);
        setHistory([]);
      }
    };
    
    loadHistoryData();
    
    try {
      const draft = loadDraft(userId);
      if (!draft) {
        setShowDraftMsg(false);
        setDraftSummary([]);
      } else {
        // build payload state as save would do
        const payloadState = { ...(state || {}), ...(draft || {}) };
        // compare payloadState with current state: if identical -> nothing to save
        let hasChanges = false;
        try {
          hasChanges = JSON.stringify(payloadState) !== JSON.stringify(state || {});
        } catch (e) {
          hasChanges = true; // fallback: assume changes
        }
        if (!hasChanges) {
          // no meaningful changes: clear lingering draft and hide prompt
          try { clearDraft(userId); } catch (e) {}
          setShowDraftMsg(false);
          setDraftSummary([]);
        } else {
          // compute a small human-readable summary of top-level sections changed
          const sections = ['entrate','uscite','patrimonio','liquidita'];
          const summary = [];
          sections.forEach(sec => {
            try {
              const a = payloadState[sec] || {};
              const b = state?.[sec] || {};
              if (!equalish(a, b)) {
                // list changed subkeys if present
                const keysA = Object.keys(a || {});
                const keysB = Object.keys(b || {});
                const allKeys = Array.from(new Set([...(keysA), ...(keysB)]));
                const changed = [];
                allKeys.forEach(k => {
                  try {
                    const va = a?.[k];
                    const vb = b?.[k];
                    if (!equalish(va, vb)) {
                      // for arrays, note length difference
                      if (Array.isArray(va) || Array.isArray(vb)) {
                        const la = Array.isArray(va) ? va.length : 0;
                        const lb = Array.isArray(vb) ? vb.length : 0;
                        changed.push(`${k} (array len ${la} → ${lb})`);
                      } else {
                        changed.push(k);
                      }
                    }
                  } catch (e) {
                    changed.push(k);
                  }
                });
                if (changed.length > 0) {
                  summary.push(`${sec}: ${changed.join(', ')}`);
                }

                // Detailed debug: if patrimonio differs and there are real changed keys, keep detailed objects for inspection in UI
                try {
                  if (sec === 'patrimonio' && changed.length > 0) {
                    setDraftDebug({ payload: a, state: b });
                  }
                } catch (e) { /* ignore debug errors */ }
              }
            } catch (e) {
              summary.push(sec);
            }
          });
          if (summary.length > 0) {
            setDraftSummary(summary);
            setShowDraftMsg(true);
          } else {
            // no meaningful field-level changes -> clear lingering draft
            try { clearDraft(userId); } catch (e) {}
            setShowDraftMsg(false);
            setDraftSummary([]);
          }
        }
      }
    } catch (e) {
      setShowDraftMsg(false);
      setDraftSummary([]);
    }
  }, [userId, tick]);

  // Calcoli dinamici dai dati nel context
  const { totaleEntrate, totalePatrimonio, totaleLiquidita } = useFinancialCalculations();

  // start background generation of recurring cashflows (runs at mount and every hour)
  // expose forceGenerate for manual/testing trigger
  const { forceGenerate } = useCashflowGeneration();

  const currency = getUserCurrency(userId);
  const totaleProgetti = computeTotaleProgetti(state.progettiExtra || []);

  // compute totaleUscite from state so Dashboard tab matches Uscite section
  const totaleUscite = (
  (Array.isArray(state?.uscite?.fisse) ? state.uscite.fisse.reduce((sum, u) => sum + (u.importo || 0), 0) : 0)
  ) + (
  (Array.isArray(state?.uscite?.variabili) ? state.uscite.variabili.reduce((sum, u) => sum + (u.importo || 0), 0) : 0)
  );

   const totals = {
     'Entrate Attuali': { raw: totaleEntrate, label: formatCurrency(totaleEntrate, currency) },
     'Asset Patrimonio': { raw: totalePatrimonio, label: formatCurrency(totalePatrimonio, currency) },
     'Liquidità': { raw: totaleLiquidita, label: formatCurrency(totaleLiquidita, currency) },
    'Uscite': { raw: totaleUscite, label: formatCurrency(totaleUscite, currency) },
     'Progetti Extra': { raw: totaleProgetti, label: formatCurrency(totaleProgetti, currency) },
   };

  // Icone esempio (puoi usare emoji o icone da una libreria)
  const icons = {
    'Entrate Attuali': '💰',
    'Asset Patrimonio': '🏦',
    'Liquidità': '💳',
  'Uscite': '💸',
  'Progetti Extra': '🗂️',
  };

  // build a point (entrate/uscite) from a saved snapshot object
  const buildTotalsFromSnapshot = (snap) => {
    const st = snap && snap.state ? snap.state : snap || {};
    const date = snap?.date || st?.date || '';

    const entrate =
      (st?.entrate?.stipendio?.netto || 0) +
  ((Array.isArray(st?.entrate?.bonus) ? st.entrate.bonus.reduce((s, b) => s + (b.importo || 0), 0) : 0) +
  (Array.isArray(st?.entrate?.altreEntrate) ? st.entrate.altreEntrate.reduce((s, e) => s + (e.importo || 0), 0) : 0));

    const uscite =
  ((Array.isArray(st?.uscite?.fisse) ? st.uscite.fisse.reduce((s, u) => s + (u.importo || 0), 0) : 0) +
  (Array.isArray(st?.uscite?.variabili) ? st.uscite.variabili.reduce((s, u) => s + (u.importo || 0), 0) : 0));

    return { date, entrate, uscite };
  };

  // build patrimonio breakdown from snapshot
  const buildPatrimonioFromSnapshot = (snap) => {
    const st = snap && snap.state ? snap.state : snap || {};
    const date = snap?.date || st?.date || '';

    const tfr = st?.patrimonio?.tfr || 0;
    const conti = (st?.patrimonio?.contiDeposito || []).reduce((s, c) => s + (c.saldo || 0), 0);
    const buoni = (st?.patrimonio?.buoniTitoli || []).reduce((s, b) => s + (b.importo || 0), 0);
  const azioni = (st?.patrimonio?.investimenti?.azioni || []).reduce((s, a) => s + (a.valore || 0), 0);
  const etf = (st?.patrimonio?.investimenti?.etf || []).reduce((s, e) => s + (e.valore || 0), 0);
  const crypto = (st?.patrimonio?.investimenti?.crypto || []).reduce((s, c) => s + (c.valore || 0), 0);

  const patrimonio = tfr + conti + buoni + azioni + etf + crypto;
  return { date, tfr, conti, buoni, azioni, etf, crypto, patrimonio };
  };

  // build liquidita breakdown from snapshot using canonical fields only
  const buildLiquiditaFromSnapshot = (snap) => {
    const st = snap && snap.state ? snap.state : snap || {};
    const date = snap?.date || st?.date || '';
    const liq = st.liquidita || {};

    const conti = (liq.contiCorrenti || []).reduce((s, c) => s + Number(c?.saldo ?? 0), 0);
    const carte = (liq.cartePrepagate || []).reduce((s, c) => s + Number(c?.saldo ?? 0), 0);
    const altro = Number(liq.contante ?? 0);

    return { date, conti, carte, altro, totale: conti + carte + altro };
  };

  const chartData = React.useMemo(() => {
  const points = (history || []).map(h => buildTotalsFromSnapshot(h));

    const currEntrate =
      (state?.entrate?.stipendio?.netto || 0) +
  ((Array.isArray(state?.entrate?.bonus) ? state.entrate.bonus.reduce((s, b) => s + (b.importo || 0), 0) : 0) +
  (Array.isArray(state?.entrate?.altreEntrate) ? state.entrate.altreEntrate.reduce((s, e) => s + (e.importo || 0), 0) : 0));

    const currUscite =
  ((Array.isArray(state?.uscite?.fisse) ? state.uscite.fisse.reduce((s, u) => s + (u.importo || 0), 0) : 0) +
  (Array.isArray(state?.uscite?.variabili) ? state.uscite.variabili.reduce((s, u) => s + (u.importo || 0), 0) : 0));

    // canonicalize saveDate to YYYY-MM-DD and avoid duplicate points for same day
    const canonicalSaveDate = saveDate ? String(saveDate).slice(0, 10) : '';
    if (canonicalSaveDate) {
      const idx = points.findIndex(p => String(p?.date || '').slice(0, 10) === canonicalSaveDate);
      if (idx !== -1) {
        points[idx] = { ...points[idx], entrate: currEntrate, uscite: currUscite, date: canonicalSaveDate };
      } else {
        points.push({ date: canonicalSaveDate, entrate: currEntrate, uscite: currUscite });
      }
    } else {
      points.push({ date: saveDate, entrate: currEntrate, uscite: currUscite });
    }
    points.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    // filter by dateRange
    const filtered = points.filter(p => {
      const d = p.date || '';
      if (dateRange.start && d < dateRange.start) return false;
      if (dateRange.end && d > dateRange.end) return false;
      return true;
    });
    return filtered.map(p => ({ ...p, date: p.date }));
  }, [history, state, saveDate, dateRange]);

  // current totals for percentages (used in the side bracket)
  const currEntrate = (
    (state?.entrate?.stipendio?.netto || 0) +
  ((Array.isArray(state?.entrate?.bonus) ? state.entrate.bonus.reduce((s, b) => s + (b.importo || 0), 0) : 0) +
  (Array.isArray(state?.entrate?.altreEntrate) ? state.entrate.altreEntrate.reduce((s, e) => s + (e.importo || 0), 0) : 0))
  );
  const currUscite = (
  ((Array.isArray(state?.uscite?.fisse) ? state.uscite.fisse.reduce((s, u) => s + (u.importo || 0), 0) : 0) +
  (Array.isArray(state?.uscite?.variabili) ? state.uscite.variabili.reduce((s, u) => s + (u.importo || 0), 0) : 0))
  );
  // progetto sums: separate entrate (isCosto=false) and uscite (isCosto=true)
  const progettiList = state.progettiExtra || [];
  const currProgettiEntrate = progettiList.reduce((s, p) => s + (p && !p.isCosto ? (p.valore !== undefined ? p.valore : (p.importo || 0)) : 0), 0);
  const currProgettiUscite = progettiList.reduce((s, p) => s + (p && p.isCosto ? (p.valore !== undefined ? p.valore : (p.importo || 0)) : 0), 0);

  // Donut chart data (used in the inline responsive donuts)
  const leftDonutData = [{ name: 'Entrate', value: currEntrate }, { name: 'Uscite', value: currUscite }];
  const leftNonZero = leftDonutData.filter(d => (d.value || 0) > 0).length;
  const leftPaddingAngle = leftNonZero <= 1 ? 0 : 0.6;

  const rightDonutData = [{ name: 'Entrate Progetti', value: currProgettiEntrate }, { name: 'Uscite Progetti', value: currProgettiUscite }];
  const rightNonZero = rightDonutData.filter(d => (d.value || 0) > 0).length;
  const rightPaddingAngle = rightNonZero <= 1 ? 0 : 0.6;

  const percUscite = currEntrate ? (currUscite / currEntrate) * 100 : 0;
  const percRemain = Math.max(0, 100 - percUscite);

  // valori per le "candele"
  const netEntrateValue = currEntrate - currUscite;
  const totaleWealth = (totalePatrimonio || 0) + (totaleLiquidita || 0) + (totaleProgetti || 0);
  const maxCandle = Math.max(Math.abs(netEntrateValue), Math.abs(totaleWealth), 1); // per scala Y minima sensata

  // helper: render a compact "goal bar" using inline SVG.
  // - current: valore attuale (number, può essere negativo)
  // - goal: valore obiettivo (number, >=0)
  // - color: colore per la porzione "attuale" (es. verde/rosso/blue)
  const renderGoalBar = (current, goal, color = '#27ae60', height = 96, width = 36) => {
    const max = Math.max(Math.abs(current), Math.abs(goal), 1);
    // map value to pixel height
    const scale = v => Math.round((Math.abs(v) / max) * height);
    const goalH = scale(goal);
    const currH = scale(current);
    const centerY = Math.round(height); // bottom baseline
    // if current negative -> draw colored downwards below baseline
    const currY = current >= 0 ? (centerY - currH) : centerY;
    const goalY = centerY - goalH;

    // small labels formatting
    const fmt = v => formatCurrency(v || 0, currency);

    return (
      <div className="goal-bar" style={{ width: width }}>
        <svg width={width} height={height} role="img" aria-hidden style={{ display: 'block', flex: `0 0 ${height}px` }}>
          {/* grey goal bar (background) */}
          <rect className="goal-rect" x={Math.round(width * 0.15)} y={goalY} width={Math.round(width * 0.7)} height={goalH} rx="6" />
          {/* colored current bar (drawn on top; if negative draw below baseline) */}
          <rect className="current-rect" x={Math.round(width * 0.25)} y={currY} width={Math.round(width * 0.5)} height={currH} fill={current >= 0 ? color : '#ff6b6b'} rx="6" />
          {/* baseline */}
          <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>
        <div className="goal-bar-labels" style={{ width: '100%' }}>
          <div className="goal-bar-current" style={{ fontWeight: 700, color: 'var(--bg-light)', lineHeight: 1 }}>{fmt(current)}</div>
          <div className="goal-bar-goal" style={{ fontSize: 15 }}>{fmt(goal)}</div>
        </div>
      </div>
    );
  };

  const chartDataPatrimonio = React.useMemo(() => {
  const points = (history || []).map(h => buildPatrimonioFromSnapshot(h));

    const currTfr = state?.patrimonio?.tfr || 0;
    const currConti = (state?.patrimonio?.contiDeposito || []).reduce((s, c) => s + (c.saldo || 0), 0);
    const currBuoni = (state?.patrimonio?.buoniTitoli || []).reduce((s, b) => s + (b.importo || 0), 0);
  const currAzioni = (state?.patrimonio?.investimenti?.azioni || []).reduce((s, a) => s + (a.valore || 0), 0);
  const currEtf = (state?.patrimonio?.investimenti?.etf || []).reduce((s, e) => s + (e.valore || 0), 0);
  const currCrypto = (state?.patrimonio?.investimenti?.crypto || []).reduce((s, c) => s + (c.valore || 0), 0);
  const currOro = (state?.patrimonio?.investimenti?.oro || []).reduce((s, o) => s + (o.valore || 0), 0);
  const currPatrimonio = currTfr + currConti + currBuoni + currAzioni + currEtf + currCrypto + currOro;

    const canonicalSaveDate = saveDate ? String(saveDate).slice(0, 10) : '';
    if (canonicalSaveDate) {
      const idx = points.findIndex(p => String(p?.date || '').slice(0, 10) === canonicalSaveDate);
      if (idx !== -1) {
        points[idx] = { ...points[idx], tfr: currTfr, conti: currConti, buoni: currBuoni, azioni: currAzioni, etf: currEtf, crypto: currCrypto, oro: currOro, patrimonio: currPatrimonio, date: canonicalSaveDate };
      } else {
        points.push({ date: canonicalSaveDate, tfr: currTfr, conti: currConti, buoni: currBuoni, azioni: currAzioni, etf: currEtf, crypto: currCrypto, oro: currOro, patrimonio: currPatrimonio });
      }
    } else {
      points.push({ date: saveDate, tfr: currTfr, conti: currConti, buoni: currBuoni, azioni: currAzioni, etf: currEtf, crypto: currCrypto, oro: currOro, patrimonio: currPatrimonio });
    }
    points.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const filtered = points.filter(p => {
      const d = p.date || '';
      if (dateRange.start && d < dateRange.start) return false;
      if (dateRange.end && d > dateRange.end) return false;
      return true;
    });
    return filtered.map(p => ({ ...p, date: p.date }));
  }, [history, state, dateRange, saveDate]);

  // chart data for Liquidità (uses canonical liquidita shape only)
  const chartDataLiquidita = React.useMemo(() => {
  const points = (history || []).map(h => buildLiquiditaFromSnapshot(h));

    // current state values (canonical)
    const currL = state?.liquidita || {};
    const currConti = (currL.contiCorrenti || []).reduce((s, c) => s + Number(c?.saldo ?? 0), 0);
    const currCarte = (currL.cartePrepagate || []).reduce((s, c) => s + Number(c?.saldo ?? 0), 0);
    const currAltro = Number(currL.contante ?? 0);
    const currTot = currConti + currCarte + currAltro;

    const canonicalSaveDate = saveDate ? String(saveDate).slice(0, 10) : '';
    if (canonicalSaveDate) {
      const idx = points.findIndex(p => String(p?.date || '').slice(0, 10) === canonicalSaveDate);
      if (idx !== -1) {
        points[idx] = { ...points[idx], conti: currConti, carte: currCarte, altro: currAltro, totale: currTot, date: canonicalSaveDate };
      } else {
        points.push({ date: canonicalSaveDate, conti: currConti, carte: currCarte, altro: currAltro, totale: currTot });
      }
    } else {
      // append current state as last point
      points.push({ date: currL.date || new Date().toISOString().slice(0,10), conti: currConti, carte: currCarte, altro: currAltro, totale: currTot });
    }
    points.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const filtered = points.filter(p => {
      const d = p.date || '';
      if (dateRange.start && d < dateRange.start) return false;
      if (dateRange.end && d > dateRange.end) return false;
      return true;
    });
    return filtered.map(p => ({ ...p, date: p.date }));
  }, [history, state, dateRange, saveDate]);

  return (
    <main className="main-content" style={{ position: 'relative' }}>
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0 }}>FINANCIAL STATUS DASHBOARD</h1>
        {/* DEBUG: manual trigger per test automatic cashflow */}
        <div style={{ marginLeft: 12 }}>
          <button
            type="button"
            onClick={() => { if (typeof forceGenerate === 'function') forceGenerate(); }}
            title="Forza generazione cashflow (debug)"
            style={{ marginLeft: 12, background: 'transparent', color: '#06d2fa', border: '1px solid rgba(6,210,250,0.12)', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
          >
            Forza generazione cashflow
          </button>
        </div>
        <div className="topbar-dates">
          <div className="date-field">
            <label htmlFor="start-date">Start Date</label>
            <input
              type="date"
              id="start-date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="date-field">
            <label htmlFor="end-date">End Date</label>
            <input
              type="date"
              id="end-date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              max={today}
            />
          </div>

          <div className="date-field">
            <label htmlFor="save-date" style={{ marginRight: '288px' }}>Save Date</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="date"
                id="save-date"
                name="saveDate"
                value={saveDate}
                onChange={e => setSaveDate(e.target.value)}
                max={today}
              />
              <button className="today-btn" type="button" onClick={() => setSaveDate(today)}>Oggi</button>
              <button
                type="button"
                onClick={() => {
                    const draft = loadDraft(userId);
                    // costruisci uno stato completo partendo dallo state corrente, sovrascrivendo con il draft se presente
                    const payloadState = { ...(state || {}), ...(draft || {}) };
                    const snapshot = { date: saveDate, state: payloadState };
                    handleAttemptSave(snapshot, () => {
                      if (draft) clearDraft(userId);
                      setShowDraftMsg(false);
                      setSaveConfirm(`Snapshot salvato: ${saveDate}`);
                      setTimeout(() => setSaveConfirm(''), 3000);
                      setTick(t => t + 1);
                    });
                  }}
                style={{ marginLeft: 8, background: '#06d2fa', color: '#012', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
              >
                Salva ora
              </button>
              <button style={{ marginLeft: 12, background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }} onClick={handleResetHistory}>Reset storico</button>
            </div>
          </div>
        </div>
      </div>

  {showDraftMsg && (
        <div style={{
          background: 'var(--accent-cyan)',
          color: 'var(--bg-dark)',
          padding: '18px 32px',
          borderRadius: 16,
          fontSize: 22,
          fontWeight: 'bold',
          textAlign: 'center',
          margin: '24px auto',
          maxWidth: 600
        }}>
          Hai delle modifiche non salvate. Vuoi associarle a una data e salvarle?
          {draftSummary && draftSummary.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 'normal' }}>
              <div style={{ marginBottom: 6 }}>Modifiche rilevate:</div>
              <ul style={{ margin: 0, paddingLeft: 18, textAlign: 'left' }}>
                {draftSummary.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {draftDebug && (
            <div style={{ marginTop: 10, textAlign: 'left' }}>
              <button
                onClick={() => setShowDraftDetails(d => !d)}
                style={{ marginTop: 8, background: 'transparent', border: '1px dashed rgba(0,0,0,0.1)', color: 'inherit', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
              >
                {showDraftDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
              </button>
              {showDraftDetails && draftDebug && (
                <pre style={{ marginTop: 8, maxHeight: 220, overflow: 'auto', background: 'rgba(0,0,0,0.04)', padding: 12, borderRadius: 6, textAlign: 'left' }}>
                  {JSON.stringify(draftDebug, null, 2)}
                </pre>
              )}
            </div>
          )}
                  <button
                    style={{
                      marginLeft: 24,
                      background: 'var(--bg-dark)',
                      color: 'var(--accent-cyan)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 20px',
                      fontWeight: 'bold',
                      fontSize: 18,
                      cursor: 'pointer'
                    }}
                        onClick={() => {
                          const draft = loadDraft(userId);
                          const payloadState = { ...(state || {}), ...(draft || {}) };
                          const snapshot = { date: saveDate, state: payloadState };
                          handleAttemptSave(snapshot, () => {
                            if (draft) clearDraft(userId);
                            setShowDraftMsg(false);
                            setSaveConfirm(`Snapshot salvato: ${saveDate}`);
                            setTimeout(() => setSaveConfirm(''), 3000);
                            setTick(t => t + 1);
                          });
                        }}
                  >
            Salva ora
          </button>
        </div>
      )}
    {/* --- big tabs: moved up so they appear above charts --- */}
    {activeSection === null && (
      <div
        className="horizontal-container"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          margin: '12px 0',
        }}
      >
        {Object.keys(totals).map(section => (
          <BigTab
            key={section}
            title={section}
            value={typeof totals[section] === 'object' ? totals[section].raw : totals[section]}
            icon={icons[section]}
            allowEdit={false}
            onClick={() => setActiveSection(section)}
          />
        ))}
      </div>
    )}
  {/* --- overview with inline responsive donuts --- */}
  {activeSection === null && chartData && chartData.length > 0 && (
  <div style={{ width: '100%', maxWidth: 1720, margin: '12px auto 12px' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' }}>

        {/* left donut + goal-bar (stacked visual) */}
  <div className="donut-item" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: 140, transform: `translateX(var(--donut-left-offset, 8px))` }}>
          <div className="donut-card" role="presentation" aria-hidden style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leftDonutData} dataKey="value" cx="50%" cy="50%" innerRadius="50%" outerRadius="90%" paddingAngle={leftPaddingAngle} startAngle={90} endAngle={-270} isAnimationActive animationDuration={900} stroke="none">
                  <Cell key="entrate" fill="#16a085" stroke="none" />
                  <Cell key="uscite" fill="#ff6b6b" stroke="none" />
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val, currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* goal/comparison bar: current (green/red) vs goal (grey) */}
          <div className="goal-block" style={{ marginTop: 'var(--goal-block-offset, 18px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className="goal-wrapper" style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderGoalBar(netEntrateValue, Number(userSettings?.monthlyIncomeGoal ?? userSettings?.entrateObiettivo ?? 0), netEntrateValue >= 0 ? '#27ae60' : '#ff6b6b', 96, 40)}
            </div>
            <div className="goal-label" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Entrate vs obiettivo</div>
          </div>
        </div>

  {/* center gray box that contains title + chart */}
  <div style={{ flex: 1, minWidth: 0, padding: 8, background: 'var(--bg-medium)', borderRadius: 8, maxWidth: 1100, margin: '0 auto' }}>
          <h3 style={{ color: 'var(--bg-light)', margin: '6px 0 12px' }}>Entrate vs Uscite (storico)</h3>
          <div style={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
            <div style={{ flex: 1, minWidth: 0, height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 32, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis width={80} tickFormatter={v => formatCurrency(v, currency)} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                  <Legend />
                  <Area type="monotone" dataKey="entrate" stroke="#06d2fa" fill="rgba(6,210,250,0.12)" name="Entrate" />
                  <Area type="monotone" dataKey="uscite" stroke="#ff6b6b" fill="rgba(255,107,107,0.08)" name="Uscite" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: 4, height: 120, borderRadius: 8, borderLeft: '4px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -8, top: `${Math.min(100, Math.max(0, 100 - percRemain))}%`, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#06d2fa', boxShadow: '0 0 6px rgba(6,210,250,0.12)' }} />
                    <div style={{ color: 'var(--bg-light)', fontWeight: 700 }}>{percRemain.toFixed(1)}%</div>
                  </div>
                  <div style={{ position: 'absolute', left: -8, top: `${Math.min(100, Math.max(0, 100 - percUscite))}%`, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ff6b6b', boxShadow: '0 0 6px rgba(255,107,107,0.18)' }} />
                    <div style={{ color: 'var(--bg-light)', fontWeight: 700 }}>{percUscite.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Uscite vs residuo</div>
            </div>
          </div>
        </div>

    {/* right donut + goal-bar (stacked visual) */}
  <div className="donut-item" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: 140, transform: `translateX(var(--donut-right-offset, -8px))` }}>
          <div className="donut-card" role="presentation" aria-hidden style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rightDonutData} dataKey="value" cx="50%" cy="50%" innerRadius="50%" outerRadius="90%" paddingAngle={rightPaddingAngle} startAngle={90} endAngle={-270} isAnimationActive animationDuration={900} stroke="none">
                  <Cell key="entrateProj" fill="#16a085" stroke="none" />
                  <Cell key="usciteProj" fill="#ff6b6b" stroke="none" />
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val, currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* goal/comparison bar: patrimonio attuale (blue) vs patrimonio obiettivo (grey) */}
          <div className="goal-block" style={{ marginTop: 'var(--goal-block-offset, 18px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className="goal-wrapper" style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderGoalBar(totaleWealth, Number(userSettings?.patrimonioGoal ?? userSettings?.patrimonioObiettivo ?? 0), '#06d2fa', 96, 40)}
            </div>
            <div className="goal-label" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Patrimonio vs obiettivo</div>
          </div>
        </div>

      </div>
    </div>
  )}

  {activeSection === null && chartDataPatrimonio && chartDataPatrimonio.length > 0 && (
    <div style={{ width: '100%', maxWidth: 1100, margin: '12px auto 24px', padding: 12, background: 'var(--bg-medium)', borderRadius: 12 }}>
      <h3 style={{ color: 'var(--bg-light)', margin: '6px 0 12px' }}>Patrimonio (totale asset)</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={chartDataPatrimonio} margin={{ top: 8, right: 24, left: 64, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis width={80} tickFormatter={v => formatCurrency(v, currency)} tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip formatter={(val) => formatCurrency(val, currency)} />
            <Legend />
            {visibleSeries.tfr && <Area type="monotone" dataKey="tfr" stroke="#f39c12" fill="rgba(243,156,18,0.08)" stackId="patrimonio" name="TFR" />}
            {visibleSeries.conti && <Area type="monotone" dataKey="conti" stroke="#27ae60" fill="rgba(39,174,96,0.08)" stackId="patrimonio" name="Conti deposito" />}
            {visibleSeries.buoni && <Area type="monotone" dataKey="buoni" stroke="#2980b9" fill="rgba(41,128,185,0.06)" stackId="patrimonio" name="Buoni/Titoli" />}
            {visibleSeries.azioni && <Area type="monotone" dataKey="azioni" stroke="#8e44ad" fill="rgba(142,68,173,0.06)" stackId="patrimonio" name="Azioni" />}
            {visibleSeries.etf && <Area type="monotone" dataKey="etf" stroke="#16a085" fill="rgba(22,160,133,0.06)" stackId="patrimonio" name="ETF" />}
            {visibleSeries.crypto && <Area type="monotone" dataKey="crypto" stroke="#d35400" fill="rgba(211,84,0,0.06)" stackId="patrimonio" name="Crypto" />}
            {/* total line intentionally removed; chart shows component series */}
          </AreaChart>
        </ResponsiveContainer>
        </div>
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: 'var(--bg-light)', fontWeight: 700 }}>Mostra serie</div>
          {[
            { key: 'tfr', label: 'TFR', color: '#f39c12' },
            { key: 'conti', label: 'Conti deposito', color: '#27ae60' },
            { key: 'buoni', label: 'Buoni/Titoli', color: '#2980b9' },
            { key: 'azioni', label: 'Azioni', color: '#8e44ad' },
            { key: 'etf', label: 'ETF', color: '#16a085' },
            { key: 'crypto', label: 'Crypto', color: '#d35400' },
          ].map(s => {
            const on = !!visibleSeries[s.key];
            return (
              <div
                key={s.key}
                role="button"
                tabIndex={0}
                onClick={() => setVisibleSeries(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVisibleSeries(prev => ({ ...prev, [s.key]: !prev[s.key] })); } }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: on ? 'var(--bg-light)' : 'var(--text-muted)', opacity: on ? 1 : 0.5 }}
              >
                <span style={{ width: 12, height: 12, background: s.color, borderRadius: 4, display: 'inline-block', opacity: on ? 1 : 0.35, boxShadow: on ? '0 0 6px rgba(0,0,0,0.12)' : 'none' }} />
                <span style={{ fontSize: 13 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )}

  {/* Liquidità chart (same layout/functionality as Patrimonio) */}
  {activeSection === null && chartDataLiquidita && chartDataLiquidita.length > 0 && (
    <div style={{ width: '100%', maxWidth: 1100, margin: '12px auto 24px', padding: 12, background: 'var(--bg-medium)', borderRadius: 12 }}>
      <h3 style={{ color: 'var(--bg-light)', margin: '6px 0 12px' }}>Liquidità (breakdown)</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={chartDataLiquidita} margin={{ top: 8, right: 24, left: 64, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis width={80} tickFormatter={v => formatCurrency(v, currency)} tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip formatter={(val) => formatCurrency(val, currency)} />
            <Legend />
            {visibleLiquidita.conti && <Area type="monotone" dataKey="conti" stroke="#27ae60" fill="rgba(39,174,96,0.08)" stackId="liquidita" name="Conti" />}
            {visibleLiquidita.carte && <Area type="monotone" dataKey="carte" stroke="#2980b9" fill="rgba(41,128,185,0.06)" stackId="liquidita" name="Carte" />}
            {visibleLiquidita.altro && <Area type="monotone" dataKey="altro" stroke="#8e44ad" fill="rgba(142,68,173,0.06)" stackId="liquidita" name="Altro" />}
            {/* overlay total line to display overall liquidity trend */}
            <Line type="monotone" dataKey="totale" stroke="#06d2fa" strokeWidth={2} dot={false} name="Totale liquidità" />
          </AreaChart>
        </ResponsiveContainer>
        </div>
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: 'var(--bg-light)', fontWeight: 700 }}>Mostra serie</div>
          {[{ key: 'conti', label: 'Conti', color: '#27ae60' }, { key: 'carte', label: 'Carte', color: '#2980b9' }, { key: 'altro', label: 'Altro', color: '#8e44ad' }].map(s => {
            const on = !!visibleLiquidita[s.key];
            return (
              <div key={s.key} role="button" tabIndex={0} onClick={() => setVisibleLiquidita(prev => ({ ...prev, [s.key]: !prev[s.key] }))} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVisibleLiquidita(prev => ({ ...prev, [s.key]: !prev[s.key] })); } }} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: on ? 'var(--bg-light)' : 'var(--text-muted)', opacity: on ? 1 : 0.5 }}>
                <span style={{ width: 12, height: 12, background: s.color, borderRadius: 4, display: 'inline-block', opacity: on ? 1 : 0.35, boxShadow: on ? '0 0 6px rgba(0,0,0,0.12)' : 'none' }} />
                <span style={{ fontSize: 13 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )}

  {activeSection !== null && (
    <div style={{ padding: 32 }}>
      {activeSection === 'Entrate Attuali' && <Stipendio dateRange={dateRange} />}
      {activeSection === 'Asset Patrimonio' && <AssetPatrimonio dateRange={dateRange} />}
      {activeSection === 'Liquidità' && <Liquidita dateRange={dateRange} />}
      {activeSection === 'Uscite' && <Uscite dateRange={dateRange} />}
      {activeSection === 'Progetti Extra' && <ProgettiExtra dateRange={dateRange} />}
      {activeSection === 'Libertà Giorni' && <LibertaGiorni />}
      {/* ...altre sezioni... */}
    </div>
  )}

  {saveConfirm && (
    <div style={{ width: '100%', maxWidth: 1100, margin: '12px auto', padding: 12, background: 'var(--accent-cyan)', color: 'var(--bg-dark)', borderRadius: 12, textAlign: 'center', fontWeight: '700' }}>
      {saveConfirm}
    </div>
  )}
  <HistoricalSavePreviewModal
    visible={showPreview}
    diffs={previewDiffs}
    saveDate={canonicalizeDate(previewPayload?.date || previewPayload?.state?.date || saveDate)}
    onCancel={() => { setShowPreview(false); setPreviewPayload(null); setPreviewDiffs([]); setPreviewOnSaved(null); }}
    onConfirm={(selectedDiffs) => {
      // selectedDiffs is provided by the modal; apply them and save selectively
      handleApplySelected(selectedDiffs || []);
    }}
  />
      {/* floating save button when there are unsaved changes */}
      {dirty && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 60 }}>
          <button onClick={() => {
            const draft = loadDraft(username);
            const snapshot = draft ? { ...draft, date: saveDate } : { date: saveDate, state: state };
            handleAttemptSave(snapshot, () => {
              if (draft) clearDraft(username);
              markSaved();
              setShowDraftMsg(false);
              setSaveConfirm(`Snapshot salvato: ${saveDate}`);
              setTimeout(() => setSaveConfirm(''), 3000);
              setTick(t => t + 1);
            });
          }} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: '700', cursor: 'pointer' }}>Salva modifiche</button>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
