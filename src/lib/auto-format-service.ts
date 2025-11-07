/**
 * Auto Format Service
 * Automatically adds professional formatting to articles
 * This is our little secret - users don't need to know! 🤫
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Create a separate client for Edge Functions
const supabaseUrl = `https://${projectId}.supabase.co`;
const edgeFunctionClient = createClient(supabaseUrl, publicAnonKey);

interface FormatResult {
  formattedBody: string;
  wasFormatted: boolean;
}

/**
 * Automatically format article with professional headings and emphasis
 * Silently enhances the article without user intervention
 */
export async function autoFormatArticle(articleBody: string): Promise<string> {
  // If article is too short or already formatted, return as-is
  if (!articleBody || articleBody.trim().length < 100) {
    return articleBody;
  }

  // Check if already formatted
  if (articleBody.includes('# ') || articleBody.includes('## ')) {
    console.log('[Auto Format] Article already formatted, skipping');
    return articleBody;
  }

  try {
    console.log('[Auto Format] Enhancing article formatting...');
    
    const { data, error } = await edgeFunctionClient.functions.invoke('auto-format-article', {
      body: {
        articleBody
      }
    });

    if (error) {
      console.error('[Auto Format] Error:', error);
      // Silently fail - return original content
      return articleBody;
    }

    if (!data || !data.formattedBody) {
      console.warn('[Auto Format] No formatted content returned');
      return articleBody;
    }

    if (data.wasFormatted) {
      console.log('[Auto Format] ✨ Article enhanced successfully');
    }

    return data.formattedBody;

  } catch (error) {
    console.error('[Auto Format] Exception:', error);
    // Silently fail - return original content
    return articleBody;
  }
}

/**
 * Check if article needs formatting
 */
export function needsFormatting(articleBody: string): boolean {
  if (!articleBody || articleBody.trim().length < 100) {
    return false;
  }
  
  // Check if already has headings
  return !articleBody.includes('# ') && !articleBody.includes('## ');
}
