export const initialState = {
  entrate: {
    stipendio: { netto: 0, lordo: 0, oreStandard: 0, oreEffettive: 0 },
    bonus: [],
    altreEntrate: []
  },
  patrimonio: {
    tfr: 0,
    contiDeposito: [],
    investimenti: {
      azioni: [],
      etf: [],
      crypto: [],
      oro: 0
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
