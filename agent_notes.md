# agent_notes.md — Cronologia decisioni operative

---

# 🧭 Metodi di Lavoro

Questo documento contiene le regole operative per la gestione del progetto tramite AI.  
Ogni sessione di lavoro deve iniziare specificando quale **metodo di lavoro** viene adottato, così che l’AI possa comportarsi in modo coerente e riconoscere il contesto operativo.

---

## ⚙️ Metodo di Lavoro A — *Supervisione e Continuità*
**Obiettivo:** mantenere la coerenza e la continuità del progetto nel tempo.

### Regole operative
1. Prima di ogni operazione, **leggere integralmente** le sezioni precedenti di `agent_notes.md` per recuperare:
   - Struttura generale del progetto  
   - Decisioni prese in precedenza  
   - Convenzioni di naming e logiche funzionali  
2. Ogni nuova decisione, modifica o chiarimento deve essere **annotato in questo file**, in ordine cronologico.
3. Quando un’azione deriva da una modifica già eseguita in passato, **riportare il riferimento** (es: “Come nella duplicazione di *contidepositoextra* del 2025-10-23”).
4. Ogni volta che una nuova card, pagina o funzione viene aggiunta:
   - Descrivere brevemente **scopo e comportamento previsto**
   - Annotare i **file coinvolti**
   - Riportare **eventuali dipendenze o chiamate API**
5. Mai cancellare parti di testo da `agent_notes.md`: se serve sostituire una logica, usare la dicitura:
   > 🔄 *Sostituisce la logica precedente del giorno XX/XX/XXXX in merito a ...*

### Quando usarlo
Usare il Metodo A per lavori continuativi, refactoring, o quando si riprende un task interrotto.  
Prompt tipico:  
> “Stiamo eseguendo il metodo di lavoro A. Riprendi dal punto dove avevamo duplicato la card contidepositoextra e procedi con la creazione della card Immobili.”

---

## 🧩 Metodo di Lavoro B — *Task mirato e rapido*
**Obiettivo:** completare rapidamente un singolo task isolato senza consultare l’intera cronologia.

### Regole operative
1. Leggere solo le sezioni **direttamente correlate** al task attuale.
2. Annotare la modifica in modo sintetico, ad esempio:
2025-10-23 — Task: Rinominare “contidepositoextra” in “Immobili”
File coinvolti: schede.js, api_calls.py

Azioni: rinominati riferimenti, duplicata card base

Note: eredita le logiche da contidepositoextra

3. Non modificare parti del documento non pertinenti al task.
4. A fine lavoro, aggiungere la voce `✅ Completato` per segnalare la chiusura.

### Quando usarlo
Usare il Metodo B per micro-task, bugfix o aggiornamenti veloci.  
Prompt tipico:  
> “Stiamo seguendo il metodo di lavoro B. Duplica la card contidepositoextra in Immobili mantenendo le funzioni principali.”

---

## 🧾 Struttura consigliata del file

Ogni task documentato in `agent_notes.md` deve seguire questa struttura:

```markdown
## [Data] — [Titolo del task]
### Descrizione
(breve descrizione dell’obiettivo)
### File coinvolti
(elenco file)
### Azioni eseguite
(lista puntata delle operazioni)
### Esito
(stato del task, note, dipendenze)

---



### Task correnti

### 2025-10-29 — Task 3: Estensione BigTab — Done

Descrizione
: Aggiunta della gestione spese (pulsante 📓) sulle card `BigTab` per la sezione Immobili. Ora il pulsante compare in hover quando la prop `onExpensesClick` è passata e apre il popup `ExpensesPopup`.

File modificati
- `src/components/sections/AssetPatrimonio/AssetPatrimonio.jsx` — aggiunto stato `expensesFor`, handlers `handleOpenExpenses`, `handleCloseExpenses`, `handleSaveExpenses`, passata la prop `onExpensesClick` a `BigTab` e reso `ExpensesPopup`.
- `src/components/ui/BigTab.jsx` — (già aggiornato) aggiunta prop `onExpensesClick` e visualizzazione dell'icona 📓 in hover.
- `src/components/ui/ExpensesPopup.jsx` — componente esistente usato per la gestione spese (props: `isOpen`, `initialData`, `onClose`, `onSave`).

Azioni eseguite
- Wireup: passato `onExpensesClick` dalle card immobili a `BigTab`.
- Popup: render condizionale di `ExpensesPopup` con `initialData` e salvataggio tramite `UPDATE_PATRIMONIO_IMMOBILE`.
- Verifica manuale: hover su una card immobile dovrebbe mostrare ora 📓; clic apre il popup.

Esito
: ✅ Completato. Patch applicata e salvata nel repository.

### 2025-10-29 — Task 8: Auto-generate cashflows on save (Metodo A) — Done

Descrizione
: Evitare che l'utente debba cliccare manualmente su "Forza generazione cashflow" dopo aver salvato i dati degli immobili (step 1/2 e 2/2 del popup/wizard). Il comportamento normale deve essere: al salvataggio dei dati cashflow/immobile il sistema genera automaticamente i cashflow derivati. Il pulsante "Forza generazione" rimane disponibile solo come fallback/emergenza.

File coinvolti
- `src/components/wizard/forms/CashflowForm.jsx` (o il componente/wizard che gestisce step 1/2 e step 2/2) — integrare dispatch al salvataggio
- `src/components/sections/AssetPatrimonio/AssetPatrimonio.jsx` — eventuale wiring se il salvataggio avviene qui
- `src/context/FinanceContext.jsx` — verificare action handler `GENERATE_CASHFLOWS_FROM_ASSETS` / `UPDATE_ASSET_WITH_CASHFLOWS`
- `src/components/ui/BigTab.jsx` — (no change required, ma verificare aggiornamento visuale dopo generazione)
- `src/utils/*` — eventuali helper di generazione

Azioni proposte (step-by-step)
1. Analisi (eseguita): identificare dove viene attualmente dispatchata l'azione di generazione cashflow (bottone "Forza generazione") e dove viene salvato il payload dal popup/wizard.
2. Integrazione save → generate (implementata):
   - Al termine del salvataggio dei dati dell'immobile / cashflow (quando il reducer ha aggiornato lo stato), viene ora dispatchata l'azione `GENERATE_CASHFLOWS_FROM_ASSETS` per eseguire la generazione derivata dei cashflow.
   - Implementazione eseguita in `src/components/sections/AssetPatrimonio/AssetPatrimonio.jsx`:
     - dopo `dispatch({ type: 'UPDATE_PATRIMONIO_IMMOBILE', payload: ... })` (saving from ExpensesPopup) viene chiamato `dispatch({ type: 'GENERATE_CASHFLOWS_FROM_ASSETS' })`.
     - nel wizard `handleSaveFromWizard`, dopo le azioni `ADD_PATRIMONIO_*` o `UPDATE_PATRIMONIO_*`, viene chiamato `dispatch({ type: 'GENERATE_CASHFLOWS_FROM_ASSETS' })`.
   - Nota: la generazione usa lo stato corrente del reducer (dispatch è sincrono), quindi non è necessario attendere la persistenza su storage per ottenere i cashflow generati nella UI immediatamente.
3. Protezioni e UX:
   - Eseguire la generazione in background (asincrona) e mostrare uno spinner o indicatore sulla card/toolbar per informare l'utente.
   - Debounce / queue: evitare di lanciare più generazioni contemporanee per lo stesso asset (es. rapid save multipli). Usare un lock o debounce di 1-2s.
   - Fallback: mantenere il pulsante "Forza generazione" visibile solo per utenti avanzati/diagnostica o in caso di errore.
4. Error handling e rollback:
   - Se la generazione fallisce, mostrare messaggio d'errore e lasciare il pulsante "Forza generazione" come recovery.
   - Implementazione: per ora la generazione è eseguita inline nel reducer e non è ancora avvolta in un try/catch di livello UI; eventuali miglioramenti (spinner, error UI, rollback) sono elencati nei passi successivi.
5. Test e validazione:
   - Test manuale: salvare dati immobile via popup → attendere completamento auto-generate → verificare che i cashflow siano presenti nella sezione Entrate/Uscite.
   - Aggiungere unit/integration tests per l'action dispatcher se possibile.

Acceptance criteria
- Salvataggio da popup/wizard genera automaticamente i cashflow per l'asset senza necessità di cliccare "Forza generazione". ✅
- L'operazione è debounced/queued e mostra feedback visivo; il pulsante "Forza generazione" resta disponibile solo per recovery. (Work in progress: debounce/UI feedback to add)

Note tecniche e rischio
- La generazione può essere computazionalmente pesante: evitare di eseguirla nella UI thread senza feedback. Se è pesante, valutare delega a worker o esecuzione server-side.
- Priorità: alta (migliora UX). Eseguire rollout incrementale e monitoraggio.

### 2025-10-29 — Task 4: Integrazione AssetPatrimonio — Done

Descrizione
: Integrare i calcoli di rendita netta e ROI nella renderizzazione delle card Immobili e collegare i dati del popup spese ai salvataggi del reducer.

File modificati
- `src/components/sections/AssetPatrimonio/AssetPatrimonio.jsx` — calcolo `income` e `roi` per ogni immobile, passati a `BigTab` tramite `roiDetails`; aggiunto import dei calcoli.
- `src/components/ui/BigTab.jsx` — (già aggiornato) gestione di `roiDetails` e visualizzazione compatta nella card.
- `src/components/ui/ExpensesPopup.jsx` — UI popup per gestione spese (usato nel flow di salvataggio).
- `src/utils/calculations.js` — funzioni `calculateNetIncome` e `calculateROI` (già presenti e utilizzate).

Azioni eseguite
- Calcoli: usate le utility `calculateNetIncome` e `calculateROI` per ogni immobile.
- UI: passato `roiDetails={{ roi, income }}` a `BigTab` così le card mostrano ROI e rendita.
- Salvataggio: `ExpensesPopup` salva i campi (`expenses`, `taxRate`, `yearlyRent`) e viene dispatchata l'azione `UPDATE_PATRIMONIO_IMMOBILE`.

Esito
: ✅ Completato. Patch applicata e test manuale suggerito (hover + apertura popup + salvataggio) per verificare visualizzazione e persistenza.



### Task completate (storico)

### 2025-10-29 — Task 7: Implementazione calcolo ROI e spese immobili (Metodo A)
### 2025-10-28 — Task 5: Uniformazione UI tab cashflow generati (Metodo A) — Done
### 2025-10-28 — Task 6: Riorganizzazione layout Entrate Attuali (Metodo B) — Done
### 2025-10-28 — Task 4: Miglioramento contrasto wizard/popup (Metodo B) — Done
### 2025-10-28 — Task 3: Abilitazione editing voci generate (Metodo B) — Done
### 2025-10-27 — Fix visualizzazione cashflow, edit e contrasto UI — Done ✅
### 2025-10-27 — Sistema Asset Generico + Cashflow con Wizard Multi-Step — Done ✅
### 2025-10-27 — Integrazione sezione Immobili con reducer e persistenza — Done ✅
### 2025-10-24 — Creazione iniziale dei file di contesto — Done ✅

(Registro cronologico: aggiungere nuove voci in cima al file per mantenere l'ordine decrescente.)

