Collecting workspace information# 📋 ARCHITETTURA DASHBOARD FINANZIARIA — Standard Webapp

## 🎯 Overview Sintetico

**Tipo progetto**: Single-Page Application (SPA) — Dashboard Finanziaria personale  
**Stack principale**: React (frontend) + Context/Reducer + localStorage  
**DB**: Supabase (PostgreSQL) — pianificato, non ancora in produzione  
**Storage file**: Cloudflare R2 — pianificato  
**Workers**: Wrangler (Cloudflare) — pianificato per cashflow automation  
**Stato**: MVP con persistenza locale, architettura pronta per scale-up backend

---

## 🏗️ ARCHITETTURA TECNICA

### **Livello 1: Frontend (React)**

#### Stack
```
React 18 + JSX
├── Context API + useReducer (stato centralizzato)
├── Custom Hooks (calcoli, cashflow generation)
├── Recharts (grafici interattivi)
├── Zod (validazione dati)
└── CSS custom (variables, clamp scaling)
```

#### Struttura Cartelle
```
src/
├── components/
│   ├── layout/          (Sidebar, Dashboard, UserMenu)
│   ├── sections/        (Entrate, Asset, Liquidita, Uscite, Progetti)
│   ├── ui/              (BigTab, PopUp, Modal, Charts)
│   └── wizard/          (Multi-step forms per asset/cashflow)
├── context/
│   ├── FinanceContext.jsx     (stato + reducer, normalizzazione)
│   └── AuthContext.jsx        (user minimal)
├── hooks/
│   ├── useFinancialCalculations.js
│   └── useCashflowGeneration.js
├── utils/
│   ├── storage.js             (localStorage wrapper)
│   ├── supabaseStorage.js     (Supabase wrapper - standby)
│   ├── diff.js                (diff computation/expansion)
│   ├── format.js              (currency, dates)
│   ├── calculations.js        (ROI, payback, etc.)
│   └── assetHelpers.js        (asset utilities)
├── config/
│   ├── constants.js           (initialState, defaults)
│   ├── chartConfig.js         (Recharts config)
│   ├── supabaseClient.js      (Supabase client - standby)
│   └── assetSchemas.js        (Zod validations)
├── App.jsx                    (root + scaling logic)
├── App.css                    (variables, clamp, layout FISSO)
└── index.js                   (bootstrap)
```

#### Design Pattern — Layout FISSO con Scaling Proporzionale
- **Desktop width baseline**: 1280px
- **Scaling meccanismo**: 