-- ============================================
-- AUTOMATIC ROLE ASSIGNMENT BASED ON EMAIL
-- ============================================
-- This ensures correct roles are assigned to users based on their email
-- Works for both new and existing users

-- Function to determine role based on email
CREATE OR REPLACE FUNCTION get_role_from_email(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Admin: roneymatuspp@gmail.com and all Henrique Gullo emails
  IF user_email = 'roneymatuspp@gmail.com' 
     OR user_email ILIKE '%henrique%gullo%'
     OR user_email ILIKE '%hgullo%'
     OR user_email ILIKE '%h.gullo%' THEN
    RETURN 'Admin';
  
  -- Expert: Leo Gaz and Eric Bartunec
  ELSIF user_email ILIKE '%leo%gaz%'
     OR user_email ILIKE '%leogaz%'
     OR user_email ILIKE '%eric%bartunec%'
     OR user_email ILIKE '%ericbartunec%'
     OR user_email ILIKE '%e.bartunec%' THEN
    RETURN 'Expert';
  
  -- Default: Student
  ELSE
    RETURN 'Student';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with correct roles
UPDATE users
SET role = get_role_from_email(email)
WHERE role != get_role_from_email(email);

-- Create or replace trigger function to auto-assign roles on insert/update
CREATE OR REPLACE FUNCTION auto_assign_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign role based on email if not explicitly set
  IF NEW.role IS NULL OR NEW.role = 'Student' THEN
    NEW.role := get_role_from_email(NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_assign_role ON users;

-- Create trigger to auto-assign roles
CREATE TRIGGER trigger_auto_assign_role
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_role();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check current role assignments
SELECT 
  email,
  role,
  get_role_from_email(email) as should_be_role,
  CASE 
    WHEN role = get_role_from_email(email) THEN '✓ Correct'
    ELSE '✗ Needs Update'
  END as status
FROM users
ORDER BY role DESC, email;

-- Summary by role
SELECT 
  role,
  COUNT(*) as user_count,
  STRING_AGG(name || ' (' || email || ')', ', ' ORDER BY name) as users
FROM users
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'Admin' THEN 1
    WHEN 'Expert' THEN 2
    WHEN 'Editor' THEN 3
    WHEN 'Contributor' THEN 4
    WHEN 'Student' THEN 5
    ELSE 6
  END;

-- ============================================
-- CURRENT ROLE ASSIGNMENTS (as of setup)
-- ============================================
-- Admin (3 users):
--   - roneymatuspp@gmail.com (JONA NANA)
--   - henriquegullo@icloud.com (Henrique Gullo)
--   - henriquegullo@themanereview.com (Henri Gullo)
--
-- Expert (2 users):
--   - leogaz@icloud.com (Leo Gaz)
--   - eb3@stpauls.br (Eric Bartunek)
--
-- Student (20 users): All others

-- ============================================
-- MANUAL ROLE UPDATE (if needed)
-- ============================================

-- Force update all users to correct roles
-- UPDATE users SET role = get_role_from_email(email);

-- Check specific user
-- SELECT email, role, get_role_from_email(email) as correct_role FROM users WHERE email = 'roneymatuspp@gmail.com';
