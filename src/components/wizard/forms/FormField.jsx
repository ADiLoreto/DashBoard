import React from 'react';

const FormField = ({ label = '', value = '', onChange = () => {}, type = 'text', placeholder = '' }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 13, color: '#000' }}>{label}</span>
    <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--bg-medium)' }} />
  </label>
);

export default FormField;
