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

### 2025-10-27 — Fix visualizzazione cashflow, edit e contrasto UI (tracciamento lavori)

Stato rapido e proposte di intervento (da tracciare prima di proseguire):

- Problemi riscontrati durante lo sviluppo:
  - I cashflow generati non venivano mostrati nella sezione Entrate.
  - Non esisteva la possibilità di modificare una voce cashflow generata.
  - Testi del popup/wizard (titoli e label) presentavano contrasto basso (bianco su grigio).

- Modifiche proposte (implementate/da completare):
  1. Aggiungere nella UI di `Stipendio.jsx` una sezione read-only che mostri `state.entrate.cashflowAsset[]` con pulsante "Modifica" per ogni voce.
     - Sub-task (implementazione): la UI deve mostrare titolo, importo, frequenza, data e un link/indicazione dell'asset sorgente (se disponibile). — ✅ done
     - Sub-task (interop reducer): al salvataggio della modifica la UI dispatcha `UPDATE_CASHFLOW_ASSET` con payload normalizzato. — ✅ done
     - Sub-task (sincronizzazione): il reducer `UPDATE_CASHFLOW_ASSET` deve:
       - aggiornare l'entry corrispondente in `state.entrate.cashflowAsset[]` o `state.uscite.cashflowAsset[]`; — ✅ done
       - se presente `meta.assetId` / `meta.assetTipo` (o `sourceAssetId` / `sourceAssetTipo`), trovare l'asset sorgente in `patrimonio` e aggiornare il relativo `asset.cashflows[]` (matching by cashflow id); — ✅ done
       - usare clone profondo del `state` prima di mutare per mantenere immutabilità e compatibilità con persistence/undo. — ✅ done
     - Sub-task (test): aggiungere un breve smoke test che crea un asset, forza la generazione, modifica la voce generata e verifica sia la lista `entrate.cashflowAsset` sia `patrimonio.[..].cashflows` sono aggiornate. — ✅ done
  2. Implementare la nuova azione reducer `UPDATE_CASHFLOW_ASSET` che:
    - aggiorni la voce generata in `entrate.cashflowAsset[]` o `uscite.cashflowAsset[]`; — ✅ done
    - se la voce è collegata a un asset sorgente (es. tramite `meta.assetId`/`meta.assetTipo`), aggiorni anche il cashflow corrispondente dentro `asset.cashflows[]`. — ✅ done
  3. Consentire l'editing di una voce generata aprendo `CashflowForm.jsx` pre-popolato e, al salvataggio, dispatchare `UPDATE_CASHFLOW_ASSET`. — ✅ done
  4. Aumentare contrasto testi del wizard/popup: impostare titoli e label a colore nero (`#000`) per miglior accessibilità. — ✅ done

- Test manuale suggerito (smoke):
  - creare un immobile con un cashflow `autoGenerate: true` e `startDate = oggi`;
  - usare il pulsante "Forza generazione cashflow" in Dashboard;
  - verificare che l'entry appaia in `Stipendio`;
  - cliccare "Modifica", cambiare importo e salvare; verificare che la voce generata e il cashflow sorgente siano aggiornati.

---

### 2025-10-28 — Task 3: Abilitazione editing voci generate (Metodo B) — Done

Descrizione
: Abilitata l'apertura del `CashflowForm.jsx` pre-popolato dalle voci in `state.entrate.cashflowAsset[]` e dispatch di `UPDATE_CASHFLOW_ASSET` al salvataggio.

File coinvolti
- `src/components/sections/EntrateAttuali/Stipendio.jsx` (gestione `editingGenerated`, normalizzazione modello, wiring `onSave`)
- `src/components/wizard/forms/CashflowForm.jsx` (modal pre-popolato, `onSave` restituisce modello normalizzato)

Azioni eseguite
- Implementato `handleEditGenerated` in `Stipendio.jsx` che costruisce il model iniziale per il form.
- Wire `CashflowForm` con props `show`, `initial`, `onClose`, `onSave` e dispatch `UPDATE_CASHFLOW_ASSET` nel callback `handleSaveGenerated`.

Esito
: ✅ Completato — l'editing delle voci generate è operativo; la chiamata `UPDATE_CASHFLOW_ASSET` viene effettuata con payload normalizzato (amount/importo, startDate/date, meta) e il reducer sincronizza la voce anche nell'asset sorgente quando presente.


Nota: queste modifiche servono a completare il flusso end-to-end prima di procedere con ulteriori feature.

---

### 2025-10-28 — Task 6: Riorganizzazione layout Entrate Attuali (Metodo B) — Done

Descrizione
: Migliorata l'organizzazione visiva della sezione Entrate Attuali riposizionando il pulsante "Aggiungi voce" in linea con le voci manuali e separando visivamente la sezione dei cashflow generati.

File coinvolti
- `src/components/sections/EntrateAttuali/Stipendio.jsx` (riorganizzazione layout e stili)

Azioni eseguite
1. Spostato il pulsante "Aggiungi voce":
   - Mantenuto inline con le voci manuali
   - Allineamento a sinistra per coerenza visiva
   - Stile e dimensioni uniformi con le altre tab
2. Migliorata separazione sezione cashflow:
   - Aggiunto separatore visivo con `borderTop: '1px solid var(--bg-medium)'`
   - Aumentata spaziatura verticale con `marginTop: 32px` e `paddingTop: 24px`
   - Migliorata coerenza visiva delle sezioni

Esito
: ✅ Completato — Il layout è ora più intuitivo con gli elementi correlati raggruppati logicamente e una chiara separazione visiva tra voci manuali e automatiche.

---

### 2025-10-28 — Task 5: Uniformazione UI tab cashflow generati (Metodo A)

Descrizione
: Migliorare e uniformare l'aspetto visivo delle tab generate automaticamente da nextgeneration in Entrate Attuali per allinearle allo stile delle altre tab di entrata.

File coinvolti
- `src/components/sections/EntrateAttuali/Stipendio.jsx` (visualizzazione e formattazione tab)
- `src/utils/format.js` (potenziale helper per formattazione date)

Azioni da eseguire
1. Semplificare formato data:
   - Rimuovere timestamp e mantenere solo data (YYYY-MM-DD)
   - Implementare formattazione consistente per tutte le date mostrate
2. Uniformare stile tab generate:
   - Applicare stesso stile visivo delle tab entrata esistenti
   - Uniformare padding, margini e spaziature
   - Verificare allineamento testi e valori
3. Migliorare organizzazione informazioni:
   - Raggruppare logicamente dati correlati
   - Evidenziare importo con stile consistente
   - Mostrare frequenza in modo chiaro e conciso

Esito atteso
: Le tab generate automaticamente dovranno essere visivamente indistinguibili da quelle create manualmente, con informazioni temporali semplificate e più leggibili.

---

### 2025-10-28 — Task 4: Miglioramento contrasto wizard/popup (Metodo B) — Done

Descrizione
: Aggiornati i componenti del wizard e i form per impostare titoli e label a colore nero (`#000`) per migliorare l'accessibilità e il contrasto.

File coinvolti
- `src/components/wizard/forms/FormField.jsx` (label color impostato a `#000`)
- `src/components/wizard/forms/CashflowForm.jsx` (labels/titoli già impostati a `#000`)
- `src/components/wizard/WizardHeader.jsx` (titolo e step già impostati a `#000`)
- `src/components/wizard/steps/BaseDataStep.jsx` (hint tipo asset a `#000`)
- `src/components/wizard/steps/CashflowStep.jsx` (titoli e label a `#000`)

Azioni eseguite
- Aggiornato `FormField.jsx` per usare `color: '#000'` sulle etichette.
- Verificati e uniformati i componenti `CashflowForm.jsx` e `WizardHeader.jsx` (già con testo nero).
- Aggiornati `BaseDataStep.jsx` e `CashflowStep.jsx` per aumentare contrasto su titoli e testi principali.

Esito
: ✅ Completato — i titoli e le label principali del wizard e dei popup sono ora impostati a `#000`.


---

### 2025-10-27 — Sistema Asset Generico + Cashflow con Wizard Multi-Step

**Decisione / modifica:**
- Progettato e proposto sistema unificato per gestione asset con cashflow ricorrenti integrato
- Pattern riutilizzabile: ogni asset (immobili, obbligazioni, azioni, ETF, depositi, oro) può avere 0+ cashflow (entrate/uscite)
- Wizard multi-step (3 step: Dati base, Cashflow, Extra) per creare/modificare asset in modo guidato
- Sistema di generazione automatica cashflow ricorrenti che crea entrate/uscite collegate all'asset sorgente

**Decisione / modifica:**
- Progettato e proposto sistema unificato per gestione asset con cashflow ricorrenti integrato
- Pattern riutilizzabile: ogni asset (immobili, obbligazioni, azioni, ETF, depositi, oro) può avere 0+ cashflow (entrate/uscite)
- Wizard multi-step (3 step: Dati base, Cashflow, Extra) per creare/modificare asset in modo guidato
- Sistema di generazione automatica cashflow ricorrenti che crea entrate/uscite collegate all'asset sorgente

**Architettura proposta:**

1. **Modello dati unificato:**
   - Schema `baseAssetSchema` comune a tutti gli asset: `{ id, tipo, titolo, valore, cashflows[], note, documenti }`
   - Schema `cashflowSchema`: `{ id, type, titolo, amount, frequency, startDate, autoGenerate, nextGeneration }`
   - Campi specifici per tipo asset: `assetTypeFields` (es. immobile: indirizzo, metratura; obbligazione: ISIN, cedola; azione: ticker, quantità)

2. **Componenti Wizard:**
   - `src/components/wizard/AssetWizard.jsx` → Container principale con navigazione step
   - `src/components/wizard/steps/BaseDataStep.jsx` → Step 1: form dati base configurabile per tipo asset
   - `src/components/wizard/steps/CashflowStep.jsx` → Step 2: gestione entrate/uscite ricorrenti (add/edit/delete)
   - `src/components/wizard/steps/ExtraStep.jsx` → Step 3: note e documenti (opzionale)
   - `src/components/wizard/forms/CashflowForm.jsx` → Modal per aggiungere/modificare singolo cashflow
   - `src/components/wizard/WizardHeader.jsx` → Barra step indicator
   - `src/components/wizard/WizardFooter.jsx` → Pulsanti navigazione (Indietro/Avanti/Salva)

3. **Reducer & Context:**
   - Nuove azioni: `UPDATE_ASSET_WITH_CASHFLOWS`, `GENERATE_CASHFLOWS_FROM_ASSETS`
   - Helper `updateAssetInPatrimonio(state, assetType, payload)` → aggiorna asset in qualsiasi sezione patrimonio
   - Helper `generateRecurringCashflows(state)` → scansiona asset, genera cashflow ricorrenti se data >= nextGeneration
   - Helper `calculateNextDate(currentDate, frequency)` → calcola prossima data in base a frequenza (monthly/quarterly/semiannually/yearly)

4. **Integrazione UI:**
   - `AssetPatrimonio.jsx`: sostituire pulsanti "+" e click su BigTab con apertura wizard
   - Handler `handleAddAsset(assetType)` e `handleEditAsset(asset, assetType)` → aprono wizard
   - Handler `handleSaveFromWizard(assetData)` → dispatch azione appropriata + chiude wizard

5. **Auto-generazione:**
   - Hook `useCashflowGeneration()` → esegue `GENERATE_CASHFLOWS_FROM_ASSETS` ogni ora + al mount
   - Integrato in `Dashboard.jsx` per attivazione globale
   - Genera voci in `state.entrate.cashflowAsset[]` e `state.uscite.cashflowAsset[]` con link all'asset sorgente

  ---

  ### 2025-10-27 — Fase 4: Auto-generazione Cashflow — integrazione e stato test

  Decisione / modifica:
  - Implementato hook `useCashflowGeneration()` che dispatcha `GENERATE_CASHFLOWS_FROM_ASSETS` al mount e ogni ora.
  - Hook integrato in `src/components/layout/Dashboard.jsx` (Fase 4.2) — ora il sistema esegue la scansione automatica in background.
  - Aggiunto pulsante di debug "Forza generazione cashflow" in Dashboard per trigger manuale e testing rapido.

  Stato:
  - Fase 4.1 (creare hook) — COMPLETATA
  - Fase 4.2 (integrare hook in Dashboard) — COMPLETATA
  - Fase 4.3 (testare generazione automatica con asset mock) — IN-PROGRESS
    - Azione richiesta: creare asset con cashflow con `startDate <= oggi` e `autoGenerate: true` oppure usare il pulsante "Forza generazione cashflow" per verificare che vengano generate voci in `state.entrate.cashflowAsset[]` / `state.uscite.cashflowAsset[]`

  Azioni future / TODO immediate:
  - Eseguire smoke test manuale:
    1. Aprire UI → AssetPatrimonio → aggiungere un asset (es. immobile) con cashflow autoGenerate true e startDate = oggi.
    2. Cliccare "Forza generazione cashflow" in Dashboard.
    3. Verificare che `state.entrate.cashflowAsset` (o `uscite`) contenga la voce generata.
  - Se test positivo, marcare Fase 4.3 come COMPLETATA e registrare test automatico/unit test.

6. **Visualizzazione:**
   - `Stipendio.jsx`: nuova sezione "Entrate automatiche da Asset" (read-only, mostra cashflowAsset)
   - `Uscite.jsx`: nuova sezione "Uscite automatiche da Asset" (read-only, mostra cashflowAsset)
   - Ogni cashflow mostra link all'asset di origine per tracciabilità

**Esempi concreti configurabili:**
- **Immobile**: valore 250k, cashflows: affitto 1200€/mese (entrata), IMU 800€/anno (uscita), condominio 150€/mese (uscita)
- **Obbligazione BTP**: valore 10k, cedola 2.5%, cashflow: cedola semestrale 125€ (entrata)
- **ETF Vanguard**: 50 quote, cashflow: dividendi trimestrali 45€ (entrata)
- **Azione Enel**: 200 azioni, cashflow: dividendo annuale 72€ (entrata)
- **Conto deposito FCA**: 15k al 3%, cashflow: interessi annuali 450€ (entrata)
- **Oro fisico**: cashflow: cassetta sicurezza 120€/anno (uscita)

**Motivazione sintetica:**
- Eliminare duplicazione codice tra tipi di asset (wizard riutilizzabile)
- Collegare automaticamente entrate/uscite ricorrenti agli asset che le generano
- UX guidata step-by-step per configurazione completa asset + cashflow
- Tracciabilità: ogni flusso di cassa è linkato all'asset sorgente (immobile, obbligazione, azione...)
- Scalabilità: aggiungere nuovi tipi di asset richiede solo configurazione campi, non nuovi componenti

**Azioni future / TODO:**

**Fase 1 - Fondamenta (priorità ALTA):**
- [ ] Creare `src/config/assetSchemas.js` con `baseAssetSchema`, `cashflowSchema`, `assetTypeFields`
- [ ] Estendere `initialState` in `src/config/constants.js`:
  - Aggiungere `entrate.cashflowAsset[]`
  - Aggiungere `uscite.cashflowAsset[]`
  - Arricchire array asset esistenti per supportare campo `cashflows[]`
- [ ] Aggiungere azioni reducer in `src/context/FinanceContext.jsx`:
  - `UPDATE_ASSET_WITH_CASHFLOWS` con helper `updateAssetInPatrimonio()`
  - `GENERATE_CASHFLOWS_FROM_ASSETS` con helper `generateRecurringCashflows()`
  - `calculateNextDate()` utility

**Fase 2 - Componenti Wizard (priorità ALTA):**
- [ ] Creare struttura cartella `src/components/wizard/` con sottocartelle `steps/` e `forms/`
- [ ] Implementare `AssetWizard.jsx` (container principale con state management step)
- [ ] Implementare `WizardHeader.jsx` (step indicator + titolo + pulsante close)
- [ ] Implementare `WizardFooter.jsx` (pulsanti Indietro/Avanti/Salva/Annulla)
- [ ] Implementare `BaseDataStep.jsx` con configurazione campi per tipo asset
- [ ] Implementare `CashflowStep.jsx` con lista entrate/uscite + pulsanti modifica/elimina
- [ ] Implementare `CashflowForm.jsx` (modal per add/edit cashflow singolo)
- [ ] Creare `FormField.jsx` generico per input configurabili

**Fase 3 - Integrazione UI AssetPatrimonio (priorità MEDIA):**
- [ ] Modificare `AssetPatrimonio.jsx`:
  - Aggiungere stato `showWizard`, `wizardAsset`, `wizardAssetType`
  - Implementare `handleAddAsset(assetType)` → apre wizard vuoto
  - Implementare `handleEditAsset(asset, assetType)` → apre wizard pre-popolato
  - Implementare `handleSaveFromWizard(assetData)` → dispatch azione + chiude wizard
  - Sostituire pulsanti "+" con `onClick={() => handleAddAsset('deposito')}` etc.
  - Sostituire click su BigTab con `onClick={() => handleEditAsset(asset, tipo)}`
  - Aggiungere render `{showWizard && <AssetWizard ... />}`

**Fase 4 - Auto-generazione Cashflow (priorità MEDIA):**
- [ ] Creare `src/hooks/useCashflowGeneration.js`:
  - Hook che dispatcha `GENERATE_CASHFLOWS_FROM_ASSETS` ogni ora + al mount
  - Espone `forceGenerate()` per trigger manuale
- [ ] Integrare hook in `Dashboard.jsx` per attivazione globale
- [ ] Testare generazione automatica con mock asset configurati

**Fase 5 - Visualizzazione Cashflow in Entrate/Uscite (priorità BASSA):**
- [ ] Modificare `Stipendio.jsx`:
  - Aggiungere sezione "Entrate automatiche da Asset"
  - Mostrare `state.entrate.cashflowAsset` con `EntriesGrid` in modalità read-only
  - Aggiungere link cliccabile per navigare all'asset sorgente
- [ ] Modificare `Uscite.jsx`:
  - Aggiungere sezione "Uscite automatiche da Asset"
  - Mostrare `state.uscite.cashflowAsset` con griglia read-only
  - Aggiungere link all'asset sorgente

**Fase 6 - Testing & Refinement (priorità BASSA):**
- [ ] Test completi workflow: crea immobile con affitto → verifica generazione entrata automatica
- [ ] Test workflow: crea obbligazione con cedola semestrale → verifica calcolo nextDate corretto
- [ ] Test modifica asset esistente → verifica aggiornamento cashflow collegati
- [ ] Test eliminazione asset → decidere comportamento cashflow generati (mantenerli o eliminarli?)
- [ ] Refinement UX: animazioni transizioni step, validazione form, error handling
- [ ] Ottimizzazione performance: memoization per `generateRecurringCashflows` se asset numerosi

**Stima tempo implementazione:** 15-20 ore totali
**Impatto architetturale:** ALTO (introduce pattern wizard riutilizzabile, modifica modello dati, aggiunge sistema automatizzazione)
**Breaking changes:** NO (retrocompatibile, arricchisce asset esistenti senza romperli)

**Note tecniche:**
- Frequenze supportate: `monthly`, `quarterly`, `semiannually`, `yearly`, `once`
- Calcolo nextDate: usa `Date.setMonth()` / `Date.setFullYear()` per incremento
- Persistenza: cashflow memorizzati dentro asset (`asset.cashflows[]`), generati salvati in `entrate/uscite.cashflowAsset[]`
- Link bidirezionale: cashflow generato contiene `assetId` + `assetTipo` per risalire all'origine

**Dipendenze esterne:** Nessuna (usa solo React hooks, recharts già presente)

---

### 2025-10-27 — Integrazione sezione Immobili con reducer e persistenza

**Decisione / modifica:**
- Completata rinominazione sezione duplicata da `conti_extra` a `immobili`
- Aggiunto supporto completo nel reducer per `ADD_PATRIMONIO_IMMOBILE`, `UPDATE_PATRIMONIO_IMMOBILE`, `DELETE_PATRIMONIO_IMMOBILE`
- Esteso `normalizeState()` per gestire `patrimonio.immobili[]` con fallback da `contiExtra` per retro-compatibilità
- Normalizzazione automatica campo `valore` a Number per ogni immobile

**Modifiche applicate:**
- `src/context/FinanceContext.jsx`:
  - Aggiunti case reducer per immobili
  - Aggiornato `normalizeState()` per garantire `s.patrimonio.immobili = []` e mappare `valore` a Number
- `src/components/sections/AssetPatrimonio/AssetPatrimonio.jsx`:
  - Rinominati tutti hook da `showAddContoExtra` → `showAddImmobile`, etc.
  - Rinominati handler da `handleAddContoExtra` → `handleAddImmobile`, etc.
  - Sostituita card UI e modali con nuovi riferimenti a `immobili`
  - Aggiornata dependency array `useEffect` per ESC handler

**Motivazione sintetica:**
- Dare nome di dominio corretto alla sezione duplicata (da placeholder a entity significativa)
- Preparare terreno per estensione cashflow (immobili possono generare affitti/spese)

**Status:** ✅ Completato e testato - integrazione funziona correttamente

---

### 2025-10-24 — Creazione iniziale dei file di contesto
Decisione / modifica:
- Creati due file di contesto: `ai_context.md` e `agent_notes.md`.

Motivazione sintetica:
- Introdurre una memoria persistente e regole condivise per supportare l'assistente nelle sessioni future.

Azioni future / TODO:
- Aggiornare `agent_notes.md` al termine di ogni sessione con le modifiche effettuate (nuove dipendenze, refactor, modifiche API).
- Quando si introduce una nuova libreria o cambi architetturali, aggiungere una entry datata con motivazione e TODO di migrazione.

(Registro cronologico: aggiungere nuove voci in cima al file per mantenere l'ordine decrescente.)
# agent_notes.md — Cronologia decisioni operative

### 2025-10-24 — Creazione iniziale dei file di contesto
Decisione / modifica:
- Creati due file di contesto: `ai_context.md` e `agent_notes.md`.

Motivazione sintetica:
- Introdurre una memoria persistente e regole condivise per supportare l'assistente nelle sessioni future.

Azioni future / TODO:

- Aggiornare `agent_notes.md` al termine di ogni sessione con le modifiche effettuate (nuove dipendenze, refactor, modifiche API).

- Quando si introduce una nuova libreria o cambi architetturali, aggiungere una entry datata con motivazione e TODO di migrazione.

---

(Registro cronologico: aggiungere nuove voci in cima al file per mantenere l'ordine decrescente.)
