import React, { useState } from 'react';

const EditableCard = ({ title, value, unit, fields, onSave, expandable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({});

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));
  const handleSubmit = () => { onSave(formData); setIsEditing(false); };

  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: expandable ? 'pointer' : 'default' }}
           onClick={() => expandable && setIsExpanded(!isExpanded)}>
        <p className="kpi-title">{title}</p>
        <p className="kpi-value" style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>{value} {unit}</p>
      </div>

      {isExpanded && <div>{/* sottotab dettaglio */}</div>}

      {isEditing && (
        <div style={{ marginTop: 10 }}>
          {fields.map(f => (
            <div key={f} style={{ marginBottom: 8 }}>
              <label style={{ color: 'var(--text-light)', fontSize: 13 }}>{f}</label>
              <input type="number" style={{ background: 'var(--bg-darker)', color: 'var(--text-light)', border: 'none', borderRadius: 4, padding: '4px 8px', marginLeft: 8 }} onChange={e => handleChange(f, Number(e.target.value))} />
            </div>
          ))}
          <button style={{ background: 'var(--accent-cyan)', color: 'var(--bg-dark)', border: 'none', borderRadius: 4, padding: '6px 16px', marginRight: 8, fontWeight: 'bold' }} onClick={handleSubmit}>Salva</button>
          <button style={{ background: 'var(--bg-darker)', color: 'var(--text-light)', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold' }} onClick={() => setIsEditing(false)}>Annulla</button>
        </div>
      )}
    </div>
  );
};

export default EditableCard;
