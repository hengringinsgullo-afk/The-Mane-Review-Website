-- Add RLS policies to allow admins and editors to review articles
-- This allows admins/editors to update article status, review_notes, and other review-related fields

-- First, check if a function exists to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policy: Admins and Editors can read all articles (for review)
DROP POLICY IF EXISTS "Admins and Editors can read all articles" ON public.articles;
CREATE POLICY "Admins and Editors can read all articles"
  ON public.articles FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR 
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'Editor')
    )
  );

-- Policy: Admins and Editors can update articles for review
DROP POLICY IF EXISTS "Admins and Editors can update articles for review" ON public.articles;
CREATE POLICY "Admins and Editors can update articles for review"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'Editor')
    )
  )
  WITH CHECK (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'Editor')
    )
  );

-- Policy: Authors can read their own articles regardless of status
-- (Already covered by the first policy, but keeping for clarity)
-- This is already handled by the existing policy that checks auth.uid() = author_id

-- Verify policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'articles' 
AND schemaname = 'public'
ORDER BY policyname;

