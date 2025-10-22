-- Fix missing columns and ensure proper structure

-- 1. Add slug column to articles if it doesn't exist
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Generate slugs for existing articles without them
UPDATE public.articles 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- 3. Make slug unique after populating
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'articles_slug_key'
  ) THEN
    ALTER TABLE public.articles ADD CONSTRAINT articles_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 4. Create function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Add random suffix if slug already exists
    WHILE EXISTS (SELECT 1 FROM public.articles WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || FLOOR(RANDOM() * 1000)::TEXT;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for auto-slug generation
DROP TRIGGER IF EXISTS articles_generate_slug ON public.articles;
CREATE TRIGGER articles_generate_slug
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION generate_slug_from_title();

-- 6. Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'articles')
ORDER BY table_name, ordinal_position;
