import React, { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { initialState } from '../config/constants';
import { saveState, loadState, loadDraft, saveDraft, clearDraft } from '../utils/storage';
import { AuthContext } from './AuthContext';

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

  useEffect(() => {
    if (!username) return;
    const savedState = loadState(username);
    if (savedState) dispatch({ type: 'LOAD_STATE', payload: savedState });
  }, [username]);

  useEffect(() => {
    if (!username) return;
    setDirty(true);
    const timeoutId = setTimeout(() => {
      saveState(state, username);
      setDirty(false);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [state, username]);

  // auto-save draft example: whenever state changes save draft for user
  useEffect(() => {
    if (!username) return;
    saveDraft(state, username);
  }, [state, username]);

  // ensure draft is saved on page unload
  useEffect(() => {
    if (!username) return;
    const handler = () => saveDraft(state, username);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state, username]);

  const markSaved = () => setDirty(false);

  return <FinanceContext.Provider value={{ state, dispatch, dirty, markSaved }}>{children}</FinanceContext.Provider>;
};
