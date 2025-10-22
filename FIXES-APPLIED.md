# Fixes Applied to The Mane Review

## ✅ Completed Fixes

### 1. Authentication System
- ✅ Fixed infinite recursion in RLS policies
- ✅ Created simple, non-recursive policies for users and articles tables
- ✅ Fixed user signup trigger with proper error handling
- ✅ Brazilian phone number validation working
- ✅ All required fields: email, password, full name, phone, date of birth

### 2. React Component Warnings
- ✅ Fixed Dialog component missing `DialogDescription` warning
- ✅ Added proper aria-describedby to article preview dialog

### 3. Database Structure
- ⏳ **NEEDS TO BE RUN**: `fix-database-columns.sql` - Adds slug column and auto-generation

## 🔧 Remaining Issues to Fix

### 1. Database 500 Errors
**Problem**: Articles table queries failing with 500 errors

**Solution**: Run `fix-database-columns.sql` in Supabase SQL Editor to:
- Add `slug` column to articles table
- Create auto-slug generation trigger
- Ensure all required columns exist

### 2. CORS Errors (Market API)
**Problem**: Market data API calls blocked by CORS

**Location**: `https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/market/`

**Solution Options**:
a) Add CORS headers to Supabase Edge Functions
b) Use a proxy or disable CORS in development
c) Move market data fetching to server-side

**To fix in Supabase Functions**:
```typescript
// In your edge function
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
});
```

## 📋 SQL Scripts to Run (In Order)

1. ✅ **COMPLETED**: `cleanup-policies.sql` - Removed recursive policies
2. ✅ **COMPLETED**: `fix-trigger.sql` - Fixed user signup trigger  
3. ⏳ **RUN THIS NOW**: `fix-database-columns.sql` - Add slug column

## 🧪 Testing Checklist

### Authentication
- [ ] Sign up with new account
- [ ] Login with existing account
- [ ] Create admin account (henriquegullo@themanereview.com)
- [ ] Run SQL to grant admin role: `UPDATE public.users SET role = 'Admin' WHERE email = 'henriquegullo@themanereview.com';`

### Article Submission
- [ ] Submit new article
- [ ] View submissions list
- [ ] Edit draft article
- [ ] Delete draft article
- [ ] View published article

### Article Review (Admin/Editor)
- [ ] View articles under review
- [ ] Approve/reject articles
- [ ] Add review comments

## 🎯 Next Steps

1. **Run `fix-database-columns.sql`** in Supabase SQL Editor
2. **Fix CORS for Market API** (see solution above)
3. **Test authentication flow** completely
4. **Test article submission** and review workflow
5. **Create admin account** and verify permissions

## 📁 Files Created

- `supabase-setup.sql` - Initial database setup
- `cleanup-policies.sql` - Fixed RLS policies
- `fix-trigger.sql` - Fixed signup trigger
- `fix-database-columns.sql` - Adds slug column
- `SUPABASE-SETUP-INSTRUCTIONS.md` - Setup guide
- `FIXES-APPLIED.md` - This file

## 🔐 Security Notes

- RLS policies are now simple and non-recursive
- Users can only read/update their own profiles
- Articles have proper access controls
- Admin operations require authentication

## 💡 Tips

- Check browser console for detailed error messages
- Use the AuthTest page for debugging auth issues
- Verify tables exist in Supabase Table Editor
- Check Supabase logs for server-side errors
