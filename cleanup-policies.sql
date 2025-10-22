-- AGGRESSIVE CLEANUP - Run this first to remove ALL policies and start fresh

-- 1. Drop ALL policies on users table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users CASCADE';
    END LOOP;
END $$;

-- 2. Drop ALL policies on articles table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'articles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.articles CASCADE';
    END LOOP;
END $$;

-- 3. Drop ALL policies on article_reviews table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'article_reviews' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.article_reviews CASCADE';
    END LOOP;
END $$;

-- 4. Disable RLS temporarily
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.article_reviews DISABLE ROW LEVEL SECURITY;

-- 5. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.article_reviews ENABLE ROW LEVEL SECURITY;

-- 6. Create SIMPLE policies for users (NO RECURSION)
CREATE POLICY "users_select_policy"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert_policy"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Create SIMPLE policies for articles
CREATE POLICY "articles_select_policy"
  ON public.articles FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "articles_insert_policy"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "articles_update_policy"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "articles_delete_policy"
  ON public.articles FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Done! Policies are now clean and simple.
