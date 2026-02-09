/**
 * Asset Management Helpers
 * Funzioni di supporto per la gestione centralizzata degli asset
 */

import { ASSET_FIELD_CONFIG } from '../config/assetFields';

/**
 * Mappa dai nomi della configurazione agli asset type del reducer
 */
export const ASSET_TYPE_MAPPING = {
  immobili: 'immobili',
  obbligazioni: 'obbligazioni',
  azioni: 'azioni',
  etf: 'etf',
  conti: 'conti',
  crypto: 'crypto',
  metalli: 'metalli',
  oro: 'metalli', // oro è un alias per metalli nel popup
  fondi: 'fondi',
  polizze: 'polizze',
  alternativi: 'alternativi'
};

/**
 * Mappa dai nomi della configurazione alle azioni del reducer
 */
export const getAssetActions = (assetType) => {
  const typeMap = {
    immobili: { add: 'ADD_PATRIMONIO_IMMOBILE', update: 'UPDATE_PATRIMONIO_IMMOBILE', delete: 'DELETE_PATRIMONIO_IMMOBILE' },
    obbligazioni: { add: 'ADD_INVESTIMENTO_OBBLIGAZIONI', update: 'UPDATE_INVESTIMENTO_OBBLIGAZIONI', delete: 'DELETE_INVESTIMENTO_OBBLIGAZIONI' },
    azioni: { add: 'ADD_INVESTIMENTO_AZIONE', update: 'UPDATE_INVESTIMENTO_AZIONE', delete: 'DELETE_INVESTIMENTO_AZIONE' },
    etf: { add: 'ADD_INVESTIMENTO_ETF', update: 'UPDATE_INVESTIMENTO_ETF', delete: 'DELETE_INVESTIMENTO_ETF' },
    conti: { add: 'ADD_PATRIMONIO_CONTO', update: 'UPDATE_PATRIMONIO_CONTO', delete: 'DELETE_PATRIMONIO_CONTO' },
    crypto: { add: 'ADD_INVESTIMENTO_CRYPTO', update: 'UPDATE_INVESTIMENTO_CRYPTO', delete: 'DELETE_INVESTIMENTO_CRYPTO' },
    metalli: { add: 'ADD_METALLI', update: 'UPDATE_METALLI', delete: 'DELETE_METALLI' },
    fondi: { add: 'ADD_INVESTIMENTO_FONDI', update: 'UPDATE_INVESTIMENTO_FONDI', delete: 'DELETE_INVESTIMENTO_FONDI' },
    polizze: { add: 'ADD_INVESTIMENTO_POLIZZE', update: 'UPDATE_INVESTIMENTO_POLIZZE', delete: 'DELETE_INVESTIMENTO_POLIZZE' },
    alternativi: { add: 'ADD_INVESTIMENTO_ALTERNATIVI', update: 'UPDATE_INVESTIMENTO_ALTERNATIVI', delete: 'DELETE_INVESTIMENTO_ALTERNATIVI' },
    buoni: { add: 'ADD_BUONO_TITOLO', update: 'UPDATE_BUONO_TITOLO', delete: 'DELETE_BUONO_TITOLO' },
    bassoRischio: { add: 'ADD_INVESTIMENTO_BASSORISCHIO', update: 'UPDATE_INVESTIMENTO_BASSORISCHIO', delete: 'DELETE_INVESTIMENTO_BASSORISCHIO' }
  };
  return typeMap[assetType];
};

/**
 * Genera un ID univoco
 */
export const generateAssetId = () => {
  return Math.random().toString(36).slice(2, 9);
};

/**
 * Prepara i dati dell'asset per il salvataggio
 * - Aggiunge l'ID se nuovo
 * - Converte stringhe numeriche in numeri
 * - Pulisce i dati non necessari
 */
export const prepareAssetData = (data, isNew = false, assetType = null) => {
  console.log('prepareAssetData input:', { data, isNew });
  const prepared = { ...data };
  
  // Aggiungi ID per nuovi asset
  if (isNew && !prepared.id) {
    prepared.id = generateAssetId();
  }
  
  // Converti campi numerici da string a number
  // Questo è critico perché i form input HTML passano stringhe
  const numericFields = ['valore', 'valoreAttuale', 'importo', 'quantita', 'prezzoMedioAcquisto', 'tassoInteresse', 'saldo', 'valoreNominale', 'prezzoAcquisto', 'quantitaQuote', 'valoreQuota', 'prezzoMedioAcquisto', 'tassoAnnuale'];
  
  Object.keys(prepared).forEach(key => {
    if (numericFields.includes(key) && prepared[key] !== null && prepared[key] !== undefined && prepared[key] !== '') {
      const num = Number(prepared[key]);
      if (!isNaN(num)) {
        prepared[key] = num;
      }
    }
  });
  
  console.log('prepareAssetData output:', prepared);
  return prepared;
};

/**
 * Ottiene i dati dell'asset dal patrimonio
 */
export const getAssetFromPatrimonio = (state, assetType, assetId) => {
  const patrimonio = state.patrimonio || {};
  
  switch (assetType) {
    case 'conti':
      return (patrimonio.contiDeposito || []).find(a => a.id === assetId);
    case 'immobili':
      return (patrimonio.immobili || []).find(a => a.id === assetId);
    case 'buoni':
      return (patrimonio.buoniTitoli || []).find(a => a.id === assetId);
    case 'bassoRischio': {
      const inv = patrimonio.investimenti || {};
      return (inv.bassoRischio || []).find(a => a.id === assetId);
    }
    default: {
      const investimenti = patrimonio.investimenti || {};
      return (investimenti[assetType] || []).find(a => a.id === assetId);
    }
  }
};

/**
 * Ottiene tutti gli asset di un tipo dal patrimonio
 */
export const getAssetsByType = (state, assetType) => {
  const patrimonio = state.patrimonio || {};
  
  switch (assetType) {
    case 'conti':
      return patrimonio.contiDeposito || [];
    case 'immobili':
      return patrimonio.immobili || [];
    case 'buoni':
      return patrimonio.buoniTitoli || [];
    case 'bassoRischio': {
      const inv = patrimonio.investimenti || {};
      return inv.bassoRischio || [];
    }
    default: {
      const investimenti = patrimonio.investimenti || {};
      return investimenti[assetType] || [];
    }
  }
};

/**
 * Crea handlers per un tipo di asset
 * Ritorna { handleAdd, handleEdit, handleDelete, handleSave }
 */
export const createAssetHandlers = (assetType, dispatch) => {
  const actions = getAssetActions(assetType);
  
  if (!actions) {
    console.warn(`Unknown asset type: ${assetType}`);
    return { handleAdd: () => {}, handleEdit: () => {}, handleDelete: () => {}, handleSave: () => {} };
  }

  return {
    handleAdd: (data) => {
      const prepared = prepareAssetData(data, true);
      dispatch({ type: actions.add, payload: prepared });
    },
    
    handleEdit: (data) => {
      const prepared = prepareAssetData(data, false);
      dispatch({ type: actions.update, payload: prepared });
    },
    
    handleDelete: (assetId) => {
      dispatch({ type: actions.delete, payload: { id: assetId } });
    },
    
    handleSave: (data) => {
      if (data.id) {
        // Aggiornamento
        const prepared = prepareAssetData(data, false);
        dispatch({ type: actions.update, payload: prepared });
      } else {
        // Creazione
        const prepared = prepareAssetData(data, true);
        dispatch({ type: actions.add, payload: prepared });
      }
    }
  };
};

/**
 * Helper per raggruppare gli asset per categoria
 */
export const groupAssetsByCategory = (state) => {
  const grouped = {};
  
  Object.keys(ASSET_FIELD_CONFIG).forEach(assetType => {
    grouped[assetType] = getAssetsByType(state, assetType);
  });
  
  return grouped;
};

/**
 * Calcola il valore totale di un tipo di asset
 */
export const calculateTotalAssetValue = (assets, valueField = 'valoreAttuale') => {
  return assets.reduce((sum, asset) => {
    return sum + (Number(asset[valueField]) || Number(asset.valore) || 0);
  }, 0);
};

/**
 * Calcola la composizione del portafoglio (%)
 */
export const calculatePortfolioComposition = (state) => {
  const grouped = groupAssetsByCategory(state);
  let total = 0;
  const values = {};
  
  // Calcola il totale
  Object.entries(grouped).forEach(([type, assets]) => {
    const value = calculateTotalAssetValue(assets);
    values[type] = value;
    total += value;
  });
  
  // Calcola le percentuali
  const composition = {};
  Object.entries(values).forEach(([type, value]) => {
    composition[type] = total > 0 ? (value / total * 100) : 0;
  });
  
  return { composition, values, total };
};

export default {
  ASSET_TYPE_MAPPING,
  getAssetActions,
  generateAssetId,
  prepareAssetData,
  getAssetFromPatrimonio,
  getAssetsByType,
  createAssetHandlers,
  groupAssetsByCategory,
  calculateTotalAssetValue,
  calculatePortfolioComposition
};
