import React, { useState, useMemo } from 'react';
import { formatCurrency, formatDate, formatEffort, formatDiffPreview, extractDiffItem } from '../../utils/format';
import DiffGroup from './DiffGroup';
import DiffItem from './DiffItem';

// diffs: array of { section, field, current, proposed, itemId?, action?, itemKeyFields? }
const HistoricalSavePreviewModal = ({ visible, diffs = [], saveDate, onConfirm, onCancel }) => {
  const [selection, setSelection] = useState(() => {
    const init = {};
    (diffs || []).forEach((d, i) => {
      const section = d.path?.[0] || d.section || 'other';
      const field = d.path?.[1] || d.field || 'default';
      const key = `${section}::${field}::${d.itemId || d.id || i}`;
      init[key] = true;
    });
    return init;
  });

  // group diffs by section and field for easier rendering and select-all
  const grouped = useMemo(() => {
    const g = {};
    (diffs || []).forEach((d, i) => {
      // extract normalized items from the diff (handles arrays and objects)
      const items = extractDiffItem(d);
      items.forEach(it => {
        const section = it.section || 'other';
        const field = it.field || 'default';
        const key = `${section}::${field}::${it.itemId || it.key || i}`;

        if (!g[section]) g[section] = {};
        if (!g[section][field]) g[section][field] = [];

        g[section][field].push({
          __key: key,
          __index: i,
          __type: field === 'default' ? section : field,
          label: it.label,
          amount: it.amount,
          date: it.date,
          metadata: it.metadata || [],
          raw: it.raw,
          originalDiff: d
        });
      });
    });
    return g;
  }, [diffs]);

  // initialize selection when diffs change
  React.useEffect(() => {
    const init = {};
    (diffs || []).forEach((d, i) => {
      const section = d.path?.[0] || d.section || 'other';
      const field = d.path?.[1] || d.field || 'default';
      const key = `${section}::${field}::${d.itemId || d.id || i}`;
      init[key] = true; // default select all so user can deselect
    });
    setSelection(init);
  }, [diffs]);

  if (!visible) return null;

  // set selection for a specific key, or toggle if checked === undefined
  const toggleItem = (key, checked) => setSelection(s => ({ ...s, [key]: typeof checked === 'boolean' ? checked : !s[key] }));

  const toggleField = (section, field, checked) => {
    const items = (grouped[section] && grouped[section][field]) || [];
    const next = { ...selection };
    items.forEach(it => { next[it.__key] = typeof checked === 'boolean' ? checked : !selection[it.__key]; });
    setSelection(next);
  };

  const toggleSection = (section, checked) => {
    const next = { ...selection };
    Object.entries(grouped[section] || {}).forEach(([field, items]) => {
      items.forEach(it => { next[it.__key] = typeof checked === 'boolean' ? checked : !selection[it.__key]; });
    });
    setSelection(next);
  };

  const handleConfirm = () => {
    const selected = (diffs || []).filter((d, i) => {
      const section = d.path?.[0] || d.section || 'other';
      const field = d.path?.[1] || d.field || 'default';
      const key = `${section}::${field}::${d.itemId || d.id || i}`;
      return !!selection[key];
    });
    if (onConfirm) onConfirm(selected);
  };

  // Helper to render an array item diff with readable format
  const renderNormalized = (it) => {
    const { __key, label, amount, date, metadata, raw, originalDiff } = it;
    const type = (originalDiff && originalDiff.section === 'entrate') ? 'entrata' : (originalDiff && originalDiff.section === 'uscite') ? 'uscita' : 'asset';
    return (
      <DiffItem
        key={__key}
        id={__key}
        selected={!!selection[__key]}
        onSelect={(id, checked) => toggleItem(id, checked)}
        label={label}
        amount={amount}
        metadata={metadata}
        type={type}
      />
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-dark)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '90%',
        width: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-light)' }}>
          Anteprima modifiche per {formatDate(saveDate)}
        </h3>

        {diffs.length === 0 ? (
          <div style={{ padding: 12, background: 'var(--bg-medium)', borderRadius: 8, color: 'var(--text-light)' }}>
            Nessuna differenza rilevata.
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            {Object.entries(grouped).map(([section, fields]) => (
              <DiffGroup
                key={section}
                title={section.charAt(0).toUpperCase() + section.slice(1)}
                groupKey={section}
                onGroupSelect={(gk, checked) => toggleSection(section, checked)}
                isSelected={Object.values(fields).flat().every(d => selection[d.__key])}
                isPartiallySelected={
                  !Object.values(fields).flat().every(d => selection[d.__key]) &&
                  Object.values(fields).flat().some(d => selection[d.__key])
                }
              >
                {Object.entries(fields).map(([field, items]) => (
                  <DiffGroup
                    key={`${section}-${field}`}
                    title={field.charAt(0).toUpperCase() + field.slice(1)}
                    groupKey={`${section}-${field}`}
                    onGroupSelect={(gk, checked) => toggleField(section, field, checked)}
                    isSelected={items.every(d => selection[d.__key])}
                    isPartiallySelected={
                      !items.every(d => selection[d.__key]) &&
                      items.some(d => selection[d.__key])
                    }
                  >
                    {items.map(diff => renderNormalized(diff))}
                  </DiffGroup>
                ))}
              </DiffGroup>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--bg-medium)',
              color: 'var(--text-light)',
              cursor: 'pointer'
            }}
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--accent-cyan)',
              color: 'var(--bg-dark)',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Applica modifiche selezionate
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoricalSavePreviewModal;
