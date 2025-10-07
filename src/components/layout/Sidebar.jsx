import React from 'react';
import UserMenu from './UserMenu';

const tabs = [
  'Entrate Attuali',
  'Asset Patrimonio',
  'Liquidità',
  'Uscite',
  'Progetti Extra',
  'Libertà Giorni'
];

const Sidebar = ({ onSelect, selected }) => (
  <aside className="sidebar">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <h2 style={{ margin: 0 }}>Dashboard</h2>
      <UserMenu />
    </div>
    <nav>
      {tabs.map(tab => (
        <a
          key={tab}
          href="#"
          style={{ fontWeight: selected === tab ? 'bold' : 'normal', borderLeft: selected === tab ? '4px solid var(--accent-cyan)' : 'none', paddingLeft: 12 }}
          onClick={e => { e.preventDefault(); onSelect && onSelect(tab); }}
        >
          {tab}
        </a>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
