import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const keyFor = (username) => (username ? `user_settings_${username}` : 'user_settings');

const LibertaGiorni = () => {
  const { user } = useContext(AuthContext);
  const username = user?.username;
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState('');
  const [patrimonioGoal, setPatrimonioGoal] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyFor(username));
      const s = raw ? JSON.parse(raw) : {};
      setMonthlyIncomeGoal(s.monthlyIncomeGoal ?? s.entrateObiettivo ?? '');
      setPatrimonioGoal(s.patrimonioGoal ?? s.patrimonioObiettivo ?? '');
    } catch {
      // ignore
    }
  }, [username]);

  const save = () => {
    try {
      const raw = localStorage.getItem(keyFor(username));
      const s = raw ? JSON.parse(raw) : {};
      s.monthlyIncomeGoal = monthlyIncomeGoal ? Number(monthlyIncomeGoal) : 0;
      s.patrimonioGoal = patrimonioGoal ? Number(patrimonioGoal) : 0;
      localStorage.setItem(keyFor(username), JSON.stringify(s));
      // notify others (Dashboard/Sidebar) to reload settings
      window.dispatchEvent(new Event('user_settings_changed'));
      alert('Obiettivi salvati');
    } catch (e) {
      console.error(e);
      alert('Errore nel salvataggio');
    }
  };

  const clear = () => {
    try {
      const raw = localStorage.getItem(keyFor(username));
      const s = raw ? JSON.parse(raw) : {};
      delete s.monthlyIncomeGoal;
      delete s.patrimonioGoal;
      localStorage.setItem(keyFor(username), JSON.stringify(s));
      window.dispatchEvent(new Event('user_settings_changed'));
      setMonthlyIncomeGoal('');
      setPatrimonioGoal('');
    } catch {}
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ color: 'var(--bg-light)' }}>Libertà Giorni — Obiettivi</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ color: 'var(--text-muted)' }}>
          Entrate mensili obiettivo
          <input type="number" value={monthlyIncomeGoal} onChange={e => setMonthlyIncomeGoal(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'var(--bg-light)' }} />
        </label>

        <label style={{ color: 'var(--text-muted)' }}>
          Patrimonio obiettivo
          <input type="number" value={patrimonioGoal} onChange={e => setPatrimonioGoal(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'var(--bg-light)' }} />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Salva obiettivi</button>
          <button onClick={clear} style={{ background: '#666', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}>Rimuovi obiettivi</button>
        </div>
      </div>
    </div>
  );
};

export default LibertaGiorni;
