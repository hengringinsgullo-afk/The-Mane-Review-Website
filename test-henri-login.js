import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dlpfkrqvptlgtampkqvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGZrcnF2cHRsZ3RhbXBrcXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzM3MzUsImV4cCI6MjA3MzcwOTczNX0.IuZBEKMBV1lXinuxB31zmNjGa79fsCk5ujFU4VIUfoo';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

async function testHenriLogin() {
  console.log('🔐 Testing login with henriquegullo account...\n');
  
  const email = 'henriquegullo@themanereview.com';
  const password = 'H3nr1qu3';
  
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    const duration = Date.now() - startTime;
    console.log(`\nDuration: ${duration}ms`);
    
    if (error) {
      console.error('❌ Login failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
    } else {
      console.log('✅ Login successful!');
      console.log('User:', data.user?.email);
      console.log('User ID:', data.user?.id);
      console.log('Role:', data.user?.user_metadata?.role);
      console.log('Session:', data.session ? 'Valid' : 'Invalid');
      console.log('Access token:', data.session?.access_token ? 'Present' : 'Missing');
      
      // Test if we can make an authenticated request
      console.log('\n📊 Testing authenticated request...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (userError) {
        console.error('❌ Failed to fetch user data:', userError);
      } else {
        console.log('✅ User data fetched successfully:', userData);
      }
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

testHenriLogin();