// Schemi e configurazioni per asset e cashflow
export const baseAssetSchema = {
  id: null,
  tipo: '', // e.g. 'immobili', 'conti', 'azioni', 'etf', 'crypto', 'oro', 'buoni'
  titolo: '',
  valore: 0,
  note: '',
  documenti: [],
  cashflows: [] // array of cashflowSchema
};

export const cashflowSchema = {
  id: null,
  type: 'entrata', // 'entrata' | 'uscita'
  titolo: '',
  amount: 0,
  frequency: 'once', // monthly | quarterly | semiannually | yearly | once
  startDate: null, // ISO date string
  autoGenerate: false,
  nextGeneration: null, // ISO date string
  meta: {} // optional metadata (assetId, assetTipo, notes)
};

// Campi specifici per tipo asset (utili per costruire il BaseDataStep nel wizard)
export const assetTypeFields = {
  immobili: [
    { name: 'titolo', label: 'Nome immobile', type: 'text' },
    { name: 'indirizzo', label: 'Indirizzo', type: 'text' },
    { name: 'metratura', label: 'Metratura (mq)', type: 'number' },
    { name: 'valore', label: 'Valore (€)', type: 'number' }
  ],
  conti: [
    { name: 'titolo', label: 'Nome conto', type: 'text' },
    { name: 'saldo', label: 'Saldo (€)', type: 'number' }
  ],
  buoni: [
    { name: 'titolo', label: 'Titolo', type: 'text' },
    { name: 'importo', label: 'Importo (€)', type: 'number' }
  ],
  azioni: [
    { name: 'titolo', label: 'Nome azione', type: 'text' },
    { name: 'ticker', label: 'Ticker', type: 'text' },
    { name: 'quantita', label: 'Quantità', type: 'number' },
    { name: 'prezzoAcquisto', label: 'Prezzo acquisto (€)', type: 'number' }
  ],
  etf: [
    { name: 'titolo', label: 'Nome ETF', type: 'text' },
    { name: 'ticker', label: 'Ticker', type: 'text' },
    { name: 'quantita', label: 'Quantità', type: 'number' }
  ],
  crypto: [
    { name: 'titolo', label: 'Nome crypto', type: 'text' },
    { name: 'wallet', label: 'Wallet/Exchange', type: 'text' },
    { name: 'quantita', label: 'Quantità', type: 'number' }
  ],
  oro: [
    { name: 'titolo', label: 'Tipo materiale', type: 'text' },
    { name: 'quantita', label: 'Quantità', type: 'number' },
    { name: 'purezza', label: 'Purezza (%)', type: 'number' }
  ]
};

export default { baseAssetSchema, cashflowSchema, assetTypeFields };
