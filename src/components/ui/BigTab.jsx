import React from 'react';

const BigTab = ({ title, value, icon, onClick, titleStyle }) => (
  <div
    className="big-tab"
    onClick={onClick}
    style={{
      background: 'var(--bg-medium)',
      borderRadius: 16,
      minWidth: 220,
      maxWidth: 360,
      minHeight: 160,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      margin: 0,
      flex: '1 1 260px',
      boxSizing: 'border-box',
      fontSize: 32,
      fontFamily: 'Montserrat, sans-serif',
      color: 'var(--text-light)',
      transition: 'all 0.2s'
    }}
  >
    {icon && <span className="big-tab-icon">{icon}</span>}
  <div style={{ fontWeight: 700, ...(titleStyle || {}) }}>{title}</div>
    <div style={{ fontFamily: 'Roboto Mono, monospace', color: 'var(--accent-cyan)', fontSize: 40 }}>
      {value}
    </div>
  </div>
);

export default BigTab;
