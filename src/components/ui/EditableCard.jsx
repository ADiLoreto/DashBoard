import React, { useState } from 'react';

const EditableCard = ({ title, value, unit, fields, onSave, expandable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({});

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));
  const handleSubmit = () => { onSave(formData); setIsEditing(false); };

  return (
    <div style={{ backgroundColor: '#2e3842', padding: 16, borderRadius: 10, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', cursor: expandable ? 'pointer' : 'default' }}
           onClick={() => expandable && setIsExpanded(!isExpanded)}>
        <h3 style={{ color: '#f6f9fc' }}>{title}</h3>
        <span style={{ color: '#06d2fa', fontWeight: 'bold' }}>{value} {unit}</span>
        <button onClick={() => setIsEditing(true)}>✏️</button>
      </div>

      {isExpanded && <div>{/* sottotab dettaglio */}</div>}

      {isEditing && (
        <div style={{ marginTop: 10 }}>
          {fields.map(f => (
            <div key={f}>
              <label style={{ color: '#f6f9fc' }}>{f}</label>
              <input type="number" onChange={e => handleChange(f, Number(e.target.value))} />
            </div>
          ))}
          <button onClick={handleSubmit}>Salva</button>
          <button onClick={() => setIsEditing(false)}>Annulla</button>
        </div>
      )}
    </div>
  );
};

export default EditableCard;
