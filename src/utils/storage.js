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
