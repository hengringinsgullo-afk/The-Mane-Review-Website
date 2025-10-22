# Supabase Database Setup Instructions

## The Problem
Your Supabase database has **infinite recursion in RLS policies** which is preventing authentication from working properly.

## The Solution
Run the SQL script in your Supabase dashboard to fix the policies and set up the database correctly.

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd

### 2. Navigate to SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New Query"

### 3. Copy and Paste the SQL
Open the file `supabase-setup.sql` in this project and copy ALL the contents.

### 4. Run the Script
- Paste the SQL into the editor
- Click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows)

### 5. Verify Success
You should see messages indicating:
- Tables created successfully
- Policies created successfully
- Functions created successfully

### 6. Test Authentication
After running the SQL, try these tests:

1. **Test Signup:**
   - Go to your app's signup page
   - Create a new account with:
     - Email: test@example.com
     - Password: test123456
     - Full Name: Test User
     - Phone: (11) 98765-4321
     - Date of Birth: 2000-01-01

2. **Test Login:**
   - Try logging in with the credentials you just created

3. **Create Admin Account:**
   - Sign up with:
     - Email: henriquegullo@themanereview.com
     - Password: H3nr1qu3
     - Full Name: Henrique Gullo
   - After signup, run this SQL to make it admin:
     ```sql
     UPDATE public.users SET role = 'Admin' WHERE email = 'henriquegullo@themanereview.com';
     ```

## What the Script Does

1. ✅ Creates `users` table with all required fields
2. ✅ Creates `articles` table for content management
3. ✅ Creates `article_reviews` table for editorial workflow
4. ✅ Creates `submission_guidelines` table
5. ✅ Creates `admin_logs` table for audit trail
6. ✅ Fixes RLS policies (removes infinite recursion)
7. ✅ Sets up triggers for automatic user profile creation
8. ✅ Creates helper functions for admin operations

## Troubleshooting

### If you get "relation already exists" errors:
This is normal - it means some tables already exist. The script uses `IF NOT EXISTS` to handle this safely.

### If you get "policy already exists" errors:
The script drops old policies first, but if you see this error, you can manually drop them:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### If authentication still doesn't work:
1. Check the browser console for errors
2. Verify the tables were created: Go to "Table Editor" in Supabase
3. Check if the trigger is working: Try signing up and see if a row appears in `public.users`

## Need Help?
If you encounter any issues, check:
- Supabase logs (in the dashboard)
- Browser console (F12)
- The AuthTest page in your app for debugging

---

**Important:** Keep your Supabase credentials secure and never commit them to version control!
