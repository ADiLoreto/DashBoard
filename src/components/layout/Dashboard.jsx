import React, { useState, useContext } from 'react';
import BigTab from '../ui/BigTab';
import { loadHistory, loadDraft, saveSnapshot, clearDraft } from '../../utils/storage';
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
  const dateOptions = history.map(h => h.date);
  const defaultStart = dateOptions.length ? dateOptions[dateOptions.length - 1] : new Date().toISOString().slice(0, 10);
  const [dateRange, setDateRange] = useState({
    start: defaultStart,
    end: new Date().toISOString().slice(0, 10)
  });
  const [saveDate, setSaveDate] = useState(new Date().toISOString().slice(0, 10));
  const today = new Date().toISOString().slice(0, 10);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
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
    return points.map(p => ({ ...p, date: p.date }));
  }, [history, state]);

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
              if (draft) {
                saveSnapshot({ ...draft, date: saveDate }, username);
                clearDraft(username);
                setShowDraftMsg(false);
              }
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
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis tickFormatter={v => formatCurrency(v, currency)} tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip formatter={(val) => formatCurrency(val, currency)} />
            <Legend />
            <Area type="monotone" dataKey="entrate" stroke="#06d2fa" fill="rgba(6,210,250,0.12)" name="Entrate" />
            <Area type="monotone" dataKey="uscite" stroke="#ff6b6b" fill="rgba(255,107,107,0.08)" name="Uscite" />
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
          }} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: '700', cursor: 'pointer' }}>Salva modifiche</button>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
