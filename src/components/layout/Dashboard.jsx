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
