-- Fix existing articles that have AI images but no cover_image set
-- This updates articles where ai_image_url exists but cover_image is null

UPDATE articles
SET 
  cover_image = ai_image_url,
  cover_alt = 'AI generated image for: ' || title
WHERE 
  ai_image_url IS NOT NULL 
  AND ai_image_status = 'completed'
  AND (cover_image IS NULL OR cover_image = '');

-- Check the results
SELECT 
  id, 
  title, 
  cover_image, 
  ai_image_url,
  ai_image_status
FROM articles
WHERE ai_image_url IS NOT NULL;
