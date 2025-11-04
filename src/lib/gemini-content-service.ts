/**
 * Gemini Content Generation Service
 * Generates article titles and tags using Google's Gemini AI via Supabase Edge Function
 */

import { supabase } from './supabase';

interface ContentSuggestions {
  title: string;
  tags: string[];
  excerpt?: string;
}

/**
 * Generate article title and tags based on content using Supabase Edge Function
 */
export async function generateArticleMetadata(
  articleBody: string,
  region?: string,
  category?: string
): Promise<ContentSuggestions> {
  if (!articleBody || articleBody.trim().length < 100) {
    throw new Error('Article content is too short to generate metadata');
  }

  try {
    const { data, error } = await supabase.functions.invoke('gemini-metadata', {
      body: {
        articleBody,
        region,
        category
      }
    });

    if (error) {
      console.error('[Gemini Content] Edge Function Error:', error);
      throw new Error(error.message || 'Failed to generate metadata');
    }

    if (!data || !data.title || !Array.isArray(data.tags)) {
      throw new Error('Invalid response from metadata generation service');
    }

    console.log('[Gemini Content] Generated suggestions:', data);
    return data as ContentSuggestions;

  } catch (error) {
    console.error('[Gemini Content] Error:', error);
    throw error;
  }
}

/**
 * Generate only tags based on article content
 */
export async function generateArticleTags(
  articleBody: string,
  region?: string,
  category?: string
): Promise<string[]> {
  const suggestions = await generateArticleMetadata(articleBody, region, category);
  return suggestions.tags;
}

/**
 * Generate only title based on article content
 */
export async function generateArticleTitle(
  articleBody: string,
  region?: string,
  category?: string
): Promise<string> {
  const suggestions = await generateArticleMetadata(articleBody, region, category);
  return suggestions.title;
}

/**
 * Check if Gemini API is configured (always true since we use Edge Function)
 */
export function isGeminiConfigured(): boolean {
  return true;
}
