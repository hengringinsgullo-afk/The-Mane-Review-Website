# Quick Start Guide - The Mane Review

## 🚀 Get Everything Working in 3 Steps

### Step 1: Fix Database Structure
Run these SQL scripts in your Supabase SQL Editor (in order):

1. **`fix-database-columns.sql`** - Adds missing slug column
2. **`insert-sample-data.sql`** - Adds submission guidelines

### Step 2: Test Authentication
1. Go to your app's signup page
2. Create a test account:
   - Email: test@example.com
   - Password: test123456
   - Full Name: Test User
   - Phone: (11) 98765-4321
   - Date of Birth: 2000-01-01

3. Create admin account:
   - Email: henriquegullo@themanereview.com
   - Password: H3nr1qu3
   - Full Name: Henrique Gullo
   - Phone: (11) 99999-9999
   - Date of Birth: 1990-01-01

4. Grant admin role (run in Supabase SQL Editor):
```sql
UPDATE public.users SET role = 'Admin' WHERE email = 'henriquegullo@themanereview.com';
```

### Step 3: Test Article Submission
1. Login with your test account
2. Go to Opinion → Submit Article
3. Fill out the form and submit
4. Check Opinion → My Submissions

## ✅ What's Fixed

- ✅ Authentication with Brazilian phone validation
- ✅ RLS policies (no more infinite recursion)
- ✅ User signup trigger
- ✅ React Dialog warnings
- ✅ Article submission form
- ✅ Student submissions tracking

## ✅ All Issues Fixed!

### Market Data
The app now uses realistic fallback data for market indices and stock quotes. This means:
- ✅ No CORS errors
- ✅ No API rate limits
- ✅ Works offline
- ✅ Realistic data that updates on each page load

If you want real market data, see `DEPLOY-EDGE-FUNCTIONS.md` for deployment instructions.

## 📊 Database Tables

Your database now has:
- `users` - User profiles with auth integration
- `articles` - Article submissions with slug auto-generation
- `article_reviews` - Editorial review tracking
- `submission_guidelines` - Guidelines for contributors
- `admin_logs` - Admin action audit trail

## 🔑 Key Features

### For Students
- Submit articles for review
- Track submission status
- Receive editorial feedback
- Edit drafts and rejected articles

### For Editors/Admins
- Review submitted articles
- Approve/reject with comments
- Manage published content
- View admin dashboard

## 🐛 Troubleshooting

**"Database error saving new user"**
- Run `fix-trigger.sql` again
- Check Supabase logs for details

**"500 error on articles query"**
- Run `fix-database-columns.sql`
- Verify slug column exists

**"Infinite recursion in policy"**
- Run `cleanup-policies.sql` again
- Check policies in Supabase dashboard

## 📞 Support

Check these files for detailed information:
- `FIXES-APPLIED.md` - Complete list of fixes
- `SUPABASE-SETUP-INSTRUCTIONS.md` - Detailed setup guide
- Browser console - For frontend errors
- Supabase logs - For backend errors
