import React, { useState, useContext } from 'react';
import BigTab from '../ui/BigTab';
import { loadHistory, loadDraft, saveSnapshot, clearDraft, clearHistory } from '../../utils/storage';
import { AuthContext } from '../../context/AuthContext';
import Stipendio from '../sections/EntrateAttuali/Stipendio';
import AssetPatrimonio from '../sections/AssetPatrimonio/AssetPatrimonio';
import Uscite from '../sections/Uscite/Uscite';
import Liquidita from '../sections/Liquidita/Liquidita';
import ProgettiExtra from '../sections/ProgettiExtra/ProgettiExtra';
import { useFinancialCalculations } from '../../hooks/useFinancialCalculations';
import { FinanceContext } from '../../context/FinanceContext';
import { formatCurrency, getUserCurrency } from '../../utils/format';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

const Dashboard = (props) => {
  const { activeSection, setActiveSection } = props;
  const { user } = useContext(AuthContext);
  const username = user?.username;
  const { dirty, markSaved, state } = useContext(FinanceContext);
  const [, setTick] = useState(0);
  const [showDraftMsg, setShowDraftMsg] = useState(!!loadDraft(username));
  const history = loadHistory(username);
  const dateOptions = (history || []).map(h => h.date).filter(Boolean).sort();
  const defaultStart = dateOptions.length ? dateOptions[0] : new Date().toISOString().slice(0, 10);
  const [dateRange, setDateRange] = useState({
    start: defaultStart,
    end: new Date().toISOString().slice(0, 10)
  });
  const [saveDate, setSaveDate] = useState(new Date().toISOString().slice(0, 10));
  const today = new Date().toISOString().slice(0, 10);
  const [saveConfirm, setSaveConfirm] = useState('');

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleResetHistory = () => {
    if (!username) return;
    clearHistory(username);
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

  // Calcoli dinamici dai dati nel context
  const { totaleEntrate, totalePatrimonio, totaleLiquidita } = useFinancialCalculations();

  const currency = getUserCurrency(username);
  const totaleProgetti = (state.progettiExtra || []).reduce((s, p) => s + (p.valore || 0), 0);

  const totals = {
    'Entrate Attuali': { raw: totaleEntrate, label: formatCurrency(totaleEntrate, currency) },
    'Asset Patrimonio': { raw: totalePatrimonio, label: formatCurrency(totalePatrimonio, currency) },
    'Liquidità': { raw: totaleLiquidita, label: formatCurrency(totaleLiquidita, currency) },
    'Uscite': { raw: 1200, label: formatCurrency(1200, currency) },
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
      ((st?.entrate?.bonus || []).reduce ? st.entrate.bonus.reduce((s, b) => s + (b.importo || 0), 0) : 0) +
      ((st?.entrate?.altreEntrate || []).reduce ? st.entrate.altreEntrate.reduce((s, e) => s + (e.importo || 0), 0) : 0);

    const uscite =
      ((st?.uscite?.fisse || []).reduce ? st.uscite.fisse.reduce((s, u) => s + (u.importo || 0), 0) : 0) +
      ((st?.uscite?.variabili || []).reduce ? st.uscite.variabili.reduce((s, u) => s + (u.importo || 0), 0) : 0);

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

    const patrimonio = tfr + conti + buoni + azioni;
    return { date, tfr, conti, buoni, azioni, patrimonio };
  };

  const chartData = React.useMemo(() => {
    const points = (history || []).map(h => buildTotalsFromSnapshot(h));

    const currEntrate =
      (state?.entrate?.stipendio?.netto || 0) +
      ((state?.entrate?.bonus || []).reduce ? state.entrate.bonus.reduce((s, b) => s + (b.importo || 0), 0) : 0) +
      ((state?.entrate?.altreEntrate || []).reduce ? state.entrate.altreEntrate.reduce((s, e) => s + (e.importo || 0), 0) : 0);

    const currUscite =
      ((state?.uscite?.fisse || []).reduce ? state.uscite.fisse.reduce((s, u) => s + (u.importo || 0), 0) : 0) +
      ((state?.uscite?.variabili || []).reduce ? state.uscite.variabili.reduce((s, u) => s + (u.importo || 0), 0) : 0);

    points.push({ date: new Date().toISOString().slice(0, 10), entrate: currEntrate, uscite: currUscite });
    points.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    // filter by dateRange
    const filtered = points.filter(p => {
      const d = p.date || '';
      if (dateRange.start && d < dateRange.start) return false;
      if (dateRange.end && d > dateRange.end) return false;
      return true;
    });
    return filtered.map(p => ({ ...p, date: p.date }));
  }, [history, state]);

  // current totals for percentages (used in the side bracket)
  const currEntrate = (
    (state?.entrate?.stipendio?.netto || 0) +
    ((state?.entrate?.bonus || []).reduce ? state.entrate.bonus.reduce((s, b) => s + (b.importo || 0), 0) : 0) +
    ((state?.entrate?.altreEntrate || []).reduce ? state.entrate.altreEntrate.reduce((s, e) => s + (e.importo || 0), 0) : 0)
  );
  const currUscite = (
    ((state?.uscite?.fisse || []).reduce ? state.uscite.fisse.reduce((s, u) => s + (u.importo || 0), 0) : 0) +
    ((state?.uscite?.variabili || []).reduce ? state.uscite.variabili.reduce((s, u) => s + (u.importo || 0), 0) : 0)
  );
  const percUscite = currEntrate ? (currUscite / currEntrate) * 100 : 0;
  const percRemain = Math.max(0, 100 - percUscite);

  const chartDataPatrimonio = React.useMemo(() => {
    const points = (history || []).map(h => buildPatrimonioFromSnapshot(h));

    const currTfr = state?.patrimonio?.tfr || 0;
    const currConti = (state?.patrimonio?.contiDeposito || []).reduce((s, c) => s + (c.saldo || 0), 0);
    const currBuoni = (state?.patrimonio?.buoniTitoli || []).reduce((s, b) => s + (b.importo || 0), 0);
    const currAzioni = (state?.patrimonio?.investimenti?.azioni || []).reduce((s, a) => s + (a.valore || 0), 0);
    const currPatrimonio = currTfr + currConti + currBuoni + currAzioni;

    points.push({ date: new Date().toISOString().slice(0, 10), tfr: currTfr, conti: currConti, buoni: currBuoni, azioni: currAzioni, patrimonio: currPatrimonio });
    points.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const filtered = points.filter(p => {
      const d = p.date || '';
      if (dateRange.start && d < dateRange.start) return false;
      if (dateRange.end && d > dateRange.end) return false;
      return true;
    });
    return filtered.map(p => ({ ...p, date: p.date }));
  }, [history, state, dateRange]);

  return (
    <main style={{ flex: 1, background: 'var(--bg-dark)', minHeight: '100vh' }}>
      <div className="topbar">
        <h1>FINANCIAL STATUS DASHBOARD</h1>
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
            <label htmlFor="save-date">Save Date</label>
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
                    const draft = loadDraft(username);
                    const snapshot = draft ? { ...draft, date: saveDate } : { date: saveDate, state };
                    saveSnapshot(snapshot, username);
                    clearDraft(username);
                    setShowDraftMsg(false);
                    setSaveConfirm(`Snapshot salvato: ${saveDate}`);
                    setTimeout(() => setSaveConfirm(''), 3000);
                    setTick(t => t + 1);
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
                  const draft = loadDraft(username);
                  const snapshot = draft ? { ...draft, date: saveDate } : { date: saveDate, state };
                  saveSnapshot(snapshot, username);
                  clearDraft(username);
                  setShowDraftMsg(false);
                  setSaveConfirm(`Snapshot salvato: ${saveDate}`);
                  setTimeout(() => setSaveConfirm(''), 3000);
                  setTick(t => t + 1);
                }}
          >
            Salva ora
          </button>
        </div>
      )}
  {/* --- chart on overview --- */}
  {activeSection === null && chartData && chartData.length > 0 && (
    <div style={{ width: '100%', maxWidth: 1100, margin: '12px auto 24px', padding: 12, background: 'var(--bg-medium)', borderRadius: 12 }}>
      <h3 style={{ color: 'var(--bg-light)', margin: '6px 0 12px' }}>Entrate vs Uscite (storico)</h3>
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: 1, minWidth: 0, height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 64, bottom: 8 }}>
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
  )}

  {activeSection === null && chartDataPatrimonio && chartDataPatrimonio.length > 0 && (
    <div style={{ width: '100%', maxWidth: 1100, margin: '12px auto 24px', padding: 12, background: 'var(--bg-medium)', borderRadius: 12 }}>
      <h3 style={{ color: 'var(--bg-light)', margin: '6px 0 12px' }}>Patrimonio (totale asset)</h3>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={chartDataPatrimonio} margin={{ top: 8, right: 24, left: 64, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis width={80} tickFormatter={v => formatCurrency(v, currency)} tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip formatter={(val) => formatCurrency(val, currency)} />
            <Legend />
            <Area type="monotone" dataKey="tfr" stroke="#f39c12" fill="rgba(243,156,18,0.08)" name="TFR" />
            <Area type="monotone" dataKey="conti" stroke="#27ae60" fill="rgba(39,174,96,0.08)" name="Conti deposito" />
            <Area type="monotone" dataKey="buoni" stroke="#2980b9" fill="rgba(41,128,185,0.06)" name="Buoni/Titoli" />
            <Area type="monotone" dataKey="azioni" stroke="#8e44ad" fill="rgba(142,68,173,0.06)" name="Azioni" />
            <Area type="monotone" dataKey="patrimonio" stroke="#9b59b6" fill="rgba(155,89,182,0.12)" name="Totale" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )}

  {activeSection === null ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            gap: 32,
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
      ) : (
        <div style={{ padding: 32 }}>
          {activeSection === 'Entrate Attuali' && <Stipendio dateRange={dateRange} />}
          {activeSection === 'Asset Patrimonio' && <AssetPatrimonio dateRange={dateRange} />}
          {activeSection === 'Liquidità' && <Liquidita dateRange={dateRange} />}
          {activeSection === 'Uscite' && <Uscite dateRange={dateRange} />}
          {activeSection === 'Progetti Extra' && <ProgettiExtra dateRange={dateRange} />}
          {/* ...altre sezioni... */}
        </div>
      )}

  {saveConfirm && (
    <div style={{ width: '100%', maxWidth: 1100, margin: '12px auto', padding: 12, background: 'var(--accent-cyan)', color: 'var(--bg-dark)', borderRadius: 12, textAlign: 'center', fontWeight: 700 }}>
      {saveConfirm}
    </div>
  )}
      {/* floating save button when there are unsaved changes */}
      {dirty && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 60 }}>
          <button onClick={() => {
            const draft = loadDraft(username);
            if (draft) {
              saveSnapshot({ ...draft, date: saveDate }, username);
              clearDraft(username);
            }
            markSaved();
            setShowDraftMsg(false);
            setSaveConfirm(`Snapshot salvato: ${saveDate}`);
            setTimeout(() => setSaveConfirm(''), 3000);
            setTick(t => t + 1);
          }} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: '700', cursor: 'pointer' }}>Salva modifiche</button>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
