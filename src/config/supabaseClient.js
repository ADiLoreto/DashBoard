import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Variabili d\'ambiente Supabase mancanti!\n' +
    'Assicurati di aver creato il file .env nella root del progetto con:\n' +
    'REACT_APP_SUPABASE_URL=https://xxx.supabase.co\n' +
    'REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
