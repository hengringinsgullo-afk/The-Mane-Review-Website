// Simple utility to get current user and profile
import { supabase } from './supabase';

export async function getCurrentUserWithProfile() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('No session found');
      return { user: null, profile: null };
    }
    
    console.log('Session found for:', session.user.email);
    
    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching profile:', error);
    }
    
    // If no profile in DB, create a temporary one
    const userProfile = profile || {
      id: session.user.id,
      email: session.user.email,
      name: session.user.email.split('@')[0],
      role: 'Student',
      auth_id: session.user.id
    };
    
    console.log('Returning profile:', userProfile);
    
    return {
      user: session.user,
      profile: userProfile
    };
  } catch (error) {
    console.error('Error in getCurrentUserWithProfile:', error);
    return { user: null, profile: null };
  }
}