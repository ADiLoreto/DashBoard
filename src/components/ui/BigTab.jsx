
import React, { useState } from 'react';

const BigTab = ({
  title,
  value,
  icon,
  titleStyle,
  valueStyle,
  onUpdate,
  onDelete,
  onClick,
  allowEdit = true,
  allowTitleEdit, // optional override
  allowValueEdit, // optional override
  subtitle
}) => {
  const [editingField, setEditingField] = useState(null); // 'title' | 'value' | null
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftValue, setDraftValue] = useState(value);
  // Aggiorna draftValue se value cambia dall'esterno
  React.useEffect(() => {
    if (editingField !== 'value') {
      setDraftValue(value);
    }
  }, [value, editingField]);
  // Aggiorna draftTitle se title cambia dall'esterno
  React.useEffect(() => {
    if (editingField !== 'title') {
      setDraftTitle(title);
    }
  }, [title, editingField]);
  const [hovered, setHovered] = useState(false);

  const canEditTitle = typeof allowTitleEdit === 'boolean' ? allowTitleEdit : allowEdit;
  const canEditValue = typeof allowValueEdit === 'boolean' ? allowValueEdit : allowEdit;

  // Gestione salvataggio
  const handleSave = () => {
    if (editingField === 'title' && draftTitle !== title) {
      onUpdate && onUpdate({ title: draftTitle });
    }
    if (editingField === 'value') {
      const numValue = draftValue === '' ? value : Number(draftValue);
      if (!isNaN(numValue) && numValue !== value) {
        onUpdate && onUpdate({ value: numValue });
      }
    }
    setEditingField(null);
    setDraftTitle(title);
    setDraftValue(value);
  };

  // Gestione annulla
  const handleCancel = () => {
    setDraftTitle(title);
    setDraftValue(value);
    setEditingField(null);
  };

  // Gestione tastiera
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
  <div
      className="big-tab"
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
  cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        margin: 0,
        flex: '1 1 260px',
        boxSizing: 'border-box',
        fontSize: 32,
        fontFamily: 'Montserrat, sans-serif',
        color: 'var(--text-light)',
        position: 'relative',
        transition: 'all 0.2s'
      }}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  onClick={() => { if (onClick) onClick(); }}
    >
      {icon && <span className="big-tab-icon">{icon}</span>}

      {/* Titolo modificabile */}
  {editingField === 'title' ? (
        <input
          type="text"
          value={draftTitle}
          autoFocus
          onChange={e => setDraftTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
  style={{ fontWeight: 700, fontSize: 18, textAlign: 'center', marginBottom: 8, ...(titleStyle || { fontSize: 18 }) }}
        />
      ) : (
        <div
  style={{ fontWeight: 700, cursor: canEditTitle ? 'pointer' : 'default', ...(titleStyle || { fontSize: 18 }) }}
  onClick={() => { if (canEditTitle) setEditingField('title'); }}
        >
          {draftTitle}
        </div>
      )}

      {/* Valore modificabile */}
  {editingField === 'value' ? (
        <input
          type="number"
          value={draftValue === undefined || draftValue === null ? '' : draftValue}
          autoFocus
          onChange={e => {
            const val = e.target.value;
            if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
              setDraftValue(val);
            }
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
      style={{ fontFamily: 'Roboto Mono, monospace', color: '#222', fontSize: 32, textAlign: 'center', marginTop: 8, ...(valueStyle || {}) }}
        />
      ) : (
        <div
    style={{ fontFamily: 'Roboto Mono, monospace', color: 'var(--accent-cyan)', fontSize: 40, cursor: canEditValue ? 'pointer' : 'default', marginTop: 8, ...(valueStyle || {}) }}
    onClick={() => { if (canEditValue) setEditingField('value'); }}
        >
          {typeof value === 'number' && !isNaN(value) ? value : 0}
        </div>
      )}

      {/* Cestino per eliminare */}
  {hovered && onDelete && (canEditTitle || canEditValue) && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute',
            top: 8,
            right: 12,
            background: 'transparent',
            border: 'none',
            color: '#ff6b6b',
            fontSize: 22,
            cursor: 'pointer',
            zIndex: 2
          }}
          title="Elimina"
        >
          🗑️
        </button>
      )}
      {/* Subtitle / small info under the card */}
      {subtitle && (
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default BigTab;
