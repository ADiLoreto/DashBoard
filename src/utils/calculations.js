/**
 * ============================================================
 * CALCOLI IMMOBILI
 * ============================================================
 */

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

// Calcola il Payback Period (anni)
export const calculatePayback = (monthlyRent, expenses, taxRate, propertyValue) => {
  // Reuse calculateNetIncome which treats the first param as monthly rent and returns annual net income
  const netIncome = calculateNetIncome(monthlyRent, expenses, taxRate);
  const value = Number(propertyValue) || 0;
  // if netIncome is 0, return Infinity to indicate non-recoverable
  if (!netIncome) return Infinity;
  return value / netIncome; // anni per rientrare
};

// Calcola le metriche di performance complete per immobili
export const calculatePropertyPerformance = (yearlyRent, expenses, taxRate, propertyValue) => {
  const totalExpenses = (expenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const yearlyRentNum = Number(yearlyRent) || 0;
  const propertyValueNum = Number(propertyValue) || 1;
  
  // Rendita lorda (affitto annuo)
  const renditaLorda = yearlyRentNum * 12;
  
  // Tasse sulla rendita
  const tasse = (renditaLorda * (Number(taxRate) || 0)) / 100;
  
  // Rendita netta
  const renditaNetta = renditaLorda - totalExpenses - tasse;
  
  // ROI Lordo
  const roiLordo = (renditaLorda / propertyValueNum) * 100;
  
  // ROI Netto
  const roiNetto = (renditaNetta / propertyValueNum) * 100;
  
  // Capital Gain (0 se non specificato, poiché è confronto tra valore attuale e di acquisto)
  const capitalGain = 0;
  
  // Capital Gain Percent
  const capitalGainPercent = 0;
  
  return {
    totalSpese: totalExpenses,
    renditaLorda,
    renditaNetta,
    roiLordo,
    roiNetto,
    capitalGain,
    capitalGainPercent
  };
};

// Calcola le metriche di performance per immobili usando i campi completi
export const calculatePropertyPerformanceFromData = (data) => {
  if (!data) return {};
  
  // Calcolo totalSpese
  const imu = Number(data.imu) || 0;
  const tasi = Number(data.tasi) || 0;
  const cond = (Number(data.condominioMensile) || 0) * 12;
  const maint = Number(data.manutenzioneAnnua) || 0;
  const assic = Number(data.assicurazione) || 0;
  const totalSpese = imu + tasi + cond + maint + assic;
  
  // Calcolo renditaLorda
  const affitto = Number(data.affittoMensile) || 0;
  const freq = data.frequenzaAffitto || 'mensile';
  const multiplier = { mensile: 12, trimestrale: 4, annuale: 1 };
  const renditaLorda = affitto * (multiplier[freq] || 12);
  
  // Calcolo tasse
  const tasse = (renditaLorda * (Number(data.tassazioneAffitto) || 0)) / 100;
  
  // Calcolo renditaNetta
  const renditaNetta = renditaLorda - totalSpese - tasse;
  
  // Calcolo valore (usa valoreAttuale se disponibile, altrimenti valore)
  const valore = Number(data.valoreAttuale) || Number(data.valore) || 1;
  
  // Calcolo roiLordo
  const roiLordo = (renditaLorda / valore) * 100;
  
  // Calcolo roiNetto
  const roiNetto = (renditaNetta / valore) * 100;
  
  // Calcolo capitalGain
  const valoreAttuale = Number(data.valoreAttuale) || Number(data.valore) || 0;
  const valoreAcquisto = Number(data.valore) || 0;
  const capitalGain = valoreAttuale - valoreAcquisto;
  
  // Calcolo capitalGainPercent
  const capitalGainPercent = (capitalGain / valoreAcquisto) * 100;
  
  return {
    totalSpese,
    renditaLorda,
    renditaNetta,
    roiLordo,
    roiNetto,
    capitalGain,
    capitalGainPercent
  };
};

/**
 * ============================================================
 * CALCOLI OBBLIGAZIONI
 * ============================================================
 */

export const calculateYieldToMaturity = (nominalValue, currentPrice, couponRate, yearsToMaturity, frequency = 1) => {
  /**
   * Yield to Maturity (YTM) - rendimento a scadenza
   * Formula approssimata (simplified Newton-Raphson approximation)
   */
  if (yearsToMaturity <= 0 || currentPrice <= 0) return 0;
  
  const nomVal = Number(nominalValue) || 0;
  const currPrice = Number(currentPrice) || 1;
  const coupon = (nomVal * Number(couponRate)) / 100;
  const annualCoupon = coupon * frequency;
  const capitalGain = (nomVal - currPrice) / yearsToMaturity;
  const ytm = (annualCoupon + capitalGain) / currPrice;
  
  return ytm * 100;
};

export const calculateBondDuration = (yearsToMaturity, couponRate) => {
  /**
   * Duration (Macaulay Duration) - misura approssimata della sensibilità ai tassi
   */
  if (couponRate === 0) return yearsToMaturity;
  return (yearsToMaturity * (1 + couponRate / 100)) / 2;
};

/**
 * ============================================================
 * CALCOLI AZIONI / ETF / FONDI
 * ============================================================
 */

export const calculateDividendYield = (dividendPerShare, currentPrice) => {
  const dividend = Number(dividendPerShare) || 0;
  const price = Number(currentPrice) || 1;
  return (dividend / price) * 100;
};

export const calculateTotalReturn = (endValue, beginValue, dividends = 0, costs = 0) => {
  /**
   * Total Return = (Ending Value - Beginning Value + Dividends - Costs) / Beginning Value * 100
   */
  const end = Number(endValue) || 0;
  const begin = Number(beginValue) || 1;
  const div = Number(dividends) || 0;
  const cost = Number(costs) || 0;
  return ((end - begin + div - cost) / begin) * 100;
};

export const calculateAnnualizedReturn = (totalReturn, yearsHeld) => {
  /**
   * Annualized Return = (1 + Total Return)^(1/years) - 1
   */
  const total = Number(totalReturn) / 100 || 0;
  const years = Number(yearsHeld) || 1;
  if (years <= 0) return 0;
  return (Math.pow(1 + total, 1 / years) - 1) * 100;
};

/**
 * ============================================================
 * CALCOLI CRYPTO / METALLI / ALTERNATIVI
 * ============================================================
 */

export const calculateVolatilityBasedRisk = (historicalPrices = []) => {
  /**
   * Calcola la volatilità (standard deviation) da una serie di prezzi
   * Ritorna la volatilità annualizzata (%)
   */
  if (!Array.isArray(historicalPrices) || historicalPrices.length < 2) return 0;
  
  const prices = historicalPrices.map(p => Number(p) || 0);
  const returns = [];
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  const dailyVolatility = Math.sqrt(variance);
  const annualizedVolatility = dailyVolatility * Math.sqrt(252); // 252 trading days per year
  
  return annualizedVolatility * 100;
};

export const calculateStakingRewards = (stakedAmount, apy, daysHeld) => {
  /**
   * Calcola le ricompense di staking
   * Formula: Rewards = Staked Amount * APY * (Days Held / 365)
   */
  const amount = Number(stakedAmount) || 0;
  const rate = Number(apy) / 100 || 0;
  const days = Number(daysHeld) || 0;
  return amount * rate * (days / 365);
};

/**
 * ============================================================
 * CALCOLI GENERALI
 * ============================================================
 */

export const calculatePercentageChange = (newValue, oldValue) => {
  /**
   * Calcola il cambio percentuale
   */
  const newVal = Number(newValue) || 0;
  const oldVal = Number(oldValue) || 1;
  return ((newVal - oldVal) / oldVal) * 100;
};

export const calculateWeightedAverage = (values = [], weights = []) => {
  /**
   * Calcola la media ponderata
   */
  if (values.length === 0 || values.length !== weights.length) return 0;
  
  const total = values.reduce((sum, val, i) => sum + (Number(val) || 0) * (Number(weights[i]) || 0), 0);
  const weightSum = weights.reduce((sum, w) => sum + (Number(w) || 0), 0);
  
  return weightSum === 0 ? 0 : total / weightSum;
};

export const calculateNetValue = (grossValue, costs, taxes) => {
  /**
   * Calcola il valore netto dopo costi e tasse
   */
  const gross = Number(grossValue) || 0;
  const cost = Number(costs) || 0;
  const tax = Number(taxes) || 0;
  return gross - cost - tax;
};

export const calculateTaxes = (income, taxRate, exemptionThreshold = 0) => {
  /**
   * Calcola le tasse con eventuale soglia di esenzione
   */
  const inc = Number(income) || 0;
  const threshold = Number(exemptionThreshold) || 0;
  const taxableIncome = Math.max(0, inc - threshold);
  const rate = Number(taxRate) / 100 || 0;
  return taxableIncome * rate;
};

export const calculateCumulativeCosts = (annualCosts, years) => {
  /**
   * Calcola i costi cumulativi su N anni
   */
  const annual = Number(annualCosts) || 0;
  const periodsYears = Number(years) || 0;
  return annual * periodsYears;
};