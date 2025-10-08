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
export const saveSnapshot = (snapshot, username) => {
  const history = loadHistory(username);
  history.push(snapshot);
  localStorage.setItem(keyFor('financeHistory', username), JSON.stringify(history));
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
