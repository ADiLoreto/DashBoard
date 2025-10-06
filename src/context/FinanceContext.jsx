import React, { createContext, useReducer, useEffect } from 'react';
import { initialState } from '../config/constants';
import { saveState, loadState } from '../utils/storage';

export const FinanceContext = createContext();

const financeReducer = (state, action) => {
  switch(action.type) {
    case 'UPDATE_STIPENDIO':
      return { ...state, entrate: { ...state.entrate, stipendio: { ...state.entrate.stipendio, ...action.payload } } };
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
  const [state, dispatch] = useReducer(financeReducer, initialState);

  useEffect(() => {
    const savedState = loadState();
    if (savedState) dispatch({ type: 'LOAD_STATE', payload: savedState });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => saveState(state), 1000);
    return () => clearTimeout(timeoutId);
  }, [state]);

  return <FinanceContext.Provider value={{ state, dispatch }}>{children}</FinanceContext.Provider>;
};
