-- Check if admin user exists in both auth and public users tables
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  au.last_sign_in_at,
  au.created_at as auth_created_at,
  pu.id as public_id,
  pu.email as public_email,
  pu.name,
  pu.role,
  pu.auth_id as public_auth_id
FROM auth.users au
LEFT JOIN public.users pu ON pu.auth_id = au.id
WHERE au.email = 'henriquegullo@themanereview.com';

-- If no results above, check if user exists in public.users without auth link
SELECT * FROM public.users WHERE email = 'henriquegullo@themanereview.com';

-- Check if there's any mismatch between auth.users and public.users
SELECT 
  'Auth user without public profile' as issue,
  au.id,
  au.email
FROM auth.users au
LEFT JOIN public.users pu ON pu.auth_id = au.id
WHERE pu.id IS NULL
  AND au.email = 'henriquegullo@themanereview.com';

-- Fix: Create public user profile if missing
-- INSERT INTO public.users (id, email, name, role, auth_id)
-- SELECT 
--   au.id,
--   au.email,
--   COALESCE(au.raw_user_meta_data->>'full_name', 'Henrique Gullo'),
--   'Admin',
--   au.id
-- FROM auth.users au
-- LEFT JOIN public.users pu ON pu.auth_id = au.id
-- WHERE au.email = 'henriquegullo@themanereview.com'
--   AND pu.id IS NULL;