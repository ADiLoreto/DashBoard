La gestione e modifica della sotto tab "immobili" nella scheda asset/patrimonio è implementata principalmente nel componente AssetPatrimonio.jsx:

- **Stato e handler**:  
  - Lo stato `editingImmobile` e le funzioni `openEditImmobile`, `handleUpdateImmobile`, `handleDeleteImmobile` gestiscono l'apertura, modifica e cancellazione di un immobile (AssetPatrimonio.jsx).
- **Popup di modifica**:  
  - Il popup/modal per la modifica di un immobile viene renderizzato quando `showEditImmobile` è true (AssetPatrimonio.jsx).
- **Gestione spese/cashflow**:  
  - La gestione delle spese e del cashflow per gli immobili è gestita tramite il componente `ExpensesPopup` e i relativi handler (AssetPatrimonio.jsx).
- **Aggiornamento stato globale**:  
  - Le azioni `UPDATE_PATRIMONIO_IMMOBILE` e `DELETE_PATRIMONIO_IMMOBILE` sono gestite dal reducer in FinanceContext.jsx (FinanceContext.jsx).

In sintesi: la logica di modifica/gestione immobili è nel componente React AssetPatrimonio.jsx, con stato locale per il popup e dispatch di azioni per aggiornare il contesto globale.
# 🎯 Analisi Popup Gestione per Ogni Strumento Finanziario

## 📋 **Principi Generali di Design**

Prima di entrare nel dettaglio, ecco i **criteri universali** che dovrebbero guidare ogni popup:

### **1. Campi Comuni a Tutti gli Strumenti**
```javascript
{
  titolo: String,              // Nome identificativo
  valoreNominale: Number,      // Valore iniziale/acquisto
  valoreAttuale: Number,       // Valore corrente di mercato
  dataAcquisto: Date,          // Quando è stato acquistato
  quantita: Number,            // Unità possedute (azioni, grammi, quote...)
  note: String                 // Note libere utente
}
```

### **2. Metriche Calcolate Automaticamente**
- **Variazione Assoluta**: `valoreAttuale - valoreNominale`
- **Variazione % Lorda**: `((valoreAttuale - valoreNominale) / valoreNominale) * 100`
- **Variazione % Netta**: Considera tasse + costi gestione
- **ROI Annualizzato**: Per investimenti pluriennali
- **Yield (Rendimento)**: Per strumenti con cedole/dividendi

### **3. Struttura Popup Modulare**

```
┌─────────────────────────────────────────────────┐
│ [TIPO STRUMENTO]                          [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌─ DATI BASE (comune a tutti) ────────────┐    │
│ │ Nome, Valore nominale, Quantità, Data   │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI & TASSE (variabili) ─────────────┐    │
│ │ Commissioni, Bolli, Tassazione          │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ CASHFLOW (se applicabile) ─────────────┐    │
│ │ Cedole, Dividendi, Affitti, Interessi   │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ METRICHE CALCOLATE ────────────────────┐    │
│ │ Valore netto, Variazioni %, ROI         │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│         [Annulla]  [Salva Modifiche]            │
└─────────────────────────────────────────────────┘
```

---

## 🏢 **1. IMMOBILI** (già implementato - base di riferimento)

### **Campi Specifici**
```javascript
{
  // Dati base
  indirizzo: String,
  metratura: Number,
  tipologia: Enum['residenziale', 'commerciale', 'terreno'],
  
  // Valutazione
  valoreAcquisto: Number,       // Prezzo pagato
  valoreAttuale: Number,        // Stima mercato corrente
  
  // Cashflow entrate
  affittoMensile: Number,       // Se locato
  frequenzaAffitto: Enum['mensile', 'trimestrale', 'annuale'],
  
  // Costi ricorrenti
  imu: Number,                  // Annuale
  tasi: Number,                 // Annuale
  condominioMensile: Number,
  manutenzioneAnnua: Number,    // Stima media
  assicurazione: Number,        // Annuale
  
  // Tassazione
  tassazioneAffitto: Number,    // % su affitto (es. cedolare secca 21%)
  
  // Calcoli
  totaleSpese: (imu + tasi + condominio*12 + manutenzione + assicurazione),
  renditaLorda: (affitto * 12),
  renditaNetta: (renditaLorda - totaleSpese - tasse),
  roiLordo: (renditaLorda / valoreAttuale * 100),
  roiNetto: (renditaNetta / valoreAttuale * 100)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione Immobile: [Via Roma 10]         [✕]   │
├─────────────────────────────────────────────────┤
│ 📍 Indirizzo: [Via Roma 10, Milano         ]   │
│ 📐 Metratura: [85] mq                          │
│ 💰 Valore acquisto: [250.000] €                │
│ 📈 Valore attuale: [280.000] €                 │
│                                                  │
│ ┌─ ENTRATE ───────────────────────────────┐    │
│ │ Affitto mensile: [1.200] €              │    │
│ │ Frequenza: [Mensile ▼]                  │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ SPESE ANNUALI ─────────────────────────┐    │
│ │ IMU: [800] €                             │    │
│ │ TASI: [0] €                              │    │
│ │ Condominio mensile: [150] €              │    │
│ │ Manutenzione (media): [500] €            │    │
│ │ Assicurazione: [300] €                   │    │
│ │ ─────────────────────────────────────    │    │
│ │ TOTALE: 3.400 €/anno                     │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ TASSAZIONE ────────────────────────────┐    │
│ │ Tipo: [Cedolare secca ▼]                │    │
│ │ Aliquota: [21] %                         │    │
│ │ Tasse annue: 3.024 €                     │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ RIEPILOGO ─────────────────────────────┐    │
│ │ Rendita lorda: 14.400 €/anno             │    │
│ │ Rendita netta: 7.976 €/anno              │    │
│ │ ROI lordo: 5,14%                         │    │
│ │ ROI netto: 2,85%                         │    │
│ │ Capital gain: +30.000 € (+12%)           │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 📜 **2. OBBLIGAZIONI / BUONI TITOLI**

### **Campi Specifici**
```javascript
{
  // Identificazione
  isin: String,                 // IT0005438004
  tipologia: Enum['BTP', 'BOT', 'CCT', 'Corporate', 'Esteri'],
  emittente: String,            // "Stato Italiano", "Unicredit"
  
  // Caratteristiche contratto
  valoreNominale: Number,       // Valore facciale (es. 10.000€)
  prezzoAcquisto: Number,       // Prezzo effettivo pagato (es. 9.800€)
  valoreAttuale: Number,        // Quotazione corrente
  scadenza: Date,               // 2030-05-23
  
  // Cedola
  tipoCedola: Enum['fissa', 'variabile', 'zero-coupon'],
  tassoInteresse: Number,       // % annua (es. 2.5%)
  frequenzaCedola: Enum['mensile', 'trimestrale', 'semestrale', 'annuale'],
  prossimaCedola: Date,
  importoCedola: Number,        // Calcolato: (valoreNominale * tasso) / frequenza
  
  // Costi
  commissioniAcquisto: Number,  // Una tantum (es. 15€)
  bolloAnnuo: Number,           // 0.2% del valore (max 14€ per deposito titoli)
  
  // Tassazione
  tassazioneCedole: Number,     // 12.5% per titoli stato, 26% corporate
  tassazioneCapitalGain: Number,// 12.5% o 26%
  
  // Calcoli
  rendimentoNetto: Function,    // (cedole annue - tasse - bollo) / prezzoAcquisto
  yieldToMaturity: Function,    // Rendimento a scadenza effettivo
  duration: Number              // Durata media finanziaria
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione Obbligazione: [BTP Italia 2030]  [✕]  │
├─────────────────────────────────────────────────┤
│ 🏛️ Emittente: [Stato Italiano             ]   │
│ 🔢 ISIN: [IT0005438004                     ]   │
│ 📅 Scadenza: [23/05/2030]                      │
│                                                  │
│ ┌─ VALORI ────────────────────────────────┐    │
│ │ Valore nominale: [10.000] €              │    │
│ │ Prezzo acquisto: [9.850] €               │    │
│ │ Valore attuale: [10.200] €               │    │
│ │ Quantità: [1] titolo                     │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ CEDOLA ────────────────────────────────┐    │
│ │ Tipo: [Fissa ▼]                          │    │
│ │ Tasso: [2.5] %                           │    │
│ │ Frequenza: [Semestrale ▼]                │    │
│ │ Importo cedola: 125 € ogni 6 mesi        │    │
│ │ Prossima cedola: 15/06/2025              │    │
│ │ ☑ Genera entrata automatica              │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI & TASSE ─────────────────────────┐    │
│ │ Commissioni acquisto: [15] € (una tantum)│    │
│ │ Bollo annuo: [2.04] €                    │    │
│ │ Tassazione cedole: [12.5] %              │    │
│ │ Tassazione capital gain: [12.5] %        │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ PERFORMANCE ───────────────────────────┐    │
│ │ Cedole annue lorde: 250 €                │    │
│ │ Cedole annue nette: 218.75 €             │    │
│ │ Rendimento netto: 2.13%                  │    │
│ │ Capital gain: +350 € (+3.55%)            │    │
│ │ Yield to maturity: 2.67%                 │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 📊 **3. AZIONI**

### **Campi Specifici**
```javascript
{
  // Identificazione
  ticker: String,               // AAPL, ENEL.MI
  isin: String,
  azienda: String,              // "Apple Inc."
  mercato: String,              // "NASDAQ", "Borsa Italiana"
  
  // Posizione
  quantita: Number,             // Numero azioni
  prezzoMedioAcquisto: Number,  // PAC o media ponderata
  valoreAttuale: Number,        // Prezzo corrente * quantità
  
  // Dividendi
  dividendoPerAzione: Number,   // €/azione
  frequenzaDividendi: Enum['mensile', 'trimestrale', 'semestrale', 'annuale'],
  dataStaccoDividendo: Date,    // Ex-dividend date
  dividendYield: Number,        // % calcolata
  
  // Costi
  commissioniAcquisto: Number,  // Per operazione
  commissioniVendita: Number,
  bolloAnnuo: Number,           // 0.2% su valore deposito
  costoCustodia: Number,        // €/anno se applicabile
  
  // Tassazione
  tassazioneDividendi: Number,  // 26% in Italia
  tassazioneCapitalGain: Number,// 26%
  
  // Calcoli
  dividendiAnnuiLordi: (quantita * dividendoPerAzione * frequenza),
  dividendiAnnuiNetti: (dividendiLordi * (1 - tassazioneDividendi/100)),
  plusvalenzaNonRealizzata: (valoreAttuale - (quantita * prezzoMedioAcquisto)),
  roiTotale: ((plusvalenza + dividendiNetti) / investimentoIniziale * 100)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione Azione: [Apple Inc. (AAPL)]      [✕]  │
├─────────────────────────────────────────────────┤
│ 📈 Ticker: [AAPL]  ISIN: [US0378331005]        │
│ 🏢 Mercato: [NASDAQ]                            │
│                                                  │
│ ┌─ POSIZIONE ─────────────────────────────┐    │
│ │ Quantità: [50] azioni                    │    │
│ │ Prezzo medio acquisto: [150.00] €        │    │
│ │ Prezzo attuale: [178.50] €               │    │
│ │ Valore posizione: 8.925 €                │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ DIVIDENDI ─────────────────────────────┐    │
│ │ Dividendo per azione: [0.96] €           │    │
│ │ Frequenza: [Trimestrale ▼]               │    │
│ │ Prossimo stacco: 15/02/2025              │    │
│ │ Dividend yield: 2.15%                    │    │
│ │ ☑ Genera entrata automatica              │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI & TASSE ─────────────────────────┐    │
│ │ Commissioni totali acquisto: [75] €      │    │
│ │ Bollo annuo deposito: [34.20] €          │    │
│ │ Tassazione dividendi: [26] %             │    │
│ │ Tassazione capital gain: [26] %          │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ PERFORMANCE ───────────────────────────┐    │
│ │ Investimento iniziale: 7.575 €           │    │
│ │ Valore attuale: 8.925 €                  │    │
│ │ Plusvalenza non realizzata: +1.350 €     │    │
│ │ Variazione %: +17.82%                    │    │
│ │ Dividendi annui netti: 142.08 €          │    │
│ │ ROI totale (con dividendi): +19.70%      │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🌐 **4. ETF (Exchange Traded Fund)**

### **Campi Specifici**
```javascript
{
  // Identificazione
  ticker: String,               // VWCE.MI, SPY
  isin: String,
  nome: String,                 // "Vanguard FTSE All-World"
  indiceReplicato: String,      // "FTSE All-World"
  tipologia: Enum['azionario', 'obbligazionario', 'bilanciato', 'commodities'],
  
  // Caratteristiche
  ter: Number,                  // Total Expense Ratio (% annua)
  metodologiaReplica: Enum['fisica', 'sintetica'],
  distribuzioneDividendi: Enum['ad accumulazione', 'a distribuzione'],
  
  // Posizione
  quantita: Number,             // Quote possedute
  prezzoMedioAcquisto: Number,
  valoreAttuale: Number,
  
  // Dividendi (se distribuzione)
  dividendoPerQuota: Number,
  frequenzaDistribuzione: Enum['trimestrale', 'semestrale', 'annuale'],
  
  // Costi
  commissioniAcquisto: Number,
  costoGestioneAnnuo: Number,   // (valore * TER/100)
  bolloAnnuo: Number,
  
  // Tassazione
  tassazioneDividendi: Number,  // 26%
  tassazioneCapitalGain: Number,// 26%
  
  // Calcoli
  costiGestioneTotali: (costoGestione + bollo),
  rendimentoNettoStimato: (rendimentoIndice - TER - tasse)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione ETF: [Vanguard FTSE All-World]   [✕]  │
├─────────────────────────────────────────────────┤
│ 🔢 ISIN: [IE00BK5BQT80]  Ticker: [VWCE.MI]    │
│ 📊 Indice: [FTSE All-World]                    │
│ 🏷️ Tipo: [Azionario globale]                  │
│                                                  │
│ ┌─ POSIZIONE ─────────────────────────────┐    │
│ │ Quantità: [100] quote                    │    │
│ │ Prezzo medio acquisto: [95.00] €         │    │
│ │ Prezzo attuale: [108.50] €               │    │
│ │ Valore posizione: 10.850 €               │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ CARATTERISTICHE ───────────────────────┐    │
│ │ TER (costi gestione): [0.22] %           │    │
│ │ Replica: [Fisica ▼]                      │    │
│ │ Dividendi: [Ad accumulazione ▼]          │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI ANNUALI ─────────────────────────┐    │
│ │ Costi gestione (TER): 23.87 €            │    │
│ │ Bollo deposito: 34.20 €                  │    │
│ │ TOTALE: 58.07 €/anno                     │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ TASSAZIONE ────────────────────────────┐    │
│ │ Capital gain: [26] %                     │    │
│ │ (Dividendi già reinvestiti)              │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ PERFORMANCE ───────────────────────────┐    │
│ │ Investimento iniziale: 9.500 €           │    │
│ │ Valore attuale: 10.850 €                 │    │
│ │ Plusvalenza non realizzata: +1.350 €     │    │
│ │ Variazione % lorda: +14.21%              │    │
│ │ Variazione % netta: +13.60%              │    │
│ │ (al netto costi gestione annui)          │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 💰 **5. CONTI DEPOSITO**

### **Campi Specifici**
```javascript
{
  // Identificazione
  nomeBanca: String,            // "FCA Bank", "Rendimax"
  tipoConto: Enum['vincolato', 'libero', 'svincolabile'],
  
  // Condizioni
  capitaleTotale: Number,
  tassoInteresse: Number,       // % lorda annua
  durataVincolo: Number,        // Mesi (0 se libero)
  dataApertura: Date,
  dataScadenza: Date,           // Se vincolato
  
  // Interessi
  frequenzaLiquidazione: Enum['mensile', 'trimestrale', 'semestrale', 'annuale', 'a scadenza'],
  interessiMaturati: Number,    // Accumulati finora
  
  // Costi
  speseGestione: Number,        // Quasi sempre 0
  impostaBollo: Number,         // 34.20€ se saldo medio > 5.000€
  
  // Tassazione
  tassazioneInteressi: Number,  // 26%
  
  // Calcoli
  interessiAnnuiLordi: (capitale * tasso/100),
  interessiAnnuiNetti: (interessiLordi * 0.74 - bollo),
  rendimentoEffettivo: (interessiNetti / capitale * 100)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione Conto Deposito: [FCA Bank]       [✕]  │
├─────────────────────────────────────────────────┤
│ 🏦 Banca: [FCA Bank                        ]   │
│ 📝 Tipo: [Vincolato ▼]                         │
│                                                  │
│ ┌─ DEPOSITO ──────────────────────────────┐    │
│ │ Capitale: [15.000] €                     │    │
│ │ Tasso interesse lordo: [3.50] %          │    │
│ │ Durata vincolo: [24] mesi                │    │
│ │ Data apertura: [01/01/2024]              │    │
│ │ Scadenza: [01/01/2026]                   │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ INTERESSI ─────────────────────────────┐    │
│ │ Frequenza liquidazione: [A scadenza ▼]   │    │
│ │ Interessi maturati: 388.50 €             │    │
│ │ ☑ Genera entrata automatica              │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI & TASSE ─────────────────────────┐    │
│ │ Spese gestione: [0] €                    │    │
│ │ Imposta bollo annua: [34.20] €           │    │
│ │ Tassazione interessi: [26] %             │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ RENDIMENTO ────────────────────────────┐    │
│ │ Interessi annui lordi: 525 €             │    │
│ │ Interessi annui netti: 354.30 €          │    │
│ │ Rendimento effettivo: 2.36%              │    │
│ │ Capitale a scadenza: 15.708.60 €         │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## ₿ **6. CRYPTO**

### **Campi Specifici**
```javascript
{
  // Identificazione
  simbolo: String,              // BTC, ETH, ADA
  nome: String,                 // "Bitcoin", "Ethereum"
  blockchain: String,           // "Bitcoin", "Ethereum", "Cardano"
  
  // Posizione
  quantita: Number,             // Unità possedute
  prezzoMedioAcquisto: Number,  // € per unità
  valoreAttuale: Number,        // Prezzo corrente * quantità
  
  // Staking (se applicabile)
  inStaking: Boolean,
  quantitaStakingata: Number,
  apyStaking: Number,           // % annua
  ricompendeStaking: Number,    // Crypto guadagnate
  
  // Costi
  commissioniAcquisto: Number,  // Fee exchange
  commissioniNetwork: Number,   // Gas fees
  custodiaExchange: Number,     // €/anno se lasciato su exchange
  
  // Tassazione (Italia 2025+)
  tassazioneCapitalGain: Number,// 26% sopra 2.000€ di plusvalenza
  tassazioneStaking: Number,    // 26% su rewards
  
  // Calcoli
  plusvalenzaNonRealizzata: ((valoreAttuale - (quantita * prezzoMedioAcquisto))),
  ricompendeAnnueStaking: (quantitaStakingata * apyStaking/100),
  roiTotale: ((plusvalenza + ricompense) / investimentoIniziale * 100)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione Crypto: [Bitcoin (BTC)]          [✕]  │
├─────────────────────────────────────────────────┤
│ ₿ Simbolo: [BTC]  Nome: [Bitcoin          ]    │
│ 🔗 Blockchain: [Bitcoin]                       │
│                                                  │
│ ┌─ POSIZIONE ─────────────────────────────┐    │
│ │ Quantità: [0.5] BTC                      │    │
│ │ Prezzo medio acquisto: [35.000] €        │    │
│ │ Prezzo attuale: [45.000] €               │    │
│ │ Valore posizione: 22.500 €               │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ STAKING (opzionale) ───────────────────┐    │
│ │ ☐ In staking                             │    │
│ │ Quantità stakingata: [0] BTC             │    │
│ │ APY: [0] %                               │    │
│ │ Ricompense accumulate: [0] BTC           │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI ─────────────────────────────────┐    │
│ │ Commissioni acquisto: [175] €            │    │
│ │ Network fees totali: [50] €              │    │
│ │ Custodia exchange: [0] €/anno            │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ TASSAZIONE ────────────────────────────┐    │
│ │ Capital gain: [26] % (su plusvalenza)    │    │
│ │ Soglia esenzione: 2.000 €/anno           │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ PERFORMANCE ───────────────────────────┐    │
│ │ Investimento iniziale: 17.500 €          │    │
│ │ Valore attuale: 22.500 €                 │    │
│ │ Plusvalenza: +5.000 € (+28.57%)          │    │
│ │ Tasse su realizzo: 1.300 €               │    │
│ │ Profitto netto potenziale: 3.700 €       │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🥇 **7. METALLI PREZIOSI (Oro, Argento, Platino)**

### **Campi Specifici**
```javascript
{
  // Identificazione
  metallo: Enum['oro', 'argento', 'platino', 'palladio'],
  forma: Enum['lingotti', 'monete', 'gioielli', 'ETF/ETC'],
  purezza: String,              // "999.9", "24K", "925"
  
  // Posizione
  quantita: Number,             // Grammi o once troy
  unitaMisura: Enum['grammi', 'kg', 'once_troy'],
  prezzoMedioAcquisto: Number,  // €/grammo o €/oncia
  valoreAttuale: Number,        // Prezzo mercato corrente
  
  // Fisicità (se applicabile)
  luogoCustodia: Enum['casa', 'cassetta_sicurezza', 'caveau', 'digitale'],
  certificatoAutenticita: Boolean,
  
  // Costi
  commissioniAcquisto: Number,  // % o fisso
  costoCustodiaAnnuo: Number,   // Cassetta sicurezza
  assicurazione: Number,        // €/anno
  
  // Tassazione
  tassazioneCapitalGain: Number,// 26% (oro fisico esente IVA ma tassato)
  
  // Calcoli
  valoreInvestimento: (quantita * prezzoMedioAcquisto),
  valoreMercato: (quantita * prezzoAttualeOro),
  plusvalenza: (valoreMercato - valoreInvestimento),
  costiGestioneAnnui: (custodia + assicurazione)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione Metallo Prezioso: [Oro Fisico]   [✕]  │
├─────────────────────────────────────────────────┤
│ 🥇 Metallo: [Oro ▼]                            │
│ 📦 Forma: [Lingotti ▼]                         │
│ ✨ Purezza: [999.9 (24K)]                      │
│                                                  │
│ ┌─ POSIZIONE ─────────────────────────────┐    │
│ │ Quantità: [100] grammi                   │    │
│ │ Prezzo medio acquisto: [55.00] €/g       │    │
│ │ Prezzo attuale: [60.00] €/g              │    │
│ │ Valore posizione: 6.000 €                │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ CUSTODIA ──────────────────────────────┐    │
│ │ Luogo: [Cassetta sicurezza banca ▼]      │    │
│ │ ☑ Certificato autenticità presente       │    │
│ │ Costo custodia: [120] €/anno             │    │
│ │ Assicurazione: [80] €/anno               │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI & TASSE ─────────────────────────┐    │
│ │ Commissioni acquisto: [275] € (5%)       │    │
│ │ Costi gestione annui: 200 €              │    │
│ │ Tassazione capital gain: [26] %          │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ PERFORMANCE ───────────────────────────┐    │
│ │ Investimento iniziale: 5.500 €           │    │
│ │ Valore attuale: 6.000 €                  │    │
│ │ Plusvalenza: +500 € (+9.09%)             │    │
│ │ Costi gestione cumulati: 400 €           │    │
│ │ ROI netto: +1.82%                        │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🏦 **8. FONDI COMUNI DI INVESTIMENTO**

### **Campi Specifici**
```javascript
{
  // Identificazione
  isin: String,
  nomeFondo: String,            // "Eurizon Azioni Italia"
  societaGestione: String,      // "Eurizon Capital"
  categoria: Enum['azionario', 'obbligazionario', 'bilanciato', 'flessibile'],
  
  // Posizione
  quantitaQuote: Number,
  valoreQuota: Number,          // NAV (Net Asset Value)
  valoreAttuale: Number,
  
  // Costi
  commissioniIngresso: Number,  // % una tantum (0-5%)
  commissioniUscita: Number,    // % al disinvestimento
  commissioniGestione: Number,  // % annua (0.5-3%)
  commissioniPerformance: Number,// % su overperformance
  
  // Tassazione
  tassazioneCapitalGain: Number,// 26%
  tassazioneDividendi: Number,  // 26%
  
  // Calcoli
  costiTotaliAnnui: (valoreAttuale * (commissioniGestione/100)),
  rendimentoNetto: (rendimentoLordo - costi - tasse)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione Fondo: [Eurizon Azioni Italia]   [✕]  │
├─────────────────────────────────────────────────┤
│ 🏢 SGR: [Eurizon Capital                  ]    │
│ 🔢 ISIN: [IT0001234567]                        │
│ 📊 Categoria: [Azionario Italia]               │
│                                                  │
│ ┌─ POSIZIONE ─────────────────────────────┐    │
│ │ Quantità quote: [500]                    │    │
│ │ Valore quota attuale: [12.50] €          │    │
│ │ Valore posizione: 6.250 €                │    │
│ │ Valore medio acquisto: [11.00] €         │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI ─────────────────────────────────┐    │
│ │ Commissione ingresso: [2.5] %            │    │
│ │ Commissione gestione: [1.8] % annua      │    │
│ │ Commissione performance: [15] %          │    │
│ │   (su extra-rendimento vs benchmark)     │    │
│ │ Commissione uscita: [0] %                │    │
│ │ ─────────────────────────────────────    │    │
│ │ Costi gestione annui: 112.50 €           │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ TASSAZIONE ────────────────────────────┐    │
│ │ Capital gain: [26] %                     │    │
│ │ Dividendi: [26] %                        │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ PERFORMANCE ───────────────────────────┐    │
│ │ Investimento iniziale: 5.637.50 €        │    │
│ │ Valore attuale: 6.250 €                  │    │
│ │ Variazione % lorda: +13.64%              │    │
│ │ Costi totali pagati: 450 €               │    │
│ │ Variazione % netta: +2.74%               │    │
│ │ (I fondi hanno costi MOLTO elevati!)     │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🛡️ **9. POLIZZE ASSICURATIVE / VITA**

### **Campi Specifici**
```javascript
{
  // Identificazione
  tipoPolizza: Enum['vita', 'unit_linked', 'rivalutabile', 'caso_morte'],
  compagnia: String,            // "Generali", "UnipolSai"
  numeroPolizza: String,
  
  // Condizioni
  capitaleAssicurato: Number,   // Capitale garantito
  premioPagato: Number,         // Totale versato finora
  valoreRiscatto: Number,       // Valore attuale se riscattata
  scadenza: Date,
  
  // Versamenti
  tipoPremio: Enum['unico', 'ricorrente'],
  importoPremio: Number,        // Se ricorrente
  frequenzaPremio: Enum['mensile', 'trimestrale', 'annuale'],
  
  // Rendimento (se unit-linked o rivalutabile)
  rendimentoStimato: Number,    // % annua
  
  // Costi
  costiCaricamento: Number,     // % sui premi
  costiGestione: Number,        // % annua
  penaleRiscatto: Number,       // % se riscatto anticipato
  
  // Tassazione
  tassazioneRendimenti: Number, // 26% (o 12.5% se polizze vita ante 2001)
  
  // Calcoli
  rendimentoNetto: (rendimentoStimato - costiGestione - tasse),
  roiEffettivo: ((valoreRiscatto - premioPagato) / premioPagato * 100)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Gestione Polizza: [Generali Vita]         [✕]  │
├─────────────────────────────────────────────────┤
│ 🏢 Compagnia: [Generali                   ]    │
│ 📋 N. Polizza: [123456789                 ]    │
│ 🛡️ Tipo: [Unit Linked ▼]                      │
│                                                  │
│ ┌─ CONDIZIONI ────────────────────────────┐    │
│ │ Capitale assicurato: [50.000] €          │    │
│ │ Scadenza: [31/12/2035]                   │    │
│ │ Durata residua: 10 anni                  │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ VERSAMENTI ────────────────────────────┐    │
│ │ Tipo: [Ricorrente ▼]                     │    │
│ │ Premio: [200] € / [Mensile ▼]            │    │
│ │ Totale versato: 12.000 €                 │    │
│ │ Valore riscatto attuale: 11.250 €        │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI ─────────────────────────────────┐    │
│ │ Caricamento premi: [3] %                 │    │
│ │ Costi gestione: [2] % annua              │    │
│ │ Penale riscatto anticipato: [5] %        │    │
│ │ (si azzera dopo 8 anni)                  │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ RENDIMENTO ────────────────────────────┐    │
│ │ Rendimento stimato: [4] % annuo          │    │
│ │ Tassazione: [26] %                       │    │
│ │ Rendimento netto: 0.96%                  │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ PERFORMANCE ───────────────────────────┐    │
│ │ Totale versato: 12.000 €                 │    │
│ │ Valore attuale: 11.250 €                 │    │
│ │ Differenza: -750 € (-6.25%)              │    │
│ │ ⚠️ Polizze vita raramente convenienti    │    │
│ │    come investimento puro!               │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🚀 **10. INVESTIMENTI ALTERNATIVI**

### **Campi Specifici**
```javascript
{
  // Identificazione
  tipoInvestimento: Enum['startup', 'crowdfunding', 'P2P_lending', 'arte', 'vini', 'altro'],
  nome: String,
  piattaforma: String,          // Se via intermediario
  
  // Posizione
  importoInvestito: Number,
  valoreAttuale: Number,        // Stimato
  dataInvestimento: Date,
  
  // Rendimenti (se applicabile)
  cashflowRicorrente: Number,   // Es. interessi P2P lending
  frequenzaCashflow: Enum['mensile', 'trimestrale', 'annuale'],
  
  // Rischi
  livelloRischio: Enum['basso', 'medio', 'alto', 'molto_alto'],
  liquidita: Enum['alta', 'media', 'bassa', 'nulla'],
  
  // Costi
  commissioniPiattaforma: Number,
  costiGestione: Number,
  
  // Tassazione
  tassazione: Number,           // Varia molto per tipologia
  
  // Calcoli
  roiAttuale: ((valoreAttuale - importoInvestito) / importoInvestito * 100)
}
```

### **Layout Popup**
```
┌─────────────────────────────────────────────────┐
│ Investimento Alternativo: [Startup XYZ]   [✕]  │
├─────────────────────────────────────────────────┤
│ 🚀 Tipo: [Startup equity crowdfunding]         │
│ 🌐 Piattaforma: [Mamacrowd                ]    │
│ 📅 Data investimento: [15/03/2023]             │
│                                                  │
│ ┌─ POSIZIONE ─────────────────────────────┐    │
│ │ Importo investito: [5.000] €             │    │
│ │ Valore stimato: [5.500] € (+10%)         │    │
│ │ Quota posseduta: 2.5%                    │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ CARATTERISTICHE ───────────────────────┐    │
│ │ Liquidità: [Nulla ▼] (fino a exit/IPO)  │    │
│ │ Rischio: [Molto Alto ▼]                  │    │
│ │ Orizzonte temporale: 5-10 anni           │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ COSTI ─────────────────────────────────┐    │
│ │ Commissione piattaforma: [250] € (5%)    │    │
│ │ Costi gestione annui: [0] €              │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ TASSAZIONE ────────────────────────────┐    │
│ │ Capital gain: [26] % (al disinvestimento)│    │
│ │ Deducibilità: 30% per startup innovative │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─ PERFORMANCE ───────────────────────────┐    │
│ │ Investimento netto: 5.250 €              │    │
│ │ Valore stimato: 5.500 €                  │    │
│ │ ROI attuale: +4.76%                      │    │
│ │ ⚠️ Rischio perdita totale elevato        │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🎯 **RIEPILOGO COMPARATIVO: Metriche Chiave per Tipo**

| Strumento | Valore | Cashflow | Costi | Tasse | ROI Primario | Liquidità |
|-----------|--------|----------|-------|-------|--------------|-----------|
| **Immobili** | Mercato | Affitto mensile | IMU, manutenzione | 21-26% | ROI netto | Bassa |
| **Obbligazioni** | Quotazione | Cedole fisse | Bollo | 12.5-26% | Yield to maturity | Alta |
| **Azioni** | Prezzo * Qty | Dividendi | Commissioni, bollo | 26% | Capital gain + dividendi | Alta |
| **ETF** | NAV * Qty | Dividendi (se dist.) | TER, bollo | 26% | Tracking index | Alta |
| **Conti Deposito** | Capitale | Interessi | Bollo | 26% | Rendimento netto | Alta (se libero) |
| **Crypto** | Spot price | Staking (opt.) | Gas, exchange | 26% | Variazione % | Media |
| **Metalli** | Spot * peso | - | Custodia | 26% | Capital gain | Media |
| **Fondi Comuni** | NAV | Dividendi | TER alto (1-3%) | 26% | Rendimento - costi | Media |
| **Polizze Vita** | Riscatto | - | Caricamenti alti | 12.5-26% | Valore vs versato | Bassa |
| **Alternativi** | Stima | Variabile | Piattaforma | 26% | Exit multiple | Molto bassa |

---

## 💡 **Raccomandazioni Implementative**

### **1. Componente Universale `AssetManagementPopup`**

```javascript
<AssetManagementPopup
  assetType="obbligazione"  // Determina campi mostrati
  asset={currentAsset}      // Dati attuali
  onSave={handleSave}
  onClose={handleClose}
/>
```

### **2. Schema Configurazione per Tipo**

```javascript
// config/assetFields.js
export const ASSET_FIELD_CONFIG = {
  obbligazione: {
    sections: ['base', 'cedola', 'costi', 'tasse', 'performance'],
    fields: {
      isin: { type: 'text', label: 'ISIN', required: true },
      tassoInteresse: { type: 'percentage', label: 'Cedola %' },
      // ...
    },
    calculations: {
      rendimentoNetto: (data) => calculateBondYield(data),
      // ...
    }
  },
  // ... altri asset types
};
```

### **3. Validazioni Specifiche**

```javascript
// Per obbligazioni: scadenza deve essere futura
// Per ETF: TER tra 0.01% e 5%
// Per crypto: quantità con 8 decimali
// Per immobili: valore > 10.000€
```

### **4. Helper di Calcolo Centralizzati**

```javascript
// utils/financialCalculations.js
export const calculateYieldToMaturity = (nominalValue, currentPrice, coupon, yearsToMaturity) => {
  // Formula YTM complessa
};

export const calculateROI = (currentValue, initialValue, costs, taxes) => {
  return ((currentValue - initialValue - costs - taxes) / initialValue) * 100;
};
```

---

## 🎨 **Design Pattern Finale**

```javascript
// Popup dinamico con stepper
<AssetWizard assetType="azione">
  <Step1_BaseData />      // Ticker, quantità, prezzo
  <Step2_Cashflow />      // Dividendi
  <Step3_Costs />         // Commissioni, bollo
  <Step4_Taxes />         // Aliquote
  <Step5_Performance />   // Riepilogo calcolato (read-only)
</AssetWizard>
```

