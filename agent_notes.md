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

### 2025-10-30 — Task 9: Rimozione slider tab in Uscite (Metodo A) — To Do

#### Descrizione
Rimuovere lo slider di selezione tab "uscite" dalle griglie all'interno della sezione Uscite, in quanto ridondante essendo già all'interno della sezione dedicata.

#### File coinvolti
- `src/components/sections/Uscite/Uscite.jsx`
- `src/components/ui/EntriesGrid.jsx`

#### Piano implementativo
1. Analisi:
   - Le grid delle uscite fisse e variabili usano il componente `EntriesGrid`
   - Lo slider viene mostrato tramite una prop del componente `EntriesGrid`

2. Implementazione (opzioni):
   - Aggiungere una prop `hideTabSelector` a `EntriesGrid` che quando true nasconde lo slider
   - Oppure modificare `EntriesGrid` per nascondere lo slider quando il `sectionTitle` contiene "Uscite"
   - La prima opzione è più flessibile e riutilizzabile

3. Modifiche da apportare:
   - In `EntriesGrid.jsx`:
     - Aggiungere prop `hideTabSelector: boolean`
     - Condizionare il render del tab selector in base alla prop
   - In `Uscite.jsx`:
     - Passare `hideTabSelector={true}` a entrambe le `EntriesGrid`

4. Testing:
   - Verificare che lo slider sia nascosto in entrambe le grid delle uscite
   - Verificare che lo slider rimanga visibile nelle altre sezioni che usano `EntriesGrid`
   - Verificare che il comportamento delle grid rimanga invariato

#### Note
- Mantenere la logica interna di EntriesGrid che usa il tipo "uscita"
- Non modificare il comportamento, solo la UI
- L'implementazione deve essere retrocompatibile con l'uso esistente di EntriesGrid

### Task completate (storico)

### 2025-10-29 — Task 3: Estensione BigTab — Done
### 2025-10-29 — Task 8: Auto-generate cashflows on save (Metodo A) — Done
### 2025-10-29 — Task 4: Integrazione AssetPatrimonio — Done
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

