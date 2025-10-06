import React from 'react';

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
    <h2>Dashboard</h2>
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
