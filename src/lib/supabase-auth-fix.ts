import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// CRITICAL: Debug everything about the authentication process
const DEBUG = true;

const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[SUPABASE AUTH]', new Date().toISOString(), ...args);
  }
};

const error = (...args: any[]) => {
  console.error('[SUPABASE AUTH ERROR]', new Date().toISOString(), ...args);
};

// Configuration with all possible options
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

log('Configuration:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  projectId
});

// Create client with explicit configuration
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    log('Creating new Supabase client with enhanced configuration...');
    
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Changed to false to avoid URL detection issues
        storage: {
          getItem: (key: string) => {
            const value = window.localStorage.getItem(key);
            log(`Storage GET [${key}]:`, value ? 'Has value' : 'Empty');
            return value;
          },
          setItem: (key: string, value: string) => {
            log(`Storage SET [${key}]:`, value ? 'Setting value' : 'Empty');
            window.localStorage.setItem(key, value);
          },
          removeItem: (key: string) => {
            log(`Storage REMOVE [${key}]`);
            window.localStorage.removeItem(key);
          }
        },
        storageKey: 'mane-review-auth-v2', // Changed key to avoid conflicts
        flowType: 'pkce',
        debug: DEBUG
      },
      global: {
        headers: {
          'X-Client-Info': 'mane-review-web/1.0.1',
          'X-Application': 'the-mane-review'
        },
        fetch: async (url: any, options: any = {}) => {
          log('Fetch request:', {
            url: typeof url === 'string' ? url : url.toString(),
            method: options.method || 'GET',
            hasBody: !!options.body
          });
          
          const startTime = Date.now();
          
          try {
            const response = await fetch(url, options);
            const duration = Date.now() - startTime;
            
            log('Fetch response:', {
              url: typeof url === 'string' ? url : url.toString(),
              status: response.status,
              ok: response.ok,
              duration: `${duration}ms`
            });
            
            return response;
          } catch (err) {
            const duration = Date.now() - startTime;
            error('Fetch failed:', {
              url: typeof url === 'string' ? url : url.toString(),
              error: err,
              duration: `${duration}ms`
            });
            throw err;
          }
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    
    // Add auth state change listener
    clientInstance.auth.onAuthStateChange((event, session) => {
      log('Auth state changed:', {
        event,
        hasSession: !!session,
        user: session?.user?.email
      });
    });
    
    log('Supabase client created successfully');
  } else {
    log('Reusing existing Supabase client');
  }
  
  return clientInstance;
}

// Enhanced auth helpers with full debugging
export const authHelpers = {
  async signUp(email: string, password: string, metadata?: { name?: string; role?: string }) {
    const client = getSupabaseClient();
    
    try {
      log('Sign up attempt for:', email);
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        error('Sign up error:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      error('Sign up exception:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Sign up failed')
      };
    }
  },
  
  async signOut() {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();
    return { error };
  },

  async getSession() {
    const client = getSupabaseClient();
    const { data: { session } } = await client.auth.getSession();
    return session;
  },

  async getUser() {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    return user;
  },
  async signIn(email: string, password: string) {
    log('=== SIGN IN STARTED ===');
    log('Email:', email);
    log('Password length:', password.length);
    
    const client = getSupabaseClient();
    
    try {
      // First, check if we can reach the auth endpoint
      log('Checking auth endpoint availability...');
      const healthCheck = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        error('Health check failed:', err);
        return null;
      });
      
      if (healthCheck) {
        log('Health check response:', healthCheck.status);
      }
      
      // Skip clearing session - it's causing the hang
      // Just proceed with the login directly
      log('Proceeding with login...');
      
      // Attempt sign in with detailed logging
      log('Attempting signInWithPassword...');
      const signInPromise = client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      // Set up a shorter timeout detector
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          error('Sign in timeout after 10 seconds');
          reject(new Error('Authentication timeout. The server is not responding.'));
        }, 10000); // Reduced to 10 seconds
      });
      
      // Race between sign in and timeout
      log('Waiting for authentication response...');
      const result = await Promise.race([
        signInPromise.then(res => {
          clearTimeout(timeoutId!);
          return res;
        }),
        timeoutPromise
      ]) as { data: any; error: any };
      
      log('Sign in completed:', {
        hasData: !!result?.data,
        hasError: !!result?.error,
        errorMessage: result?.error?.message,
        userEmail: result?.data?.user?.email,
        hasSession: !!result?.data?.session
      });
      
      if (result.error) {
        error('Sign in error details:', {
          message: result.error.message,
          status: result.error.status,
          code: result.error.code,
          name: result.error.name,
          __isAuthError: result.error.__isAuthError
        });
        return { data: null, error: result.error };
      }
      
      if (!result.data || !result.data.user) {
        error('Sign in succeeded but no user data returned');
        return {
          data: null,
          error: new Error('Authentication succeeded but no user data was returned')
        };
      }
      
      log('=== SIGN IN SUCCESS ===');
      log('User:', result.data.user.email);
      log('Session:', result.data.session?.access_token ? 'Valid' : 'Invalid');
      
      return { data: result.data, error: null };
      
    } catch (err: any) {
      error('Sign in exception:', err);
      error('Stack trace:', err.stack);
      
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown authentication error')
      };
    }
  },
  
  async testDirectAPI(email: string, password: string) {
    log('=== TESTING DIRECT API ===');
    
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });
      
      log('Direct API response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      const data = await response.json();
      log('Direct API data:', data);
      
      return { success: response.ok, data };
    } catch (err) {
      error('Direct API error:', err);
      return { success: false, error: err };
    }
  }
};

export const supabaseFixed = getSupabaseClient();