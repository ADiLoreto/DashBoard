# agent_notes.md — Cronologia decisioni operative e Metodi di lavoro

# 🧭 Metodi di Lavoro

NON TOCCARE MAI I METODI DI LAVORO !

Questo documento contiene le regole operative per la gestione del progetto tramite AI.  
Ogni sessione di lavoro deve iniziare specificando quale **metodo di lavoro** viene adottato, così che l’AI possa comportarsi in modo coerente e riconoscere il contesto operativo.

---
## ⚙️ Metodo di Lavoro A — *Supervisione e Continuità*
**Obiettivo:** mantenere la coerenza e la continuità del progetto nel tempo.

### Regole operative
0. Crea un nuovo file "task".md e inserisci tutte le informazioni emergenti all'interno del file creat
1. Prima di eseguire l'ipotesi fare una lista dei file che ritieni responsabili del problema evidenziato dal prompt ricevuto. 
2. Ogni nuova decisione, modifica o chiarimento deve essere **annotato in questo file appena creato**, in ordine cronologico.
3. Quando un’azione deriva da una modifica già eseguita in passato, **riportare il riferimento** (es: “Come nella duplicazione di *contidepositoextra* del 2025-10-23”).
4. Ogni volta che una nuova card, pagina o funzione viene aggiunta:
   - Descrivere brevemente **scopo e comportamento previsto**
   - Annotare i **file coinvolti**
   - Riportare **eventuali dipendenze o chiamate API**
5. Mai cancellare parti di testo di questo file se non espressamente richiesto: se serve sostituire una logica, usare la dicitura:
   > 🔄 *Sostituisce la logica precedente del giorno XX/XX/XXXX in merito a ...*
6. La strategia proposta deve essere coerente con la lista dei file responsabili del comportamento.

### Quando usarlo
Usare il Metodo A per lavori continuativi, refactoring, o quando si riprende un task interrotto.  
Prompt tipico:  
> “Stiamo eseguendo il metodo di lavoro A. Riprendi dal punto dove avevamo duplicato la card contidepositoextra e procedi con la creazione della card Immobili.”

---

## Metodo di Lavoro A+ — Scomposizione profonda e piano operativo dettagliato

Obiettivo: trasformare una task di alto livello (creata con il Metodo A) in un piano di sottotask tecniche, sequenziali e immediatamente implementabili.

### Regole operative

1. Individuare la task principale indicata nel messaggio (di solito è l'ultima appena creata)

2. Senza modificare il contenuto precedente, scomporre la task in sottotask concrete, ognuna con:
- Titolo sintetico con sottosezione della task (esempio Task 24, andrai a creare le sotto task 24.1, 24.2, 24.3 e cosi via)
- 1 frase descrittiva (max 15 parole)
- File coinvolti

3. Output atteso (es: “nuova classe CSS”, “sidebar aggiornata”, “hover animato”)

4. I sottotask devono essere sequenziali, in modo logico come eseguirebbe il lavoro un programmatore esperto.

5. Nessun codice completo, solo elementi tecnici precisi: classi da creare, logiche da introdurre, punti da verificare.

6. Le sottotask devono essere sufficientemente piccole da poter essere eseguite individualmente con Metodo B.

7. Restituire il risultato modificando direttamente il file (non con testo in chat).

IMPORTANTE: NON implementare la patch: il Metodo A+ serve solo per preparare un piano operativo preciso.

### Quando usarlo

Dopo aver eseguito il metodo A e prima del metodo B

Prima di operazioni stilistiche complesse, refactoring o ristrutturazioni UI.

---

## Metodo di lavoro B

1. Prima di apportare modifiche ai file, crea un nuovo stash chiamato:
   "stash/<nome_task>_<timestamp>"
   Il contenuto dello stash deve includere:
   - Titolo della task
   - Frase di sintesi (1 riga)
   - Lista degli step di implementazione
   - Stato corrente del file da modificare

2. Procedi a implementare la task e gli step nel codice.

3. Aggiorna il file delle task:
   - marca come "Done" la task completata ✅
   - mantieni solo titolo + frase di sintesi (senza dettagli implementativi: quelli ora sono nello stash)

4. Alla fine:
   - genera un riepilogo conciso delle modifiche effettuate
   - NON eliminare lo stash
   - se necessario, crea anche uno stash "diff" con le differenze finali

Obiettivo: lasciare il file pulito, leggibile, sintetico e mantenere la storia tecnica nello stash.

---

## 🧩 Metodo di Lavoro C — Sintesi e Pulizia Task

Obiettivo: sintetizzare il file seguente mantenendo solo le informazioni essenziali per la documentazione, come questo metodo di lavoro.

Regole operative (da rispettare scrupolosamente)
1. Apri e leggi il file **solo in lettura sequenziale** dall’inizio alla fine.
2. *Non* fare prima una lettura completa del file: processa riga-per-riga.  
   - Quando **incontri l’inizio di una task** (es. una riga che contiene “Task”, una data + titolo, o un header `## [Data] — [Titolo]`), fermati su quella task.
   - Sintetizza **immediatamente** quella task in formato: `Titolo — [una frase max 15 parole]`.
   - Appendi la riga sintetizzata al contenuto di output (nell’ordine in cui le task vengono trovate).
   - Poi prosegui la lettura sequenziale dal punto successivo.
3. Per **ogni task** mantenere:
   - il **titolo esatto** così com’è nel file (senza modificarlo),
   - una **frase di sintesi** (massimo 15 parole) che riassuma scopo o risultato.
4. **Ignora completamente**: codice, log, dettagli tecnici, snippet, stacktrace, note di debug, e referenze obsolete. Non includere nulla di tecnico.
5. Se una task è ambigua e non è possibile sintetizzarla con certezza, mantieni il titolo e usa la frase: `[Sintesi non determinabile]`.
6. L’output finale deve essere **solo** le righe sintetizzate, una per task, nello stesso ordine cronologico in cui appaiono nel file originale. Nessuna intestazione aggiuntiva, nessuna spiegazione in chat.
   - Esempio riga di output:  
     `2025-10-27 — Fix visualizzazione cashflow — Mostra cashflow generati e abilita editing sincronizzato.`
7. **Sovrascrivi il file originale** con il contenuto sintetizzato (una riga per task).  
   - Non creare file nuovi o altro non richiesto.
8. Al termine, rispondi in chat soltanto con la frase: `OK — file riscritto con Metodo C.`

### Quando usarlo

Usare il Metodo C per revisionare e alleggerire i file “agent” dopo diverse iterazioni di sviluppo.
Serve a creare una panoramica chiara e aggiornata dei task effettivamente rilevanti.

### Prompt tipico

“Stiamo seguendo il metodo di lavoro C. Riscrivi direttamente il file agent mantenendo solo il titolo e una frase di sintesi per ogni task, ignorando codice e parti obsolete.”

---

## METODO D — "Deep Coherence Validator"

### Obiettivo:
Analizzare la task e le sottotask appena implementate derivanti dal metodo di lavoro A+ appena eseguito insieme ai file dichiarati verificare se:

- tutti i passi sono applicabili,
- non mancano precondizioni,
- l’ordine degli interventi è logico,
- non ci sono conflitti tecnici prevedibili,
- ogni punto può essere implementato con patch reali e non teoriche.
- Controllo struttura e file coinvolti
- Controllo classi, componenti ed elementi target
- Controllo CSS e ordine delle regole
- Controllo integrazione con Tailwind
- Controllo tipi, props e logica interna
- Controllo aspetti di UI e percezione visiva
- Controllo compatibilità fra componenti
- Controllo robustezza e atomicità della patch
- Controllo presenza di step superflui o mancanti
- Controllo eventuali side-effects non dichiarati
- Controllo necessità di rebuild/riavvii
- Controllo coerenza con stato del progetto
- Controllo se ogni sottotask produce un effetto verificabile

Se ritieni che tutti i controllo sono positivi con la patch proposta rispetto al problema da risolvere della task indicare:
1. Controllo effettuato con esito positivo (indicare valore da 1 a 10 per indicare il valore di applicabilità della patch)
2. In caso contrario, ovvero la patch proposta non risponde a tutti i controlli ed è necessario implementare altre modifiche alla patch perchè possa risolvere il problema indicare quali sono gli elementi mancanti/critici da implementare nella patch, sapendo che queste informazioni verranno incluse alle sottotask esistenti della task analizzata. 

---
## Metodo di Lavoro E — Post-Patch Validator

### Obiettivo:
Verificare l’efficacia e la correttezza delle modifiche appena integrate nei file, garantendo che la patch prodotta abbia l’effetto desiderato e non introduca regressioni.

Regole operative:

1. Analizzare la patch applicata nei file dichiarati nella task o sottotask precedente.

2. Controllare se ogni modifica produce l’effetto previsto e se tutti i punti della task originale sono stati rispettati.

3. Individuare eventuali problemi tecnici, conflitti, override, precondizioni mancanti o effetti indesiderati.

4. Valutare la coerenza generale tra task, sottotask e file modificati.

Se necessario, proporre modifiche o estensioni della patch per correggere anomalie o incompletezze.

Annotare in modo sintetico i risultati, con rating di coerenza e decisione finale.

Metodo di lavoro 🔍 Prompt di Indagine Tecnica

Dopo aver Analizzato la richiesta (il cosa).

Comprendi il contesto e la motivazione (il perché).

Identifica i file potenzialmente coinvolti (componenti, CSS, Tailwind config, logiche tema, variabili CSS).

Isola le parti di codice rilevanti al tema richiesto.

Fornisci una spiegazione tecnica chiara su dove e come l’elemento richiesto viene gestito nel codice.

Scrivi il report riassuntivo nel file attuale (senza modificare altro), inseriscilo dopo le ultime task

Output atteso:
Un report di indagine tecnica completo, leggibile, senza patch e senza modifiche ai file, solo analisi.

## 🧾 Quando apporti modifiche al file attieniti a questa struttura

Ogni task documentato in questo file deve seguire questa struttura:

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
---

## [2025-12-02] — Task 33 — Sidebar auto-hide con timeout configurabile
### Descrizione
Modificare la sidebar per diventare progressivamente trasparente dopo un timeout configurabile. Al passaggio del cursore, tornerà opaca. L'utente potrà selezionare il timeout tramite slider nella modal Impostazioni con preset: No transparency | 3s | 10s | 20s | 30s | 1m | 3m | 5m (default: 3s).

### File coinvolti
- `src/components/SidebarPrompt.tsx` (logica auto-hide, hover detection, opacity transition)
- `src/components/SettingsModalForm.tsx` (slider timeout con preset mappati)
- `src/types/Prompt.ts` (nuovo campo `autoHideTimeout` in `AppSettings`)
- `src/main/ipc.ts` (persistenza `autoHideTimeout` via `getSettings`/`saveSettings`)
- `src/renderer/types/electron.d.ts` (aggiornamento tipi AppSettings)

### Ipotesi di intervento (perché questa strada)
- La gestione del timeout è interamente lato **client-side** (React + CSS): non richiede modifiche al main process Electron, solo persistenza su store.
- Lo stato della sidebar (inattiva/attiva) è già gestito in `SidebarPrompt.tsx`; aggiungiamo timeout + hover detection.
- Il slider nella modal usa la stessa logica di salvataggio delle impostazioni (`saveSettings` + `getSettings`).
- CSS Tailwind per opacity class (`opacity-20`, `opacity-100`) e transizione smooth.

### Azioni proposte (passi sequenziali)
1. **Estensione tipo AppSettings**: Aggiungere il campo `autoHideTimeout: number` (in millisecondi) a `src/types/Prompt.ts` con valore di default `3000` (3 secondi).

2. **Mapping preset**: Creare un oggetto mapping per i preset in `SettingsModalForm.tsx`:
   ```
   const timeoutPresets = {
     'no-transparency': 0,         // Disabilitato
     '3s': 3000,
     '10s': 10000,
     '20s': 20000,
     '30s': 30000,
     '1m': 60000,
     '3m': 180000,
     '5m': 300000
   }


3. **UI Slider**: Sostituire il blocco **"Intensità Blur"** attuale con un nuovo blocco **"Auto-hide Sidebar"** che:
   - Mostra il preset selezionato corrente (es: "3 secondi" o "No transparency").
   - Usa uno slider `range` con 8 step (0-7) per i preset.
   - Aggiorna `settings.autoHideTimeout` e persiste con `saveSettings`.
   - Label dinamica che mostra il preset selezionato.

4. **Logica SidebarPrompt**: In `src/components/SidebarPrompt.tsx` aggiungere:
   - State `isHovered` (boolean) per tracciare hover sulla sidebar.
   - State `isInactive` (boolean) per tracciare se timeout è scaduto.
   - useEffect che setta un interval/timeout quando `isInactive = false` e il timeout è > 0; resetta il timer quando hover/mouse move sulla sidebar.
   - CSS class condizionale: applica `opacity-20` quando `isInactive && autoHideTimeout > 0`, altrimenti `opacity-100`.
   - Event listener `onMouseEnter`/`onMouseLeave` per toggle `isHovered`.
   - Transizione smooth: `transition-opacity duration-500` Tailwind.

5. **Listener impostazioni**: In `SidebarPrompt.tsx`, aggiungere un useEffect che ascolta i cambiamenti di `autoHideTimeout` tramite:
   - Opzione A: Caricamento iniziale via `getSettings()` e re-render automatico.
   - Opzione B: Listener IPC (come già fatto per `onThemeChange`) per propagare il cambiamento dalla modal.

6. **Aggiornamento tipi**: In `src/renderer/types/electron.d.ts`, aggiornare l'interfaccia `AppSettings` per includere `autoHideTimeout?: number`.

7. **Test manuale**:
   - Avviare `npm run dev`.
   - Aprire modal Impostazioni e verificare il nuovo slider Auto-hide.
   - Selezionare diversi preset e verificare che la sidebar diventi trasparente dopo il timeout.
   - Passare il cursore sulla sidebar: deve ritornare opaca immediatamente.
   - Chiudere/riaprire app per verificare persistenza.
   - Verificare console per errori.

8. **Documentazione e stash**: Aggiornare `agent_notes_7.md` con esito Task 33 e creare stash `stash/task33_<timestamp>_autohide_timeout.md`.

### Esito atteso
- Sidebar con auto-hide funzionante, timeout configurabile dall'utente, persistito tra sessioni.
- UI intuitiva con preset predefiniti.
- Nessuna regressione su altri controlli (blur rimane se desiderato, export/import, exit funzionano).

### Sottotask (Metodo A+)
#### Task 33.1 — Estendere AppSettings con autoHideTimeout
- Descrizione: Aggiungere campo `autoHideTimeout: number` a Prompt.ts con default 3000ms.
- File coinvolti: src/types/Prompt.ts, src/renderer/types/electron.d.ts
- Output atteso: Tipo esteso, nessun errore TS.

#### Task 33.2 — Creare mapping preset timeout nella modal
- Descrizione: Aggiungere oggetto mapping preset (no-transparency, 3s, ..., 5m) in SettingsModalForm.tsx.
- File coinvolti: src/components/SettingsModalForm.tsx
- Output atteso: Costante mapping pronta per uso slider.

#### Task 33.3 — Implementare UI slider Auto-hide
- Descrizione: Sostituire/aggiungere blocco slider con label dinamica e preset selezionato.
- File coinvolti: src/components/SettingsModalForm.tsx
- Output atteso: Slider funzionante con preset e salvataggio impostazioni.

#### Task 33.4 — Aggiungere logica timeout e hover in SidebarPrompt
- Descrizione: Implementare state isHovered, isInactive, timeout logic e mouse event listener.
- File coinvolti: src/components/SidebarPrompt.tsx
- Output atteso: Sidebar diventa trasparente dopo timeout, opaca su hover.

#### Task 33.5 — Applicare CSS opacity e transizione
- Descrizione: Aggiungere class condizionale opacity-20/opacity-100 e transition-opacity Tailwind.
- File coinvolti: src/components/SidebarPrompt.tsx
- Output atteso: Transizione smooth tra opaco/trasparente.

#### Task 33.6 — Aggiungere listener per propagazione impostazioni
- Descrizione: useEffect in SidebarPrompt per leggere/ascoltare autoHideTimeout da modal.
- File coinvolti: src/components/SidebarPrompt.tsx, src/main/ipc.ts (verifica listener theme pattern)
- Output atteso: Cambi impostazioni modal propagati a sidebar in tempo reale.

#### Task 33.7 — Test manuale e documentazione
- Descrizione: Testare auto-hide, persistenza, console check; aggiornare agent_notes e creare stash.
- File coinvolti: agent_notes_7.md, eventuali stash
- Output atteso: Task marcata Done con validazione.

---

## 2025-12-02 — Task 33: Auto-hide Sidebar (timeout configurabile)
### Descrizione
Implementazione della funzionalità che rende la sidebar quasi trasparente dopo un periodo di inattività configurabile via impostazioni. Preset: No-transparency, 3s, 10s, 20s, 30s, 1m, 3m, 5m.
### File coinvolti
- `src/types/Prompt.ts`
- `src/renderer/types/electron.d.ts`
- `src/components/SettingsModalForm.tsx`
- `src/components/Sidebar.tsx`
- `src/preload/index.ts`
- `src/preload/index.js` (compilato)
- `src/main/ipc.ts`
- `stash/stash_task33_20251202_autohide_timeout.md`
- `agent_notes_7.md`
### Azioni eseguite
- Aggiunto campo `autoHideTimeout?: number` all'interfaccia `AppSettings` in `src/types/Prompt.ts` per persistere la preferenza (ms, 0 = disabled).
- Aggiornata la definizione di `window.electronAPI` in `src/renderer/types/electron.d.ts` per includere `onAutoHideTimeoutChange` (listener con cleanup).
- Introdotti i preset (`AUTOHIDE_TIMEOUT_PRESETS`) e uno slider nella `SettingsModalForm` (`src/components/SettingsModalForm.tsx`) per permettere la selezione rapida dei timeout; la modifica è salvata tramite il canale esistente `storage:saveSettings`.
- Implementata la logica nel componente `Sidebar` (`src/components/Sidebar.tsx`): stato `autoHideTimeout`, flag `isHovered`/`isInactive`, timer gestito con `useEffect` e `useRef`, handler `onMouseEnter/onMouseLeave/onMouseMove` per resettare il timeout, e transizione di opacità tra `opacity-100` e `opacity-20`.
- Esposto in preload il listener `onAutoHideTimeoutChange` in `src/preload/index.ts` e aggiornato anche il file compilato `src/preload/index.js` per assicurare la presenza del listener durante l'esecuzione.
- Aggiornato `src/main/ipc.ts` per salvare le impostazioni e (in prima implementazione) eseguire il broadcast `autohide:timeout-changed` a tutte le finestre; per debugging il broadcast è stato temporaneamente disabilitato in alcuni commit per isolare il crash.
- Creato uno stash descrittivo (`stash/stash_task33_20251202_autohide_timeout.md`) con i dettagli della task, lista dei file toccati e note di debug; aggiornato `agent_notes_7.md` con riferimento alla task e stato.
### Esito
- Tutte le modifiche sono state applicate e documentate nel repo; i tipi TypeScript e le tipizzazioni del preload sono stati aggiornati. Dopo alcune correzioni la compilazione TypeScript non segnala più errori.
- Durante il tentativo di esecuzione in dev: Vite parte correttamente ma il processo Electron esce con `code 1` (crash nel main process) prima che la verifica end-to-end della UI sia completata. Questo impedisce la conferma visiva definitiva del comportamento auto-hide.
- Azioni raccomandate: abilitare logging dettagliato nel main process, raccogliere stderr/stdout di Electron, verificare che il preload compilato caricato sia quello aggiornato e re-abilitare progressivamente il broadcast per isolare l'errore.

---

## 2025-12-02 — Decisione Metodo A: Analisi Task 33 e piano per sostituzione blur slider
### Descrizione
Analisi della Task 33 implementata: aggiunto autoHideTimeout a tipi e preload, logica Sidebar, ma in SettingsModalForm.tsx lasciato blur slider invece di sostituirlo con timeout slider. Strada proposta: rimuovere blur slider e sostituirlo con auto-hide timeout slider usando preset.
### File coinvolti
- `src/components/SettingsModalForm.tsx`
### Azioni eseguite
- Identificato che il blocco "Intensità Blur" è ancora presente e non sostituito.
- Ipotizzato sostituzione diretta del blocco blur con blocco auto-hide timeout.
### Esito
- Procedere con Task 34 per implementare la sostituzione.

---

## 2026-01-24 — Task 1 — Fix ordinamento Prezzo e Scadenza nella tabella Dati
### Descrizione
L'ordinamento multi-colonna funziona perfettamente per Cedola, ISIN, Nome (stringhe). Ma per Prezzo e Scadenza l'ordinamento rimane lessicografico invece di numerico/cronologico. La patch precedente crea correttamente le colonne temporanee con tipi float64 e datetime64, ma il dataframe mantiene gli **indici originali** dopo l'ordinamento, causando visualizzazione incoerente.

### Ipotesi
🔄 *Sostituisce la logica precedente del 2026-01-24 (ordinamento Prezzo/Scadenza)*

Il problema è che `df_work.sort_values()` riordina le RIGHE ma mantiene gli indici originali del dataframe (0, 1, 2, ..., 197). Quando visualizziamo `df = df_work[df.columns]`, gli indici rimangono "fuori ordine" rispetto ai valori mostrati. La soluzione: **resettare l'indice** dopo l'ordinamento con `.reset_index(drop=True)`.

### File coinvolti
- `btpscraping_v2.py` (righe 803-837): Blocco ordinamento multi-colonna, metodo sort_values()

### Azioni proposte (patch da applicare)
1. **Dopo `df_work.sort_values(...)`** (attualmente riga 833): Aggiungere **`df_work = df_work.reset_index(drop=True)`**
   - Questo resetta gli indici a 0, 1, 2, ... in ordine sequenziale coerente con l'ordinamento applicato.
   - `drop=True` scarta gli indici vecchi (non li vuoi come colonna).

2. **Verifica**: Il dataframe `df` finale avrà indici coerenti con l'ordine visuale: riga 0 = primo elemento ordinato, riga 1 = secondo, ecc.

3. **Test manuale**: 
   - Ordinare per Scadenza crescente → deve mostrare 2026-01-28, 2026-02-01, ..., 2056-15-05
   - Ordinare per Prezzo crescente → deve mostrare 55.98, 56.2, 58.5, ..., 116.8
   - Ordinamento decrescente inverso

4. **CSV export**: Il download CSV deve contenere le righe nell'ordine corretto (indici 0-196 con dati coerenti).

### Esito atteso
- Ordinamento Prezzo: ✅ numerico (0 < 55.98 < 56.2 < 116.8)
- Ordinamento Scadenza: ✅ cronologico (anno → mese → giorno)
- CSV download: ✅ righe nell'ordine corretto
- Nessuna regressione su Cedola, ISIN, Nome

---


**Sintesi**: Trasformato ordinamento multi-colonna in screener progressivo con pipeline funnel e cut-off percentuali sequenziali.

**Completato**: 2026-01-25


## [2026-02-02] — Task 35 — Sidebar e menu rapido: fix visualizzazione responsive su schermi piccoli
### Descrizione
La Sidebar laterale e il menu rapido minimizzato risultano parzialmente visibili o tagliati su schermi diversi dal PC desktop (laptop, tablet, mobile). L'obiettivo è garantire accessibilità e leggibilità completa su tutte le risoluzioni, con comportamento responsive e fallback mobile-friendly.

### Obiettivi
- Sidebar sempre completamente visibile e utilizzabile su schermi piccoli
- Menu rapido minimizzato sempre accessibile, senza porzioni tagliate
- Applicazione di media query e logica CSS/JS per adattare layout e dimensioni
- Fallback mobile-friendly (overlay, swipe, hamburger, ecc.)
- Test su diverse risoluzioni/device
- Nessuna regressione su desktop
- Documentazione delle modifiche e file coinvolti

### File coinvolti
- `src/components/layout/Sidebar.jsx`
- `src/components/layout/UserMenu.jsx`
- `src/App.css`

### Azioni proposte (passi sequenziali)
1. Analizzare struttura e logica di Sidebar.jsx e UserMenu.jsx per individuare limiti attuali su schermi piccoli.
2. Esaminare e aggiornare le media query in App.css per garantire che Sidebar e menu rapido si adattino correttamente a <900px, <760px, <600px.
3. Correggere overflow, min/max-width, z-index e posizionamento per evitare tagli o porzioni non visibili.
4. Implementare fallback mobile-friendly: overlay, hamburger menu o swipe per Sidebar su mobile/tablet.
5. Testare la visualizzazione e l'accessibilità su vari device e risoluzioni (desktop, laptop, tablet, mobile).
6. Verificare che UserMenu sia sempre accessibile e non venga minimizzato/tagliato eccessivamente.
7. Aggiornare la documentazione delle modifiche e annotare i file coinvolti.

### Esito atteso
- Sidebar e menu rapido sempre accessibili e leggibili su tutti i dispositivi, con layout responsive e fallback mobile-friendly.
- Nessuna regressione su desktop.