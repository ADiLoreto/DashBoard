import React, { useContext, useEffect, useState } from 'react';
import UserMenu from './UserMenu';
import { AuthContext } from '../../context/AuthContext';

const tabs = [
  'Entrate Attuali',
  'Asset Patrimonio',
  'Liquidità',
  'Uscite',
  'Progetti Extra',
  'Obiettivi'
];

const Sidebar = ({ onSelect, selected, onBack }) => {
  const { user } = useContext(AuthContext);
  const username = user?.username;
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(username ? `user_settings_${username}` : 'user_settings');
      const settings = raw ? JSON.parse(raw) : {};
      setPinned(!!settings.sidebarPinned);
    } catch { /* ignore */ }
  }, [username]);

  const togglePinned = () => {
    const next = !pinned;
    setPinned(next);
    try {
      const key = username ? `user_settings_${username}` : 'user_settings';
      const raw = localStorage.getItem(key);
      const settings = raw ? JSON.parse(raw) : {};
      settings.sidebarPinned = next;
      localStorage.setItem(key, JSON.stringify(settings));
      window.dispatchEvent(new Event('user_settings_changed'));
    } catch {}
  };

  const collapsed = !pinned && !hover;

  return (
    <aside
      className="sidebar"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width: collapsed ? 64 : 220, transition: 'width 220ms ease', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px' }}>
        <h2 style={{ margin: 0, fontSize: collapsed ? 16 : 20 }}>{collapsed ? 'DB' : 'Dashboard'}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={togglePinned} title="Fissa sidebar" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>{pinned ? '📌' : '📍'}</button>
          {!collapsed && <UserMenu />}
        </div>
      </div>

  <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 8px' }}>
        {tabs.map(tab => (
          <a
            key={tab}
            href="#"
            style={{
              display: 'block',
              padding: '10px 10px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: selected === tab ? 'bold' : 'normal',
              borderLeft: selected === tab ? '4px solid var(--accent-cyan)' : 'none'
            }}
            onClick={e => { e.preventDefault(); onSelect && onSelect(tab); }}
          >
            {collapsed ? tab.split(' ').map(w=>w[0]).join('') : tab}
          </a>
        ))}
      </nav>

      {/* Back button placed under the tabs (below 'Libertà Giorni' / 'LG') */}
      <div style={{ padding: 10, paddingTop: 6 }}>
        <BackButton collapsed={collapsed} onClick={() => {
          try {
            if (typeof onBack === 'function') return onBack();
          } catch {}
          window.history.back();
        }} />
      </div>
    </aside>
  );
};

const BackButton = ({ collapsed, onClick }) => {
  if (collapsed) {
    return (
      <button onClick={onClick} title="Indietro" style={{ width: 44, height: 44, borderRadius: 22, border: 'none', background: 'var(--accent-cyan)', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>←</button>
    );
  }

  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent-cyan)', color: 'var(--bg-dark)', cursor: 'pointer', fontWeight: 'bold', fontSize: 16 }}>← Indietro</button>
  );
};

export default Sidebar;
