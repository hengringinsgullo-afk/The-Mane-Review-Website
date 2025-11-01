import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
// TODO: Add your Google API key here or use environment variable
const GOOGLE_API_KEY = (import.meta as any).env?.VITE_GOOGLE_API_KEY || '';

if (!GOOGLE_API_KEY) {
  console.warn('⚠️ Google API Key not found. AI image generation will not work.');
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

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
    
    if (!GOOGLE_API_KEY) {
      throw new Error('Google API Key is not configured. Please add VITE_GOOGLE_API_KEY to your .env file.');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite-preview-09-2025'
    });

    const promptInstruction = `
You are an expert at creating image generation prompts for financial and business articles.

Analyse this article and create a detailed, professional image generation prompt that would create 
a compelling featured image for the article. The image should be:
- Professional and suitable for a financial publication
- Visually striking and engaging
- Related to the article's main theme
- Modern and clean aesthetic
- Suitable for a 16:9 aspect ratio header image

Article Details:
Title: ${article.title}
Category: ${article.category}
Region: ${article.region}
Excerpt: ${article.excerpt}
Tags: ${article.tags?.join(', ') || 'None'}

First 500 characters of content:
${article.body.substring(0, 500)}

Create a detailed image generation prompt (maximum 200 words) that captures the essence of this article.
Focus on visual elements, style, mood, and composition. Do not include any text or words in the image.

Return ONLY the image generation prompt, nothing else.
`;

    const result = await model.generateContent(promptInstruction);
    const response = await result.response;
    const imagePrompt = response.text().trim();

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
    
    if (!GOOGLE_API_KEY) {
      throw new Error('Google API Key is not configured. Please add VITE_GOOGLE_API_KEY to your .env file.');
    }

    // Using Gemini 2.5 Flash Image model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image'
    });

    // Generate image using Gemini's native image generation
    const result = await model.generateContent([
      {
        text: `Generate a professional, high-quality featured image for a financial article. 
        
Image requirements:
- Aspect ratio: 16:9 (landscape)
- Style: Professional, modern, clean
- No text or words in the image
- High resolution
- Suitable for a financial publication header

Prompt: ${prompt}`
      }
    ]);

    const response = await result.response;
    
    // Extract image from response
    // Gemini returns images in the candidates array
    const candidates = response.candidates;
    
    if (!candidates || candidates.length === 0) {
      throw new Error('No image generated in response');
    }

    const candidate = candidates[0];
    const content = candidate.content;
    
    if (!content || !content.parts || content.parts.length === 0) {
      throw new Error('No content parts in response');
    }

    // Find the image part
    const imagePart = content.parts.find((part: any) => part.inlineData);
    
    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image data in response');
    }

    // Get the base64 image data
    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    
    // Return as data URL
    const imageUrl = `data:${mimeType};base64,${imageData}`;

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

    // Step 1: Generate optimised prompt
    const imagePrompt = await generateImagePrompt(article);

    // Step 2: Generate image using the prompt
    const imageUrl = await generateImage(imagePrompt);

    console.log('[Gemini] Workflow completed successfully');
    return {
      imageUrl,
      prompt: imagePrompt
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
