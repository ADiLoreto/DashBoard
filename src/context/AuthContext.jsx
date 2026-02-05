import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Hook per compatibilità con vecchio codice che usa useContext(AuthContext)
export const useAuthContext = () => useAuth();

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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
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
      
      return { ok: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { ok: false, error: error.message };
    }
  };

  // Login
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { ok: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { ok: false, error: error.message };
    }
  };

  // Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { ok: false, error: error.message };
    }
  };

  // Recupera profilo completo
  const getUserProfile = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
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

export default AuthProvider;
