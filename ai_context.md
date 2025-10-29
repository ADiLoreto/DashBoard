# ai_context.md — Regole permanenti e contesto tecnico

## 1) Descrizione sintetica del progetto
Dashboard Finanziaria single-page costruita con React. Scopo: monitorare entrate, patrimonio, liquidità, uscite e progetti extra, con visualizzazioni grafiche e stato sincronizzabile in futuro.

Stack e linguaggi principali:
- Frontend: React (JSX), JavaScript (ES6+), hooks.
- Librerie rilevanti: recharts (grafici), react-router-dom (routing), eventualmente zod per validazioni.
- Persistenza: localStorage (attuale) con wrapper in `src/utils/storage.js`.

File chiave:
- `src/context/FinanceContext.jsx` (provider dello stato finanziario, gestione cashflow)
- `src/context/AuthContext.jsx` (autenticazione minimale)
- `src/hooks/useFinancialCalculations.js` (logica dei calcoli)
- `src/hooks/useCashflowGeneration.js` (generazione automatica cashflow)
- `src/utils/storage.js` (wrapper per localStorage)
- `src/components/layout/Dashboard.jsx` (entry UI principale)
- `src/components/wizard/AssetWizard.jsx` (wizard multi-step per asset)

## 2) Architettura
Struttura cartelle (sintesi):
- `src/components/` — componenti UI e sezioni (`layout`, `sections`, `ui`, `wizard`)
  - `layout/` — componenti strutturali (Dashboard, Sidebar)
  - `sections/` — sezioni principali (AssetPatrimonio, EntrateAttuali, etc.)
  - `ui/` — componenti riutilizzabili (BigTab, EditableCard, etc.)
  - `wizard/` — wizard multi-step per asset e cashflow
    - `steps/` — BaseDataStep, CashflowStep
    - `forms/` — CashflowForm e altri form modali
- `src/context/` — provider e context (Finance, Auth)
- `src/hooks/` — hooks riutilizzabili (useCashflowGeneration, useFinancialCalculations)
- `src/utils/` — helper, formattazione, storage
- `src/config/` — costanti, configurazioni e schemi

Logica frontend:
- Stato centralizzato tramite Context + useReducer (azioni tipo `ADD_`, `UPDATE_`, `DELETE_`).
- Componenti consumano il context e notificano mutazioni via `dispatch`.
- Persistenza a livello client con salvataggi e snapshot in localStorage.

Dipendenze tra moduli:
- Componenti UI → `FinanceContext` / `AuthContext`.
- Hook `useFinancialCalculations` è consumato dalle sezioni della dashboard.
- `storage.js` viene usato dal provider per persistere lo stato.

## 3) Regole di sviluppo
- Linguaggio: JavaScript moderno (ES6+). Componenti React in JSX.
- Naming:
  - Componenti React: PascalCase (es. `Dashboard`, `Liquidita`).
  - Funzioni/variabili: camelCase.
  - Azioni del reducer: prefisso `ADD_`, `UPDATE_`, `DELETE_`, `LOAD_`.
- Commenti: spiegare il "perché"; evitare commenti ovvi.
- Dimensione file: preferire file piccoli e composizione (≈<300 righe per componente complesso).
- Formattazione: usare Prettier / ESLint se presenti; prima del commit formattare.
- Commit message: formato `<area>: <breve descrizione>` (es. `liquidita: aggiunta modal nuovo conto`).
- Gestione errori: validazione dei dati in input (zod o controllo manuale); try/catch per operazioni di I/O.
- Test: scrivere test unitari per helper critici (es. storage, calcoli finanziari).

## 4) Vincoli e decisioni chiave

- Frontend: SPA React. Non c'è backend obbligatorio al momento.
- Persistenza corrente: localStorage; progettare l'astrazione per facilitare futura sincronizzazione remota.
- UI: responsive; seguire regole CSS in `src/App.css`.
- Stato: Context + useReducer per coerenza e possibili snapshot/undo.
- Data format: usare ISO-like `YYYY-MM-DD` per snapshot/storico.
- Cashflow: generazione automatica da asset con frequenze configurabili (monthly/quarterly/semiannually/yearly).
- Asset: struttura unificata con supporto per cashflow ricorrenti e wizard multi-step per creazione/modifica.

## 5) Prompt operativo (come usare questo file)
- Leggi `ai_context.md` prima di proporre modifiche significative.
- Quando introduci nuove dipendenze o cambi architetturali, aggiorna la sezione "Vincoli e decisioni chiave".
- Se modifichi la persistenza o il modello dei dati, documenta i campi nuovi e aggiorna il provider (`FinanceContext.jsx`) e `storage.js`.
- Questo file è la fonte di verità per l'assistente: tutte le azioni future dovrebbero tenerne conto.

## Aggiornamento e mantenimento
- Ogni cambiamento rilevante (libreria, struttura cartelle, paradigma state management) richiede aggiornamento immediato di `ai_context.md`.
- Preferire descrizioni concise e link ai file interessati.
