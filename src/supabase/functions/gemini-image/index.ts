import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

interface ArticleData {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  region: string;
  tags?: string[];
}

/**
 * Get Google API Key from environment variables
 * Tries both VITE_GOOGLE_API_KEY (existing) and GOOGLE_API_KEY (alternative)
 */
function getGoogleApiKey(): string {
  const apiKey = Deno.env.get('VITE_GOOGLE_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  
  if (!apiKey) {
    throw new Error('Google API Key is not configured in Supabase secrets. Please set VITE_GOOGLE_API_KEY or GOOGLE_API_KEY.');
  }
  
  return apiKey;
}

/**
 * Generate an optimized image prompt using Gemini 2.5 Flash Lite Preview
 */
async function generateImagePrompt(article: ArticleData): Promise<string> {
  const apiKey = getGoogleApiKey();

  const genAI = new GoogleGenerativeAI(apiKey);
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
  return response.text().trim();
}

/**
 * Generate the actual image using Gemini 2.5 Flash Image
 */
async function generateImage(prompt: string): Promise<string> {
  const apiKey = getGoogleApiKey();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-image'
  });

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
  const candidates = response.candidates;
  
  if (!candidates || candidates.length === 0) {
    throw new Error('No image generated in response');
  }

  const candidate = candidates[0];
  const content = candidate.content;
  
  if (!content || !content.parts || content.parts.length === 0) {
    throw new Error('No content parts in response');
  }

  const imagePart = content.parts.find((part: any) => part.inlineData);
  
  if (!imagePart || !imagePart.inlineData) {
    throw new Error('No image data in response');
  }

  const imageData = imagePart.inlineData.data;
  const mimeType = imagePart.inlineData.mimeType || 'image/png';
  
  return `data:${mimeType};base64,${imageData}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/gemini-image', '');

    // Generate image prompt endpoint
    if (req.method === 'POST' && path === '/prompt') {
      const article: ArticleData = await req.json();
      const prompt = await generateImagePrompt(article);
      
      return new Response(
        JSON.stringify({ prompt }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate image endpoint
    if (req.method === 'POST' && path === '/image') {
      const { prompt } = await req.json();
      const imageUrl = await generateImage(prompt);
      
      return new Response(
        JSON.stringify({ imageUrl }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Complete workflow endpoint
    if (req.method === 'POST' && path === '/generate') {
      const article: ArticleData = await req.json();
      
      const imagePrompt = await generateImagePrompt(article);
      const imageUrl = await generateImage(imagePrompt);
      
      return new Response(
        JSON.stringify({ imageUrl, prompt: imagePrompt }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

