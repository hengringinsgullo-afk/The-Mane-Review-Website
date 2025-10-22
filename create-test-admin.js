import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dlpfkrqvptlgtampkqvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGZrcnF2cHRsZ3RhbXBrcXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzM3MzUsImV4cCI6MjA3MzcwOTczNX0.IuZBEKMBV1lXinuxB31zmNjGa79fsCk5ujFU4VIUfoo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestAdmin() {
  console.log('🔧 Creating test admin user...\n');
  
  const email = 'testadmin@themanereview.com';
  const password = 'TestAdmin123!';
  
  // Try to sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Test Admin',
        role: 'Admin'
      }
    }
  });
  
  if (error) {
    console.error('❌ Error creating user:', error);
  } else {
    console.log('✅ User created successfully!');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   User ID:', data.user?.id);
    
    // Now test login
    console.log('\n🔐 Testing login with new user...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError);
    } else {
      console.log('✅ Login successful!');
      console.log('   User:', loginData.user?.email);
      console.log('   Session:', loginData.session ? 'Valid' : 'Invalid');
    }
  }
}

createTestAdmin();