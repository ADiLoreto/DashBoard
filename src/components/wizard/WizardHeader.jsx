import React from 'react';

const WizardHeader = ({ title = '', onClose = () => {}, step = 0, totalSteps = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
    <div>
      <h3 style={{ margin: 0, color: '#000' }}>{title}</h3>
      <div style={{ fontSize: 12, color: '#000' }}>Step {step + 1} di {totalSteps}</div>
    </div>
    <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 18 }}>✕</button>
  </div>
);

export default WizardHeader;
