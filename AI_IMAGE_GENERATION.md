# AI Image Generation Setup

This document explains how to set up and use the AI image generation feature for article featured images.

## Overview

The system uses Google's Gemini AI to automatically generate professional featured images for articles. The process involves two steps:

1. **Prompt Generation**: Gemini Flash Lite analyses the article and creates an optimised image generation prompt
2. **Image Generation**: Imagen (Gemini Image) generates the actual image based on the prompt

## Setup Instructions

### 1. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google Developer account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google credentials to `.env`:
   ```
   VITE_GOOGLE_API_KEY=your_actual_api_key_here
   VITE_GOOGLE_PROJECT_ID=your_project_id_here
   ```

**📖 Para instruções DETALHADAS, veja: `GOOGLE_AI_SETUP_GUIDE.md`**

### 3. Set Up Supabase Storage

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket called `article-images`
4. Set the bucket to **public** (so images can be accessed)
5. Configure CORS if needed

### 4. Install Dependencies

Make sure you have the Google Generative AI package installed:

```bash
npm install @google/generative-ai
```

## How It Works

### For Authors

1. When submitting an article, authors can check the "Generate Featured Image with AI" option
2. The article is submitted with `request_ai_image = true`
3. The article goes through normal editorial review

### For Admins/Editors

1. When approving an article that requested AI image generation:
   - The article is published immediately
   - AI image generation starts automatically in the background
   - A toast notification shows the generation progress

2. The generation process:
   - **Step 1**: Gemini analyses the article content and creates an optimised prompt
   - **Step 2**: Imagen generates a professional image based on the prompt
   - **Step 3**: Image is uploaded to Supabase Storage
   - **Step 4**: Article is updated with the image URL

3. If generation fails:
   - Article remains published
   - Error is logged
   - Admin is notified via toast

## Database Schema

The following fields were added to the `articles` table:

```sql
request_ai_image BOOLEAN DEFAULT false
ai_image_url TEXT
ai_image_prompt TEXT
ai_image_status TEXT CHECK (ai_image_status IN ('pending', 'generating', 'completed', 'failed'))
```

## API Models Used

### Modelo 1: Gemini 2.5 Flash Lite Preview (Prompt Generation)
- **Model**: `gemini-2.5-flash-lite-preview-09-2025`
- **Purpose**: Analyses article content and generates optimised image prompts
- **Input**: Article title, excerpt, body, category, region, tags
- **Output**: Detailed image generation prompt (max 200 words)

### Modelo 2: Gemini 2.5 Flash Image (Image Generation)
- **Model**: `gemini-2.5-flash-image`
- **Purpose**: Generates the actual image using Gemini's native image generation
- **Input**: Optimised prompt from Step 1
- **Output**: High-quality 16:9 PNG image
- **Parameters**:
  - Aspect ratio: 16:9 (perfect for article headers)
  - Style: Professional, modern, clean
  - No text or words in images
  - High resolution output

## Troubleshooting

### API Key Issues

If you see "Google API Key not found" warning:
1. Check that `.env` file exists
2. Verify `VITE_GOOGLE_API_KEY` is set correctly
3. Restart the development server after adding the key

### Image Generation Fails

Common issues:
1. **API quota exceeded**: Check your Google Cloud quota
2. **Storage bucket not found**: Create `article-images` bucket in Supabase
3. **CORS errors**: Configure CORS in Supabase Storage settings
4. **Content policy violation**: The article content may have triggered safety filters

### Images Not Displaying

1. Check that the Supabase Storage bucket is public
2. Verify the image URL in the database
3. Check browser console for CORS errors

## Cost Considerations

- **Gemini Flash**: Very low cost per request (~$0.00001 per request)
- **Imagen**: Moderate cost per image (~$0.02-0.04 per image)
- Images are only generated when:
  - Author explicitly requests it
  - Article is approved for publication
  - Previous generation hasn't completed

## Future Enhancements

Potential improvements:
- [ ] Allow admins to regenerate images
- [ ] Provide multiple image options to choose from
- [ ] Add image editing capabilities
- [ ] Support custom prompts from authors
- [ ] Batch generation for multiple articles
- [ ] Image style presets (minimalist, bold, abstract, etc.)

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Google API key has the necessary permissions
4. Check Supabase Storage configuration

## Security Notes

- Never commit `.env` file to version control
- Keep your Google API key secure
- Rotate API keys regularly
- Monitor API usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges
