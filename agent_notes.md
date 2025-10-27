# agent_notes.md — Cronologia decisioni operative

### 2025-10-27 — Duplicazione scheda `Conti Deposito` -> `conti_extra`
Decisione / modifica effettuata:
- Duplicata la scheda `Conti Deposito` all'interno di `src/components/sections/AssetPatrimonio/AssetPatrimonio.jsx` con chiave UI `conti_extra`.

Dettaglio delle modifiche:
- Aggiunta costante `contiExtra = state.patrimonio.contiDepositoExtra || []` per collegare la nuova sezione nello stato (se assente rimane vuota).
- Aggiunti hook locali per UI e form: `showAddContoExtra`, `showEditContoExtra`, `newContoExtra`, `editingContoExtra`.
- Aggiunti handler CRUD: `handleAddContoExtra`, `handleUpdateContoExtra`, `handleDeleteContoExtra`, `openEditContoExtra`.
- Inserito blocco JSX duplicato (titolo, DonutChart, elenco `BigTab`, add-tab) con key `conti_extra` e modali `Nuovo Conto Deposito (Extra)` / `Modifica Conto (Extra)`.
- Aggiunto supporto ESC globale per chiudere i modali della nuova sezione e aggiornata la dependency array della `useEffect`.

Note tecniche:
- I dispatch usano tipi specifici con suffisso `_EXTRA`: `ADD_PATRIMONIO_CONTO_EXTRA`, `UPDATE_PATRIMONIO_CONTO_EXTRA`, `DELETE_PATRIMONIO_CONTO_EXTRA` — il reducer (`FinanceContext.jsx`) va aggiornato per supportare questi tipi o si può mappare la nuova sezione su action generiche come pianificato nella proposta di refactor.

Azioni future / TODO generate:
- Aggiornare il reducer (`FinanceContext.jsx`) per gestire i nuovi tipi o adottare action generiche (`ADD_SECTION_ITEM`, ...).
- Aggiornare `storage.js` / `normalizeState` se si vuole persistere `contiDepositoExtra` con naming coerente.

---

Dettaglio operativo (passi da effettuare):
1. Copiare il blocco JSX della scheda esistente (wrapper con onMouseEnter/onMouseLeave, header, DonutChart, elenco `BigTab`, add-tab, modals) come punto di partenza.
2. Rinomina il `key` della sezione (es. da `'buoni'` → `'nuovaSezione'`) e tutte le variabili locali correlate (es. `items`, `showAddX`, `newX`, `editingX`, `handlers`).
3. Collegare la sorgente dati corretta nello state: `const items = state.patrimonio.nuovaSezione || []`.
4. Implementare `getValue` specifico per la nuova entità (es. `item.valore` o `item.importo`) e fornire la funzione come prop a `SmallCard`.
5. Aggiungere / aggiornare i tipi di action nel reducer (`ADD_...`, `UPDATE_...`, `DELETE_...`) o introdurre action generiche (`ADD_SECTION_ITEM`, `UPDATE_SECTION_ITEM`, `DELETE_SECTION_ITEM`) con payload che includa `sectionKey`.
6. Implementare handler add/update/delete che eseguono `dispatch` con i tipi corretti e gestiscono lo stato locale `new` / `editing`.
7. Aggiungere le modali/forms per `showAdd` e `showEdit` con i campi necessari e garantire la chiusura via ESC (riusare il key handler globale se presente).
8. Aggiornare `useFinancialCalculations` se la nuova scheda deve partecipare ai totali globali.
9. Assicurare che ogni elemento abbia un `key` univoco (id generato) e che la persistenza (`storage.js` e `normalizeState` in `FinanceContext.jsx`) salvi la nuova sezione.
10. Test funzionale: aggiungere, modificare, eliminare elementi; verificare totalizzazione e persistenza su localStorage.

Motivazione sintetica:
- Ridurre duplicazione di codice, migliorare manutenzione e semplificare l'aggiunta di nuove sezioni.

Azioni future / TODO generate:

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
