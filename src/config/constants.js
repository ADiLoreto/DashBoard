export const initialState = {
  entrate: {
    stipendio: { netto: 0, lordo: 0, oreStandard: 0, oreEffettive: 0 },
    bonus: [],
    altreEntrate: []
  },
  patrimonio: {
    tfr: 0,
    contiDeposito: [],
    buoniTitoli: [],
    investimenti: {
      azioni: [],
      etf: [],
      crypto: [],
      oro: []
    }
  },
  liquidita: {
    contiCorrenti: [],
    cartePrepagate: [],
    contante: 0
  },
  uscite: {
    fisse: [],
    variabili: []
  },
  progettiExtra: [],
  libertaGiorni: 0
};
