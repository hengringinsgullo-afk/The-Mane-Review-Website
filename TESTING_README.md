# 🧪 Testing Guide

## Local Testing Files

Para testar localmente sem expor suas credenciais:

### 1. Test Gemini API

```bash
# Copy the template
cp test-gemini.local.js test-gemini.js

# Edit test-gemini.js and add your API key
# Then run:
node test-gemini.js
```

### 2. Test Supabase Storage

```bash
# Copy the template
cp test-storage.local.html test-storage.html

# Edit test-storage.html and add your credentials
# Then open in browser
```

## Important Notes

⚠️ **NEVER commit files with real API keys!**

The following files are in `.gitignore`:
- `test-gemini.js`
- `test-storage.html`
- `*.local.js`
- `*.local.html`

## Environment Variables

All production code uses environment variables from `.env`:

```env
VITE_GOOGLE_API_KEY=your_key_here
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

## Netlify Configuration

Make sure to add these environment variables in Netlify:
1. Go to Site settings > Environment variables
2. Add:
   - `VITE_GOOGLE_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Security

✅ `.env` is in `.gitignore`
✅ Test files are in `.gitignore`
✅ Production code uses environment variables
✅ No hardcoded secrets in repository
