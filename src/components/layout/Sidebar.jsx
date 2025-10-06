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
  <aside style={{ width: 220, background: '#2e3842', color: '#f6f9fc', padding: 24 }}>
    <h2 style={{ color: '#06d2fa' }}>Dashboard</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tabs.map(tab => (
        <li key={tab} style={{ margin: '18px 0', cursor: 'pointer', fontWeight: selected === tab ? 'bold' : 'normal', borderLeft: selected === tab ? '4px solid #06d2fa' : 'none', paddingLeft: 12 }}
            onClick={() => onSelect && onSelect(tab)}>
          {tab}
        </li>
      ))}
    </ul>
  </aside>
);

export default Sidebar;
