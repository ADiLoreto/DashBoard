import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';

const keyFor = (userId) => `user_settings_${userId}`;

const loadSettings = (userId) => {
  if (!userId) return { currency: 'EUR' };
  try { return JSON.parse(localStorage.getItem(keyFor(userId)) || '{}'); } catch { return { currency: 'EUR' }; }
};

const saveSettings = (userId, settings) => {
  if (!userId) return;
  try { localStorage.setItem(keyFor(userId), JSON.stringify(settings)); } catch {}
};

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const userId = user?.id;
  const email = user?.email || '';

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({ currency: 'EUR' });
  const [showPass, setShowPass] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, visibility: 'hidden' });

  useEffect(() => {
    if (userId) setSettings(s => ({ currency: 'EUR', ...loadSettings(userId) }));
  }, [userId]);

  // position portal when opened and handle outside click
  useEffect(() => {
    if (!open || !btnRef.current) {
      setPos(p => ({ ...p, visibility: 'hidden' }));
      return;
    }

    const update = () => {
      const rect = btnRef.current.getBoundingClientRect();
      const left = rect.left + window.scrollX;
      const top = rect.bottom + window.scrollY;
      setPos({ left, top, visibility: 'visible' });
    };

    update();

    const onDocClick = (e) => {
      const portal = document.querySelector('[data-usermenu-portal]');
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (portal && portal.contains(e.target)) return;
      setOpen(false);
    };

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    document.addEventListener('mousedown', onDocClick);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [open]);

  const initial = email ? email.charAt(0).toUpperCase() : '?';

  const handleSave = () => {
    saveSettings(userId, settings);
    try { window.dispatchEvent(new CustomEvent('user_settings_changed', { detail: { userId } })); } catch {}
    setOpen(false);
  };

  const handleLogout = async () => {
    const res = await signOut();
    if (res.ok) {
      setOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        ref={btnRef}
        title={email}
        onClick={() => setOpen(v => !v)}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--accent-cyan)',
          color: 'var(--bg-dark)',
          border: 'none',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {initial}
      </button>

      {open && btnRef.current && createPortal(
        <div data-usermenu-portal style={{ position: 'absolute', left: pos.left, top: pos.top, width: 320, background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 8, zIndex: 9999 }}>
          <div style={{ color: 'var(--bg-light)', fontWeight: 700, marginBottom: 8 }}>Account</div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Email</label>
            <div style={{ color: 'var(--bg-light)', fontWeight: 600, wordBreak: 'break-all' }}>{email}</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ color: 'var(--text-muted)', fontSize: 12 }}>Valuta</label>
            <select value={settings.currency} onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, background: 'var(--bg-light)', color: 'var(--bg-dark)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setOpen(false); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', color: 'var(--text-muted)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Chiudi</button>
            <button onClick={handleSave} style={{ background: 'var(--accent-cyan)', border: 'none', color: 'var(--bg-dark)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Salva</button>
          </div>

          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.03)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red, #ff6b6b)', cursor: 'pointer', fontSize: 14 }}>Logout</button>
          </div>
        </div>, document.body)}
    </div>
  );
};

export default UserMenu;
