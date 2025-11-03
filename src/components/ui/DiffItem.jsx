import React from 'react';
import { formatEffort, formatDate, formatCurrency } from '../../utils/format';

const DiffItem = ({
  id,
  selected,
  onSelect,
  label,
  oldValue,
  newValue,
  amount,
  metadata,
  type = 'default'
}) => {
  const icons = {
    entrata: '💰',
    uscita: '💸',
    asset: '📊',
    default: '📄'
  };

  const getChangeType = (old, new_) => {
    if (!old && new_) return { color: 'var(--accent-cyan)', icon: '✨', text: 'Nuovo' };
    if (old && !new_) return { color: '#ff6b6b', icon: '🗑️', text: 'Rimosso' };
    if (old !== new_) return { color: '#ffd93d', icon: '✏️', text: 'Modificato' };
    return { color: 'inherit', icon: '', text: '' };
  };

  const change = getChangeType(oldValue, newValue);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '8px',
      marginBottom: '8px',
      background: 'var(--bg-dark)',
      borderRadius: '6px',
      border: '1px solid var(--bg-medium)'
    }}>
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onSelect(id, e.target.checked)}
        style={{ marginRight: '12px', marginTop: '4px' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{icons[type]}</span>
            <span style={{ fontWeight: 'bold' }}>{label}</span>
            {change.text && (
              <span style={{ 
                fontSize: '12px',
                color: change.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--bg-darker)'
              }}>
                {change.icon} {change.text}
              </span>
            )}
          </div>

          <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: 16, color: 'var(--accent-cyan)' }}>
            {amount !== undefined && amount !== null ? formatCurrency(amount) : (newValue || oldValue || '—')}
          </div>
        </div>
        {metadata && metadata.length > 0 && (
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)',
            marginTop: '4px',
            display: 'flex',
            gap: '8px'
          }}>
            {metadata.map((item, idx) => (
              <span key={idx}>{item}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffItem;