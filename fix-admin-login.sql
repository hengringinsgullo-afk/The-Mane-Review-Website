-- Fix Admin Login Issues
-- This script fixes the auth_id mismatch, RLS policies, and trigger function
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- PROBLEM SUMMARY:
-- 1. auth_id in public.users didn't match id in auth.users
-- 2. RLS policies were checking auth.uid() = id instead of auth.uid() = auth_id
-- 3. Trigger function was inserting into wrong columns (id instead of auth_id, full_name instead of name)
-- ============================================================================

-- Step 1: Fix the auth_id for existing users
-- The auth_id in public.users must match the id in auth.users
UPDATE public.users 
SET auth_id = (
  SELECT id FROM auth.users 
  WHERE auth.users.email = public.users.email
)
WHERE auth_id IS NULL OR auth_id != (
  SELECT id FROM auth.users 
  WHERE auth.users.email = public.users.email
);

-- Step 2: Fix RLS policies to use auth_id instead of id
-- Drop existing policies
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;

-- Create corrected policies using auth_id
CREATE POLICY "users_select_policy"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert_policy"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "users_update_policy"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Step 3: Fix the trigger function to use correct columns
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    auth_id,  -- Changed from 'id' to 'auth_id'
    email,
    name,     -- Changed from 'full_name' to 'name'
    phone_number,
    date_of_birth,
    is_st_pauls_member,
    member_type,
    student_form,
    role
  )
  VALUES (
    NEW.id,  -- This is the auth.users.id, goes to auth_id column
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone_number',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    COALESCE((NEW.raw_user_meta_data->>'is_st_pauls_member')::BOOLEAN, false),
    NEW.raw_user_meta_data->>'member_type',
    NEW.raw_user_meta_data->>'student_form',
    COALESCE(NEW.raw_user_meta_data->>'role', 'Student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify the fix
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  u.auth_id,
  au.id as auth_user_id,
  CASE 
    WHEN u.auth_id = au.id THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
ORDER BY u.created_at DESC;

-- Step 5: Grant admin role to the admin user (if needed)
UPDATE public.users 
SET role = 'Admin' 
WHERE email = 'henriquegullo@themanereview.com';
