import { createClient } from '@supabase/supabase-js';

// Direct test of Supabase authentication
const supabaseUrl = 'https://dlpfkrqvptlgtampkqvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGZrcnF2cHRsZ3RhbXBrcXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzM3MzUsImV4cCI6MjA3MzcwOTczNX0.IuZBEKMBV1lXinuxB31zmNjGa79fsCk5ujFU4VIUfoo';

console.log('🚀 Starting direct authentication test...\n');

// Create a fresh client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Disable persistence for clean test
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: true
  }
});

async function testAuth() {
  const email = 'henriquegullo@themanereview.com';
  const password = 'TMRAdmin2025!';
  
  console.log(`📧 Testing with: ${email}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  
  try {
    // Test 1: Direct API call
    console.log('\n1️⃣ Testing direct API call...');
    const apiResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log(`   Status: ${apiResponse.status} ${apiResponse.statusText}`);
    const apiData = await apiResponse.json();
    console.log(`   Response:`, apiData);
    
    // Test 2: SDK signInWithPassword
    console.log('\n2️⃣ Testing SDK signInWithPassword...');
    const startTime = Date.now();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    const duration = Date.now() - startTime;
    console.log(`   Duration: ${duration}ms`);
    
    if (error) {
      console.error('   ❌ Error:', error);
    } else {
      console.log('   ✅ Success!');
      console.log('   User:', data.user?.email);
      console.log('   Session:', data.session ? 'Valid' : 'Invalid');
    }
    
    // Test 3: Check current session
    console.log('\n3️⃣ Checking current session...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log(`   Session exists: ${!!session}`);
    
    // Test 4: Get user
    console.log('\n4️⃣ Getting current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('   ❌ Error:', userError);
    } else {
      console.log(`   User: ${user?.email || 'No user'}`);
    }
    
  } catch (err) {
    console.error('\n💥 Unexpected error:', err);
  }
  
  console.log('\n✅ Test completed');
  process.exit(0);
}

// Run the test
testAuth();