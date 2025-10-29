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

### 2025-10-29 — Task 7: Implementazione calcolo ROI e spese immobili (Metodo A)

Descrizione
: Aggiungere il sistema di gestione spese e calcolo ROI per gli immobili, includendo un popup dedicato per l'inserimento delle spese e la visualizzazione dei calcoli nella card dell'immobile.

File coinvolti
- `src/components/sections/AssetPatrimonio/AssetPatrimonio.jsx` (gestione stato e logica)
- `src/components/ui/BigTab.jsx` (estensione UI per mostrare ROI e rendita)
- `src/components/ui/ExpensesPopup.jsx` (nuovo componente per gestione spese)
- `src/utils/calculations.js` (nuove funzioni di calcolo)
- `src/context/FinanceContext.jsx` (estensione state per spese immobili)

Azioni da eseguire
1. Backend e State Management: ✅ Done
   - Esteso schema immobili con `expenses[]`, `taxRate`, `yearlyRent`
   - Aggiunta action `UPDATE_IMMOBILE_EXPENSES`
   - Implementati helper `calculateROI` e `calculateNetIncome` in `calculations.js`

2. Popup Gestione Spese: ✅ Done
   - Creato componente `ExpensesPopup.jsx` con:
     - Lista dinamica spese implementata con add/remove
     - Input numerici validati per spese/tassazione/affitto
     - Calcoli real-time per totale, rendita e ROI
     - UI coerente e responsive con temi applicazione

3. Estensione BigTab: ✅ Done
   - Aggiunto pulsante gestione spese (📓) visibile in hover
   - Implementata sezione ROI details con stile compatto
   - Aggiunta prop roiDetails per gestione dati
   - Mantenuta compatibilità con funzionalità esistenti

4. Integrazione AssetPatrimonio:✅ Done
   - Aggiungere stato per controllo popup spese
   - Implementare handlers per salvataggio/modifica spese
   - Collegare calcoli ROI al componente BigTab
   - Aggiornare visualizzazione immobili con nuove info

5. Testing e Validazione:
   - Testare inserimento spese multiple
   - Verificare calcoli ROI e rendita
   - Controllare persistenza dati
   - Validare UX del popup

Obiettivi UI/UX:
- Popup spese intuitivo con aggiunta dinamica voci
- Visualizzazione compatta ma chiara di ROI e rendita
- Coerenza visiva con il resto dell'applicazione
- Feedback immediato sui calcoli

Esempio struttura dati:
```javascript
immobile: {
  id: string,
  titolo: string,
  valore: number,
  yearlyRent: number,
  taxRate: number,
  expenses: [
    { title: string, amount: number }
  ]
}
```

### Task completate (storico)

### 2025-10-28 — Task 5: Uniformazione UI tab cashflow generati (Metodo A) — Done
### 2025-10-28 — Task 6: Riorganizzazione layout Entrate Attuali (Metodo B) — Done
### 2025-10-28 — Task 4: Miglioramento contrasto wizard/popup (Metodo B) — Done
### 2025-10-28 — Task 3: Abilitazione editing voci generate (Metodo B) — Done
### 2025-10-27 — Fix visualizzazione cashflow, edit e contrasto UI — Done ✅
### 2025-10-27 — Sistema Asset Generico + Cashflow con Wizard Multi-Step — Done ✅
### 2025-10-27 — Integrazione sezione Immobili con reducer e persistenza — Done ✅
### 2025-10-24 — Creazione iniziale dei file di contesto — Done ✅

(Registro cronologico: aggiungere nuove voci in cima al file per mantenere l'ordine decrescente.)

