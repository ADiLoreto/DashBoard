# 📦 Workflow: Build e Deploy Automatico nel SitoHub

Questo documento descrive il workflow per mantenere sincronizzato il progetto **DashBoard** con il **SitoHub**.

---

## 🏗️ Configurazione Completata

### File Creati

- **`scripts/build-for-hub.js`** - Script di automazione che:
  1. Esegue `npm run build` per creare il bundle ottimizzato
  2. Copia il contenuto di `build/` in `SitoHub/public/wealth-dashboard/`
  3. Mostra un resoconto finale

### Modifiche al package.json

- **Aggiunto script**: `"build:hub": "node scripts/build-for-hub.js"`
- **Aggiunta dipendenza**: `"fs-extra": "^11.2.0"` (devDependency)

---

## ⚡ Workflow Quotidiano

### Scenario: Aggiornare il DashBoard

#### **Step 1: Sviluppare Localmente**

```bash
cd D:\progetti\DashBoard

# Avvia il dev server
npm start
```

Sviluppa normalmente con hot-reload su `http://localhost:3000`

---

#### **Step 2: Build e Deploy nel SitoHub**

Quando sei soddisfatto delle modifiche:

```bash
# Sempre in D:\progetti\DashBoard
npm run build:hub
```

### Output Atteso

```
🏗️  Building DashBoard...

> dashboard@1.0.0 build
> react-scripts build

Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  211.83 kB  build\static\js\main.XXXXXX.js
  1.63 kB    build\static\css\main.XXXXXX.css

📦 Copying build to SitoHub...
✅ Success! Copied to: D:\progetti\SitoHub\public\wealth-dashboard

📂 Build output structure:
   ├── index.html
   ├── static/css/
   └── static/js/

✨ DashBoard integration complete!
```

---

## 📂 Struttura dei File

```
DashBoard/
├── scripts/
│   ├── build-for-hub.js       ← Script di automazione
│   └── smoke/
├── src/
├── build/                      ← Output del build (usato come sorgente per copia)
├── package.json                ← Contiene script "build:hub"
└── ...

SitoHub/
└── public/
    └── wealth-dashboard/       ← Destinazione finale (aggiornata automaticamente)
        ├── index.html
        ├── static/css/
        └── static/js/
```

---

## 🔄 Ciclo Completo: Da Sviluppo a Deploy

```
1. Modifiche in DashBoard/src/
   ↓
2. npm start → Testa localmente
   ↓
3. npm run build:hub → Build + Copia automatica
   ↓
4. Verificare in SitoHub/public/wealth-dashboard/
   ↓
5. Deploy SitoHub (se necessario)
```

---

## 🛠️ Comandi Disponibili

| Comando | Descrizione |
|---------|------------|
| `npm start` | Dev server locale (hot-reload) |
| `npm run build` | Build singolo (senza copia) |
| `npm run build:hub` | Build + Copia in SitoHub ⭐ |
| `npm test` | Esegui test |
| `npm run eject` | Eject da create-react-app (irreversibile) |

---

## ✅ Checklist Pre-Deploy

Prima di eseguire `npm run build:hub`:

- [ ] Tutte le modifiche sono state testate localmente con `npm start`
- [ ] Non ci sono errori di console/build
- [ ] I componenti funzionano correttamente
- [ ] No console warnings importanti

---

## 📝 Note

- Lo script **non cancella** la cartella `SitoHub/public/wealth-dashboard/` prima di copiare, ma la **svuota completamente** per evitare file obsoleti.
- Il percorso `SitoHub` è relativo: `../../SitoHub` dal file `build-for-hub.js`
- Se modifichi il percorso del SitoHub, aggiorna `SITOHUB_PATH` in `scripts/build-for-hub.js`

---

## 🚀 Primo Test (Già Completato)

L'integrazione è stata testata e funziona correttamente:

```bash
npm run build:hub  # ✅ Eseguito con successo
# Output copiato in D:\progetti\SitoHub\public\wealth-dashboard/
```

---

**Pronto per lo sviluppo futuro!** 🎉
