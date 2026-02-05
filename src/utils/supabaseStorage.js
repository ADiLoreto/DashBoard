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
