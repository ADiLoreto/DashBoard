---

# Task 35 — Sidebar e menu rapido: layout FISSO con scaling proporzionale — 🔄 REDEFINING

## Nuova interpretazione
Layout FISSO con scaling uniforme, NON responsive design. Sidebar sempre visibile (220px esteso, 64px collassato), contenuto principale 16:9. Quando viewport si rimpicciolisce SOTTO 1415px, tutto scala proporzionealmente mantenendo posizioni fisse. Tab e elementi NON cambiano posizione.

---

## Stato precedente — ANNULLATO (Archivio)

### ❌ Cosa NON fare (vedi stash_task35_20260202.md)
- ❌ Hamburger menu responsive
- ❌ Overlay mobile con click-through
- ❌ Media query che adattano layout (768px, 480px)
- ❌ Elementi che cambiano posizione al ridimensionamento
- ❌ Reflow dinamico di tab e contenuti

### ✅ Cosa FARE
- ✅ Layout FISSO con spazi definiti
- ✅ Sidebar sempre visibile (220px esteso OR 64px collassato)
- ✅ Main content area in rapporto 16:9
- ✅ Scaling uniforme di TUTTI gli elementi quando viewport < 1415px
- ✅ Nessun cambio di posizione, solo ridimensionamento proporzionale
- ✅ Tab rimangono nella stessa posizione, si ridimensionano

---

# Task 35 — Sottotask Metodo A+

## Scomposizione operativa (Metodo A+)

### Task 35.1 — Analisi struttura layout FISSO
- Analizzare struttura HTML/CSS: body, aside.sidebar, main, topbar, nav. Identificare il layout grid/flex e come sidebar occupa spazio.
- File coinvolti: src/components/layout/Sidebar.jsx, src/App.css, src/components/layout/Dashboard.jsx
- Output atteso: Schema del layout FISSO, spazi definiti (sidebar 220px esteso, 64px collassato, content width, height 16:9).

### Task 35.2 — Implementare scaling proporzionale viewport
- Aggiungere regola CSS su body/html per scalare tutto quando viewport < 1415px. Usare transform: scale() o zoom oppure dinamico via JS (calc scale factor).
- File coinvolti: src/App.css, eventualmente src/App.jsx
- Output atteso: Tutti gli elementi si ridimensionano uniformemente, nessun reflow, posizioni fisse.

### Task 35.3 — Forzare layout FISSO senza reflow
- Assicurare che tab, kpi-card, donut-row, chart NON cambino posizione al ridimensionamento. Rimuovere media query che usano flex-wrap, gap dinamico, min-width.
- File coinvolti: src/App.css
- Output atteso: Layout fisso, no reflow, tutto scala proporzionalmente.

### Task 35.4 — Sidebar sempre visibile con spazio definito
- Sidebar width: 220px (esteso) oppure 64px (collassato), mai hidden. Main content area: width: calc(100% - sidebar_width). Content area: aspect-ratio 16/9 o con scaling.
- File coinvolti: src/App.css, src/components/layout/Sidebar.jsx
- Output atteso: Sidebar occupa spazio definito sempre, content area ridimensionato proporzionalmente.

### Task 35.5 — UserMenu e elementi nested: scaling coerente
- Verificare che UserMenu, kpi-value, font-size, padding scalino uniformemente. No breakpoint che cambiano font-size o padding dinamicamente.
- File coinvolti: src/App.css, src/components/layout/UserMenu.jsx
- Output atteso: Tutti gli elementi mantengono proporzioni, no salti di dimensione.

### Task 35.6 — Test scaling manuale su viewport
- Testare manualmente ridimensionando browser: 1920px -> 1415px -> 1024px -> 768px. Verificare che posizioni rimangono fisse e solo dimensioni cambiano.
- File coinvolti: Tutti quelli modificati
- Output atteso: Scaling fluido e coerente, nessun reflow, tab e elementi rimangono allineati.

### Task 35.7 — Aggiornamento documentazione e stash
- Documentare la strategia di scaling fisso (no media query responsive). Aggiornare stash e agent_notes.
- File coinvolti: agent_notes.md, task_35_sidebar_responsive.md, stash
- Output atteso: Documentazione chiara su layout FISSO vs responsive design.

---

# Task 36 — Mantenimento proporzioni 16:9 e UX rotazione schermo

## Descrizione
La schermata della dashboard deve mantenere il rapporto 16:9 su tutte le risoluzioni, anche su dispositivi mobili. Se visualizzata su uno schermo troppo stretto (es. telefono in verticale), l’utente deve essere invogliato a ruotare il dispositivo per una migliore esperienza.

## Obiettivi
- Mantenere proporzioni 16:9 per l’area principale della dashboard su tutte le risoluzioni
- Se lo schermo è troppo stretto, mostrare un overlay/avviso che invita a ruotare il dispositivo
- Garantire che la UI non si deforma eccessivamente su mobile
- Testare su dispositivi reali e simulati

## File coinvolti
- src/App.css
- src/components/layout/Sidebar.jsx
- src/components/layout/UserMenu.jsx
- Eventuali nuovi componenti Overlay/Avviso

## Azioni proposte (passi sequenziali)
1. Analizzare e aggiornare i CSS per forzare il rapporto 16:9 sull’area principale (main/dashboard)
2. Implementare una logica che rileva quando il rapporto schermo è troppo lontano da 16:9 (es. portrait mobile)
3. Mostrare un overlay/avviso che invita a ruotare il dispositivo se necessario
4. Garantire che la UI rimanga leggibile e non deformata anche in casi limite
5. Testare la soluzione su device reali e simulatori
6. Aggiornare la documentazione delle modifiche

## Esito atteso
- Dashboard sempre in proporzione 16:9, overlay/avviso su portrait mobile, UX coerente e responsiva.

---

# Task 36 — Sottotask Metodo A+

## Scomposizione operativa (Metodo A+)

### Task 36.1 — Analisi e strategia CSS 16:9
- Analizzare i CSS attuali e individuare la strategia migliore per forzare il rapporto 16:9 sull’area principale della dashboard.
- File coinvolti: src/App.css, src/components/layout/Sidebar.jsx
- Output atteso: strategia CSS chiara e punti di intervento annotati.

### Task 36.2 — Implementazione CSS rapporto 16:9
- Aggiornare/aggiungere regole CSS per forzare il rapporto 16:9 sull'area principale (main/dashboard). Usare aspect-ratio: 16/9 con fallback padding-top: 56.25% per browser senza supporto.
- File coinvolti: src/App.css
- Output atteso: area dashboard che mantiene proporzione 16:9, compatibile con tutti i browser.

### Task 36.3 — Rilevamento rapporto schermo e trigger overlay
- Implementare logica JS/React che rileva quando il rapporto schermo è troppo lontano da 16:9 (es. portrait mobile) e attiva un overlay/avviso. Usare debounce (200ms) su resize/orientationchange per evitare flicker.
- File coinvolti: src/App.jsx, eventuale nuovo componente OverlayRotate.jsx
- Output atteso: overlay/avviso visibile solo quando necessario, senza flicker.

### Task 36.4 — Overlay/avviso rotazione schermo
- Creare un componente Overlay/Avviso che invita l'utente a ruotare il dispositivo. Deve essere accessibile: focus trap, aria-label, ruolo dialog, pulsante "Continua comunque" per bypassare.
- File coinvolti: src/components/ui/OverlayRotate.jsx, src/App.css
- Output atteso: overlay/avviso chiaro, accessibile, responsive, con opzione di bypass.

### Task 36.5 — Test e verifica su device
- Testare la soluzione su dispositivi reali e simulatori, verificando proporzioni, overlay e UX.
- File coinvolti: tutti quelli modificati
- Output atteso: verifica visiva e funzionale su tutti i dispositivi target.

### Task 36.6 — Aggiornamento documentazione
- Aggiornare la documentazione delle modifiche e annotare i file coinvolti.
- File coinvolti: agent_notes.md, task_35_sidebar_responsive.md
- Output atteso: documentazione aggiornata e coerente.