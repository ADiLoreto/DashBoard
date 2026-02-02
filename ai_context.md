# ai_context.md — Regole permanenti e contesto tecnico

## 1) Descrizione sintetica del progetto
Dashboard Finanziaria single-page costruita con React. Scopo: monitorare entrate, patrimonio, liquidità, uscite e progetti extra, con visualizzazioni grafiche, snapshot storici e selezione granulare dei diffs per salvataggi conservativi.

Stack e linguaggi principali:
- Frontend: React (JSX), JavaScript (ES6+), hooks.
- Librerie rilevanti: recharts (grafici), zod (validazioni).
- Persistenza: localStorage (attuale) con wrapper in `src/utils/storage.js`.
- Build: create-react-app (npm start, npm run build).

File chiave:
- `src/context/FinanceContext.jsx` (provider dello stato finanziario, gestione cashflow, normalizzazione stato)
- `src/context/AuthContext.jsx` (autenticazione minimale)
- `src/hooks/useFinancialCalculations.js` (logica dei calcoli aggregati)
- `src/hooks/useCashflowGeneration.js` (generazione automatica cashflow ricorrenti)
- `src/utils/storage.js` (persistenza localStorage, snapshot storico, diff application)
- `src/utils/diff.js` (calcolo e espansione diffs per preview/salvataggio storico)
- `src/utils/format.js` (formattazione valute, date, diff extraction)
- `src/components/layout/Dashboard.jsx` (entry UI principale, orchestrazione diff e preview modal)
- `src/components/ui/HistoricalSavePreviewModal.jsx` (anteprima e selezione granulare diffs)

## 2) Architettura

### Struttura cartelle
```
src/
├── components/
│   ├── layout/
│   │   └── Dashboard.jsx (orchestrazione, calcolo diffs, preview modal)
│   ├── sections/ (Entrate, Asset, Liquidita, Uscite, Progetti, Libertà)
│   ├── ui/ (BigTab, EntriesGrid, HistoricalSavePreviewModal, DiffGroup, DiffItem)
│   └── wizard/ (multi-step per asset e cashflow)
├── context/
│   ├── FinanceContext.jsx (state + reducer, normalizzazione, autoload/autosave)
│   └── AuthContext.jsx (user minimal)
├── hooks/
│   ├── useFinancialCalculations.js (calcoli aggregati)
│   └── useCashflowGeneration.js (generazione ricorrenti)
├── utils/
│   ├── storage.js (localStorage wrapper, snapshot, applySelectedDiffs)
│   ├── diff.js (computeDiffs, expandDiffs dinamico)
│   └── format.js (formatCurrency, formatDate, extractDiffItem, etc.)
├── config/
│   ├── constants.js (initialState, schemi)
│   ├── chartConfig.js (configurazioni recharts)
│   └── assetSchemas.js (validazioni zod)
├── App.jsx (root)
└── index.js
```

### Flusso dati (Context + useReducer)
- **Stato centralizzato**: entrate, uscite, patrimonio, liquidità, progettiExtra con shape normalizzato.
- **Azioni reducer**: `ADD_*`, `UPDATE_*`, `DELETE_*`, `LOAD_STATE`, `GENERATE_CASHFLOWS_FROM_ASSETS`, etc.
- **Persistenza**: 
  - Autosave cada 1 secondo (normalizzato) via localStorage (`saveState`/`loadState`).
  - Draft saves per recupero incompleto tramite `saveDraft`/`loadDraft`.
  - Snapshot storici per data specifiche tramite `saveSnapshot`/`loadHistory`.
- **Normalizzazione**: `normalizeState()` in `FinanceContext` assicura shape canonico (evita mismatch tra versioni/salvataggi).

### Flusso salvataggio storico (con preview)
1. **Utente imposta `saveDate`** nel passato e clicca "Salva modifiche".
2. **Dashboard**: `handleAttemptSave` → `computeDiffs(existingState, proposedState)` → diffs grezzi per sezione.
3. **Espansione**: `expandDiffs(existingState, proposedState)` → item-level diffs (uno per elemento array).
4. **Preview modal**: `HistoricalSavePreviewModal` ragruppa diffs per sezione/field, permette selezione granulare (checkbox).
5. **Applicazione**: `applySelectedDiffs(existingState, proposedState, selectedDiffs)` → snapshot finale.
6. **Salvataggio**: `saveSnapshot(finalState, saveDate, username)` → history localStorage.

### Cashflow generation
- Asset (immobili, investimenti) possono avere `cashflows` ricorrenti con `autoGenerate=true` e `nextGeneration`.
- Hook `useCashflowGeneration` genera entry in `entrate.cashflowAsset` quando `nextGeneration <= now`.
- Supporta frequenze: monthly, quarterly, semiannually, yearly, once.

## 3) Regole di sviluppo
- **Linguaggio**: JavaScript moderno (ES6+). Componenti React in JSX.
- **Naming**:
  - Componenti React: PascalCase (es. `Dashboard`, `Liquidita`).
  - Funzioni/variabili: camelCase.
  - Azioni del reducer: prefisso `ADD_`, `UPDATE_`, `DELETE_`, `LOAD_`.
  - Utility diff: `computeDiffs`, `expandDiffs`, `extractDiffItem`, `applySelectedDiffs`.
- **Commenti**: spiegare il "perché"; console.log diagnostici per debug (cercare pattern come `🔍`, `📦`, `📣`).
- **Dimensione file**: preferire <300 righe per componente; helper in `utils/`.
- **Gestione errori**: validazione zod per asset; try/catch per storage.
- **Test**: unit test per `expandDiffs`, `applySelectedDiffs`, calcoli finanziari.

## 4) Vincoli e decisioni chiave

### Persistenza
- **localStorage**: unica fonte di verità attuale (no backend). Shape normalizzato per evitare rotture.
- **Snapshot storico**: array di `{ date, state }` per ogni username. Calcolo diffs tra stati.
- **Draft**: flag per il recovery di modifiche incomplete prima del salvataggio.

### UI/UX per salvataggio storico
- **Modal preview**: mostra diffs raggruppati (sezione > field > item), selezionabili granularmente.
- **Comportamento conservativo**: di default seleziona solo i campi modificati dall'utente; per il resto mostra anteprima.
- **Validazione**: nessun salvataggio senza preview se `saveDate` è nel passato.

### State shape normalizzato (post Task 21)
```javascript
{
  entrate: {
    stipendio: { netto, gross, hours, days, cashflows: [] },
    bonus: { importo, cashflows: [] },
    altreEntrate: [ { id, titolo, importo, date, hours, days } ]
  },
  uscite: {
    fisse: [ { id, titolo, importo, date } ],
    variabili: [ { id, titolo, importo, date } ]
  },
  patrimonio: {
    contiDeposito: [ { id, titolo, saldo, interesse, cashflows: [] } ],
    buoniTitoli: [ { id, titolo, valore, valore_nominale, rendimento, scadenza } ],
    investimenti: {
      azioni: [ { id, titolo, quantita, prezzo, cashflows: [] } ],
      etf: [ { id, titolo, quantita, prezzo, cashflows: [] } ],
      crypto: [ { id, titolo, quantita, prezzo, cashflows: [] } ],
      oro: [ { id, titolo, grammi, tipo } ]
    },
    immobili: [ { id, titolo, valore, yearlyRent, cashflows: [] } ]
  },
  liquidita: {
    contiCorrenti: [ { id, titolo, saldo } ],
    cartePrepagate: [ { id, titolo, saldo } ],
    contante: number
  },
  progettiExtra: [ { id, titolo, valore, isCosto, ...metadata } ]
}
```

### Cashflow generation
- Frequenze: `monthly`, `quarterly`, `semiannually`, `yearly`, `once`.
- Campo `nextGeneration` (ISO string) gestito da `calculateNextDate()`.
- Entry generate aggiunte a `entrate.cashflowAsset` con tracciamento `sourceAssetId`.

### Diff expansion (Task 21, post-2025-11-03)
- **`computeDiffs`**: confronta sezione per sezione, ritorna diffs grezzi (uno per sezione).
- **`expandDiffs`**: gestisce tre modalità:
  - **EDIT_MODE**: sezione in both states → genera diffs per singoli item (add/modify/remove per id).
  - **REMOVE_MODE**: sezione solo in existing → item marcati come 'remove'.
  - **ALL_NEW_MODE**: sezione solo in proposed → item marcati come 'add' (scenario "tutto nuovo").
- **Shape expanded diff**: `{ section, field, itemId, current, proposed, action, path, metadata }`.
- **Temp IDs**: elementi senza `id` ricevono `tmp_<timestamp>_<section>_<field>_<idx>`.

## 5) File critico: HistoricalSavePreviewModal

Componente che:
- Riceve `previewDiffs` (array espanso), `onConfirm(selectedDiffs)`, `onCancel`.
- Raggruppa diffs per `section` → `field` → `itemId`.
- Supporta selezione granulare: checkbox per item, "Select All" per field/section.
- Mostra valori leggibili: titolo, importo, date (via `extractDiffItem`).
- Propaga selezione a Dashboard per applicazione conservativa.

## 6) Funzionalità consolidate (post Task 21, 2025-11-03)

| Feature | Status | Note |
|---------|--------|------|
| Entrate attuali (stipendio, bonus, altre) | ✅ Stabile | Includono cashflow ricorrenti |
| Asset patrimonio | ✅ Stabile | Supporto multi-tipo, cashflow, asset wizard |
| Liquidità | ✅ Stabile | Conti, carte, contante |
| Uscite (fisse, variabili) | ✅ Stabile | Raggruppate per categoria |
| Progetti extra | ✅ Stabile | ROI tracking, isCosto toggle |
| Salvataggio storico con preview | ✅ Implementato | Diffs grezzi + espansione item-level |
| Selezione granulare diffs | ✅ Implementato | Checkbox per item, select-all per field |
| Normalizzazione stato | ✅ Implementato | Evita shape mismatch, supporta versionamento |
| Draft recovery | ✅ Implementato | Prompts ripetuti (buggy — vedi Task 24) |
| Cashflow auto-generation | ✅ Implementato | Frequenze configurabili |

## 7) Bug noti e task in progress

### Task 24 — Popup "unsaved changes" persistente (2025-11-03)
- **Problema**: prompt ripetuto all'avvio anche se non ci sono modifiche.
- **Causa ipotizzata**: `loadDraft()` ritorna true per draft inesistenti; flag non cancellato al salvataggio.
- **Soluzione richiesta**: correggere `clearDraft()` nei percorsi di salvataggio; verificare logica di `loadDraft()`.
- **File**: `src/utils/storage.js`, `src/components/layout/Dashboard.jsx`.

### Task 23 — Candidate-value chooser (In progress)
- **Scopo**: permettere scelta tra múltiples candidate values (edited, historical, current) per campo con divergenza.
- **Status**: bozza in `agent_notes.md`, non implementata in UI.
- **Blocca**: nessun task critico; è un'estensione UX.

## 8) Prossimi passi e roadmap

### Breve termine (critici)
1. **Fix Task 24**: bug prompt persistente — impatto UX alta.
2. **Verifica E2E**: riprodurre flusso salvataggio storico (past date → preview → select items → apply) in ambiente dev.
3. **Test expandDiffs**: scenario ALL_NEW_MODE con payload reale.

### Medio termine (feature)
1. **Candidate-value chooser** (Task 23): UI per scegliere source di valore.
2. **Audit trail**: logging quale candidate value è stato scelto per ogni field.
3. **Undo/redo**: snapshot-based state recovery.

### Lungo termine (architettura)
1. **Backend sync**: da localStorage a server (DB).
2. **Collaborative editing**: supporto multipli utenti.
3. **Report/export**: PDF, CSV di snapshot storici.

## 9) Setup e lancio locale

### Prerequisiti
- Node.js (v14 o superiore) e npm installati nel sistema.
- Git (opzionale, per clone del repository).

### Prima volta: Setup iniziale
```bash
# 1. Navigare nella cartella del progetto
cd d:\progetti\DashBoard

# 2. Installare dipendenze
npm install

# 3. Avviare il dev server
npm start
```

**Risultato atteso:**
- Il browser si apre automaticamente su `http://localhost:3000`
- La dashboard carica con UI reattiva (React Fast Refresh).
- Autosave su localStorage ogni ~1 secondo.
- Console browser disponibile per debug (F12 o Ctrl+Shift+I).

### Sviluppo: lancio successivi
```bash
# Semplicemente riavviare da cartella progetto
npm start
```

### Build per produzione
```bash
# Compilazione ottimizzata
npm run build

# Output: cartella `build/` con file statici minificati
# Serve per deployment su server, non per dev locale
```

### Troubleshooting
| Problema | Soluzione |
|----------|-----------|
| Port 3000 già in uso | Cambia port: `PORT=3001 npm start` (su PowerShell) |
| `npm: command not found` | Installa Node.js da https://nodejs.org/ |
| Modifiche non si vedono | Cancella browser cache (Ctrl+Shift+Delete) o reload hard (Ctrl+Shift+R) |
| Build fallisce | Esegui `npm install` di nuovo; cancella `node_modules/` e `.npm cache` se persiste |
| localStorage non persiste | Usa modalità normale (non incognito); browser potrebbe avere storage disabilitato |

### Debug e logging
- **Browser console** (F12): cerca pattern `🔍`, `📦`, `📣` nei log.
- **React DevTools**: installa extension per ispezionare state e props.
- **Redux DevTools** (se usato): traccia azioni e state changes.

## 10) Prompt operativo (come usare questo file)

- Leggi `ai_context.md` **prima** di proporre modifiche significative.
- Quando introduci nuove dipendenze, update: "Vincoli e decisioni chiave" + "File chiave".
- Se cambi state shape: aggiorna section "State shape normalizzato".
- Se aggiungi action reducer: annota in "Flusso dati".
- Se risolvi bug/task: sposta da "Bug noti" a "Funzionalità consolidate" + aggiorna data.

Questo file è **source of truth** per context tecnico. Mantenerlo allineato con `agent_notes.md`.

## Aggiornamento e mantenimento
- **Ultimo update**: 2026-02-02 (verifica completa + setup locale).
- Ogni cambiamento rilevante richiede update immediato di questo file.
- Preferire descrizioni concise con link ai file interessati.
