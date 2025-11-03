export const formatCurrency = (amount, currency = 'EUR') => {
  try {
    const num = Number(amount);
    if (amount === null || amount === undefined || Number.isNaN(num)) return '—';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(num);
  } catch (e) {
    return `${amount} ${currency}`;
  }
};

export const getUserCurrency = (username) => {
  if (!username) return 'EUR';
  try {
    const s = localStorage.getItem(`user_settings_${username}`);
    if (!s) return 'EUR';
    const obj = JSON.parse(s);
    return obj.currency || 'EUR';
  } catch { return 'EUR'; }
};

export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  try {
    // Format date in Italian style
    const d = new Date(isoDate);
    return d.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return isoDate;
  }
};

// Format time/effort
export const formatEffort = (hours, days) => {
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (days) parts.push(`${days}g`);
  return parts.join(', ');
};

// Format a diff item for preview
export const formatDiffPreview = (item, type = 'default') => {
  if (!item) return { title: '—', subtitle: '', details: '' };

  const icons = {
    entrata: '💰',
    uscita: '💸',
    asset: '📊',
    delete: '🗑️',
    add: '✨',
    edit: '✏️'
  };

  const title = `${item.titolo || item.title || ''}`;
  const amount = (item.importo !== undefined && item.importo !== null) ? formatCurrency(item.importo) : (item.amount !== undefined && item.amount !== null ? formatCurrency(item.amount) : '');
  const date = item.date ? formatDate(item.date) : '';
  const effort = formatEffort(item.hours, item.days);

  return {
    icon: icons[type] || '',
    title,
    subtitle: [amount, date].filter(Boolean).join(' - '),
    details: effort || '',
    raw: item // keep raw data for tooltip
  };
};

// Extract individual diff items from a possibly-array/object diff entry.
export function extractDiffItem(d) {
  const section = d.path?.[0] || d.section || 'other';
  const field = d.path?.[1] || d.field || 'default';

  // If diff already represents an expanded item (has itemId), prefer proposed/current as source
  const itemIdFromDiff = d.itemId || d.itemKey || null;
  const source = d.proposed || d.current || d.value;

  // If the diff's source is an array, map each element (backwards compat)
  if (Array.isArray(source)) {
    return source.map((el, idx) => ({
      key: `${section}.${field}.${el.id || idx}`,
      section,
      field,
      itemId: el.id || String(idx),
      label: el.titolo || el.title || String(el.id || idx),
      amount: el.importo !== undefined ? el.importo : (el.amount !== undefined ? el.amount : null),
      date: el.date || null,
      metadata: [el.hours ? `${el.hours}h` : null, el.days ? `${el.days}g` : null].filter(Boolean),
      raw: el
    }));
  }

  // If it's an object, return a single normalized item and respect itemId from diff when present
  if (source && typeof source === 'object') {
    // try to pick a meaningful amount
    const amount = source.importo !== undefined ? source.importo : (source.amount !== undefined ? source.amount : (source.netto !== undefined ? source.netto : null));
    const label = source.titolo || source.title || source.nome || field;
    const resolvedItemId = itemIdFromDiff || (source.id ? String(source.id) : field);

    return [{
      key: `${section}.${field}.${resolvedItemId}`,
      section,
      field,
      itemId: resolvedItemId,
      label,
      amount,
      date: source.date || null,
      metadata: [source.hours ? `${source.hours}h` : null, source.days ? `${source.days}g` : null].filter(Boolean),
      raw: source
    }];
  }

  // fallback: primitive value
  return [{
    key: `${section}.${field}`,
    section,
    field,
    itemId: field,
    label: String(source),
    amount: (typeof source === 'number' ? source : null),
    date: null,
    metadata: [],
    raw: source
  }];
}
