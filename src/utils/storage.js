// Gestione draft temporaneo
const keyFor = (base, username) => username ? `${base}_${username}` : base;

export const saveDraft = (draft, username) => {
  localStorage.setItem(keyFor('financeDraft', username), JSON.stringify(draft));
};

export const loadDraft = (username) => {
  try {
    const data = localStorage.getItem(keyFor('financeDraft', username));
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearDraft = (username) => {
  localStorage.removeItem(keyFor('financeDraft', username));
};
export const saveState = (state, username) => {
  try {
    localStorage.setItem(keyFor('financeState', username), JSON.stringify(state));
  } catch (e) {
    // Gestione errore
  }
};

export const loadState = (username) => {
  try {
    const state = localStorage.getItem(keyFor('financeState', username));
    return state ? JSON.parse(state) : null;
  } catch (e) {
    return null;
  }
};

// Storico degli snapshot
// Storico degli snapshot

// helper: semplice merge profondo per oggetti (non perfetto per Date/Map/Set)
const deepMerge = (target = {}, source = {}) => {
  if (!source || typeof source !== 'object') return target;
  const out = Array.isArray(target) ? [...target] : { ...target };
  Object.keys(source).forEach(key => {
    const sVal = source[key];
    const tVal = target ? target[key] : undefined;
    if (
      sVal && typeof sVal === 'object' && !Array.isArray(sVal) &&
      tVal && typeof tVal === 'object' && !Array.isArray(tVal)
    ) {
      out[key] = deepMerge(tVal, sVal);
    } else {
      out[key] = sVal;
    }
  });
  return out;
};

// canonicalizza la data di una entry (snapshot o elemento history) a YYYY-MM-DD
const canonicalDateOf = (entry) => {
  if (!entry) return '';
  const d = entry.date ?? (entry.state && entry.state.date) ?? '';
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
};

export const saveSnapshot = (snapshot, username) => {
  const history = loadHistory(username) || [];

  // normalizza le date già presenti nello storico (conserva YYYY-MM-DD in .date)
  for (let i = 0; i < history.length; i++) {
    const c = canonicalDateOf(history[i]);
    if (c) history[i].date = c;
  }

  // dedup: unisci eventuali voci duplicate per stessa data (merge dello state)
  const map = {};
  history.forEach(h => {
    const key = canonicalDateOf(h) || `__nodate_${Math.random().toString(36).slice(2,8)}`;
    if (!map[key]) map[key] = { ...h };
    else {
      const existing = map[key];
      const mergedState = existing.state && h.state ? deepMerge(existing.state, h.state) : (h.state || existing.state);
      map[key] = { ...existing, ...h, state: mergedState, date: canonicalDateOf(h) || existing.date };
    }
  });
  const deduped = Object.values(map);
  history.length = 0;
  history.push(...deduped);

  // determina data canonica dalla snapshot in ingresso (preferisci snapshot.state.date)
  const stateDate = snapshot?.state && snapshot.state.date;
  const topDate = snapshot?.date;
  const rawDate = stateDate || topDate || '';
  const canonicalDate = rawDate ? (rawDate instanceof Date ? rawDate.toISOString().slice(0,10) : String(rawDate).slice(0,10)) : '';

  // allinea la snapshot alle date canoniche
  if (canonicalDate) {
    snapshot = { ...snapshot, date: canonicalDate, state: { ...(snapshot.state || {}), date: canonicalDate } };
  }

  if (!canonicalDate) {
    // nessuna data: fallback, push come prima
    history.push(snapshot);
  } else {
    const idx = history.findIndex(h => canonicalDateOf(h) === canonicalDate);
    if (idx !== -1) {
      const existing = history[idx] || {};
      const mergedState = existing.state && snapshot.state
        ? deepMerge(existing.state, snapshot.state)
        : (snapshot.state || existing.state);
      const merged = { ...existing, ...snapshot, state: mergedState, date: canonicalDate };
      history[idx] = merged;
    } else {
      history.push(snapshot);
    }
  }

  try {
    localStorage.setItem(keyFor('financeHistory', username), JSON.stringify(history));
  } catch (e) {
    // ignore storage errors
  }
};

export const loadHistory = (username) => {
  try {
    const data = localStorage.getItem(keyFor('financeHistory', username));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const clearHistory = (username) => {
  try {
    localStorage.removeItem(keyFor('financeHistory', username));
  } catch (e) {
    // ignore
  }
};
