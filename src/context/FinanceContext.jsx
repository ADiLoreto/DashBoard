import React, { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { initialState } from '../config/constants';
import { saveState, loadState, loadDraft, saveDraft, clearDraft } from '../utils/storage';
import { AuthContext } from './AuthContext';

// Utility: calculate next generation date given frequency
const calculateNextDate = (currentIso, frequency) => {
  if (!currentIso) return null;
  const d = new Date(currentIso);
  if (Number.isNaN(d.getTime())) return null;
  switch (frequency) {
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'semiannually': d.setMonth(d.getMonth() + 6); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    case 'once': return null;
    default: d.setMonth(d.getMonth() + 1); break;
  }
  return d.toISOString();
};

// Helper: update an asset inside patrimonio by type
const updateAssetInPatrimonio = (state, assetType, asset) => {
  const s = { ...state };
  switch (assetType) {
    case 'conti':
      s.patrimonio = { ...s.patrimonio, contiDeposito: (s.patrimonio.contiDeposito || []).map(a => a.id === asset.id ? { ...a, ...asset } : a) };
      break;
    case 'immobili':
      s.patrimonio = { ...s.patrimonio, immobili: (s.patrimonio.immobili || []).map(a => a.id === asset.id ? { ...a, ...asset } : a) };
      break;
    case 'buoni':
      s.patrimonio = { ...s.patrimonio, buoniTitoli: (s.patrimonio.buoniTitoli || []).map(a => a.id === asset.id ? { ...a, ...asset } : a) };
      break;
    case 'azioni':
      s.patrimonio = { ...s.patrimonio, investimenti: { ...s.patrimonio.investimenti, azioni: (s.patrimonio.investimenti.azioni || []).map(a => a.id === asset.id ? { ...a, ...asset } : a) } };
      break;
    case 'etf':
      s.patrimonio = { ...s.patrimonio, investimenti: { ...s.patrimonio.investimenti, etf: (s.patrimonio.investimenti.etf || []).map(a => a.id === asset.id ? { ...a, ...asset } : a) } };
      break;
    case 'crypto':
      s.patrimonio = { ...s.patrimonio, investimenti: { ...s.patrimonio.investimenti, crypto: (s.patrimonio.investimenti.crypto || []).map(a => a.id === asset.id ? { ...a, ...asset } : a) } };
      break;
    case 'oro':
      s.patrimonio = { ...s.patrimonio, investimenti: { ...s.patrimonio.investimenti, oro: (s.patrimonio.investimenti.oro || []).map(a => a.id === asset.id ? { ...a, ...asset } : a) } };
      break;
    default:
      break;
  }
  return s;
};

export const FinanceContext = createContext();

const financeReducer = (state, action) => {
  switch(action.type) {
    case 'UPDATE_STIPENDIO':
      return { ...state, entrate: { ...state.entrate, stipendio: { ...state.entrate.stipendio, ...action.payload } } };
    case 'ADD_ENTRATA':
      return { ...state, entrate: { ...state.entrate, altreEntrate: [ ...(state.entrate.altreEntrate || []), action.payload ] } };
    case 'UPDATE_ENTRATA':
      return {
        ...state,
        entrate: {
          ...state.entrate,
          altreEntrate: (state.entrate.altreEntrate || []).map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e)
        }
      };
    case 'DELETE_ENTRATA':
      return {
        ...state,
        entrate: {
          ...state.entrate,
          altreEntrate: (state.entrate.altreEntrate || []).filter(e => e.id !== action.payload.id)
        }
      };
    case 'ADD_PATRIMONIO_CONTO':
      return { ...state, patrimonio: { ...state.patrimonio, contiDeposito: [ ...(state.patrimonio.contiDeposito || []), action.payload ] } };
    case 'UPDATE_PATRIMONIO_CONTO':
      return { ...state, patrimonio: { ...state.patrimonio, contiDeposito: (state.patrimonio.contiDeposito || []).map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) } };
    case 'DELETE_PATRIMONIO_CONTO':
      return { ...state, patrimonio: { ...state.patrimonio, contiDeposito: (state.patrimonio.contiDeposito || []).filter(c => c.id !== action.payload.id) } };

    case 'ADD_PATRIMONIO_IMMOBILE':
      return { ...state, patrimonio: { ...state.patrimonio, immobili: [ ...(state.patrimonio.immobili || []), action.payload ] } };
    case 'UPDATE_IMMOBILE_EXPENSES':
      return {
        ...state,
        patrimonio: {
          ...state.patrimonio,
          immobili: state.patrimonio.immobili.map(i => 
            i.id === action.payload.id 
              ? { 
                  ...i, 
                  expenses: action.payload.expenses,
                  taxRate: action.payload.taxRate,
                  yearlyRent: action.payload.yearlyRent
                }
              : i
          )
        }
      };

    case 'UPDATE_PATRIMONIO_IMMOBILE':
      return { ...state, patrimonio: { ...state.patrimonio, immobili: (state.patrimonio.immobili || []).map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i) } };
    case 'DELETE_PATRIMONIO_IMMOBILE':
      return { ...state, patrimonio: { ...state.patrimonio, immobili: (state.patrimonio.immobili || []).filter(i => i.id !== action.payload.id) } };

    case 'ADD_INVESTIMENTO_AZIONE':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, azioni: [ ...(state.patrimonio.investimenti.azioni || []), action.payload ] } } };
    case 'UPDATE_INVESTIMENTO_AZIONE':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, azioni: (state.patrimonio.investimenti.azioni || []).map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) } } };
    case 'DELETE_INVESTIMENTO_AZIONE':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, azioni: (state.patrimonio.investimenti.azioni || []).filter(a => a.id !== action.payload.id) } } };

    case 'ADD_BUONO_TITOLO':
      return { ...state, patrimonio: { ...state.patrimonio, buoniTitoli: [ ...(state.patrimonio.buoniTitoli || []), action.payload ] } };
    case 'UPDATE_BUONO_TITOLO':
      return { ...state, patrimonio: { ...state.patrimonio, buoniTitoli: (state.patrimonio.buoniTitoli || []).map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b) } };
    case 'DELETE_BUONO_TITOLO':
      return { ...state, patrimonio: { ...state.patrimonio, buoniTitoli: (state.patrimonio.buoniTitoli || []).filter(b => b.id !== action.payload.id) } };

    case 'ADD_INVESTIMENTO_ETF':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, etf: [ ...(state.patrimonio.investimenti.etf || []), action.payload ] } } };
    case 'UPDATE_INVESTIMENTO_ETF':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, etf: (state.patrimonio.investimenti.etf || []).map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i) } } };
    case 'DELETE_INVESTIMENTO_ETF':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, etf: (state.patrimonio.investimenti.etf || []).filter(i => i.id !== action.payload.id) } } };

    case 'ADD_INVESTIMENTO_CRYPTO':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, crypto: [ ...(state.patrimonio.investimenti.crypto || []), action.payload ] } } };
    case 'UPDATE_INVESTIMENTO_CRYPTO':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, crypto: (state.patrimonio.investimenti.crypto || []).map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) } } };
    case 'DELETE_INVESTIMENTO_CRYPTO':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, crypto: (state.patrimonio.investimenti.crypto || []).filter(c => c.id !== action.payload.id) } } };

    case 'ADD_ORO':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, oro: [ ...(state.patrimonio.investimenti.oro || []), action.payload ] } } };
    case 'UPDATE_ORO':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, oro: (state.patrimonio.investimenti.oro || []).map(o => o.id === action.payload.id ? { ...o, ...action.payload } : o) } } };
    case 'DELETE_ORO':
      return { ...state, patrimonio: { ...state.patrimonio, investimenti: { ...state.patrimonio.investimenti, oro: (state.patrimonio.investimenti.oro || []).filter(o => o.id !== action.payload.id) } } };

    case 'ADD_USCITA_FISSA':
      return { ...state, uscite: { ...state.uscite, fisse: [ ...(state.uscite.fisse || []), action.payload ] } };
    case 'UPDATE_USCITA_FISSA':
      return { ...state, uscite: { ...state.uscite, fisse: (state.uscite.fisse || []).map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u) } };
    case 'DELETE_USCITA_FISSA':
      return { ...state, uscite: { ...state.uscite, fisse: (state.uscite.fisse || []).filter(u => u.id !== action.payload.id) } };

    case 'ADD_USCITA_VARIABILE':
      return { ...state, uscite: { ...state.uscite, variabili: [ ...(state.uscite.variabili || []), action.payload ] } };
    case 'ADD_PROGETTO_EXTRA':
      return { ...state, progettiExtra: [ ...(state.progettiExtra || []), action.payload ] };
    case 'UPDATE_PROGETTO_EXTRA':
      return { ...state, progettiExtra: (state.progettiExtra || []).map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
    case 'DELETE_PROGETTO_EXTRA':
      return { ...state, progettiExtra: (state.progettiExtra || []).filter(p => p.id !== action.payload.id) };
    case 'ADD_LIQUIDITA_CONTO':
      return { ...state, liquidita: { ...state.liquidita, contiCorrenti: [ ...(state.liquidita.contiCorrenti || []), action.payload ] } };
    case 'UPDATE_LIQUIDITA_CONTO':
      return { ...state, liquidita: { ...state.liquidita, contiCorrenti: (state.liquidita.contiCorrenti || []).map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) } };
    case 'DELETE_LIQUIDITA_CONTO':
      return { ...state, liquidita: { ...state.liquidita, contiCorrenti: (state.liquidita.contiCorrenti || []).filter(c => c.id !== action.payload.id) } };

    case 'ADD_LIQUIDITA_CARTE':
      return { ...state, liquidita: { ...state.liquidita, cartePrepagate: [ ...(state.liquidita.cartePrepagate || []), action.payload ] } };
    case 'UPDATE_LIQUIDITA_CARTE':
      return { ...state, liquidita: { ...state.liquidita, cartePrepagate: (state.liquidita.cartePrepagate || []).map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) } };
    case 'DELETE_LIQUIDITA_CARTE':
      return { ...state, liquidita: { ...state.liquidita, cartePrepagate: (state.liquidita.cartePrepagate || []).filter(c => c.id !== action.payload.id) } };

    case 'UPDATE_LIQUIDITA_CONTANTE':
      return { ...state, liquidita: { ...state.liquidita, contante: action.payload.contante } };
    case 'UPDATE_USCITA_VARIABILE':
      return { ...state, uscite: { ...state.uscite, variabili: (state.uscite.variabili || []).map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u) } };
    case 'DELETE_USCITA_VARIABILE':
      return { ...state, uscite: { ...state.uscite, variabili: (state.uscite.variabili || []).filter(u => u.id !== action.payload.id) } };
    
    case 'UPDATE_ASSET_WITH_CASHFLOWS': {
      // payload: { assetType, asset }
      const { assetType, asset } = action.payload || {};
      if (!assetType || !asset) return state;
      return updateAssetInPatrimonio(state, assetType, asset);
    }

    case 'GENERATE_CASHFLOWS_FROM_ASSETS': {
      // scan patrimonio, find asset.cashflows with autoGenerate true and nextGeneration <= now
      const now = new Date();
      const s = JSON.parse(JSON.stringify(state)); // deep clone to mutate safely
      const generated = [];

      const processAsset = (asset, assetType) => {
        if (!asset || !Array.isArray(asset.cashflows)) return;
        asset.cashflows = asset.cashflows.map(cf => {
          try {
            if (cf.autoGenerate && cf.nextGeneration) {
              const next = new Date(cf.nextGeneration);
              if (!isNaN(next.getTime()) && next <= now) {
                // create generated entry
                const gen = {
                  id: Math.random().toString(36).slice(2,9),
                  sourceAssetId: asset.id,
                  sourceAssetTipo: assetType,
                  titolo: cf.titolo || (`${asset.titolo || asset.name} - ${cf.titolo || 'cashflow'}`),
                  amount: Number(cf.amount || 0),
                  date: cf.nextGeneration,
                  type: cf.type || 'entrata'
                };
                generated.push(gen);
                // advance nextGeneration
                cf.nextGeneration = calculateNextDate(cf.nextGeneration, cf.frequency);
              }
            }
          } catch (e) {
            // ignore
          }
          return cf;
        });
      };

      // contiDeposito
      (s.patrimonio.contiDeposito || []).forEach(a => processAsset(a, 'conti'));
      (s.patrimonio.immobili || []).forEach(a => processAsset(a, 'immobili'));
      (s.patrimonio.buoniTitoli || []).forEach(a => processAsset(a, 'buoni'));
      const inv = s.patrimonio.investimenti || {};
      (inv.azioni || []).forEach(a => processAsset(a, 'azioni'));
      (inv.etf || []).forEach(a => processAsset(a, 'etf'));
      (inv.crypto || []).forEach(a => processAsset(a, 'crypto'));
      (inv.oro || []).forEach(a => processAsset(a, 'oro'));

      // append generated entries to entrate or uscite arrays
      generated.forEach(g => {
        if (g.type === 'entrata') s.entrate.cashflowAsset = [ ...(s.entrate.cashflowAsset || []), g ];
        else s.uscite.cashflowAsset = [ ...(s.uscite.cashflowAsset || []), g ];
      });

      return s;
    }
    case 'UPDATE_CASHFLOW_ASSET': {
      // payload: updated generated cashflow entry
      const updated = action.payload || {};
      const id = updated.id;

      // shallow clone state parts we will modify
      const s = JSON.parse(JSON.stringify(state));

      // update entrate and uscite generated arrays if present
      s.entrate = s.entrate || {};
      s.entrate.cashflowAsset = (s.entrate.cashflowAsset || []).map(cf => cf.id === id ? { ...cf, ...updated } : cf);
      s.uscite = s.uscite || {};
      s.uscite.cashflowAsset = (s.uscite.cashflowAsset || []).map(cf => cf.id === id ? { ...cf, ...updated } : cf);

      // if the generated entry references an asset, sync the cashflow inside that asset
      const meta = updated.meta || {};
      const assetId = meta.assetId || updated.sourceAssetId || null;
      const assetTipo = (meta.assetTipo || updated.sourceAssetTipo || '') .toString();

      if (assetId && assetTipo) {
        // prepare updated cashflow fields to merge into asset.cashflows[]
        const cfId = updated.cashflowId || id;
        const cfPatch = {
          titolo: updated.titolo || updated.title,
          amount: updated.amount !== undefined ? Number(updated.amount) : (updated.importo !== undefined ? Number(updated.importo) : undefined),
          frequency: updated.frequency,
          startDate: updated.startDate || updated.date,
          autoGenerate: updated.autoGenerate
        };

        // helper to update cashflows array on an asset
        const updateAssetCashflows = (asset) => {
          if (!asset) return asset;
          const patched = (asset.cashflows || []).map(cf => cf.id === cfId ? { ...cf, ...cfPatch } : cf);
          return { ...asset, cashflows: patched };
        };

        // map to correct patrimonio section
        switch (assetTipo) {
          case 'conti':
          case 'contiDeposito':
          case 'conto':
            s.patrimonio.contiDeposito = (s.patrimonio.contiDeposito || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            break;
          case 'immobile':
          case 'immobili':
            s.patrimonio.immobili = (s.patrimonio.immobili || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            break;
          case 'buono':
          case 'buoni':
          case 'buoniTitoli':
            s.patrimonio.buoniTitoli = (s.patrimonio.buoniTitoli || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            break;
          case 'azioni':
          case 'azione':
            s.patrimonio.investimenti = s.patrimonio.investimenti || {};
            s.patrimonio.investimenti.azioni = (s.patrimonio.investimenti.azioni || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            break;
          case 'etf':
            s.patrimonio.investimenti = s.patrimonio.investimenti || {};
            s.patrimonio.investimenti.etf = (s.patrimonio.investimenti.etf || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            break;
          case 'crypto':
            s.patrimonio.investimenti = s.patrimonio.investimenti || {};
            s.patrimonio.investimenti.crypto = (s.patrimonio.investimenti.crypto || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            break;
          case 'oro':
            s.patrimonio.investimenti = s.patrimonio.investimenti || {};
            s.patrimonio.investimenti.oro = (s.patrimonio.investimenti.oro || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            break;
          default:
            // unknown asset type: attempt to patch across all possible arrays
            s.patrimonio.contiDeposito = (s.patrimonio.contiDeposito || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            s.patrimonio.immobili = (s.patrimonio.immobili || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            s.patrimonio.buoniTitoli = (s.patrimonio.buoniTitoli || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            if (s.patrimonio.investimenti) {
              s.patrimonio.investimenti.azioni = (s.patrimonio.investimenti.azioni || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
              s.patrimonio.investimenti.etf = (s.patrimonio.investimenti.etf || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
              s.patrimonio.investimenti.crypto = (s.patrimonio.investimenti.crypto || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
              s.patrimonio.investimenti.oro = (s.patrimonio.investimenti.oro || []).map(a => a.id === assetId ? updateAssetCashflows(a) : a);
            }
            break;
        }
      }

      return s;
    }
    case 'ADD_INVESTIMENTO':
      // logica per aggiungere investimento
      return state;
    case 'DELETE_SPESA':
      // logica per rimuovere spesa
      return state;
    case 'LOAD_STATE':
      return { ...action.payload };
    default:
      return state;
  }
};

export const FinanceProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const username = user?.username;
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [dirty, setDirty] = useState(false);

  // normalize incoming state shapes to a canonical one used across the app
  const normalizeState = (raw = {}) => {
    // shallow clone to avoid mutating original
    const s = JSON.parse(JSON.stringify(raw || {}));

    // ensure liquidita exists and canonical fields are present
    s.liquidita = s.liquidita || {};

    // ensure patrimonio exists and canonical arrays are present
    s.patrimonio = s.patrimonio || {};
    if (!Array.isArray(s.patrimonio.immobili)) {
      // try to fallback from older keys if present
      if (Array.isArray(s.patrimonio?.contiExtra)) s.patrimonio.immobili = s.patrimonio.contiExtra;
      else s.patrimonio.immobili = [];
    }

    // contiCorrenti: prefer contiCorrenti, fallback to liquidita.conti or patrimonio.contiDeposito
    if (!Array.isArray(s.liquidita.contiCorrenti)) {
      if (Array.isArray(s.liquidita.conti)) s.liquidita.contiCorrenti = s.liquidita.conti;
      else if (Array.isArray(s.patrimonio?.contiDeposito)) s.liquidita.contiCorrenti = s.patrimonio.contiDeposito;
      else s.liquidita.contiCorrenti = [];
    }

    // cartePrepagate: prefer cartePrepagate, fallback to liquidita.carte
    if (!Array.isArray(s.liquidita.cartePrepagate)) {
      if (Array.isArray(s.liquidita.carte)) s.liquidita.cartePrepagate = s.liquidita.carte;
      else s.liquidita.cartePrepagate = [];
    }

    // contante: prefer explicit contante, fallback to altro or patrimonio.contante
    if (s.liquidita.contante === undefined) {
      s.liquidita.contante = (s.liquidita?.contante ?? s.liquidita?.altro ?? s.patrimonio?.contante ?? 0);
    }

    // normalize numeric values and account shapes
    s.liquidita.contiCorrenti = (s.liquidita.contiCorrenti || []).map(c => ({
      ...c,
      saldo: Number(c?.saldo ?? c?.importo ?? 0)
    }));
    s.liquidita.cartePrepagate = (s.liquidita.cartePrepagate || []).map(c => ({
      ...c,
      saldo: Number(c?.saldo ?? c?.importo ?? 0)
    }));
    s.liquidita.contante = Number(s.liquidita.contante || 0);

    // normalize patrimonio arrays
  s.patrimonio.contiDeposito = (s.patrimonio.contiDeposito || []).map(c => ({ ...c, saldo: Number(c?.saldo ?? c?.importo ?? 0), cashflows: c.cashflows || [] }));
  s.patrimonio.immobili = (s.patrimonio.immobili || []).map(i => ({ ...i, valore: Number(i?.valore ?? i?.saldo ?? 0), cashflows: i.cashflows || [] }));
  s.patrimonio.buoniTitoli = (s.patrimonio.buoniTitoli || []).map(b => ({ ...b, importo: Number(b?.importo ?? b?.valore ?? 0), cashflows: b.cashflows || [] }));
  // investments group
  if (!s.patrimonio.investimenti) s.patrimonio.investimenti = { azioni: [], etf: [], crypto: [], oro: [] };
  s.patrimonio.investimenti.azioni = (s.patrimonio.investimenti.azioni || []).map(a => ({ ...a, valore: Number(a?.valore ?? a?.importo ?? 0), cashflows: a.cashflows || [] }));
  s.patrimonio.investimenti.etf = (s.patrimonio.investimenti.etf || []).map(e => ({ ...e, valore: Number(e?.valore ?? e?.importo ?? 0), cashflows: e.cashflows || [] }));
  s.patrimonio.investimenti.crypto = (s.patrimonio.investimenti.crypto || []).map(c => ({ ...c, valore: Number(c?.valore ?? c?.importo ?? 0), cashflows: c.cashflows || [] }));
  s.patrimonio.investimenti.oro = (s.patrimonio.investimenti.oro || []).map(o => ({ ...o, valore: Number(o?.valore ?? o?.importo ?? 0), cashflows: o.cashflows || [] }));

  // ensure entrate/uscite cashflow arrays exist
  s.entrate = s.entrate || {};
  if (!Array.isArray(s.entrate.cashflowAsset)) s.entrate.cashflowAsset = [];
  s.uscite = s.uscite || {};
  if (!Array.isArray(s.uscite.cashflowAsset)) s.uscite.cashflowAsset = [];

    return s;
  };

  useEffect(() => {
    if (!username) return;
    const savedState = loadState(username);
    if (savedState) dispatch({ type: 'LOAD_STATE', payload: normalizeState(savedState) });
  }, [username]);

  useEffect(() => {
    if (!username) return;
    setDirty(true);
    const timeoutId = setTimeout(() => {
      // persist normalized state to storage (avoid saving multiple shapes)
      try {
        saveState(normalizeState(state), username);
      } catch (e) {
        // fallback to saving raw state if normalization fails
        saveState(state, username);
      }
      setDirty(false);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [state, username]);

  // auto-save draft example: whenever state changes save draft for user
  useEffect(() => {
    if (!username) return;
    try {
      saveDraft(normalizeState(state), username);
    } catch (e) {
      saveDraft(state, username);
    }
  }, [state, username]);

  // ensure draft is saved on page unload
  useEffect(() => {
    if (!username) return;
    const handler = () => {
      try { saveDraft(normalizeState(state), username); } catch (e) { saveDraft(state, username); }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state, username]);

  const markSaved = () => setDirty(false);

  return <FinanceContext.Provider value={{ state, dispatch, dirty, markSaved }}>{children}</FinanceContext.Provider>;
};
