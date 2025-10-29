import React from 'react';

const WizardFooter = ({ onPrev = () => {}, onNext = () => {}, onSave = () => {}, onCancel = () => {}, step = 0, totalSteps = 1 }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
    {step > 0 && <button onClick={onPrev} style={{ padding: '8px 12px' }}>Indietro</button>}
    {step < totalSteps - 1 && <button onClick={onNext} style={{ padding: '8px 12px', background: 'var(--bg-light)', border: '1px solid var(--bg-medium)' }}>Avanti</button>}
    <button onClick={onSave} style={{ padding: '8px 12px', background: 'var(--accent-cyan)', color: 'var(--bg-dark)' }}>Salva</button>
    <button onClick={onCancel} style={{ padding: '8px 12px', background: 'transparent' }}>Annulla</button>
  </div>
);

export default WizardFooter;
