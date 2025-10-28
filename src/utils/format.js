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

export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  try {
    // Take only YYYY-MM-DD part
    return isoDate.split('T')[0];
  } catch (e) {
    return isoDate;
  }
};
