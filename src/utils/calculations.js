export const calculateNetIncome = (yearlyRent, expenses, taxRate) => {
  // Nota: yearlyRent era passato come valore di affitto; per ottenere la rendita annua
  // moltiplichiamo per 12 prima di sottrarre le spese (come richiesto).
  const totalExpenses = (expenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const gross = Number(yearlyRent) || 0;
  const grossAnnual = gross * 12; // <-- conversione a annuale
  const netBeforeTax = grossAnnual - totalExpenses;
  return netBeforeTax * (1 - (Number(taxRate) || 0) / 100);
};

// Calcola il ROI (Return on Investment)
export const calculateROI = (yearlyRent, expenses, taxRate, propertyValue) => {
  const netIncome = calculateNetIncome(yearlyRent, expenses, taxRate);
  const value = Number(propertyValue) || 1; // prevent division by zero
  return (netIncome / value) * 100;
};