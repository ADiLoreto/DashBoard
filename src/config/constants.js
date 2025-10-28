export const initialState = {
  entrate: {
    stipendio: { netto: 0, lordo: 0, oreStandard: 0, oreEffettive: 0 },
    bonus: [],
    altreEntrate: [],
    // auto-generated cashflows from assets
    cashflowAsset: []
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
    variabili: [],
    // auto-generated cashflows from assets (expenses)
    cashflowAsset: []
  },
  progettiExtra: [],
  libertaGiorni: 0
};
