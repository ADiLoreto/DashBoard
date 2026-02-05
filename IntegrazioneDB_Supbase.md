# 🎯 Piano di Integrazione Supabase per Dashboard Finanziaria

Ottima scelta! Supabase è **perfetto** per il tuo caso d'uso perché offre:
- ✅ Database PostgreSQL (relazionale, affidabile per dati finanziari)
- ✅ Auth integrata (già pronta per login/password)
- ✅ Real-time subscriptions (utile per notifiche future)
- ✅ Row Level Security (RLS) - **cruciale per dati finanziari**
- ✅ Edge Functions (per logica server-side tipo cashflow automation)
- ✅ Storage (per eventuali documenti/allegati)

---

## 📋 **FASE 1: Setup Iniziale Supabase**

> **ℹ️ Nota sulla gestione dipendenze**: Questo è un progetto React con `package.json`.
> - ✅ `npm install` installa automaticamente le dipendenze in `package.json`
> - ✅ No `requirements.txt` (quello è per Python)
> - ✅ Tutte le dipendenze Node sono già gestite da npm

### **1.1 Crea progetto Supabase**
```bash
# 1. Vai su https://supabase.com
# 2. Crea nuovo progetto
# 3. Vai su Settings > API
# 4. Salva le credenziali:
#    - Project URL: https://lajwhbwfpeoeetpsgyvl.supabase.co
#    - API Key (anon/public): [sb_publishable_oCypHDVE-BZ9H6lCjuHTRQ_U9QcL73-]
#    - Service Role Key: NON necessaria per ora (solo per admin operations)
```

### **1.2 Installa SDK** ✅ COMPLETATO
```bash
npm install @supabase/supabase-js
```
✅ **SDK già installato** - Controllare in `package.json`: `"@supabase/supabase-js"` presente in dependencies

### **1.3 Configura client Supabase**
Crea `src/config/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

Crea `.env` nella root del progetto (e aggiungi a `.gitignore`):
```env
# Supabase Config
REACT_APP_SUPABASE_URL=https://lajwhbwfpeoeetpsgyvl.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...  # <- Incolla qui la "API Key (anon/public)"
```

**IMPORTANTE**: La "API Key (anon/public)" che vedi in Supabase è la stessa dell'"anon key". È sicura da usare nel frontend perché le Row Level Security policies proteggono i dati.

---

## 🗄️ **FASE 2: Schema Database** ✅ COMPLETATO

### **2.1 Struttura Tabelle PostgreSQL**

**⚠️ IMPORTANTE: Eseguire in 2 step separati (NON tutto insieme)**

#### **STEP 1: Crea la funzione trigger** ✅
Vai su Supabase > SQL Editor (sinistra) > Crea nuova query
Copia SOLO questo codice e clicca "Run":

```sql
-- ============ STEP 1: ESEGUIRE PER PRIMO ============
-- Crea la funzione trigger (usata da più tabelle)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- ✅ Aspetta "Success. No rows returned"
```

#### **STEP 2: Crea tabelle e policies** ✅
Dopo che lo STEP 1 ha avuto successo, crea una NUOVA query e copia questo:

```sql
-- ============ STEP 2: ESEGUIRE DOPO STEP 1 ============

-- ============================================
-- TABELLA UTENTI (estende auth.users)
-- ============================================
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'EUR',
  locale TEXT DEFAULT 'it-IT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TABELLA STATO FINANZIARIO PRINCIPALE
-- ============================================
CREATE TABLE public.finance_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  state_data JSONB NOT NULL,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_finance_states_user_current 
ON finance_states(user_id, is_current);

CREATE TRIGGER finance_states_updated_at
BEFORE UPDATE ON finance_states
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TABELLA STORICO SNAPSHOT
-- ============================================
CREATE TABLE public.finance_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  state_data JSONB NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_snapshots_user_date 
ON finance_snapshots(user_id, snapshot_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies: ogni utente vede solo i propri dati
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own finance states"
  ON finance_states FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own snapshots"
  ON finance_snapshots FOR ALL
  USING (auth.uid() = user_id);

-- ✅ Aspetta "Success. No rows returned"
```

#### **STEP 3: Ricrea le Policies** ✅
Se ricevi un errore `new row violates row-level security policy`, esegui questa NUOVA query:

```sql
-- ============ STEP 3: RICREA LE POLICIES SE NECESSARIO ============

-- Rimuovi le policies vecchie
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own finance states" ON finance_states;
DROP POLICY IF EXISTS "Users can view own snapshots" ON finance_snapshots;

-- Ricrea le policies CORRETTE
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own finance states"
  ON finance_states FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own snapshots"
  ON finance_snapshots FOR ALL
  USING (auth.uid() = user_id);

-- ✅ Aspetta "Success. No rows returned"
```

**✅ DATABASE CREATO CON SUCCESSO!**

---

## ⚠️ Errore: "Email rate limit exceeded"

**Cosa significa?** Supabase permette un numero limitato di tentativi di registrazione con la stessa email nel free tier. Se hai provato a registrare la stessa email tante volte, viene bloccato temporaneamente.

**Soluzione:**
- ✅ Aspetta **5-10 minuti**
- ✅ Poi riprova la registrazione con un'**email DIVERSA** (es: `test2@example.com`)
- ✅ Usa una **password lunga** (almeno 8 caratteri con lettere, numeri, simboli)

**Nota:** Non è un vero problema - è solo protezione anti-spam di Supabase.

---

## 🔐 **FASE 3: Migrazione Auth** ✅ COMPLETATO

### **3.1 Nuovo AuthContext con Supabase**

Modifica `src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recupera sessione esistente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listener per cambio auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Registrazione
  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username } // metadata utente
      }
    });
    
    if (error) throw error;
    
    // Crea profilo utente
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          username,
          email,
          full_name: username
        });
      
      if (profileError) throw profileError;
    }
    
    return data;
  };

  // Login
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Recupera profilo completo
  const getUserProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### **3.2 Aggiorna Login.jsx**

```javascript
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await signUp(email, password, username);
        alert('Registrazione completata! Controlla la tua email per confermare.');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {isSignUp && (
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button type="submit">
        {isSignUp ? 'Registrati' : 'Accedi'}
      </button>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
      </button>
    </form>
  );
};
```

---

## 💾 **FASE 4: Migrazione Storage**

### **4.1 Nuovo storage.js con Supabase**

Crea `src/utils/supabaseStorage.js`:

```javascript
import { supabase } from '../config/supabaseClient';

// ============================================
// STATO PRINCIPALE
// ============================================

export const saveState = async (state, userId) => {
  if (!userId) throw new Error('User ID required');
  
  try {
    // Disattiva stati precedenti
    await supabase
      .from('finance_states')
      .update({ is_current: false })
      .eq('user_id', userId)
      .eq('is_current', true);
    
    // Salva nuovo stato
    const { data, error } = await supabase
      .from('finance_states')
      .insert({
        user_id: userId,
        state_data: state,
        is_current: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving state:', error);
    throw error;
  }
};

export const loadState = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('finance_states')
      .select('state_data')
      .eq('user_id', userId)
      .eq('is_current', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignora "not found"
    return data?.state_data || null;
  } catch (error) {
    console.error('Error loading state:', error);
    return null;
  }
};

// ============================================
// SNAPSHOT STORICO
// ============================================

export const saveSnapshot = async (snapshot, userId) => {
  if (!userId) throw new Error('User ID required');
  
  try {
    const { data, error } = await supabase
      .from('finance_snapshots')
      .upsert({
        user_id: userId,
        snapshot_date: snapshot.date,
        state_data: snapshot.state,
        note: snapshot.note || null
      }, {
        onConflict: 'user_id,snapshot_date'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving snapshot:', error);
    throw error;
  }
};

export const loadHistory = async (userId) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('finance_snapshots')
      .select('snapshot_date, state_data, note')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(snap => ({
      date: snap.snapshot_date,
      state: snap.state_data,
      note: snap.note
    }));
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

export const clearHistory = async (userId) => {
  if (!userId) throw new Error('User ID required');
  
  try {
    const { error } = await supabase
      .from('finance_snapshots')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

// ============================================
// DRAFT (mantenere localStorage per performance)
// ============================================

export const saveDraft = (draft, userId) => {
  try {
    localStorage.setItem(`financeDraft_${userId}`, JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

export const loadDraft = (userId) => {
  try {
    const draft = localStorage.getItem(`financeDraft_${userId}`);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const clearDraft = (userId) => {
  try {
    localStorage.removeItem(`financeDraft_${userId}`);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};
```

### **4.2 Aggiorna FinanceContext.jsx**

```javascript
import { saveState, loadState, saveSnapshot, loadHistory, saveDraft, loadDraft } from '../utils/supabaseStorage';
import { useAuth } from './AuthContext';

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(financeReducer, getInitialState());
  const [loading, setLoading] = useState(true);

  // Carica stato al mount
  useEffect(() => {
    const loadUserState = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const savedState = await loadState(user.id);
        if (savedState) {
          dispatch({ type: 'LOAD_STATE', payload: savedState });
        }
      } catch (error) {
        console.error('Error loading user state:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserState();
  }, [user]);

  // Auto-save a DB (debounced)
  useEffect(() => {
    if (!user || loading) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        await saveState(normalizeState(state), user.id);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000); // 2 secondi invece di 1 per ridurre chiamate
    
    return () => clearTimeout(timeoutId);
  }, [state, user, loading]);

  // Draft locale (immediato)
  useEffect(() => {
    if (!user) return;
    saveDraft(normalizeState(state), user.id);
  }, [state, user]);

  // ... resto del provider
};
```

---

## 🚀 **FASE 5: Migration Plan Step-by-Step**

### **Opzione A: Migrazione Graduale (CONSIGLIATA)**

```javascript
// src/utils/hybridStorage.js
import * as localStor from './storage';
import * as supabaseStor from './supabaseStorage';

const USE_SUPABASE = process.env.REACT_APP_USE_SUPABASE === 'true';

export const saveState = async (state, userId) => {
  if (USE_SUPABASE) {
    return await supabaseStor.saveState(state, userId);
  } else {
    return localStor.saveState(state, userId);
  }
};

// ... wrap altre funzioni
```

Poi nel `.env`:
```env
REACT_APP_USE_SUPABASE=false  # false per test locale, true per prod
```

### **Opzione B: Migrazione Dati Esistenti**

Crea script `scripts/migrate-to-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service role key!
);

async function migrateLocalStorageData() {
  // 1. Leggi dati localStorage (da export manuale o browser console)
  const users = JSON.parse(fs.readFileSync('./backup/users.json'));
  
  for (const user of users) {
    // 2. Crea utente in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.temporaryPassword,
      email_confirm: true
    });
    
    if (authError) {
      console.error(`Failed to create user ${user.username}:`, authError);
      continue;
    }
    
    // 3. Crea profilo
    await supabase.from('user_profiles').insert({
      id: authUser.user.id,
      username: user.username,
      email: user.email
    });
    
    // 4. Migra stato finanziario
    const oldState = JSON.parse(fs.readFileSync(`./backup/${user.username}_state.json`));
    await supabase.from('finance_states').insert({
      user_id: authUser.user.id,
      state_data: oldState,
      is_current: true
    });
    
    // 5. Migra storico
    const oldHistory = JSON.parse(fs.readFileSync(`./backup/${user.username}_history.json`));
    for (const snapshot of oldHistory) {
      await supabase.from('finance_snapshots').insert({
        user_id: authUser.user.id,
        snapshot_date: snapshot.date,
        state_data: snapshot.state
      });
    }
    
    console.log(`✅ Migrated user: ${user.username}`);
  }
}

migrateLocalStorageData();
```

---

## 🔔 **FASE 6: Funzionalità Future con Supabase**

### **6.1 Notifiche Email (Supabase Edge Functions)**

Crea `supabase/functions/send-cashflow-reminder/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Trova cashflow in scadenza domani
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const { data: dueCashflows } = await supabase
    .from('asset_cashflows')
    .select(`
      *,
      assets(title),
      user_profiles(email)
    `)
    .eq('next_due_date', tomorrow.toISOString().split('T')[0])
    .eq('auto_generate', true);

  // Invia email per ogni utente
  for (const cf of dueCashflows) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@tuodashboard.com',
        to: cf.user_profiles.email,
        subject: `Promemoria: ${cf.title} in scadenza domani`,
        html: `<p>Ciao! Domani è prevista una ${cf.cashflow_type === 'income' ? 'entrata' : 'uscita'} di <strong>${cf.amount}€</strong> per: ${cf.assets.title}</p>`
      })
    });
  }

  return new Response('OK', { status: 200 });
});
```

Poi configura Supabase Cron:
```sql
SELECT cron.schedule(
  'cashflow-reminder-daily',
  '0 9 * * *', -- Ogni giorno alle 9:00
  $$ SELECT net.http_post(
      url:='https://xxxxx.supabase.co/functions/v1/send-cashflow-reminder',
      headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) $$
);
```

### **6.2 Real-time Updates (Multi-device Sync)**

```javascript
// In FinanceContext.jsx
useEffect(() => {
  if (!user) return;

  const channel = supabase
    .channel('finance-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'finance_states',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        if (payload.new.is_current) {
          dispatch({ type: 'LOAD_STATE', payload: payload.new.state_data });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);
```

---

## 📊 **Checklist Implementazione**

### **Settimana 1: Setup Base**
- [ ] Crea progetto Supabase
- [ ] Configura variabili ambiente
- [ ] Esegui SQL schema
- [ ] Testa RLS policies
- [ ] Installa SDK

### **Settimana 2: Auth Migration**
- [ ] Implementa nuovo AuthContext
- [ ] Aggiorna Login.jsx
- [ ] Testa registrazione/login
- [ ] Migra utenti esistenti (se necessario)

### **Settimana 3: Storage Migration**
- [ ] Implementa supabaseStorage.js
- [ ] Aggiorna FinanceContext
- [ ] Test save/load stato
- [ ] Test snapshot storici
- [ ] Backup dati localStorage

### **Settimana 4: Testing & Rollout**
- [ ] Test completo flusso utente
- [ ] Test multi-device
- [ ] Performance check (query slow)
- [ ] Deploy production
- [ ] Comunicazione utenti

### **Future (Post-Launch)**
- [ ] Edge Functions per cashflow automation
- [ ] Email notifications
- [ ] Real-time sync
- [ ] Storage documenti/PDF
- [ ] Analytics dashboard

---

## ⚠️ **Considerazioni Importanti**

1. **Costo Supabase**: Free tier = 500MB storage + 2GB transfer. Per uso personale/pochi utenti va benissimo.

2. **Backup**: Abilita Point-in-Time Recovery (PITR) in Supabase per sicurezza extra.

3. **Performance**: Indicizza bene le tabelle (già fatto nello schema). Per query complesse usa Materialized Views.

4. **Privacy GDPR**: Con RLS sei già compliant, ma aggiungi privacy policy che spiega dove salvi i dati.

5. **Rollback Plan**: Mantieni localStorage come fallback per prime settimane.

--
