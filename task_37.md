# Task 37 — Container Orizzontale Fisso per Elementi Non-Wrappabili

**Data**: 2025-02-03
**Status**: 🎯 Analisi
**Motivazione**: Risolvere il problema di wrap verticale dei Big Tab su viewport stretti

---

## Problema Identificato

### Situazione Attuale
Quando la viewport si rimpicciolisce (es. da 1920px a 375px), i Big Tab e altri elementi orizzontali si **riorganizzano in colonna** (wrap) invece di **ridimensionarsi proporzionalmente mantenendo la stessa riga**.

**Esempio di comportamento errato:**

```
Desktop 1920px (Corretto):
┌─────────────────────────────────────────────────────┐
│ [Big Tab 1] [Big Tab 2] [Big Tab 3] [Big Tab 4] [Big Tab 5]  │
└─────────────────────────────────────────────────────┘

Mobile 375px (ERRATO - va a colonna):
┌────────────────┐
│ [Big Tab 1]    │
│ [Big Tab 2]    │
│ [Big Tab 3]    │
│ [Big Tab 4]    │
│ [Big Tab 5]    │
└────────────────┘
```

### Root Cause
1. **Flex container con `flex-wrap: wrap`**: Quando lo spazio non basta, gli elementi vanno a capo
2. **Min-width/Max-width dei Big Tab in px**: Anche se convertiti in em, il container permette wrapping
3. **Nessun vincolo di larghezza al container**: Il container si adatta alla viewport senza "resistere"
4. **Task 36 aspect-ratio comprime ulteriormente**: Aggiungere `aspect-ratio: 16/9` limita lo spazio verticale

**Comportamento indesiderato:**
- Big Tab dovrebbe ridursi: 385px → 155px (ma rimanere sulla STESSA RIGA)
- Attualmente: 385px → diventa troppo piccolo → va a capo

---

## Soluzione Proposta: Container Wrapper Orizzontale Fisso

### Concetto di Base
Creare un **container wrapper** che:
- **Racchiude gli elementi orizzontali** (Big Tab, chart container, etc.)
- **Ha una larghezza FISSA o MIN-WIDTH** che impedisce flex-wrap
- **Forza gli elementi a rimanere in riga orizzontale**
- **Gli elementi si RIPROPORZIONANO ma NON si riorganizzano in colonna**

### Struttura Logica

```
┌─────────────────────────────────────────┐
│ MAIN CONTENT AREA (flex: 1)             │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐   │
│ │ HORIZONTAL WRAPPER CONTAINER      │   │
│ │ (min-width: 1200px, no-wrap)      │   │ ← Questo impedisce colonna
│ ├───────────────────────────────────┤   │
│ │ [Big Tab 1] [Big Tab 2] ... [5]   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ HORIZONTAL WRAPPER CONTAINER 2    │   │
│ │ (min-width: 1100px, no-wrap)      │   │
│ ├───────────────────────────────────┤   │
│ │ [Chart] [Donut Left] [Donut Right]│   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Proprietà CSS del Container

```
Classe: .horizontal-container (NON ESISTE ANCORA)

Proprietà chiave:
- display: flex
- flex-wrap: nowrap ← CRUCIALE: impedisce wrapping
- min-width: XXXpx (valore fisso o calcolato)
- width: 100% ← occupa lo spazio disponibile
- overflow-x: auto ← se troppo stretto, diventa scrollabile
- gap: 1.5em ← mantenere spaziatura tra elementi
```

### Comportamento su Diverse Viewport

**Desktop 1920px:**
```
Viewport: 1920px
Sidebar: 220px (fisso)
Main: 1700px
Horizontal Container: min-width 1200px, actual 1700px ✓
├─ Fits perfectly, no scroll needed
├─ Big Tabs: ridotti ma in RIGA
└─ NO wrapping, NO colonna
```

**Tablet 1024px:**
```
Viewport: 1024px
Sidebar: 156px (scalato)
Main: 868px
Horizontal Container: min-width 1200px, actual 868px ✗ PROBLEMA
├─ 868px < 1200px → container deve scrollare
├─ Big Tabs: mantengono riga, user può scrollare orizzontalmente
└─ NO wrapping, NO colonna (ma scroll orizzontale)
```

**Mobile 375px:**
```
Viewport: 375px
Sidebar: 64px (collassato)
Main: 311px
Horizontal Container: min-width 1200px, actual 311px ✗ PROBLEMA
├─ 311px << 1200px → container DEVE scrollare
├─ Big Tabs: rimangono in RIGA (dimezziamo visivamente)
└─ NO wrapping, scroll orizzontale per vedere tutti
```

---

## Confronto: Prima vs Dopo

### PRIMA (Attuale - ERRATO)

```
Elemento: <div style={{ display: 'flex', gap: 20, ... }}>
            {/* 5 Big Tabs */}
          </div>

Comportamento:
- No min-width constraint
- flex-wrap: wrap (o default)
- Mobile 375px:
  ├─ Spazio per solo 2 tab per riga
  └─ Rimanenti vanno a capo → COLONNA

Utente vede: 5 righe di tab (pessimo UX)
```

### DOPO (Proposto - CORRETTO)

```
Elemento: <div className="horizontal-container">
            {/* 5 Big Tabs inside */}
          </div>

CSS:
.horizontal-container {
  display: flex;
  flex-wrap: nowrap ← CRUCIALE
  min-width: 1200px ← Impedisce wrapping
  width: 100%;
  overflow-x: auto ← Scrollabile se necessario
  gap: 1.5em;
}

Comportamento:
- Desktop 1920px:
  ├─ 1700px > 1200px ✓
  ├─ Tabs in RIGA, dimensioni ridotte
  └─ NO scroll needed

- Mobile 375px:
  ├─ 311px < 1200px ✗
  ├─ Tabs rimangono in RIGA (tutti visibili se si scrollano)
  └─ Scroll orizzontale leggero, ma NO colonna

Utente vede: 1 riga scrollabile (migliore UX)
```

---

## Vantaggi della Soluzione

| Aspetto | Beneficio |
|---------|-----------|
| **No Wrapping** | Elementi rimangono sempre in riga orizzontale |
| **Proporzioni mantenute** | Elementi si ridimensionano via em/clamp(), stessa riga |
| **Fallback scroll** | Se troppo stretto, user può scrollare orizzontalmente |
| **Compatibile Task 35** | Scaling proporzionale continua a funzionare |
| **Semplice da implementare** | Solo CSS + uno o due div wrapper |
| **User-friendly** | No sorprese di layout, comportamento prevedibile |

---

## Possibili Implementazioni

### Opzione 1: Min-Width Fisso
```
.horizontal-container {
  min-width: 1200px;  /* Fixed value */
  flex-wrap: nowrap;
  overflow-x: auto;
}

Pro: Semplice, prevedibile
Con: Potrebbe scrollare anche su tablet
```

### Opzione 2: Min-Width Calcolato via CSS
```
.horizontal-container {
  min-width: calc(5 * 13.75em + 4 * 1.5em);  /* 5 tabs + gaps */
  flex-wrap: nowrap;
  overflow-x: auto;
}

Calcolo:
- Larghezza Big Tab: 13.75em (220px / 16)
- Gap tra tab: 1.5em (24px / 16)
- 5 tab: 13.75 * 5 = 68.75em
- 4 gap: 1.5 * 4 = 6em
- Totale: 74.75em ≈ 1196px

Pro: Dinamico, scalabile
Con: Matematica complessa
```

### Opzione 3: Min-Width Percentuale + Media Query
```
.horizontal-container {
  min-width: 100%;  /* Default: riempie viewport */
  flex-wrap: nowrap;
  overflow-x: auto;
}

@media (max-width: 1024px) {
  .horizontal-container {
    min-width: 1200px;  /* Force scroll su tablet/mobile */
  }
}

Pro: Responsive, ottimizzato per ogni device
Con: Media query aggiuntivo
```

---

## Impatto su Task 35 e Task 36

### Task 35 (Layout FISSO con scaling)
✅ **Compatibile**: Il container wrapper usa em/clamp() come Task 35
- Big Tab rimane: `minWidth: '13.75em'`, `maxWidth: '22.5em'`
- Container min-width: `1200px` o calcolato da em
- Scaling continua a funzionare via font-size clamp()

### Task 36 (Aspect-ratio 16:9)
⚠️ **Da riconsiderare**: L'aspect-ratio su `<main>` comprime lo spazio verticale
- Se teniamo aspect-ratio: limita ulteriormente l'altezza
- Se lo togliamo: Task 36 perde il vincolo 16:9
- **Soluzione**: Mettere aspect-ratio solo su **wrapper interno**, non su main

```
<main style={{ flex: 1 }}>
  <div style={{ aspectRatio: '16/9', overflow: 'auto' }}>
    {/* Horizontal containers inside */}
  </div>
</main>
```

---

## Prossimi Passi

### Fase 1: Decisione
- [ ] Accettare questa soluzione (horizontal container wrapper)?
- [ ] Scegliere tra Opzione 1, 2, o 3 (min-width)?

### Fase 2: Implementation
- [ ] Creare classe `.horizontal-container` in App.css
- [ ] Wrappare Big Tab section in Dashboard.jsx
- [ ] Wrappare altre sezioni orizzontali (donut row, etc.)
- [ ] Testare su mobile/tablet/desktop

### Fase 3: Cleanup
- [ ] Rivedere Task 36 aspect-ratio (togliere o spostare)
- [ ] Verificare no conflicts con Task 35 scaling
- [ ] Documentare decisione finale

---

## Conclusione

**Questa soluzione risolve il vero problema:**
- ✅ Elementi rimangono in RIGA orizzontale
- ✅ Si riproporzionano proporzionalmente (em + clamp)
- ✅ No wrapping a colonna su mobile
- ✅ Fallback scroll orizzontale se necessario
- ✅ Compatibile con Task 35 scaling
- ⚠️ Richiede revisione Task 36 aspect-ratio

**Differenza chiave:**
- Task 35 = scaling proporzionale di TUTTI gli elementi
- Task 37 = impedire wrap verticale dei container orizzontali
- Insieme = layout fisso, proporzionale, senza riorganizzazione

---

**Status**: ✅ Analisi completa
**Pronto per**: Decisione su implementazione
**Difficoltà**: Bassa (solo CSS + HTML wrapper)
**Impatto**: Alto (risolve problema principale)

