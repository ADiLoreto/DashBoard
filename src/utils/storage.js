// Gestione draft temporaneo
export const saveDraft = (draft) => {
  localStorage.setItem('financeDraft', JSON.stringify(draft));
};

export const loadDraft = () => {
  try {
    const data = localStorage.getItem('financeDraft');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearDraft = () => {
  localStorage.removeItem('financeDraft');
};
export const saveState = (state) => {
  try {
    localStorage.setItem('financeState', JSON.stringify(state));
  } catch (e) {
    // Gestione errore
  }
};

export const loadState = () => {
  try {
    const state = localStorage.getItem('financeState');
    return state ? JSON.parse(state) : null;
  } catch (e) {
    return null;
  }
};

// Storico degli snapshot
export const saveSnapshot = (snapshot) => {
  const history = loadHistory();
  history.push(snapshot);
  localStorage.setItem('financeHistory', JSON.stringify(history));
};

export const loadHistory = () => {
  try {
    const data = localStorage.getItem('financeHistory');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};
