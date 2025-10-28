import React, { useState, useEffect } from 'react';
import WizardHeader from './WizardHeader';
import WizardFooter from './WizardFooter';
import BaseDataStep from './steps/BaseDataStep';
import CashflowStep from './steps/CashflowStep';

const AssetWizard = ({ show = true, asset = null, assetType = null, onClose = () => {}, onSave = () => {} }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ titolo: '', valore: 0, cashflows: [] });

  useEffect(() => {
    if (asset) setFormData(prev => ({ ...prev, ...asset }));
    else setFormData({ titolo: '', valore: 0, cashflows: [] });
  }, [asset]);

  if (!show) return null;

  const goNext = () => setStep(s => Math.min(s + 1, 1));
  const goPrev = () => setStep(s => Math.max(s - 1, 0));

  const handleSave = () => {
    // basic validation
    const payload = { ...formData };
    onSave(payload);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
      <div style={{ width: 720, maxWidth: '95%', background: 'var(--bg-light)', borderRadius: 12, padding: 18 }}>
        <WizardHeader title={asset ? `Modifica ${asset.titolo || ''}` : `Nuovo asset: ${assetType || ''}`} onClose={onClose} step={step} totalSteps={2} />
        <div style={{ padding: 12, minHeight: 160 }}>
          {step === 0 && <BaseDataStep formData={formData} setFormData={setFormData} assetType={assetType} />}
          {step === 1 && <CashflowStep formData={formData} setFormData={setFormData} />}
        </div>
        <WizardFooter onPrev={goPrev} onNext={goNext} onSave={handleSave} onCancel={onClose} step={step} totalSteps={2} />
      </div>
    </div>
  );
};

export default AssetWizard;
