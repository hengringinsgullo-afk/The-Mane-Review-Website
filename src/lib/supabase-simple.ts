import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabaseFixed } from './supabase-auth-fix';

// Use the same instance from supabase-auth-fix to maintain consistency
export const supabaseSimple = supabaseFixed;

export const authSimple = {
  async signIn(email: string, password: string) {
    console.log('[AUTH] Simple sign in for:', email);
    
    try {
      // Direct sign in without any preprocessing
      const { data, error } = await supabaseSimple.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      console.log('[AUTH] Sign in response:', {
        success: !!data?.user,
        error: error?.message,
        userId: data?.user?.id,
        email: data?.user?.email
      });
      
      return { data, error };
    } catch (err) {
      console.error('[AUTH] Sign in exception:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Sign in failed')
      };
    }
  },
  
  async signOut() {
    return supabaseSimple.auth.signOut();
  },
  
  async getSession() {
    const { data: { session } } = await supabaseSimple.auth.getSession();
    return session;
  },
  
  async getUser() {
    const { data: { user } } = await supabaseSimple.auth.getUser();
    return user;
  }
};