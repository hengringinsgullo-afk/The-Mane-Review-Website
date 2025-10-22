import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

console.log('🔍 CHECKING CURRENT AUTHENTICATION STATE...\n');

// Read the current API key from the source
const infoFile = readFileSync('./src/utils/supabase/info.tsx', 'utf-8');
const keyMatch = infoFile.match(/publicAnonKey = "([^"]+)"/);
const currentKey = keyMatch ? keyMatch[1] : null;

console.log('📋 Current Configuration:');
console.log('API Key from info.tsx:', currentKey ? `${currentKey.substring(0, 40)}...` : 'NOT FOUND');

// Also check supabase-auth-fix.ts
const authFixFile = readFileSync('./src/lib/supabase-auth-fix.ts', 'utf-8');
const hasCorrectImport = authFixFile.includes("from '../utils/supabase/info'");
console.log('Auth fix imports from info.tsx:', hasCorrectImport ? '✅ YES' : '❌ NO');

// Create client with current configuration
const supabaseUrl = 'https://dlpfkrqvptlgtampkqvd.supabase.co';
const supabase = createClient(supabaseUrl, currentKey);

async function testCurrentState() {
  console.log('\n📊 Testing Authentication:');
  console.log('Email: henriquegullo@themanereview.com');
  console.log('Password: H3nr1qu3');
  
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'henriquegullo@themanereview.com',
      password: 'H3nr1qu3'
    });
    
    const duration = Date.now() - startTime;
    console.log(`\nResponse time: ${duration}ms`);
    
    if (error) {
      console.error('❌ Authentication failed:', error.message);
      console.error('Error details:', {
        status: error.status,
        code: error.code,
        name: error.name
      });
    } else if (data?.user) {
      console.log('✅ Authentication successful!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Session:', data.session ? 'Valid' : 'Invalid');
      
      // Test database access
      console.log('\n🗄️ Testing database access:');
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'henriquegullo@themanereview.com')
        .single();
        
      if (dbError) {
        console.error('❌ Database error:', dbError.message);
      } else {
        console.log('✅ User profile found:');
        console.log('  Name:', userData.name);
        console.log('  Role:', userData.role);
        console.log('  Profile ID:', userData.id);
      }
    } else {
      console.error('❌ No user data returned');
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
  
  // Check React imports
  console.log('\n📦 Checking React app configuration:');
  const supabaseFile = readFileSync('./src/lib/supabase.ts', 'utf-8');
  const usesAuthFix = supabaseFile.includes("from './supabase-auth-fix'");
  console.log('supabase.ts uses auth-fix:', usesAuthFix ? '✅ YES' : '❌ NO');
  
  // Check if backup exists
  const hasBackup = require('fs').existsSync('./src/lib/supabase.ts.backup');
  console.log('Backup file exists:', hasBackup ? '✅ YES' : '❌ NO');
}

testCurrentState();