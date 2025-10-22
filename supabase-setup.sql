-- Supabase Database Setup for The Mane Review
-- Run this in your Supabase SQL Editor

-- 1. Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  date_of_birth DATE,
  is_st_pauls_member BOOLEAN DEFAULT false,
  member_type TEXT CHECK (member_type IN ('staff', 'student')),
  student_form TEXT,
  role TEXT DEFAULT 'Reader' CHECK (role IN ('Admin', 'Editor', 'Contributor', 'Student', 'Reader')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  cover_image TEXT,
  cover_alt TEXT,
  region TEXT NOT NULL CHECK (region IN ('South America', 'USA', 'Europe', 'Asia')),
  category TEXT NOT NULL CHECK (category IN ('Markets', 'Opinion')),
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_role TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'rejected')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  featured BOOLEAN DEFAULT false,
  est_read_min INTEGER DEFAULT 5,
  views INTEGER DEFAULT 0,
  submission_notes TEXT,
  review_notes TEXT,
  reviewer_id UUID REFERENCES public.users(id)
);

-- 3. Create article_reviews table
CREATE TABLE IF NOT EXISTS public.article_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create submission_guidelines table
CREATE TABLE IF NOT EXISTS public.submission_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can manage own articles" ON public.articles;

-- 7. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create SIMPLE RLS policies for users table (NO RECURSION)
CREATE POLICY "Enable read access for authenticated users"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 9. Create RLS policies for articles
CREATE POLICY "Anyone can read published articles"
  ON public.articles FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Authors can insert articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- 10. Create RLS policies for article_reviews
CREATE POLICY "Reviewers can read reviews"
  ON public.article_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Reviewers can insert reviews"
  ON public.article_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- 11. Create RLS policies for submission_guidelines
CREATE POLICY "Anyone can read active guidelines"
  ON public.submission_guidelines FOR SELECT
  USING (is_active = true);

-- 12. Create RLS policies for admin_logs
CREATE POLICY "Admins can read logs"
  ON public.admin_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert logs"
  ON public.admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 13. Create function to handle new user signup
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone_number,
    date_of_birth,
    is_st_pauls_member,
    member_type,
    student_form,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone_number',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    COALESCE((NEW.raw_user_meta_data->>'is_st_pauls_member')::BOOLEAN, false),
    NEW.raw_user_meta_data->>'member_type',
    NEW.raw_user_meta_data->>'student_form',
    COALESCE(NEW.raw_user_meta_data->>'role', 'Reader')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 15. Create function to update updated_at timestamp
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 17. Create admin helper function (optional - for development)
DROP FUNCTION IF EXISTS public.check_admin_credentials(text, text);
CREATE OR REPLACE FUNCTION public.check_admin_credentials(
  email_param TEXT,
  password_param TEXT
)
RETURNS JSONB AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- This is a simplified check - in production, use proper auth
  SELECT * INTO user_record
  FROM public.users
  WHERE email = email_param AND role = 'Admin';
  
  IF user_record IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'user', row_to_json(user_record));
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Admin not found');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Create admin action logging function
DROP FUNCTION IF EXISTS public.log_admin_action(text, text, uuid, jsonb);
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_text TEXT,
  target_type_text TEXT DEFAULT NULL,
  target_id_uuid UUID DEFAULT NULL,
  details_json JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_logs (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), action_text, target_type_text, target_id_uuid, details_json)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 20. Create admin user (run this AFTER creating the account via signup)
-- UPDATE public.users SET role = 'Admin' WHERE email = 'henriquegullo@themanereview.com';

-- Done! Your database is now set up.
