import { projectId, publicAnonKey } from '../utils/supabase/info';

// Use Supabase Edge Function instead of direct API calls
// This keeps the API key secure on the server side
const EDGE_FUNCTION_BASE = `https://${projectId}.supabase.co/functions/v1/gemini-image`;

async function callEdgeFunction(endpoint: string, body: any): Promise<any> {
  const response = await fetch(`${EDGE_FUNCTION_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

interface ArticleData {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  region: string;
  tags?: string[];
}

/**
 * Step 1: Generate an optimised image prompt using Gemini 2.5 Flash Lite Preview
 * This model analyses the article and creates a detailed prompt for image generation
 */
export async function generateImagePrompt(article: ArticleData): Promise<string> {
  try {
    console.log('[Gemini] Generating image prompt for article:', article.title);
    
    const result = await callEdgeFunction('/prompt', article);
    const imagePrompt = result.prompt;

    console.log('[Gemini] Generated image prompt:', imagePrompt);
    return imagePrompt;

  } catch (error) {
    console.error('[Gemini] Error generating image prompt:', error);
    throw new Error('Failed to generate image prompt: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Step 2: Generate the actual image using Gemini 2.5 Flash Image
 * This uses the prompt from step 1 to create the image
 * Model: gemini-2.5-flash-image
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log('[Gemini Image] Generating image with prompt:', prompt);
    
    const result = await callEdgeFunction('/image', { prompt });
    const imageUrl = result.imageUrl;

    console.log('[Gemini Image] Image generated successfully');
    return imageUrl;

  } catch (error) {
    console.error('[Gemini Image] Error generating image:', error);
    throw new Error('Failed to generate image: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Complete workflow: Generate prompt and then generate image
 */
export async function generateArticleImage(article: ArticleData): Promise<{
  imageUrl: string;
  prompt: string;
}> {
  try {
    console.log('[Gemini] Starting AI image generation workflow for:', article.title);

    // Use the complete workflow endpoint
    const result = await callEdgeFunction('/generate', article);

    console.log('[Gemini] Workflow completed successfully');
    return {
      imageUrl: result.imageUrl,
      prompt: result.prompt
    };

  } catch (error) {
    console.error('[Gemini] Workflow error:', error);
    throw error;
  }
}

/**
 * Upload base64 image to Supabase Storage
 */
export async function uploadImageToStorage(
  base64Image: string,
  articleId: string,
  supabase: any
): Promise<string> {
  try {
    console.log('[Storage] Starting upload for article:', articleId);
    
    // Convert base64 to blob
    const base64Data = base64Image.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    console.log('[Storage] Blob created, size:', blob.size, 'bytes');

    // Upload to Supabase Storage
    const fileName = `article-${articleId}-${Date.now()}.png`;
    console.log('[Storage] Uploading to bucket article-images, filename:', fileName);
    
    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      console.error('[Storage] Upload error:', error);
      throw error;
    }
    
    console.log('[Storage] Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);
    
    console.log('[Storage] Public URL:', publicUrl);

    return publicUrl;

  } catch (error) {
    console.error('[Storage] Error uploading image:', error);
    throw error;
  }
}
