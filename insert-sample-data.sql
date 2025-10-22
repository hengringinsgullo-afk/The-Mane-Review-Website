-- Insert sample submission guidelines

INSERT INTO public.submission_guidelines (category, title, content, order_index, is_active)
VALUES
  ('Length', 'Word Count', '800-1500 words recommended', 1, true),
  ('Length', 'Minimum', 'At least 300 words required', 2, true),
  ('Content', 'Original Work', 'Must be your own original analysis', 1, true),
  ('Content', 'Citations', 'Cite all sources and data', 2, true),
  ('Content', 'Fact-Check', 'Verify all facts and figures', 3, true),
  ('Style', 'Clear Writing', 'Use clear, accessible language', 1, true),
  ('Style', 'Structure', 'Include introduction and conclusion', 2, true),
  ('Style', 'Formatting', 'Use proper paragraphs and spacing', 3, true),
  ('Review', 'Timeline', 'Review typically takes 3-5 days', 1, true),
  ('Review', 'Feedback', 'You''ll receive detailed feedback', 2, true),
  ('Review', 'Revisions', 'Revisions may be requested', 3, true)
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT category, title, content FROM public.submission_guidelines ORDER BY category, order_index;
