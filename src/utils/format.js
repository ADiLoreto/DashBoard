export const formatCurrency = (amount, currency = 'EUR') => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
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
