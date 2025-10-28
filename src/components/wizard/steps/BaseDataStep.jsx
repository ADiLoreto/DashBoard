import React from 'react';
import FormField from '../forms/FormField';

const BaseDataStep = ({ formData, setFormData, assetType }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <FormField label="Titolo" value={formData.titolo || ''} onChange={v=>setFormData(fd=>({ ...fd, titolo: v }))} />
      <FormField label="Valore (€)" type="number" value={formData.valore || 0} onChange={v=>setFormData(fd=>({ ...fd, valore: Number(v) }))} />
      {/* assetType-specific hints */}
      {assetType && <div style={{ fontSize: 12, color: '#000' }}>Tipo asset: {assetType}</div>}
    </div>
  );
};

export default BaseDataStep;
