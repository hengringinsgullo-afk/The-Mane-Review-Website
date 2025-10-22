import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use the service role key for admin operations
const supabaseUrl = 'https://dlpfkrqvptlgtampkqvd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Please set SUPABASE_SERVICE_KEY environment variable');
  console.log('   You can find this in your Supabase dashboard under Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetAdminPassword() {
  console.log('🔧 Resetting admin user password...\n');
  
  const email = 'henriquegullo@themanereview.com';
  const newPassword = 'TMRAdmin2025!';
  
  try {
    // First, update the user's password
    const { data: userData, error: updateError } = await supabase.auth.admin.updateUserById(
      'cd3af879-301c-4aa5-aa47-7fcb8d90e7ec',
      { 
        password: newPassword,
        email_confirm: true
      }
    );
    
    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      return;
    }
    
    console.log('✅ Password reset successful!');
    console.log('   Email:', email);
    console.log('   New Password:', newPassword);
    console.log('   User ID:', userData.user.id);
    
    // Also ensure email is confirmed
    await supabase.auth.admin.updateUserById(
      'cd3af879-301c-4aa5-aa47-7fcb8d90e7ec',
      { 
        email_confirm: true 
      }
    );
    
    console.log('✅ Email confirmed!');
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

// Alternative: Create SQL to update password hash directly
async function createPasswordResetSQL() {
  console.log('\n📝 Alternative SQL approach:\n');
  
  // This is just for reference - you'd need to run this in Supabase SQL editor
  const sql = `
-- Reset password for admin user
-- Note: You need to generate the password hash using bcrypt
UPDATE auth.users 
SET 
  encrypted_password = crypt('TMRAdmin2025!', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'henriquegullo@themanereview.com';
  `;
  
  console.log(sql);
}

// Run the reset
console.log('Note: This requires the SUPABASE_SERVICE_KEY environment variable');
console.log('You can get this from: Supabase Dashboard > Settings > API > service_role key\n');

if (process.argv.includes('--sql')) {
  createPasswordResetSQL();
} else {
  resetAdminPassword();
}