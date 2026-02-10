
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
  onToggle,
  toggleValue,
  showToggleAlways = false,
  allowEdit = true,
  allowTitleEdit, // optional override
  allowValueEdit, // optional override
  subtitle,
  footer,
  onEditCashflow,  // for cashflow editing
  onExpensesClick, // for expenses management
  roiDetails     // for ROI and income details
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
      style={{
        fontFamily: 'Roboto Mono, monospace',
        color: '#222',
        fontSize: 32,
        textAlign: 'center',
        marginTop: 8,
        width: '80%',
        maxWidth: 320,
        boxSizing: 'border-box',
        padding: '6px 8px',
        borderRadius: 8,
        border: '1px solid var(--bg-medium)',
        background: 'transparent',
        ...(valueStyle || {})
      }}
        />
      ) : (
        <div
    style={{ fontFamily: 'Roboto Mono, monospace', color: 'var(--accent-cyan)', fontSize: 40, cursor: canEditValue ? 'pointer' : 'default', marginTop: 8, ...(valueStyle || {}) }}
    onClick={() => { if (canEditValue) setEditingField('value'); }}
        >
          {typeof value === 'number' && !isNaN(value) ? value : 0}
        </div>
      )}

      {/* Footer area (e.g., embedded Time/h control) */}
      {footer && (
        <div style={{ marginTop: 10, textAlign: 'center', width: '100%' }}>
          {footer}
        </div>
      )}

      {/* Pulsanti azione (spese, cashflow, elimina) */}
      {hovered && (
        <div style={{ position: 'absolute', top: 8, right: 12, display: 'flex', gap: 8, zIndex: 2 }}>
          {onEditCashflow && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditCashflow();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: 20,
                cursor: 'pointer',
                padding: 0
              }}
              title="Modifica cashflow"
            >
              💰
            </button>
          )}
          {/* Pulsante gestione spese */}
          {onExpensesClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpensesClick();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-light)',
                fontSize: 20,
                cursor: 'pointer',
                padding: 0
              }}
              title="Gestione spese e ROI"
            >
              📓
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ff6b6b',
                fontSize: 22,
                cursor: 'pointer',
                padding: 0
              }}
              title="Elimina"
            >
              🗑️
            </button>
          )}
        </div>
      )}
      {(hovered || showToggleAlways) && typeof onToggle === 'function' && (
        <div
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            role="switch"
            aria-checked={!!toggleValue}
            style={{
              position: 'relative',
              width: 120,
              height: 28,
              borderRadius: 999,
              padding: 5,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: toggleValue ? 'flex-end' : 'flex-start',
              background: toggleValue ? '#ff6b6b' : 'var(--accent-cyan)',
              cursor: 'pointer',
              border: '1px solid var(--bg-medium)'
            }}
            title={toggleValue ? 'Segna come entrata' : 'Segna come costo'}
          >
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ color: '#000', fontSize: 13, fontWeight: 700, textTransform: 'lowercase' }}>{toggleValue ? 'uscita' : 'entrata'}</span>
            </div>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              transition: 'all 0.18s ease'
            }} />
          </div>
        </div>
      )}
      {/* ROI Details */}
      {roiDetails && (
        <div style={{
          position: 'absolute',
          bottom: subtitle ? -62 : -42,
          left: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: 'var(--bg-darker)',
          borderRadius: '4px',
          padding: '8px'
        }}>
          {/* Prima riga: ROI, Rendita, Payback */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--text-muted)',
            fontSize: 12,
            gap: 4
          }}>
            <span title="ROI Netto">ROI: {roiDetails.roi}%</span>
            <span title="Rendita Netta Annuale">Rendita: €{roiDetails.income}</span>
            <span title="Anni per rientrare dell'investimento">
              Payback: {
                (function(p) {
                  const n = Number(p);
                  if (!isFinite(n)) return '∞';
                  if (isNaN(n)) return '—';
                  return n.toFixed(2);
                })(roiDetails.payback)
              } anni
            </span>
          </div>
          
          {/* Seconda riga: metriche aggiuntive se disponibili */}
          {(roiDetails.totalSpese !== undefined || roiDetails.renditaLorda !== undefined || roiDetails.roiLordo !== undefined) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'var(--text-muted)',
              fontSize: 11,
              gap: 4,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 6
            }}>
              {roiDetails.totalSpese !== undefined && <span title="Totale Spese Annuali">Spese: €{Number(roiDetails.totalSpese).toFixed(0)}</span>}
              {roiDetails.renditaLorda !== undefined && <span title="Rendita Lorda Annuale">R.Lorda: €{Number(roiDetails.renditaLorda).toFixed(0)}</span>}
              {roiDetails.roiLordo !== undefined && <span title="ROI Lordo">R.Lordo: {Number(roiDetails.roiLordo).toFixed(2)}%</span>}
              {roiDetails.capitalGain !== undefined && roiDetails.capitalGain !== 0 && <span title="Capital Gain">Gain: €{Number(roiDetails.capitalGain).toFixed(0)}</span>}
            </div>
          )}
        </div>
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
